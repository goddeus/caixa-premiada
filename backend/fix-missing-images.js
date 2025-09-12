const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function fixMissingImages() {
  console.log('🔍 VERIFICANDO E CORRIGINDO IMAGENS FALTANDO...\n');

  try {
    // 1. Buscar todos os prêmios
    const prizes = await prisma.prize.findMany({
      orderBy: { case_id: 'asc' }
    });

    console.log(`📋 Verificando ${prizes.length} prêmios...\n`);

    let fixedCount = 0;
    let missingCount = 0;

    for (const prize of prizes) {
      console.log(`🎁 Verificando: ${prize.nome}`);
      
      // Buscar a caixa do prêmio
      const caseItem = await prisma.case.findUnique({
        where: { id: prize.case_id }
      });

      if (!caseItem) {
        console.log(`   ❌ Caixa não encontrada`);
        continue;
      }

      // Gerar caminho esperado da imagem
      const expectedImagePath = generateImagePath(prize, caseItem.nome);
      const fullPath = path.join(__dirname, '..', 'frontend', 'public', expectedImagePath);

      console.log(`   📁 Caminho esperado: ${expectedImagePath}`);
      console.log(`   📁 Caminho completo: ${fullPath}`);

      // Verificar se a imagem existe
      if (fs.existsSync(fullPath)) {
        console.log(`   ✅ Imagem encontrada`);
        
        // Atualizar no banco se necessário
        if (prize.imagem_url !== expectedImagePath) {
          await prisma.prize.update({
            where: { id: prize.id },
            data: { 
              imagem_url: expectedImagePath,
              imagem_id: expectedImagePath
            }
          });
          console.log(`   🔄 Caminho atualizado no banco`);
          fixedCount++;
        }
      } else {
        console.log(`   ❌ Imagem não encontrada`);
        
        // Tentar encontrar imagem alternativa
        const alternativePath = findAlternativeImage(prize, caseItem.nome);
        if (alternativePath) {
          console.log(`   🔍 Imagem alternativa encontrada: ${alternativePath}`);
          
          await prisma.prize.update({
            where: { id: prize.id },
            data: { 
              imagem_url: alternativePath,
              imagem_id: alternativePath
            }
          });
          console.log(`   🔄 Caminho alternativo aplicado`);
          fixedCount++;
        } else {
          console.log(`   ⚠️ Nenhuma imagem alternativa encontrada`);
          missingCount++;
        }
      }
      
      console.log('');
    }

    console.log('📊 RESUMO DA CORREÇÃO:');
    console.log(`✅ Imagens corrigidas: ${fixedCount}`);
    console.log(`❌ Imagens ainda faltando: ${missingCount}`);

    // 2. Listar prêmios com problemas
    console.log('\n🔍 PRÊMIOS COM PROBLEMAS DE IMAGEM:');
    console.log('-'.repeat(50));

    const problemPrizes = await prisma.prize.findMany({
      where: {
        OR: [
          { imagem_url: null },
          { imagem_url: '' },
          { imagem_url: { contains: 'master case' } },
          { imagem_url: { contains: 'console case' } }
        ]
      },
      include: { case: true }
    });

    for (const prize of problemPrizes) {
      console.log(`🎁 ${prize.nome} (${prize.case.nome}): ${prize.imagem_url || 'N/A'}`);
    }

  } catch (error) {
    console.error('❌ Erro durante correção:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function generateImagePath(prize, caseName) {
  // Mapear nomes de caixas para pastas
  const caseFolderMap = {
    'CAIXA APPLE': 'CAIXA APPLE',
    'CAIXA CONSOLE DO SONHOS!': 'CAIXA CONSOLE DOS SONHOS',
    'CAIXA KIT NIKE': 'CAIXA KIT NIKE',
    'CAIXA PREMIUM MASTER!': 'CAIXA PREMIUM MASTER!',
    'CAIXA SAMSUNG': 'CAIXA SAMSUNG',
    'CAIXA WEEKEND': 'CAIXA WEEKEND'
  };

  const folderName = caseFolderMap[caseName] || caseName;
  
  // Gerar nome do arquivo baseado no prêmio
  let fileName = prize.nome.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\s/g, ' ');

  // Mapeamentos específicos
  const nameMappings = {
    'r$ 1,00': '1.png',
    'r$ 2,00': '2.png',
    'r$ 5,00': '5.png',
    'r$ 10,00': '10.png',
    'r$ 50,00': '50.png',
    'r$ 100,00': '100.png',
    'r$ 500,00': '500.webp',
    'apple watch': 'apple watch.jpg',
    'iphone': 'iphone 16.png',
    'macbook': 'macbook.png',
    'steam deck': 'steamdeck.png',
    'playstation 5': 'ps5.png',
    'xbox series x': 'xboxone.webp',
    'boné nike': 'boné nike.png',
    'camisa nike': 'camisa nike.webp',
    'air force 1': 'airforce.webp',
    'air jordan': 'jordan.png',
    'nike dunk': 'nike dunk.webp',
    'airpods': 'airpods.png',
    'samsung s25': 's25.png',
    'pc gamer': 'pcgamer.png',
    'ipad': 'ipad.png',
    'iphone 16 pro max': 'iphone16.png',
    'fone samsung': 'fone samsung.png',
    'notebook samsung': 'notebook samsung.png',
    'samsung galaxy buds': 'galaxy buds.png',
    'redmi note 13': 'REDMI NOTE 13.png'
  };

  const mappedName = nameMappings[fileName] || `${fileName}.png`;
  
  return `/imagens/${folderName}/${mappedName}`;
}

function findAlternativeImage(prize, caseName) {
  // Buscar imagens alternativas na pasta raiz
  const alternativePaths = [
    `/imagens/${prize.nome.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim().replace(/\s/g, ' ')}.png`,
    `/imagens/${prize.nome.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim().replace(/\s/g, ' ')}.webp`,
    `/imagens/${prize.nome.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim().replace(/\s/g, ' ')}.jpg`
  ];

  for (const altPath of alternativePaths) {
    const fullPath = path.join(__dirname, '..', 'frontend', 'public', altPath);
    if (fs.existsSync(fullPath)) {
      return altPath;
    }
  }

  return null;
}

// Executar correção
fixMissingImages().then(() => {
  console.log('\n✅ CORREÇÃO FINALIZADA!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
