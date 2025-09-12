const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixPremiumMasterPrizes() {
  console.log('🔧 CORRIGINDO PRÊMIOS DA CAIXA PREMIUM MASTER...\n');

  try {
    // 1. Buscar a caixa Premium Master
    const premiumCase = await prisma.case.findFirst({
      where: { nome: 'CAIXA PREMIUM MASTER!' }
    });

    if (!premiumCase) {
      console.log('❌ Caixa Premium Master não encontrada');
      return;
    }

    console.log(`📦 Caixa encontrada: "${premiumCase.nome}" (ID: ${premiumCase.id})`);

    // 2. Buscar prêmios da caixa
    const prizes = await prisma.prize.findMany({
      where: { case_id: premiumCase.id }
    });

    console.log(`📋 Prêmios encontrados: ${prizes.length}`);

    // 3. Corrigir prêmios de dinheiro
    const cashPrizes = [
      { nome: '100REAIS', valor_centavos: 10000, label: 'R$ 100,00' },
      { nome: '10REAIS', valor_centavos: 1000, label: 'R$ 10,00' },
      { nome: '1REAL', valor_centavos: 100, label: 'R$ 1,00' },
      { nome: '20REAIS', valor_centavos: 2000, label: 'R$ 20,00' },
      { nome: '2REAIS', valor_centavos: 200, label: 'R$ 2,00' },
      { nome: '500REAIS', valor_centavos: 50000, label: 'R$ 500,00' },
      { nome: '50REAIS', valor_centavos: 5000, label: 'R$ 50,00' },
      { nome: '5REAIS', valor_centavos: 500, label: 'R$ 5,00' }
    ];

    console.log('\n💰 Corrigindo prêmios de dinheiro...');
    
    for (const cashPrize of cashPrizes) {
      const prize = prizes.find(p => p.nome === cashPrize.nome);
      if (prize) {
        await prisma.prize.update({
          where: { id: prize.id },
          data: {
            nome: cashPrize.label,
            valor: cashPrize.valor_centavos / 100,
            valor_centavos: cashPrize.valor_centavos,
            tipo: 'cash',
            label: cashPrize.label
          }
        });
        console.log(`   ✅ ${cashPrize.nome} → ${cashPrize.label}`);
      }
    }

    // 4. Verificar resultado final
    console.log('\n📋 Prêmios finais da CAIXA PREMIUM MASTER:');
    console.log('='.repeat(60));
    
    const finalPrizes = await prisma.prize.findMany({
      where: { case_id: premiumCase.id },
      orderBy: { valor_centavos: 'asc' }
    });

    finalPrizes.forEach((prize, index) => {
      const valorFormatado = `R$ ${(prize.valor_centavos / 100).toFixed(2).replace('.', ',')}`;
      console.log(`${index + 1}. ${prize.nome} → ${valorFormatado} (${prize.tipo})`);
    });

  } catch (error) {
    console.error('❌ Erro durante correção:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar correção
fixPremiumMasterPrizes().then(() => {
  console.log('\n🎉 CORREÇÃO CONCLUÍDA!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
