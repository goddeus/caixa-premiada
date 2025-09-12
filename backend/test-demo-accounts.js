const { PrismaClient } = require('@prisma/client');
const centralizedDrawService = require('./src/services/centralizedDrawService');

const prisma = new PrismaClient();

async function testDemoAccounts() {
  try {
    console.log('🧪 TESTE DAS CONTAS DEMO');
    console.log('=' .repeat(50));

    // 1. Buscar uma conta demo
    const demoUser = await prisma.user.findFirst({
      where: { tipo_conta: 'afiliado_demo' },
      select: { id: true, nome: true, email: true, saldo: true }
    });

    if (!demoUser) {
      console.log('❌ Nenhuma conta demo encontrada');
      return;
    }

    console.log(`👤 Conta demo encontrada: ${demoUser.nome} (${demoUser.email})`);
    console.log(`💰 Saldo inicial: R$ ${demoUser.saldo}`);

    // 2. Buscar uma caixa
    const caixa = await prisma.case.findFirst({
      where: { ativo: true },
      include: { prizes: true }
    });

    if (!caixa) {
      console.log('❌ Nenhuma caixa encontrada');
      return;
    }

    console.log(`📦 Caixa encontrada: ${caixa.nome} (R$ ${caixa.preco})`);
    console.log(`🎁 Prêmios disponíveis: ${caixa.prizes.length}`);

    // 3. Testar abertura de caixa demo
    console.log('\n🎲 Testando abertura de caixa demo...');
    
    try {
      const result = await centralizedDrawService.sortearPremio(caixa.id, demoUser.id);
      
      if (result.success) {
        console.log('✅ Sorteio demo executado com sucesso!');
        console.log(`🎁 Prêmio: ${result.prize.nome}`);
        console.log(`💰 Valor: R$ ${result.prize.valor}`);
        console.log(`📝 Mensagem: ${result.message}`);
        console.log(`🎭 É demo: ${result.is_demo}`);
      } else {
        console.log('❌ Erro no sorteio demo:', result.message);
      }
    } catch (error) {
      console.log('❌ Erro ao executar sorteio demo:', error.message);
    }

    // 4. Verificar saldo após teste
    const updatedUser = await prisma.user.findUnique({
      where: { id: demoUser.id },
      select: { saldo: true }
    });

    console.log(`💰 Saldo após teste: R$ ${updatedUser.saldo}`);

    // 5. Testar múltiplas aberturas
    console.log('\n🎲 Testando múltiplas aberturas...');
    
    for (let i = 1; i <= 5; i++) {
      try {
        const result = await centralizedDrawService.sortearPremio(caixa.id, demoUser.id);
        console.log(`Abertura ${i}: ${result.prize.nome} - R$ ${result.prize.valor}`);
      } catch (error) {
        console.log(`Abertura ${i}: Erro - ${error.message}`);
      }
    }

    // 6. Verificar saldo final
    const finalUser = await prisma.user.findUnique({
      where: { id: demoUser.id },
      select: { saldo: true }
    });

    console.log(`💰 Saldo final: R$ ${finalUser.saldo}`);

    // 7. Verificar transações
    const transactions = await prisma.transaction.findMany({
      where: { user_id: demoUser.id },
      orderBy: { criado_em: 'desc' },
      take: 10
    });

    console.log('\n📋 Últimas transações:');
    transactions.forEach(t => {
      console.log(`- ${t.tipo}: R$ ${t.valor} - ${t.descricao}`);
    });

    console.log('\n✅ Teste das contas demo concluído!');

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDemoAccounts();
