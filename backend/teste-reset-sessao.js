const { PrismaClient } = require('@prisma/client');
const globalDrawService = require('./src/services/globalDrawService');

const prisma = new PrismaClient();

// Mapeamento de IDs das caixas
const CASE_MAPPING = {
  'weekend-case': 'b39feef0-d72f-4423-a561-da5fd543b15e',
  'nike-case': 'f6e19259-443b-484c-b7a1-9f670ad2e0b8',
  'samsung-case': 'f6db398c-0c14-403a-bb88-76e11c0bdcaa',
  'console-case': '605b9275-c22b-4e73-a290-95ff7997baf5',
  'apple-case': '34776309-0312-4c18-aba6-577823331d52',
  'premium-master-case': 'ef8d6aee-d210-4567-9029-bde0280d396e'
};

// Dados das caixas
const CASE_DATA = {
  'weekend-case': { name: 'CAIXA WEEKEND', price: 1.5 },
  'nike-case': { name: 'CAIXA KIT NIKE', price: 2.5 },
  'samsung-case': { name: 'CAIXA SAMSUNG', price: 3.0 },
  'console-case': { name: 'CAIXA CONSOLE', price: 3.5 },
  'apple-case': { name: 'CAIXA APPLE', price: 7.0 },
  'premium-master-case': { name: 'CAIXA PREMIUM', price: 15.0 }
};

async function resetUserSession(userId) {
  try {
    // Finalizar todas as sessões ativas
    await prisma.userSession.updateMany({
      where: { 
        user_id: userId,
        ativo: true
      },
      data: { 
        ativo: false,
        finalizado_em: new Date()
      }
    });
    
    // Limpar logs de RTP
    await prisma.drawLog.deleteMany({
      where: { user_id: userId }
    });
    
    console.log('   🔄 Sessão resetada');
  } catch (error) {
    console.log('   ⚠️ Erro ao resetar sessão:', error.message);
  }
}

async function testSinglePurchase(caseId, caseName, price, userId) {
  try {
    const userBefore = await prisma.user.findUnique({
      where: { id: userId },
      select: { saldo: true }
    });
    
    const result = await globalDrawService.sortearPremio(caseId, userId);
    
    const userAfter = await prisma.user.findUnique({
      where: { id: userId },
      select: { saldo: true }
    });
    
    const saldoVariacao = userAfter.saldo - userBefore.saldo;
    const esperado = result.prize.valor - price;
    const calculoCorreto = Math.abs(saldoVariacao - esperado) < 0.01;
    
    return {
      caseName,
      price,
      saldoAntes: userBefore.saldo,
      saldoDepois: userAfter.saldo,
      variacao: saldoVariacao,
      premio: result.prize.valor,
      esperado,
      calculoCorreto,
      premioNome: result.prize.nome
    };
    
  } catch (error) {
    return {
      caseName,
      price,
      error: error.message
    };
  }
}

