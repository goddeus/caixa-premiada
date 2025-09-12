const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function createMissingImages() {
  console.log('🖼️ CRIANDO IMAGENS FALTANDO...\n');

  try {
    // 1. Buscar prêmios sem imagem
    const prizesWithoutImages = await prisma.prize.findMany({
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

    console.log(`📋 Encontrados ${prizesWithoutImages.length} prêmios sem imagem...\n`);

    let createdCount = 0;

    for (const prize of prizesWithoutImages) {
      console.log(`🎁 Criando imagem para: ${prize.nome} (${prize.case.nome})`);
      
      // Gerar caminho correto da imagem
      const correctImagePath = getCorrectImagePath(prize, prize.case.nome);
      const fullPath = path.join(__dirname, '..', 'frontend', 'public', correctImagePath);
      
      // Criar diretório se não existir
      const dir = path.dirname(fullPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`   📁 Diretório criado: ${dir}`);
      }

      // Verificar se já existe uma imagem na pasta raiz
      const rootImagePath = findRootImage(prize);
      if (rootImagePath) {
        // Copiar imagem da pasta raiz para a pasta da caixa
        const sourcePath = path.join(__dirname, '..', 'frontend', 'public', rootImagePath);
        if (fs.existsSync(sourcePath)) {
          fs.copyFileSync(sourcePath, fullPath);
          console.log(`   📋 Imagem copiada de: ${rootImagePath}`);
          
          // Atualizar no banco
          await prisma.prize.update({
            where: { id: prize.id },
            data: { 
              imagem_url: correctImagePath,
              imagem_id: correctImagePath
            }
          });
          console.log(`   🔄 Caminho atualizado no banco`);
          createdCount++;
        } else {
          console.log(`   ❌ Imagem fonte não encontrada: ${sourcePath}`);
        }
      } else {
        console.log(`   ⚠️ Nenhuma imagem fonte encontrada`);
      }
      
      console.log('');
    }

    console.log('📊 RESUMO DA CRIAÇÃO:');
    console.log(`✅ Imagens criadas: ${createdCount}`);

    // 2. Verificar prêmios que ainda estão sem imagem
    const stillWithoutImages = await prisma.prize.findMany({
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

    if (stillWithoutImages.length > 0) {
      console.log('\n❌ PRÊMIOS AINDA SEM IMAGEM:');
      console.log('-'.repeat(50));
      for (const prize of stillWithoutImages) {
        console.log(`🎁 ${prize.nome} (${prize.case.nome}): ${prize.imagem_url || 'N/A'}`);
      }
    } else {
      console.log('\n✅ TODOS OS PRÊMIOS AGORA TÊM IMAGEM!');
    }

  } catch (error) {
    console.error('❌ Erro durante criação:', error);
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

function findRootImage(prize) {
  // Buscar imagens na pasta raiz
  const possibleNames = [
    prize.nome.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim().replace(/\s/g, ' '),
    prize.nome.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim().replace(/\s/g, ''),
    prize.nome.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim()
  ];

  const extensions = ['.png', '.webp', '.jpg', '.jpeg'];

  for (const name of possibleNames) {
    for (const ext of extensions) {
      const imagePath = `/imagens/${name}${ext}`;
      const fullPath = path.join(__dirname, '..', 'frontend', 'public', imagePath);
      if (fs.existsSync(fullPath)) {
        return imagePath;
      }
    }
  }

  return null;
}

// Executar criação
createMissingImages().then(() => {
  console.log('\n✅ CRIAÇÃO FINALIZADA!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
