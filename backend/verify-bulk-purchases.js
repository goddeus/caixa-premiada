const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

/**
 * Script de Verificação de Compras Múltiplas
 * 
 * Este script verifica as últimas 100 compras múltiplas para detectar:
 * - Discrepâncias entre valor debitado e valor esperado
 * - Discrepâncias entre prêmios creditados e valor esperado
 * - Inconsistências no saldo final
 * - Comportamento incorreto em contas demo vs reais
 */
async function verifyBulkPurchases() {
  console.log('🔍 INICIANDO VERIFICAÇÃO DE COMPRAS MÚLTIPLAS');
  console.log('=' .repeat(60));

  try {
    // Buscar últimas 100 compras múltiplas
    const purchases = await prisma.purchaseAudit.findMany({
      where: {
        status: 'concluido'
      },
      orderBy: { criado_em: 'desc' },
      take: 100,
      include: {
        user: {
          select: {
            id: true,
            nome: true,
            email: true,
            tipo_conta: true
          }
        }
      }
    });

    console.log(`📊 Total de compras encontradas: ${purchases.length}`);

    const discrepancies = [];
    const summary = {
      totalPurchases: purchases.length,
      totalDebited: 0,
      totalPrizes: 0,
      discrepanciesFound: 0,
      byAccountType: {
        normal: { count: 0, discrepancies: 0 },
        afiliado_demo: { count: 0, discrepancies: 0 }
      },
      byStatus: {
        concluido: 0,
        investigar: 0,
        erro: 0
      }
    };

    // Verificar cada compra
    for (const purchase of purchases) {
      const caixasCompradas = JSON.parse(purchase.caixas_compradas || '[]');
      const premiosDetalhados = JSON.parse(purchase.premios_detalhados || '[]');

      // Calcular total esperado das caixas
      let totalEsperadoCaixas = 0;
      for (const caixa of caixasCompradas) {
        totalEsperadoCaixas += (caixa.preco || 0) * (caixa.quantidade || 0);
      }

      // Calcular total esperado dos prêmios
      let totalEsperadoPremios = 0;
      for (const premio of premiosDetalhados) {
        if (!premio.isIllustrative && premio.sorteavel !== false) {
          totalEsperadoPremios += premio.valor || 0;
        }
      }

      // Calcular saldo final esperado
      const saldoFinalEsperado = purchase.saldo_antes - purchase.total_preco + purchase.soma_premios;

      // Verificar discrepâncias
      const discrepanciesItem = {
        purchaseId: purchase.purchase_id,
        userId: purchase.user_id,
        userName: purchase.user.nome,
        userEmail: purchase.user.email,
        tipoConta: purchase.tipo_conta,
        criadoEm: purchase.criado_em,
        issues: []
      };

      // 1. Verificar se total debitado está correto
      if (Math.abs(purchase.total_preco - totalEsperadoCaixas) > 0.01) {
        discrepanciesItem.issues.push({
          type: 'total_debitado_incorreto',
          expected: totalEsperadoCaixas,
          actual: purchase.total_preco,
          difference: purchase.total_preco - totalEsperadoCaixas
        });
      }

      // 2. Verificar se soma de prêmios está correta
      if (Math.abs(purchase.soma_premios - totalEsperadoPremios) > 0.01) {
        discrepanciesItem.issues.push({
          type: 'soma_premios_incorreta',
          expected: totalEsperadoPremios,
          actual: purchase.soma_premios,
          difference: purchase.soma_premios - totalEsperadoPremios
        });
      }

      // 3. Verificar se saldo final está correto
      if (Math.abs(purchase.saldo_depois - saldoFinalEsperado) > 0.01) {
        discrepanciesItem.issues.push({
          type: 'saldo_final_incorreto',
          expected: saldoFinalEsperado,
          actual: purchase.saldo_depois,
          difference: purchase.saldo_depois - saldoFinalEsperado
        });
      }

      // 4. Verificar se contas demo não afetaram saldo real
      if (purchase.tipo_conta === 'afiliado_demo') {
        // Para contas demo, verificar se não há transações reais
        const realTransactions = await prisma.transaction.findMany({
          where: {
            user_id: purchase.user_id,
            criado_em: {
              gte: purchase.criado_em,
              lte: new Date(purchase.criado_em.getTime() + 60000) // 1 minuto após a compra
            },
            tipo: {
              in: ['abertura_caixa_multipla', 'premio']
            }
          }
        });

        if (realTransactions.length > 0) {
          discrepanciesItem.issues.push({
            type: 'conta_demo_afetou_saldo_real',
            realTransactionsCount: realTransactions.length,
            message: 'Conta demo criou transações reais'
          });
        }
      }

      // 5. Verificar se prêmios ilustrativos não foram creditados
      const premiosIlustrativosCreditados = premiosDetalhados.filter(p => 
        p.isIllustrative && p.valor > 0
      );

      if (premiosIlustrativosCreditados.length > 0) {
        discrepanciesItem.issues.push({
          type: 'premios_ilustrativos_creditados',
          count: premiosIlustrativosCreditados.length,
          message: 'Prêmios ilustrativos foram creditados incorretamente'
        });
      }

      // Se há discrepâncias, adicionar à lista
      if (discrepanciesItem.issues.length > 0) {
        discrepancies.push(discrepanciesItem);
        summary.discrepanciesFound++;
        summary.byAccountType[purchase.tipo_conta].discrepancies++;
      }

      // Atualizar estatísticas
      summary.totalDebited += purchase.total_preco;
      summary.totalPrizes += purchase.soma_premios;
      summary.byAccountType[purchase.tipo_conta].count++;
      summary.byStatus[purchase.status] = (summary.byStatus[purchase.status] || 0) + 1;
    }

    // Gerar relatório
    console.log('\n📋 RELATÓRIO DE VERIFICAÇÃO');
    console.log('=' .repeat(60));
    console.log(`Total de compras verificadas: ${summary.totalPurchases}`);
    console.log(`Total debitado: R$ ${summary.totalDebited.toFixed(2)}`);
    console.log(`Total de prêmios: R$ ${summary.totalPrizes.toFixed(2)}`);
    console.log(`Discrepâncias encontradas: ${summary.discrepanciesFound}`);

    console.log('\n📊 POR TIPO DE CONTA:');
    for (const [tipo, stats] of Object.entries(summary.byAccountType)) {
      console.log(`  ${tipo}: ${stats.count} compras, ${stats.discrepancies} discrepâncias`);
    }

    console.log('\n📊 POR STATUS:');
    for (const [status, count] of Object.entries(summary.byStatus)) {
      console.log(`  ${status}: ${count} compras`);
    }

    // Salvar relatório CSV
    const csvPath = path.join(__dirname, 'logs', `bulk_purchase_verification_${new Date().toISOString().split('T')[0]}.csv`);
    
    // Criar diretório de logs se não existir
    const logsDir = path.dirname(csvPath);
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    // Gerar CSV
    let csvContent = 'Purchase ID,User ID,User Name,User Email,Tipo Conta,Criado Em,Issues Count,Issues Details\n';
    
    for (const discrepancy of discrepancies) {
      const issuesDetails = discrepancy.issues.map(issue => 
        `${issue.type}: ${issue.message || `Expected ${issue.expected}, Actual ${issue.actual}`}`
      ).join('; ');
      
      csvContent += `"${discrepancy.purchaseId}","${discrepancy.userId}","${discrepancy.userName}","${discrepancy.userEmail}","${discrepancy.tipoConta}","${discrepancy.criadoEm.toISOString()}","${discrepancy.issues.length}","${issuesDetails}"\n`;
    }

    fs.writeFileSync(csvPath, csvContent);
    console.log(`\n💾 Relatório CSV salvo em: ${csvPath}`);

    // Marcar compras com discrepâncias para investigação
    if (discrepancies.length > 0) {
      console.log('\n🔍 MARCANDO COMPRAS COM DISCREPÂNCIAS PARA INVESTIGAÇÃO...');
      
      const purchaseIds = discrepancies.map(d => d.purchaseId);
      
      const updateResult = await prisma.purchaseAudit.updateMany({
        where: {
          purchase_id: {
            in: purchaseIds
          }
        },
        data: {
          status: 'investigar'
        }
      });

      console.log(`✅ ${updateResult.count} compras marcadas para investigação`);
    }

    // Salvar relatório JSON detalhado
    const jsonPath = path.join(__dirname, 'logs', `bulk_purchase_verification_${new Date().toISOString().split('T')[0]}.json`);
    const jsonReport = {
      generatedAt: new Date().toISOString(),
      summary,
      discrepancies,
      totalDiscrepancies: discrepancies.length
    };

    fs.writeFileSync(jsonPath, JSON.stringify(jsonReport, null, 2));
    console.log(`💾 Relatório JSON salvo em: ${jsonPath}`);

    console.log('\n✅ VERIFICAÇÃO CONCLUÍDA');
    console.log('=' .repeat(60));

    if (summary.discrepanciesFound === 0) {
      console.log('🎉 Nenhuma discrepância encontrada! Sistema funcionando corretamente.');
    } else {
      console.log(`⚠️ ${summary.discrepanciesFound} discrepâncias encontradas. Verifique os relatórios gerados.`);
    }

  } catch (error) {
    console.error('❌ ERRO NA VERIFICAÇÃO:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar verificação se chamado diretamente
if (require.main === module) {
  verifyBulkPurchases()
    .then(() => {
      console.log('Script de verificação concluído');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Erro no script de verificação:', error);
      process.exit(1);
    });
}

module.exports = { verifyBulkPurchases };