async function runTestWithReset() {
  try {
    console.log('🚀 TESTE COM RESET DE SESSÃO - TODAS AS CAIXAS\n');
    console.log('=' * 70);
    
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
    
    // Atualizar saldo para R$ 1.000,00
    await prisma.user.update({
      where: { id: normalUser.id },
      data: { saldo: 1000 }
    });
    
    console.log(`👤 Conta: ${normalUser.nome}`);
    console.log(`💰 Saldo inicial: R$ 1000.00\n`);
    
    const allResults = [];
    
    // 2. Testar cada caixa
    for (const [frontendId, realId] of Object.entries(CASE_MAPPING)) {
      const { name, price } = CASE_DATA[frontendId];
      
      console.log(`📦 ${name} (R$ ${price})`);
      console.log('=' * 50);
      
      // Resetar sessão antes de cada caixa
      await resetUserSession(normalUser.id);
      
      const caseResults = [];
      
      // Testar quantidades 1, 2, 3, 4, 5
      for (let qty = 1; qty <= 5; qty++) {
        console.log(`\n🔢 Quantidade: ${qty}`);
        
        let totalVariacao = 0;
        let totalPremios = 0;
        let sucessos = 0;
        
        // Comprar cada caixa individualmente
        for (let i = 0; i < qty; i++) {
          console.log(`   🎲 Comprando caixa ${i+1}/${qty}...`);
          
          const result = await testSinglePurchase(realId, name, price, normalUser.id);
          
          if (result.error) {
            console.log(`      ❌ ${result.error}`);
          } else {
            totalVariacao += result.variacao;
            totalPremios += result.premio;
            if (result.calculoCorreto) sucessos++;
            
            const premioText = result.premio > 0 ? `R$ ${result.premio.toFixed(2)}` : 'Sem prêmio';
            const status = result.calculoCorreto ? '✅' : '❌';
            console.log(`      ${result.premioNome} - ${premioText} (${status})`);
          }
          
          // Pausa entre compras
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        const custoTotal = price * qty;
        const lucro = totalPremios - custoTotal;
        const calculoCorreto = Math.abs(totalVariacao - lucro) < 0.01;
        
        console.log(`\n   📊 RESUMO:`);
        console.log(`     Custo total: R$ ${custoTotal.toFixed(2)}`);
        console.log(`     Prêmios totais: R$ ${totalPremios.toFixed(2)}`);
        console.log(`     Lucro/Prejuízo: R$ ${lucro.toFixed(2)}`);
        console.log(`     Variação real: R$ ${totalVariacao.toFixed(2)}`);
        console.log(`     Cálculo correto: ${calculoCorreto ? '✅' : '❌'}`);
        console.log(`     Sucessos: ${sucessos}/${qty} (${((sucessos/qty)*100).toFixed(1)}%)`);
        
        caseResults.push({
          quantity: qty,
          custoTotal,
          premiosTotal: totalPremios,
          lucro,
          variacao: totalVariacao,
          calculoCorreto,
          sucessos,
          total: qty
        });
      }
      
      allResults.push({
        caseName: name,
        casePrice: price,
        results: caseResults
      });
      
      console.log(`\n🎯 ${name} - RESUMO FINAL:`);
      const totalSucessos = caseResults.reduce((sum, r) => sum + r.sucessos, 0);
      const totalCompras = caseResults.reduce((sum, r) => sum + r.total, 0);
      const totalCalculosCorretos = caseResults.filter(r => r.calculoCorreto).length;
      console.log(`   Sucessos individuais: ${totalSucessos}/${totalCompras} (${((totalSucessos/totalCompras)*100).toFixed(1)}%)`);
      console.log(`   Cálculos corretos: ${totalCalculosCorretos}/${caseResults.length} (${((totalCalculosCorretos/caseResults.length)*100).toFixed(1)}%)`);
    }
    
    // 3. Relatório final
    console.log('\n\n📊 RELATÓRIO FINAL');
    console.log('=' * 80);
    
    let totalSucessos = 0;
    let totalCompras = 0;
    let totalCalculosCorretos = 0;
    let totalCasos = 0;
    
    for (const caseResult of allResults) {
      const caseSucessos = caseResult.results.reduce((sum, r) => sum + r.sucessos, 0);
      const caseCompras = caseResult.results.reduce((sum, r) => sum + r.total, 0);
      const caseCalculosCorretos = caseResult.results.filter(r => r.calculoCorreto).length;
      
      totalSucessos += caseSucessos;
      totalCompras += caseCompras;
      totalCalculosCorretos += caseCalculosCorretos;
      totalCasos += caseResult.results.length;
      
      console.log(`\n📦 ${caseResult.caseName} (R$ ${caseResult.casePrice}):`);
      console.log(`   Sucessos individuais: ${caseSucessos}/${caseCompras} (${((caseSucessos/caseCompras)*100).toFixed(1)}%)`);
      console.log(`   Cálculos corretos: ${caseCalculosCorretos}/${caseResult.results.length} (${((caseCalculosCorretos/caseResult.results.length)*100).toFixed(1)}%)`);
    }
    
    console.log(`\n🎯 RESUMO GERAL:`);
    console.log(`   Sucessos individuais: ${totalSucessos}/${totalCompras} (${((totalSucessos/totalCompras)*100).toFixed(1)}%)`);
    console.log(`   Cálculos corretos: ${totalCalculosCorretos}/${totalCasos} (${((totalCalculosCorretos/totalCasos)*100).toFixed(1)}%)`);
    
    // Verificar saldo final
    const userFinal = await prisma.user.findUnique({
      where: { id: normalUser.id },
      select: { saldo: true }
    });
    
    console.log(`\n💰 Saldo final: R$ ${userFinal.saldo}`);
    console.log(`💰 Saldo inicial: R$ 1000.00`);
    console.log(`💰 Variação total: R$ ${(userFinal.saldo - 1000).toFixed(2)}`);
    
    console.log('\n🎉 TESTE COMPLETO FINALIZADO!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

runTestWithReset();
