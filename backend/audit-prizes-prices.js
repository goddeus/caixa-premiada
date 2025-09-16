const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function auditPrizesAndPrices() {
  console.log('🔍 AUDITORIA DE PRÊMIOS E PREÇOS DAS CAIXAS\n');
  
  try {
    // Buscar todas as caixas
    const cases = await prisma.case.findMany({
      include: {
        prizes: {
          orderBy: { valor: 'asc' }
        }
      }
    });

    console.log(`📦 Total de caixas encontradas: ${cases.length}\n`);

    for (const caseItem of cases) {
      console.log(`🎯 CAIXA: ${caseItem.nome}`);
      console.log(`   💰 Preço: R$ ${caseItem.preco}`);
      console.log(`   📝 Descrição: ${caseItem.descricao || 'N/A'}`);
      console.log(`   🖼️ Imagem: ${caseItem.imagem}`);
      console.log(`   🎁 Total de prêmios: ${caseItem.prizes.length}`);
      
      console.log('\n   📋 PRÊMIOS:');
      caseItem.prizes.forEach((prize, index) => {
        console.log(`   ${index + 1}. ${prize.nome} - R$ ${prize.valor} (${prize.probabilidade * 100}%)`);
        console.log(`      🖼️ Imagem: ${prize.imagem || 'N/A'}`);
        console.log(`      🆔 ID: ${prize.id}`);
      });
      
      console.log('\n' + '='.repeat(80) + '\n');
    }

    // Verificar inconsistências
    console.log('🔍 VERIFICAÇÃO DE INCONSISTÊNCIAS:\n');
    
    for (const caseItem of cases) {
      const caseName = caseItem.nome;
      const expectedImages = getExpectedImages(caseName);
      
      console.log(`🎯 ${caseName}:`);
      console.log(`   📁 Imagens esperadas: ${expectedImages.length}`);
      expectedImages.forEach(img => console.log(`      - ${img}`));
      
      console.log(`   🎁 Prêmios no DB: ${caseItem.prizes.length}`);
      caseItem.prizes.forEach(prize => {
        if (prize.imagem) {
          const imageName = prize.imagem.split('/').pop();
          const isExpected = expectedImages.some(expected => expected.includes(imageName));
          console.log(`      ✅ ${prize.nome}: ${prize.imagem} ${isExpected ? '(OK)' : '(❌ IMAGEM NÃO ENCONTRADA)'}`);
        } else {
          console.log(`      ⚠️ ${prize.nome}: SEM IMAGEM`);
        }
      });
      
      console.log('');
    }

  } catch (error) {
    console.error('❌ Erro na auditoria:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function getExpectedImages(caseName) {
  const imageMap = {
    'CAIXA FINAL DE SEMANA': [
      '1.png', '2.png', '5.png', '10.png', '100.png', '500.webp'
    ],
    'CAIXA APPLE': [
      '1.png', '2.png', '5.png', '10.png', '500.webp',
      'air pods.png', 'iphone 16 pro max.png', 'macbook.png'
    ],
    'CAIXA SAMSUNG': [
      '1.png', '2.png', '5.png', '10.png', '100.png', '500.webp',
      'fone samsung.png', 'notebook samsung.png', 's25.png'
    ],
    'CAIXA KIT NIKE': [
      '1.png', '2.png', '5.png', '10.png',
      'airforce.webp', 'boné nike.png', 'camisa nike.webp', 'jordan.png', 'nike dunk.webp'
    ],
    'CAIXA PREMIUM MASTER!': [
      '2.png', '5.png', '10.png', '20.png', '500.webp',
      'airpods.png', 'honda cg fan.webp', 'ipad.png', 'iphone 16 pro max.png', 
      'macbook.png', 'samsung s25.png'
    ],
    'CAIXA CONSOLE DOS SONHOS': [
      '1real.png', '2reais.png', '5reais.png', '10reais.png', '100reais.png',
      'ps5.png', 'steamdeck.png', 'xboxone.webp'
    ]
  };
  
  return imageMap[caseName] || [];
}

// Executar auditoria
auditPrizesAndPrices();
