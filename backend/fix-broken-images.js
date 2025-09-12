const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function fixBrokenImages() {
  console.log('🔧 CORRIGINDO IMAGENS QUEBRADAS...\n');

  try {
    // Lista de correções específicas
    const corrections = [
      // Premium Master - IPHONE
      { 
        nome: 'IPHONE', 
        caseName: 'CAIXA PREMIUM MASTER!',
        currentPath: '/imagens/CAIXA PREMIUM MASTER!/iphone.png',
        correctPath: '/imagens/CAIXA PREMIUM MASTER!/iphone16.png'
      },
      { 
        nome: 'IPHONE', 
        caseName: 'CAIXA PREMIUM MASTER!',
        currentPath: '/imagens/CAIXA PREMIUM MASTER!/iphone16promax.png',
        correctPath: '/imagens/CAIXA PREMIUM MASTER!/iphone16.png'
      },
      
      // Nike - R$ 50,00
      { 
        nome: 'R$ 50,00', 
        caseName: 'CAIXA KIT NIKE',
        currentPath: '/imagens/CAIXA KIT NIKE/bonnike.png',
        correctPath: '/imagens/CAIXA KIT NIKE/50.png'
      },
      
      // Nike - NIKE (USADO)
      { 
        nome: 'NIKE (USADO)', 
        caseName: 'CAIXA KIT NIKE',
        currentPath: '/imagens/CAIXA KIT NIKE/camisanike.png',
        correctPath: '/imagens/CAIXA KIT NIKE/nike.png'
      },
      
      // Weekend - SAMSUNG GALAXY (USADO)
      { 
        nome: 'SAMSUNG GALAXY (USADO)', 
        caseName: 'CAIXA WEEKEND',
        currentPath: '/imagens/CAIXA WEEKEND/samsunggalaxybuds.png',
        correctPath: '/imagens/CAIXA WEEKEND/galaxy buds.png'
      },
      
      // Weekend - R$ 1,00
      { 
        nome: 'R$ 1,00', 
        caseName: 'CAIXA WEEKEND',
        currentPath: '/imagens/CAIXA WEEKEND/r100.png',
        correctPath: '/imagens/CAIXA WEEKEND/1.png'
      },
      
      // Weekend - R$ 50,00
      { 
        nome: 'R$ 50,00', 
        caseName: 'CAIXA WEEKEND',
        currentPath: '/imagens/CAIXA WEEKEND/r5000.png',
        correctPath: '/imagens/CAIXA WEEKEND/50.png'
      },
      
      // Weekend - REDMI
      { 
        nome: 'REDMI', 
        caseName: 'CAIXA WEEKEND',
        currentPath: '/imagens/CAIXA WEEKEND/redminote13.png',
        correctPath: '/imagens/CAIXA WEEKEND/REDMI NOTE 13.png'
      },
      
      // Weekend - R$ 500,00
      { 
        nome: 'R$ 500,00', 
        caseName: 'CAIXA WEEKEND',
        currentPath: '/imagens/CAIXA WEEKEND/r50000.png',
        correctPath: '/imagens/CAIXA WEEKEND/500.webp'
      },
      
      // Weekend - R$ 100,00
      { 
        nome: 'R$ 100,00', 
        caseName: 'CAIXA WEEKEND',
        currentPath: '/imagens/CAIXA WEEKEND/r10000.png',
        correctPath: '/imagens/CAIXA WEEKEND/100.png'
      },
      
      // Weekend - R$ 2,00
      { 
        nome: 'R$ 2,00', 
        caseName: 'CAIXA WEEKEND',
        currentPath: '/imagens/CAIXA WEEKEND/r200.png',
        correctPath: '/imagens/CAIXA WEEKEND/2.png'
      }
    ];

    let fixedCount = 0;

    for (const correction of corrections) {
      console.log(`🔧 Corrigindo: ${correction.nome} (${correction.caseName})`);
      console.log(`   📁 De: ${correction.currentPath}`);
      console.log(`   📁 Para: ${correction.correctPath}`);

      // Buscar prêmio
      const caseItem = await prisma.case.findFirst({
        where: { nome: correction.caseName }
      });

      if (!caseItem) {
        console.log(`   ❌ Caixa não encontrada`);
        continue;
      }

      const prize = await prisma.prize.findFirst({
        where: { 
          nome: correction.nome,
          case_id: caseItem.id,
          imagem_url: correction.currentPath
        }
      });

      if (!prize) {
        console.log(`   ❌ Prêmio não encontrado`);
        continue;
      }

      // Verificar se a imagem correta existe
      const correctFullPath = path.join(__dirname, '..', 'frontend', 'public', correction.correctPath);
      
      if (fs.existsSync(correctFullPath)) {
        // Atualizar no banco
        await prisma.prize.update({
          where: { id: prize.id },
          data: { 
            imagem_url: correction.correctPath,
            imagem_id: correction.correctPath
          }
        });
        console.log(`   ✅ Caminho corrigido no banco`);
        fixedCount++;
      } else {
        console.log(`   ❌ Imagem correta não encontrada: ${correction.correctPath}`);
        
        // Tentar encontrar imagem alternativa
        const alternativePath = findAlternativeImage(correction.nome, correction.caseName);
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

function findAlternativeImage(prizeName, caseName) {
  // Buscar imagens na pasta raiz
  const possibleNames = [
    prizeName.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim().replace(/\s/g, ' '),
    prizeName.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim().replace(/\s/g, ''),
    prizeName.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim()
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

// Executar correção
fixBrokenImages().then(() => {
  console.log('\n✅ CORREÇÃO FINALIZADA!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
