const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://slotbox_user:IIVi8N0l6lzCaT72ueXeWdixJOFFRiZI@dpg-d31qva3ipnbc73cjkas0-a/slotbox_db"
    }
  }
});

async function checkPrizes() {
  try {
    console.log('🔍 Verificando prêmios e preços...\n');
    
    const cases = await prisma.case.findMany({
      include: {
        prizes: {
          orderBy: { valor: 'asc' }
        }
      }
    });

    console.log(`📦 Total de caixas: ${cases.length}\n`);

    cases.forEach(caseItem => {
      console.log(`🎯 ${caseItem.nome}`);
      console.log(`   💰 Preço: R$ ${caseItem.preco}`);
      console.log(`   🎁 Prêmios (${caseItem.prizes.length}):`);
      
      caseItem.prizes.forEach(prize => {
        console.log(`      - ${prize.nome}: R$ ${prize.valor} (${prize.probabilidade * 100}%)`);
        if (prize.imagem) {
          console.log(`        🖼️ ${prize.imagem}`);
        }
      });
      console.log('');
    });

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkPrizes();
