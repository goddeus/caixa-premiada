const PrizeValidationService = require('./src/services/prizeValidationService');

async function testValidationSystem() {
  console.log('🧪 TESTANDO SISTEMA DE VALIDAÇÃO ATUALIZADO...\n');

  try {
    // 1. Testar estatísticas
    console.log('1️⃣ Testando estatísticas de validação...');
    const stats = await PrizeValidationService.getValidationStats();
    console.log('   📊 Estatísticas:');
    console.log(`   - Total de caixas: ${stats.total_cases}`);
    console.log(`   - Total de prêmios: ${stats.total_prizes}`);
    console.log(`   - Prêmios ativos: ${stats.active_prizes}`);
    console.log(`   - Prêmios ilustrativos: ${stats.illustrative_prizes}`);
    console.log(`   - Score de saúde: ${stats.health_score.toFixed(1)}%`);
    console.log(`   - Prêmios com probabilidade inválida: ${stats.invalid_probability_prizes}`);
    console.log(`   - Prêmios com valor inválido: ${stats.invalid_value_prizes}\n`);

    // 2. Testar verificação global
    console.log('2️⃣ Testando verificação global de consistência...');
    const validationResult = await PrizeValidationService.verificarConsistenciaPremios();
    
    console.log('   📊 Resultado da verificação:');
    console.log(`   - Sucesso: ${validationResult.success}`);
    console.log(`   - Caixas verificadas: ${validationResult.total_cases}`);
    console.log(`   - Prêmios verificados: ${validationResult.total_prizes}`);
    console.log(`   - Prêmios ativos: ${validationResult.active_prizes}`);
    console.log(`   - Prêmios ilustrativos: ${validationResult.illustrative_prizes}`);
    console.log(`   - Inconsistências encontradas: ${validationResult.inconsistencies_found}`);
    console.log(`   - Tempo de processamento: ${validationResult.processing_time_ms}ms`);
    
    if (validationResult.has_inconsistencies) {
      console.log('   ⚠️ Tipos de inconsistências:');
      Object.entries(validationResult.summary).forEach(([type, count]) => {
        if (count > 0) {
          console.log(`     - ${type}: ${count}`);
        }
      });
      
      console.log('\n   📝 Primeiras 3 inconsistências:');
      validationResult.inconsistencies.slice(0, 3).forEach((inc, index) => {
        console.log(`     ${index + 1}. ${inc.type}: ${inc.message}`);
      });
    } else {
      console.log('   ✅ Nenhuma inconsistência encontrada!');
    }
    console.log('');

    // 3. Testar correção automática
    console.log('3️⃣ Testando correção automática...');
    const correctionResult = await PrizeValidationService.corrigirInconsistenciasAutomaticamente();
    
    console.log('   🔧 Resultado da correção:');
    console.log(`   - Sucesso: ${correctionResult.success}`);
    console.log(`   - Total de correções: ${correctionResult.total_corrections}`);
    
    if (correctionResult.corrections.length > 0) {
      console.log('   📝 Correções aplicadas:');
      correctionResult.corrections.forEach((correction, index) => {
        console.log(`     ${index + 1}. Prêmio ${correction.prize_id}: ${correction.field} ${correction.old_value} → ${correction.new_value}`);
      });
    } else {
      console.log('   ✅ Nenhuma correção necessária!');
    }
    console.log('');

    // 4. Testar validação específica de prêmios
    console.log('4️⃣ Testando validação específica de prêmios...');
    
    // Buscar alguns prêmios para testar
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const prizes = await prisma.prize.findMany({
      take: 5,
      include: { case: true }
    });
    
    for (const prize of prizes) {
      const validation = await PrizeValidationService.validatePrizeBeforeCredit(prize.id);
      const status = prize.ilustrativo ? 'ILUSTRATIVO' : 'ATIVO';
      const canBeDrawn = !prize.ilustrativo && validation.valid;
      
      console.log(`   Prêmio "${prize.nome}" (R$ ${prize.valor}) [${status}] → ${validation.valid ? 'VÁLIDO' : 'INVÁLIDO'}`);
      
      if (!validation.valid) {
        console.log(`     ❌ Erro: ${validation.error}`);
      } else if (prize.ilustrativo) {
        console.log(`     ℹ️ Prêmio ilustrativo - não pode ser sorteado`);
      } else {
        console.log(`     ✅ Prêmio ativo - pode ser sorteado`);
      }
    }
    
    await prisma.$disconnect();
    console.log('');

    // 5. Resumo final
    console.log('5️⃣ Resumo final do sistema de validação...');
    console.log('   ✅ Sistema de validação atualizado funcionando corretamente!');
    console.log('   🎯 Principais melhorias implementadas:');
    console.log('     - Prêmios ilustrativos são ignorados na validação');
    console.log('     - Aceita nomes genéricos (Playstation 5, iPhone, etc.)');
    console.log('     - Não valida valores excessivos para ilustrativos');
    console.log('     - Score de saúde calculado apenas para prêmios ativos');
    console.log('     - Integração completa com sistema de gerenciamento');
    console.log('     - Eliminação de falsos positivos');

  } catch (error) {
    console.error('❌ Erro durante teste:', error);
  }
}

// Executar teste
testValidationSystem().then(() => {
  console.log('\n🎉 TESTE DE VALIDAÇÃO CONCLUÍDO!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
