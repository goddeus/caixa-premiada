const express = require('express');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * POST /admin/run-full-prize-check
 * Executa verificação completa de prêmios
 */
router.post('/run-full-prize-check', async (req, res) => {
  const timestamp = new Date().toISOString();
  const results = {
    timestamp: timestamp,
    status: 'running',
    tests: [],
    summary: {
      total: 0,
      passed: 0,
      failed: 0
    }
  };

  try {
    console.log('🔍 Iniciando verificação completa de prêmios...');

    // 1. Validação de prêmios
    const prizeValidationTest = await validatePrizes();
    results.tests.push(prizeValidationTest);

    // 2. Teste de filtro de prêmios sortáveis
    const sortableTest = await testSortableFilter();
    results.tests.push(sortableTest);

    // 3. Teste de compra de caixa
    const purchaseTest = await testCasePurchase();
    results.tests.push(purchaseTest);

    // 4. Relatório final
    results.summary.total = results.tests.length;
    results.summary.passed = results.tests.filter(t => t.status === 'passed').length;
    results.summary.failed = results.tests.filter(t => t.status === 'failed').length;
    results.status = results.summary.failed === 0 ? 'completed' : 'failed';

    // Salvar relatório
    const reportPath = path.join(__dirname, '..', '..', '..', 'backups', `admin_check_${timestamp.replace(/[:.]/g, '-')}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

    console.log(`✅ Verificação concluída: ${results.summary.passed}/${results.summary.total} testes passaram`);

    res.json({
      success: true,
      message: 'Verificação completa executada',
      results: results,
      report_path: reportPath
    });

  } catch (error) {
    console.error('❌ Erro na verificação:', error);
    results.status = 'error';
    results.error = error.message;
    
    res.status(500).json({
      success: false,
      message: 'Erro na verificação',
      error: error.message,
      results: results
    });
  }
});

/**
 * GET /admin/full-prize-check-report/:timestamp
 * Busca relatório de verificação por timestamp
 */
router.get('/full-prize-check-report/:timestamp', async (req, res) => {
  try {
    const { timestamp } = req.params;
    const reportPath = path.join(__dirname, '..', '..', '..', 'backups', `admin_check_${timestamp}.json`);
    
    if (!fs.existsSync(reportPath)) {
      return res.status(404).json({
        success: false,
        message: 'Relatório não encontrado'
      });
    }

    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    
    res.json({
      success: true,
      report: report
    });

  } catch (error) {
    console.error('❌ Erro ao buscar relatório:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar relatório',
      error: error.message
    });
  }
});

/**
 * GET /admin/prize-status
 * Status atual dos prêmios
 */
router.get('/prize-status', async (req, res) => {
  try {
    const prizes = await prisma.prize.findMany({
      include: {
        case: {
          select: {
            nome: true
          }
        }
      }
    });

    const status = {
      total_prizes: prizes.length,
      by_type: {
        cash: prizes.filter(p => p.tipo === 'cash').length,
        produto: prizes.filter(p => p.tipo === 'produto').length,
        ilustrativo: prizes.filter(p => p.tipo === 'ilustrativo').length
      },
      by_status: {
        ativo: prizes.filter(p => p.ativo).length,
        inativo: prizes.filter(p => !p.ativo).length,
        sorteavel: prizes.filter(p => p.sorteavel).length,
        nao_sorteavel: prizes.filter(p => !p.sorteavel).length
      },
      by_value: {
        low: prizes.filter(p => p.valor <= 100).length,
        medium: prizes.filter(p => p.valor > 100 && p.valor <= 1000).length,
        high: prizes.filter(p => p.valor > 1000).length
      }
    };

    res.json({
      success: true,
      status: status
    });

  } catch (error) {
    console.error('❌ Erro ao buscar status:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar status',
      error: error.message
    });
  }
});

// Funções auxiliares

async function validatePrizes() {
  const test = {
    name: 'Validação de Prêmios',
    status: 'running',
    details: []
  };

  try {
    const prizes = await prisma.prize.findMany();
    let errors = 0;

    for (const prize of prizes) {
      const prizeErrors = [];

      // Verificar se prêmios > R$ 1000 são ilustrativos
      if (prize.valor > 1000 && prize.tipo !== 'ilustrativo') {
        prizeErrors.push(`Deveria ser ilustrativo`);
      }

      // Verificar se prêmios ilustrativos não são sortáveis
      if (prize.tipo === 'ilustrativo' && prize.sorteavel !== false) {
        prizeErrors.push(`Deveria ter sorteavel=false`);
      }

      // Verificar se prêmios cash têm tipo correto
      if (prize.nome && prize.nome.includes('R$') && prize.tipo !== 'cash') {
        prizeErrors.push(`Deveria ter tipo='cash'`);
      }

      if (prizeErrors.length > 0) {
        errors += prizeErrors.length;
        test.details.push({
          prize: prize.nome,
          errors: prizeErrors
        });
      }
    }

    test.status = errors === 0 ? 'passed' : 'failed';
    test.errors = errors;

  } catch (error) {
    test.status = 'failed';
    test.error = error.message;
  }

  return test;
}

async function testSortableFilter() {
  const test = {
    name: 'Filtro de Prêmios Sortáveis',
    status: 'running',
    details: []
  };

  try {
    const prizes = await prisma.prize.findMany();
    const sortablePrizes = prizes.filter(p => p.sorteavel === true);
    const nonSortablePrizes = prizes.filter(p => p.sorteavel === false);

    test.details.push({
      total_prizes: prizes.length,
      sortable: sortablePrizes.length,
      non_sortable: nonSortablePrizes.length
    });

    // Verificar se prêmios ilustrativos não estão no pool sortável
    const ilustrativosInSortable = sortablePrizes.filter(p => p.tipo === 'ilustrativo');
    if (ilustrativosInSortable.length > 0) {
      test.details.push({
        error: 'Prêmios ilustrativos encontrados no pool sortável',
        prizes: ilustrativosInSortable.map(p => p.nome)
      });
      test.status = 'failed';
    } else {
      test.status = 'passed';
    }

  } catch (error) {
    test.status = 'failed';
    test.error = error.message;
  }

  return test;
}

async function testCasePurchase() {
  const test = {
    name: 'Teste de Compra de Caixa',
    status: 'running',
    details: []
  };

  try {
    const testCase = await prisma.case.findFirst({
      include: {
        prizes: true
      }
    });

    if (!testCase) {
      test.status = 'failed';
      test.details.push({ error: 'Nenhuma caixa encontrada para teste' });
    } else {
      const sortablePrizesInCase = testCase.prizes.filter(p => p.sorteavel === true);
      const ilustrativosInCase = testCase.prizes.filter(p => p.tipo === 'ilustrativo');

      test.details.push({
        case_name: testCase.nome,
        total_prizes: testCase.prizes.length,
        sortable_prizes: sortablePrizesInCase.length,
        ilustrativos: ilustrativosInCase.length
      });

      if (sortablePrizesInCase.length === 0) {
        test.status = 'failed';
        test.details.push({ error: 'Nenhum prêmio sortável na caixa' });
      } else {
        test.status = 'passed';
      }
    }

  } catch (error) {
    test.status = 'failed';
    test.error = error.message;
  }

  return test;
}

module.exports = router;
