const { PrismaClient } = require('@prisma/client');
const globalDrawService = require('./src/services/globalDrawService');

const prisma = new PrismaClient();

async function debugSaldo() {
  try {
    console.log('🔍 DEBUG DE SALDO - VERIFICANDO DÉBITOS\n');
    
    // 1. Buscar conta normal
    let normalUser = await prisma.user.findFirst({
      where: { 
        tipo_conta: { not: 'afiliado_demo' },
        ativo: true
      }
    });
    
    if (!normalUser) {
      console.log('❌ Nenhuma conta normal encontrada');
      return;
    }
    
    // Atualizar saldo para R$ 100,00
    await prisma.user.update({
      where: { id: normalUser.id },
      data: { saldo: 100 }
    });
    
    console.log(`👤 Conta: ${normalUser.nome}`);
    console.log(`💰 Saldo inicial: R$ 100.00\n`);
    
    // 2. Testar compra de CAIXA WEEKEND (R$ 1,50)
    const weekendId = 'b39feef0-d72f-4423-a561-da5fd543b15e';
    const price = 1.5;
    
    console.log(`📦 Testando CAIXA WEEKEND (R$ ${price})`);
    console.log('=' * 40);
    
    // Verificar saldo antes
    const userBefore = await prisma.user.findUnique({
      where: { id: normalUser.id },
      select: { saldo: true }
    });
    
    console.log(`💰 Saldo antes da compra: R$ ${userBefore.saldo}`);
    
    try {
      const result = await globalDrawService.sortearPremio(weekendId, normalUser.id);
      
      // Verificar saldo depois
      const userAfter = await prisma.user.findUnique({
        where: { id: normalUser.id },
        select: { saldo: true }
      });
      
      const saldoVariacao = userAfter.saldo - userBefore.saldo;
      const esperado = result.prize.valor - price;
      
      console.log(`💰 Saldo depois da compra: R$ ${userAfter.saldo}`);
      console.log(`💰 Variação real: R$ ${saldoVariacao.toFixed(2)}`);
      console.log(`💰 Esperado: R$ ${esperado.toFixed(2)}`);
      console.log(`🎁 Prêmio: ${result.prize.nome} - R$ ${result.prize.valor}`);
      console.log(`✅ Cálculo correto: ${Math.abs(saldoVariacao - esperado) < 0.01 ? 'SIM' : 'NÃO'}`);
      
      // Verificar transações
      const transactions = await prisma.transaction.findMany({
        where: { user_id: normalUser.id },
        orderBy: { criado_em: 'desc' },
        take: 5
      });
      
      console.log(`\n📋 Últimas transações:`);
      transactions.forEach(t => {
        console.log(`   ${t.tipo}: R$ ${t.valor} - ${t.descricao}`);
      });
      
    } catch (error) {
      console.log(`❌ Erro: ${error.message}`);
    }
    
    // 3. Testar compra de CAIXA KIT NIKE (R$ 2,50)
    console.log(`\n📦 Testando CAIXA KIT NIKE (R$ 2.50)`);
    console.log('=' * 40);
    
    const nikeId = 'f6e19259-443b-484c-b7a1-9f670ad2e0b8';
    const nikePrice = 2.5;
    
    // Verificar saldo antes
    const userBeforeNike = await prisma.user.findUnique({
      where: { id: normalUser.id },
      select: { saldo: true }
    });
    
    console.log(`💰 Saldo antes da compra: R$ ${userBeforeNike.saldo}`);
    
    try {
      const result = await globalDrawService.sortearPremio(nikeId, normalUser.id);
      
      // Verificar saldo depois
      const userAfterNike = await prisma.user.findUnique({
        where: { id: normalUser.id },
        select: { saldo: true }
      });
      
      const saldoVariacao = userAfterNike.saldo - userBeforeNike.saldo;
      const esperado = result.prize.valor - nikePrice;
      
      console.log(`💰 Saldo depois da compra: R$ ${userAfterNike.saldo}`);
      console.log(`💰 Variação real: R$ ${saldoVariacao.toFixed(2)}`);
      console.log(`💰 Esperado: R$ ${esperado.toFixed(2)}`);
      console.log(`🎁 Prêmio: ${result.prize.nome} - R$ ${result.prize.valor}`);
      console.log(`✅ Cálculo correto: ${Math.abs(saldoVariacao - esperado) < 0.01 ? 'SIM' : 'NÃO'}`);
      
    } catch (error) {
      console.log(`❌ Erro: ${error.message}`);
    }
    
    console.log('\n🎉 DEBUG CONCLUÍDO!');
    
  } catch (error) {
    console.error('❌ Erro no debug:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugSaldo();
