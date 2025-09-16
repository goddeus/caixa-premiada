const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://slotbox_user:IIVi8N0l6lzCaT72ueXeWdixJOFFRiZI@dpg-d31qva3ipnbc73cjkas0-a/slotbox_db"
    }
  }
});

async function fixInconsistencies() {
  console.log('🔧 CORRIGINDO INCONSISTÊNCIAS DE PRÊMIOS E PREÇOS\n');
  
  try {
    // 1. Corrigir nome da caixa Premium Master
    console.log('1. Corrigindo nome da caixa Premium Master...');
    const updateCase = await prisma.case.updateMany({
      where: { nome: 'CAIXA PREMIUM MASTER' },
      data: { nome: 'CAIXA PREMIUM MASTER!' }
    });
    console.log(`   ✅ ${updateCase.count} caixa(s) atualizada(s)\n`);

    // 2. Corrigir valores dos prêmios
    console.log('2. Corrigindo valores dos prêmios...');
    
    // STEAM DECK
    const steamDeck = await prisma.prize.updateMany({
      where: { 
        nome: 'STEAM DECK',
        case: { nome: 'CAIXA CONSOLE DOS SONHOS' }
      },
      data: { valor: 2500 }
    });
    console.log(`   ✅ STEAM DECK: ${steamDeck.count} prêmio(s) atualizado(s)`);

    // PLAYSTATION 5
    const ps5 = await prisma.prize.updateMany({
      where: { 
        nome: 'PLAYSTATION 5',
        case: { nome: 'CAIXA CONSOLE DOS SONHOS' }
      },
      data: { valor: 5000 }
    });
    console.log(`   ✅ PLAYSTATION 5: ${ps5.count} prêmio(s) atualizado(s)`);

    // XBOX ONE X
    const xbox = await prisma.prize.updateMany({
      where: { 
        nome: 'XBOX ONE X',
        case: { nome: 'CAIXA CONSOLE DOS SONHOS' }
      },
      data: { valor: 3500 }
    });
    console.log(`   ✅ XBOX ONE X: ${xbox.count} prêmio(s) atualizado(s)`);

    // HONDA CG FAN
    const honda = await prisma.prize.updateMany({
      where: { 
        nome: 'HONDA CG FAN',
        case: { nome: 'CAIXA PREMIUM MASTER!' }
      },
      data: { valor: 25000 }
    });
    console.log(`   ✅ HONDA CG FAN: ${honda.count} prêmio(s) atualizado(s)`);

    // SAMSUNG S25
    const samsung = await prisma.prize.updateMany({
      where: { 
        nome: 'SAMSUNG S25',
        case: { nome: 'CAIXA PREMIUM MASTER!' }
      },
      data: { valor: 5000 }
    });
    console.log(`   ✅ SAMSUNG S25: ${samsung.count} prêmio(s) atualizado(s)\n`);

    // 3. Verificar se as correções foram aplicadas
    console.log('3. Verificando correções...');
    
    const consoleCase = await prisma.case.findFirst({
      where: { nome: 'CAIXA CONSOLE DOS SONHOS' },
      include: { prizes: true }
    });

    const premiumCase = await prisma.case.findFirst({
      where: { nome: 'CAIXA PREMIUM MASTER!' },
      include: { prizes: true }
    });

    console.log('\n📊 RESULTADO DAS CORREÇÕES:');
    console.log(`\n🎯 CAIXA CONSOLE DOS SONHOS:`);
    consoleCase.prizes.forEach(prize => {
      if (['STEAM DECK', 'PLAYSTATION 5', 'XBOX ONE X'].includes(prize.nome)) {
        console.log(`   ✅ ${prize.nome}: R$ ${prize.valor}`);
      }
    });

    console.log(`\n🎯 CAIXA PREMIUM MASTER!:`);
    premiumCase.prizes.forEach(prize => {
      if (['HONDA CG FAN', 'SAMSUNG S25'].includes(prize.nome)) {
        console.log(`   ✅ ${prize.nome}: R$ ${prize.valor}`);
      }
    });

    console.log('\n✅ TODAS AS CORREÇÕES APLICADAS COM SUCESSO!');

  } catch (error) {
    console.error('❌ Erro ao aplicar correções:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar correções
fixInconsistencies();
