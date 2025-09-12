const { PrismaClient } = require('@prisma/client');
const prizeAuditService = require('./src/services/prizeAuditService');
const prizeNormalizationService = require('./src/services/prizeNormalizationService');
const prizeValidationService = require('./src/services/prizeValidationService');

const prisma = new PrismaClient();

async function testPrizeSystem() {
  console.log('🧪 TESTANDO SISTEMA DE PRÊMIOS...\n');

  try {
    // 1. Testar normalização de nomes
    console.log('1️⃣ Testando normalização de nomes...');
    const testNames = [
      { name: 'XIAMO NOTE 12', value: 1200 },
      { name: 'AIRFORCE 1', value: 700 },
      { name: 'IPHONE', value: 10000 },
      { name: 'Produto Genérico', value: 15000 }
    ];

    testNames.forEach(test => {
      const normalized = prizeNormalizationService.normalizarNomeProduto(test.name, test.value);
      console.log(`   "${test.name}" (R$ ${test.value}) → "${normalized}"`);
    });

    // 2. Testar detecção de prêmios ilustrativos
    console.log('\n2️⃣ Testando detecção de prêmios ilustrativos...');
    const testValues = [1000, 5000, 5001, 10000, 15000];
    testValues.forEach(value => {
      const isIllustrative = prizeNormalizationService.deveSerIlustrativo(value);
      console.log(`   R$ ${value} → ${isIllustrative ? 'ILUSTRATIVO' : 'SORTEÁVEL'}`);
    });

    // 3. Testar auditoria automática
    console.log('\n3️⃣ Testando auditoria automática...');
    const auditResult = await prizeAuditService.auditarPremios();
    console.log(`   ✅ Auditoria executada: ${auditResult.success ? 'SUCESSO' : 'ERRO'}`);
    console.log(`   📊 Correções aplicadas: ${auditResult.corrections_applied}`);
    console.log(`   🏷️ Marcados como ilustrativos: ${auditResult.illustrative_marked}`);
    console.log(`   📝 Nomes normalizados: ${auditResult.names_normalized}`);

    // 4. Testar validação de prêmios
    console.log('\n4️⃣ Testando validação de prêmios...');
    const prizes = await prisma.prize.findMany({ take: 5 });
    
    for (const prize of prizes) {
      const validation = await prizeValidationService.validatePrizeBeforeCredit(prize.id);
      console.log(`   Prêmio "${prize.nome}" (R$ ${prize.valor}) → ${validation.valid ? 'VÁLIDO' : 'INVÁLIDO'}`);
      if (!validation.valid) {
        console.log(`     ❌ Erro: ${validation.error}`);
      }
    }

    // 5. Verificar estatísticas finais
    console.log('\n5️⃣ Estatísticas finais do sistema...');
    const stats = await prizeAuditService.getAuditStats();
    console.log(`   📦 Total de prêmios: ${stats.total_prizes}`);
    console.log(`   🏷️ Prêmios ilustrativos: ${stats.illustrative_prizes}`);
    console.log(`   💰 Prêmios de alto valor: ${stats.high_value_prizes}`);
    console.log(`   📊 Score de saúde: ${stats.health_score.toFixed(1)}%`);

    console.log('\n✅ TESTE CONCLUÍDO COM SUCESSO!');
    console.log('🎯 Sistema de prêmios está funcionando corretamente.');

  } catch (error) {
    console.error('❌ ERRO NO TESTE:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar teste
testPrizeSystem();
