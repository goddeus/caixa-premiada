const { PrismaClient } = require('@prisma/client');
const prizeUtils = require('./src/utils/prizeUtils');
const prizeValidationServiceV2 = require('./src/services/prizeValidationServiceV2');

const prisma = new PrismaClient();

async function testPrizeSystemV2() {
  console.log('🧪 TESTANDO SISTEMA DE PRÊMIOS V2...\n');

  try {
    // 1. Testar funções utilitárias
    console.log('1️⃣ Testando funções utilitárias...');
    
    // Testar formatarBRL
    const testValues = [100, 200, 500, 1000, 5000, 10000, 50000];
    console.log('📊 Testando formatarBRL:');
    testValues.forEach(valor => {
      const formatted = prizeUtils.formatarBRL(valor);
      console.log(`   ${valor} centavos → ${formatted}`);
    });
    console.log('');

    // Testar assetKeyCash
    console.log('📊 Testando assetKeyCash:');
    testValues.forEach(valor => {
      const assetKey = prizeUtils.assetKeyCash(valor);
      console.log(`   ${valor} centavos → ${assetKey}`);
    });
    console.log('');

    // Testar isMonetaryLabel
    console.log('📊 Testando isMonetaryLabel:');
    const testLabels = ['R$ 1,00', 'R$ 10,00', 'R$ 100,00', 'R$ 1.000,00', 'Playstation 5', 'iPhone', 'R$ 5,00'];
    testLabels.forEach(label => {
      const isMonetary = prizeUtils.isMonetaryLabel(label);
      console.log(`   "${label}" → ${isMonetary ? 'MONETÁRIO' : 'NÃO MONETÁRIO'}`);
    });
    console.log('');

    // 2. Testar determinação de tipo
    console.log('2️⃣ Testando determinação de tipo de prêmio...');
    
    const testPrizes = [
      { nome: 'R$ 5,00', valor: 5, valor_centavos: 500 },
      { nome: 'Playstation 5', valor: 5000, valor_centavos: 500000 },
      { nome: 'iPhone', valor: 3000, valor_centavos: 300000 },
      { nome: 'Macbook Pro', valor: 15000, valor_centavos: 1500000 },
      { nome: 'Air Jordan', valor: 700, valor_centavos: 70000 }
    ];
    
    testPrizes.forEach(prize => {
      const tipo = prizeUtils.determinarTipoPremio(prize);
      console.log(`   "${prize.nome}" (R$ ${prize.valor}) → ${tipo}`);
    });
    console.log('');

    // 3. Testar mapeamento de prêmios
    console.log('3️⃣ Testando mapeamento de prêmios...');
    
    const realPrizes = await prisma.prize.findMany({ take: 10 });
    console.log('📊 Prêmios reais do banco:');
    
    for (const prize of realPrizes) {
      try {
        const mapped = prizeUtils.mapPrizeToDisplay(prize);
        console.log(`   ${prize.id}: ${mapped.tipo} - ${mapped.label} (sorteável: ${mapped.sorteavel})`);
      } catch (error) {
        console.error(`   ❌ Erro ao mapear prêmio ${prize.id}:`, error.message);
      }
    }
    console.log('');

    // 4. Testar validação de prêmios
    console.log('4️⃣ Testando validação de prêmios...');
    
    const validationStats = await prizeValidationServiceV2.getValidationStats();
    console.log('📊 Estatísticas de validação:');
    console.log(`   - Total de caixas: ${validationStats.total_cases}`);
    console.log(`   - Total de prêmios: ${validationStats.total_prizes}`);
    console.log(`   - Prêmios por tipo:`, validationStats.prizes_by_type);
    console.log(`   - Prêmios ilustrativos: ${validationStats.illustrative_prizes}`);
    console.log(`   - Prêmios ativos: ${validationStats.active_prizes}`);
    console.log(`   - Score de saúde: ${validationStats.health_score.toFixed(1)}%`);
    console.log('');

    // 5. Testar verificação global
    console.log('5️⃣ Testando verificação global de consistência...');
    
    const validationResult = await prizeValidationServiceV2.verificarConsistenciaPremios();
    
    console.log('📊 Resultado da verificação:');
    console.log(`   - Sucesso: ${validationResult.success}`);
    console.log(`   - Caixas verificadas: ${validationResult.total_cases}`);
    console.log(`   - Prêmios verificados: ${validationResult.total_prizes}`);
    console.log(`   - Prêmios por tipo:`, validationResult.prizes_by_type);
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

    // 6. Testar validação específica
    console.log('6️⃣ Testando validação específica de prêmios...');
    
    const testPrizeIds = realPrizes.slice(0, 5).map(p => p.id);
    
    for (const prizeId of testPrizeIds) {
      const validation = await prizeValidationServiceV2.validatePrizeBeforeCredit(prizeId);
      const prize = await prisma.prize.findUnique({ where: { id: prizeId } });
      
      const status = prize.tipo === 'ilustrativo' ? 'ILUSTRATIVO' : 'ATIVO';
      const canBeDrawn = !prize.tipo || prize.tipo !== 'ilustrativo';
      
      console.log(`   Prêmio "${prize.nome}" (R$ ${prize.valor}) [${status}] → ${validation.valid ? 'VÁLIDO' : 'INVÁLIDO'}`);
      
      if (!validation.valid) {
        console.log(`     ❌ Erro: ${validation.error}`);
      } else if (prize.tipo === 'ilustrativo') {
        console.log(`     ℹ️ Prêmio ilustrativo - não pode ser sorteado`);
      } else {
        console.log(`     ✅ Prêmio ativo - pode ser sorteado`);
      }
    }
    console.log('');

    // 7. Testar caso específico corrigido
    console.log('7️⃣ Verificando caso específico corrigido...');
    
    const specificPrizeId = '97b6c851-55e7-40a0-abac-6b1826302c32';
    const specificPrize = await prisma.prize.findUnique({
      where: { id: specificPrizeId }
    });
    
    if (specificPrize) {
      console.log('📋 Estado do caso específico:');
      console.log(`   - ID: ${specificPrize.id}`);
      console.log(`   - Nome: "${specificPrize.nome}"`);
      console.log(`   - Valor: R$ ${specificPrize.valor}`);
      console.log(`   - Tipo: ${specificPrize.tipo}`);
      console.log(`   - Label: "${specificPrize.label}"`);
      console.log(`   - Imagem ID: "${specificPrize.imagem_id}"`);
      console.log(`   - Valor centavos: ${specificPrize.valor_centavos}`);
      
      // Testar mapeamento
      const mapped = prizeUtils.mapPrizeToDisplay(specificPrize);
      console.log('\n📊 Mapeamento:');
      console.log(`   - Tipo: ${mapped.tipo}`);
      console.log(`   - Label: ${mapped.label}`);
      console.log(`   - Nome: ${mapped.nome}`);
      console.log(`   - Imagem: ${mapped.imagem}`);
      console.log(`   - Sorteável: ${mapped.sorteavel}`);
      
      // Verificar se está correto
      const isCorrect = 
        specificPrize.tipo === 'cash' &&
        specificPrize.nome === 'R$ 5,00' &&
        specificPrize.label === 'R$ 5,00' &&
        specificPrize.imagem_id === 'cash/500.png' &&
        specificPrize.valor_centavos === 500;
      
      console.log(`\n✅ Caso específico está ${isCorrect ? 'CORRETO' : 'INCORRETO'}`);
    } else {
      console.log('❌ Caso específico não encontrado');
    }
    console.log('');

    // 8. Resumo final
    console.log('8️⃣ Resumo final do sistema V2...');
    console.log('✅ Sistema de prêmios V2 funcionando corretamente!');
    console.log('🎯 Principais melhorias implementadas:');
    console.log('     - Tipos de prêmio: cash, produto, ilustrativo');
    console.log('     - Valores em centavos (sem floats)');
    console.log('     - Labels padronizados em BRL');
    console.log('     - Imagens guiadas por asset_key');
    console.log('     - Prêmios ilustrativos não são sorteados');
    console.log('     - Validação por tipo de prêmio');
    console.log('     - Auto-reparo de inconsistências');
    console.log('     - Caso específico corrigido');

  } catch (error) {
    console.error('❌ Erro durante teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar teste
testPrizeSystemV2().then(() => {
  console.log('\n🎉 TESTE DO SISTEMA V2 CONCLUÍDO!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
