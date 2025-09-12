const { runBulkPurchaseTests } = require('./test-bulk-purchase');
const { runConcurrencyTests } = require('./test-concurrency-bulk-purchase');
const { verifyBulkPurchases } = require('./verify-bulk-purchases');

/**
 * Script Principal para Executar Todos os Testes de Compras Múltiplas
 * 
 * Este script executa:
 * 1. Testes unitários e de integração
 * 2. Testes de concorrência
 * 3. Verificação de auditoria das últimas compras
 */
async function runAllBulkPurchaseTests() {
  console.log('🚀 EXECUTANDO TODOS OS TESTES DE COMPRAS MÚLTIPLAS');
  console.log('=' .repeat(80));
  console.log('Data/Hora:', new Date().toISOString());
  console.log('=' .repeat(80));

  const results = {
    unitTests: { passed: 0, failed: 0 },
    concurrencyTests: { passed: 0, failed: 0 },
    auditVerification: { discrepancies: 0, totalChecked: 0 }
  };

  try {
    // 1. TESTES UNITÁRIOS E DE INTEGRAÇÃO
    console.log('\n🧪 EXECUTANDO TESTES UNITÁRIOS E DE INTEGRAÇÃO');
    console.log('-'.repeat(50));
    
    try {
      const unitTestResults = await runBulkPurchaseTests();
      results.unitTests = unitTestResults;
      console.log(`✅ Testes unitários: ${unitTestResults.testsPassed} passaram, ${unitTestResults.testsFailed} falharam`);
    } catch (error) {
      console.error('❌ Erro nos testes unitários:', error.message);
      results.unitTests.failed++;
    }

    // 2. TESTES DE CONCORRÊNCIA
    console.log('\n🏃‍♂️ EXECUTANDO TESTES DE CONCORRÊNCIA');
    console.log('-'.repeat(50));
    
    try {
      const concurrencyTestResults = await runConcurrencyTests();
      results.concurrencyTests = concurrencyTestResults;
      console.log(`✅ Testes de concorrência: ${concurrencyTestResults.totalTestsPassed} passaram, ${concurrencyTestResults.totalTestsFailed} falharam`);
    } catch (error) {
      console.error('❌ Erro nos testes de concorrência:', error.message);
      results.concurrencyTests.totalTestsFailed++;
    }

    // 3. VERIFICAÇÃO DE AUDITORIA
    console.log('\n🔍 EXECUTANDO VERIFICAÇÃO DE AUDITORIA');
    console.log('-'.repeat(50));
    
    try {
      await verifyBulkPurchases();
      console.log('✅ Verificação de auditoria concluída');
    } catch (error) {
      console.error('❌ Erro na verificação de auditoria:', error.message);
    }

  } catch (error) {
    console.error('❌ ERRO FATAL:', error);
  }

  // RELATÓRIO FINAL
  console.log('\n📊 RELATÓRIO FINAL COMPLETO');
  console.log('=' .repeat(80));
  console.log('Data/Hora:', new Date().toISOString());
  console.log('=' .repeat(80));

  console.log('\n🧪 TESTES UNITÁRIOS E DE INTEGRAÇÃO:');
  console.log(`  ✅ Passaram: ${results.unitTests.passed}`);
  console.log(`  ❌ Falharam: ${results.unitTests.failed}`);
  console.log(`  📈 Taxa de sucesso: ${((results.unitTests.passed / (results.unitTests.passed + results.unitTests.failed)) * 100).toFixed(1)}%`);

  console.log('\n🏃‍♂️ TESTES DE CONCORRÊNCIA:');
  console.log(`  ✅ Passaram: ${results.concurrencyTests.passed}`);
  console.log(`  ❌ Falharam: ${results.concurrencyTests.failed}`);
  console.log(`  📈 Taxa de sucesso: ${((results.concurrencyTests.passed / (results.concurrencyTests.passed + results.concurrencyTests.failed)) * 100).toFixed(1)}%`);

  console.log('\n🔍 VERIFICAÇÃO DE AUDITORIA:');
  console.log(`  📊 Total verificado: ${results.auditVerification.totalChecked}`);
  console.log(`  ⚠️ Discrepâncias: ${results.auditVerification.discrepancies}`);

  const totalTests = results.unitTests.passed + results.unitTests.failed + results.concurrencyTests.passed + results.concurrencyTests.failed;
  const totalPassed = results.unitTests.passed + results.concurrencyTests.passed;
  const totalFailed = results.unitTests.failed + results.concurrencyTests.failed;

  console.log('\n🎯 RESUMO GERAL:');
  console.log(`  📊 Total de testes: ${totalTests}`);
  console.log(`  ✅ Total passaram: ${totalPassed}`);
  console.log(`  ❌ Total falharam: ${totalFailed}`);
  console.log(`  📈 Taxa de sucesso geral: ${((totalPassed / totalTests) * 100).toFixed(1)}%`);

  if (totalFailed === 0) {
    console.log('\n🎉 TODOS OS TESTES PASSARAM!');
    console.log('✅ Sistema de compras múltiplas está funcionando perfeitamente');
    console.log('✅ Transações atômicas implementadas');
    console.log('✅ Race conditions prevenidas');
    console.log('✅ Contas demo isoladas corretamente');
    console.log('✅ Auditoria completa funcionando');
  } else {
    console.log('\n⚠️ ALGUNS TESTES FALHARAM!');
    console.log('❌ Verifique os logs acima para identificar os problemas');
    console.log('❌ Corrija os problemas antes de colocar em produção');
  }

  console.log('\n📋 PRÓXIMOS PASSOS:');
  console.log('1. Se todos os testes passaram, o sistema está pronto para produção');
  console.log('2. Se há falhas, corrija os problemas identificados');
  console.log('3. Execute novamente os testes após as correções');
  console.log('4. Monitore as compras múltiplas em produção');
  console.log('5. Execute verificações de auditoria regularmente');

  console.log('\n🔗 ENDPOINTS DISPONÍVEIS:');
  console.log('  POST /purchase/bulk - Processar compra múltipla');
  console.log('  GET /purchase/audit/:purchaseId - Obter auditoria de compra');
  console.log('  GET /purchase/audit - Listar auditorias com filtros');
  console.log('  GET /purchase/audit-report - Gerar relatório de auditoria');
  console.log('  POST /purchase/verify-discrepancies - Verificar discrepâncias');

  console.log('\n📁 ARQUIVOS DE LOG GERADOS:');
  console.log('  logs/bulk_purchase_verification_YYYY-MM-DD.csv');
  console.log('  logs/bulk_purchase_verification_YYYY-MM-DD.json');

  return {
    success: totalFailed === 0,
    totalTests,
    totalPassed,
    totalFailed,
    results
  };
}

// Executar todos os testes se chamado diretamente
if (require.main === module) {
  runAllBulkPurchaseTests()
    .then(({ success, totalTests, totalPassed, totalFailed }) => {
      console.log(`\n🏁 Execução concluída: ${totalPassed}/${totalTests} testes passaram`);
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('❌ Erro fatal na execução dos testes:', error);
      process.exit(1);
    });
}

module.exports = { runAllBulkPurchaseTests };

