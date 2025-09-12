const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function fixImagePaths() {
  console.log('🔧 CORRIGINDO CAMINHOS DE IMAGENS...\n');

  try {
    // 1. Buscar todos os prêmios
    const prizes = await prisma.prize.findMany({
      orderBy: { case_id: 'asc' }
    });

    console.log(`📋 Corrigindo ${prizes.length} prêmios...\n`);

    let fixedCount = 0;

    for (const prize of prizes) {
      console.log(`🎁 Corrigindo: ${prize.nome}`);
      
      // Buscar a caixa do prêmio
      const caseItem = await prisma.case.findUnique({
        where: { id: prize.case_id }
      });

      if (!caseItem) {
        console.log(`   ❌ Caixa não encontrada`);
        continue;
      }

      // Gerar caminho correto da imagem
      const correctImagePath = getCorrectImagePath(prize, caseItem.nome);
      const fullPath = path.join(__dirname, '..', 'frontend', 'public', correctImagePath);

      console.log(`   📁 Caminho correto: ${correctImagePath}`);

      // Verificar se a imagem existe
      if (fs.existsSync(fullPath)) {
        console.log(`   ✅ Imagem encontrada`);
        
        // Atualizar no banco
        await prisma.prize.update({
          where: { id: prize.id },
          data: { 
            imagem_url: correctImagePath,
            imagem_id: correctImagePath
          }
        });
        console.log(`   🔄 Caminho atualizado no banco`);
        fixedCount++;
      } else {
        console.log(`   ❌ Imagem não encontrada: ${correctImagePath}`);
        
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
          console.log(`   ⚠️ Nenhuma imagem encontrada`);
        }
      }
      
      console.log('');
    }

    console.log('📊 RESUMO DA CORREÇÃO:');
    console.log(`✅ Imagens corrigidas: ${fixedCount}`);

  } catch (error) {
    console.error('❌ Erro durante correção:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function getCorrectImagePath(prize, caseName) {
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
  
  // Mapeamentos específicos para cada prêmio
  const prizeMappings = {
    // Prêmios em dinheiro
    'R$ 1,00': '1.png',
    'R$ 2,00': '2.png',
    'R$ 5,00': '5.png',
    'R$ 10,00': '10.png',
    'R$ 50,00': '50.png',
    'R$ 100,00': '100.png',
    'R$ 500,00': '500.webp',
    
    // Prêmios Apple
    'APPLE WATCH': 'apple watch.jpg',
    'IPHONE': 'iphone 16.png',
    'MACBOOK': 'macbook.png',
    
    // Prêmios Console
    'STEAM DECK': 'steamdeck.png',
    'PLAYSTATION 5': 'ps5.png',
    'XBOX SERIES X': 'xboxone.webp',
    
    // Prêmios Nike
    'BONÉ NIKE': 'boné nike.png',
    'CAMISA NIKE': 'camisa nike.webp',
    'AIR FORCE 1': 'airforce.webp',
    'AIR JORDAN': 'jordan.png',
    'NIKE DUNK': 'nike dunk.webp',
    'NIKE': 'nike.png',
    'NIKE (USADO)': 'nike.png',
    
    // Prêmios Premium Master
    'AIRPODS': 'airpods.png',
    'SAMSUNG S25': 's25.png',
    'SAMSUNG GALAXY': 's25.png',
    'PC GAMER': 'pcgamer.png',
    'IPAD': 'ipad.png',
    'IPHONE 16 PRO MAX': 'iphone16.png',
    
    // Prêmios Samsung
    'FONE SAMSUNG': 'fone samsung.png',
    'NOTEBOOK SAMSUNG': 'notebook samsung.png',
    
    // Prêmios Weekend
    'SAMSUNG GALAXY BUDS': 'galaxy buds.png',
    'SAMSUNG GALAXY (USADO)': 'galaxy buds.png',
    'REDMI NOTE 13': 'REDMI NOTE 13.png',
    'REDMI': 'REDMI NOTE 13.png'
  };

  const fileName = prizeMappings[prize.nome] || `${prize.nome.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim().replace(/\s/g, ' ')}.png`;
  
  return `/imagens/${folderName}/${fileName}`;
}

function findAlternativeImage(prize, caseName) {
  // Buscar imagens alternativas na pasta raiz
  const alternativeNames = [
    prize.nome.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim().replace(/\s/g, ' '),
    prize.nome.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim().replace(/\s/g, ''),
    prize.nome.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim()
  ];

  const extensions = ['.png', '.webp', '.jpg', '.jpeg'];

  for (const name of alternativeNames) {
    for (const ext of extensions) {
      const altPath = `/imagens/${name}${ext}`;
      const fullPath = path.join(__dirname, '..', 'frontend', 'public', altPath);
      if (fs.existsSync(fullPath)) {
        return altPath;
      }
    }
  }

  return null;
}

// Executar correção
fixImagePaths().then(() => {
  console.log('\n✅ CORREÇÃO FINALIZADA!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
