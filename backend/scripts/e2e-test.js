const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const prisma = new PrismaClient();

async function e2eTest() {
  console.log('🧪 TESTE END-TO-END DO SISTEMA DE PRÊMIOS');
  console.log('==========================================');
  
  const timestamp = new Date().toISOString();
  const results = {
    timestamp: timestamp,
    tests: [],
    summary: {
      total: 0,
      passed: 0,
      failed: 0
    }
  };
  
  try {
    // 1. Teste de validação de prêmios
    console.log('\n1️⃣ Testando validação de prêmios...');
    
    const prizes = await prisma.prize.findMany({
      include: {
        case: {
          select: {
            nome: true
          }
        }
      }
    });
    
    const prizeValidationTest = {
      name: 'Validação de Prêmios',
      status: 'running',
      details: []
    };
    
    let validationErrors = 0;
    
    for (const prize of prizes) {
      const errors = [];
      
      // Verificar se prêmios > R$ 1000 são ilustrativos
      if (prize.valor > 1000 && prize.tipo !== 'ilustrativo') {
        errors.push(`Prêmio ${prize.nome} (R$ ${prize.valor}) deveria ser ilustrativo`);
      }
      
      // Verificar se prêmios ilustrativos não são sortáveis
      if (prize.tipo === 'ilustrativo' && prize.sorteavel !== false) {
        errors.push(`Prêmio ilustrativo ${prize.nome} deveria ter sorteavel=false`);
      }
      
      // Verificar se prêmios cash têm tipo correto
      if (prize.nome && prize.nome.includes('R$') && prize.tipo !== 'cash') {
        errors.push(`Prêmio cash ${prize.nome} deveria ter tipo='cash'`);
      }
      
      if (errors.length > 0) {
        validationErrors += errors.length;
        prizeValidationTest.details.push({
          prize: prize.nome,
          case: prize.case.nome,
          errors: errors
        });
      }
    }
    
    prizeValidationTest.status = validationErrors === 0 ? 'passed' : 'failed';
    prizeValidationTest.errors = validationErrors;
    results.tests.push(prizeValidationTest);
    
    console.log(`✅ Validação de prêmios: ${validationErrors === 0 ? 'PASSOU' : 'FALHOU'} (${validationErrors} erros)`);
    
    // 2. Teste de filtro de prêmios sortáveis
    console.log('\n2️⃣ Testando filtro de prêmios sortáveis...');
    
    const sortableTest = {
      name: 'Filtro de Prêmios Sortáveis',
      status: 'running',
      details: []
    };
    
    const sortablePrizes = prizes.filter(p => p.sorteavel === true);
    const nonSortablePrizes = prizes.filter(p => p.sorteavel === false);
    
    sortableTest.details.push({
      total_prizes: prizes.length,
      sortable: sortablePrizes.length,
      non_sortable: nonSortablePrizes.length
    });
    
    // Verificar se prêmios ilustrativos não estão no pool sortável
    const ilustrativosInSortable = sortablePrizes.filter(p => p.tipo === 'ilustrativo');
    if (ilustrativosInSortable.length > 0) {
      sortableTest.details.push({
        error: 'Prêmios ilustrativos encontrados no pool sortável',
        prizes: ilustrativosInSortable.map(p => p.nome)
      });
      sortableTest.status = 'failed';
    } else {
      sortableTest.status = 'passed';
    }
    
    results.tests.push(sortableTest);
    console.log(`✅ Filtro de prêmios sortáveis: ${sortableTest.status === 'passed' ? 'PASSOU' : 'FALHOU'}`);
    
    // 3. Teste de compra de caixa (simulado)
    console.log('\n3️⃣ Testando compra de caixa...');
    
    const purchaseTest = {
      name: 'Compra de Caixa',
      status: 'running',
      details: []
    };
    
    // Buscar uma caixa para teste
    const testCase = await prisma.case.findFirst({
      include: {
        prizes: true
      }
    });
    
    if (!testCase) {
      purchaseTest.status = 'failed';
      purchaseTest.details.push({ error: 'Nenhuma caixa encontrada para teste' });
    } else {
      const sortablePrizesInCase = testCase.prizes.filter(p => p.sorteavel === true);
      const ilustrativosInCase = testCase.prizes.filter(p => p.tipo === 'ilustrativo');
      
      purchaseTest.details.push({
        case_name: testCase.nome,
        total_prizes: testCase.prizes.length,
        sortable_prizes: sortablePrizesInCase.length,
        ilustrativos: ilustrativosInCase.length
      });
      
      if (sortablePrizesInCase.length === 0) {
        purchaseTest.status = 'failed';
        purchaseTest.details.push({ error: 'Nenhum prêmio sortável na caixa' });
      } else {
        purchaseTest.status = 'passed';
      }
    }
    
    results.tests.push(purchaseTest);
    console.log(`✅ Compra de caixa: ${purchaseTest.status === 'passed' ? 'PASSOU' : 'FALHOU'}`);
    
    // 4. Relatório final
    console.log('\n📊 RELATÓRIO FINAL:');
    console.log('==================');
    
    results.summary.total = results.tests.length;
    results.summary.passed = results.tests.filter(t => t.status === 'passed').length;
    results.summary.failed = results.tests.filter(t => t.status === 'failed').length;
    
    results.tests.forEach(test => {
      console.log(`${test.status === 'passed' ? '✅' : '❌'} ${test.name}: ${test.status.toUpperCase()}`);
      if (test.errors) {
        console.log(`   Erros: ${test.errors}`);
      }
    });
    
    console.log(`\nTotal: ${results.summary.total} | Passou: ${results.summary.passed} | Falhou: ${results.summary.failed}`);
    
    // Salvar relatório
    const fs = require('fs');
    const path = require('path');
    
    const reportPath = path.join(__dirname, '..', '..', 'backups', `e2e_test_report_${timestamp.replace(/[:.]/g, '-')}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    
    console.log(`\n📄 Relatório salvo em: ${reportPath}`);
    
    if (results.summary.failed === 0) {
      console.log('\n🎉 TODOS OS TESTES PASSARAM!');
    } else {
      console.log('\n⚠️ ALGUNS TESTES FALHARAM!');
    }
    
  } catch (error) {
    console.error('❌ Erro no teste E2E:', error);
    results.tests.push({
      name: 'Erro Geral',
      status: 'failed',
      error: error.message
    });
  } finally {
    await prisma.$disconnect();
  }
}

e2eTest();
