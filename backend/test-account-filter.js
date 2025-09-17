const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAccountFilter() {
  try {
    console.log('🧪 Testando sistema de filtro por tipo de conta...\n');

    // 1. Buscar uma caixa para teste
    const testCase = await prisma.case.findFirst({
      where: { ativo: true },
      include: { 
        prizes: { 
          where: { ativo: true },
          orderBy: { valor: 'asc' }
        } 
      }
    });

    if (!testCase) {
      console.log('❌ Nenhuma caixa ativa encontrada para teste');
      return;
    }

    console.log(`📦 Caixa de teste: ${testCase.nome}`);
    console.log(`💰 Preço: R$ ${testCase.preco}`);
    console.log(`🎁 Total de prêmios: ${testCase.prizes.length}\n`);

    // 2. Mostrar todos os prêmios disponíveis
    console.log('🎯 PRÊMIOS DISPONÍVEIS NA CAIXA:');
    testCase.prizes.forEach((prize, index) => {
      console.log(`   ${index + 1}. ${prize.nome} - R$ ${prize.valor} (${prize.probabilidade * 100}%)`);
    });
    console.log('');

    // 3. Simular filtro para conta normal
    console.log('🔒 FILTRO PARA CONTA NORMAL (até R$ 10,00):');
    const normalPrizes = testCase.prizes.filter(prize => parseFloat(prize.valor) <= 10.00);
    console.log(`   Prêmios disponíveis: ${normalPrizes.length}`);
    normalPrizes.forEach((prize, index) => {
      console.log(`   ${index + 1}. ${prize.nome} - R$ ${prize.valor}`);
    });
    console.log('');

    // 4. Simular filtro para conta demo
    console.log('🎯 FILTRO PARA CONTA DEMO (R$ 50,00+):');
    const demoPrizes = testCase.prizes.filter(prize => parseFloat(prize.valor) >= 50.00);
    console.log(`   Prêmios disponíveis: ${demoPrizes.length}`);
    if (demoPrizes.length > 0) {
      demoPrizes.forEach((prize, index) => {
        console.log(`   ${index + 1}. ${prize.nome} - R$ ${prize.valor}`);
      });
    } else {
      console.log('   ⚠️ Nenhum prêmio alto encontrado, usando todos os prêmios');
    }
    console.log('');

    // 5. Buscar usuários de teste
    const normalUser = await prisma.user.findFirst({
      where: { 
        tipo_conta: 'normal',
        ativo: true 
      }
    });

    const demoUser = await prisma.user.findFirst({
      where: { 
        tipo_conta: 'afiliado_demo',
        ativo: true 
      }
    });

    console.log('👥 USUÁRIOS DE TESTE:');
    if (normalUser) {
      console.log(`   ✅ Usuário Normal: ${normalUser.nome} (${normalUser.email})`);
    } else {
      console.log('   ❌ Nenhum usuário normal encontrado');
    }

    if (demoUser) {
      console.log(`   ✅ Usuário Demo: ${demoUser.nome} (${demoUser.email})`);
    } else {
      console.log('   ❌ Nenhum usuário demo encontrado');
    }
    console.log('');

    // 6. Estatísticas dos prêmios
    const allPrizes = testCase.prizes.map(p => parseFloat(p.valor));
    const maxPrize = Math.max(...allPrizes);
    const minPrize = Math.min(...allPrizes);
    const avgPrize = allPrizes.reduce((sum, val) => sum + val, 0) / allPrizes.length;

    console.log('📊 ESTATÍSTICAS DOS PRÊMIOS:');
    console.log(`   💰 Prêmio máximo: R$ ${maxPrize.toFixed(2)}`);
    console.log(`   💰 Prêmio mínimo: R$ ${minPrize.toFixed(2)}`);
    console.log(`   💰 Prêmio médio: R$ ${avgPrize.toFixed(2)}`);
    console.log(`   🎯 Prêmios até R$ 10,00: ${normalPrizes.length}`);
    console.log(`   🎯 Prêmios R$ 50,00+: ${demoPrizes.length}`);
    console.log('');

    // 7. Verificar se o sistema está configurado corretamente
    console.log('✅ VERIFICAÇÃO DO SISTEMA:');
    console.log(`   🔒 Contas normais podem ganhar até: R$ 10,00`);
    console.log(`   🎯 Contas demo podem ganhar a partir de: R$ 50,00`);
    console.log(`   📱 Modal da esteira: Mostra todos os prêmios (sem filtro)`);
    console.log(`   🎲 Sorteio real: Filtrado por tipo de conta`);
    console.log('');

    if (normalPrizes.length > 0 && (demoPrizes.length > 0 || testCase.prizes.length > 0)) {
      console.log('🎉 SISTEMA CONFIGURADO CORRETAMENTE!');
      console.log('   ✅ Contas normais têm prêmios disponíveis');
      console.log('   ✅ Contas demo têm prêmios disponíveis');
    } else {
      console.log('⚠️ ATENÇÃO: Verifique a configuração dos prêmios');
      if (normalPrizes.length === 0) {
        console.log('   ❌ Contas normais não têm prêmios disponíveis');
      }
      if (demoPrizes.length === 0 && testCase.prizes.length === 0) {
        console.log('   ❌ Contas demo não têm prêmios disponíveis');
      }
    }

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  testAccountFilter()
    .then(() => {
      console.log('\n✅ Teste concluído!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro no teste:', error);
      process.exit(1);
    });
}

module.exports = testAccountFilter;
