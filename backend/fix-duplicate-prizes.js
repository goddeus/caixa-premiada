const { PrismaClient } = require('@prisma/client');
const prizeUtils = require('./src/utils/prizeUtils');

const prisma = new PrismaClient();

async function fixDuplicatePrizes() {
  console.log('🔧 CORRIGINDO PRÊMIOS DUPLICADOS...\n');

  try {
    // 1. Buscar todos os prêmios
    console.log('1️⃣ Buscando todos os prêmios...');
    
    const allPrizes = await prisma.prize.findMany();
    console.log(`📋 Encontrados ${allPrizes.length} prêmios no total`);
    
    // 2. Agrupar por nome (case insensitive)
    console.log('\n2️⃣ Agrupando prêmios por nome...');
    
    const prizeGroups = {};
    allPrizes.forEach(prize => {
      const name = prize.nome?.toLowerCase().trim();
      if (name) {
        if (!prizeGroups[name]) {
          prizeGroups[name] = [];
        }
        prizeGroups[name].push(prize);
      }
    });
    
    const duplicates = Object.entries(prizeGroups).filter(([name, prizes]) => prizes.length > 1);
    console.log(`📋 Encontrados ${duplicates.length} grupos de prêmios duplicados`);
    
    // 3. Para cada grupo de duplicados, escolher o melhor e sincronizar
    console.log('\n3️⃣ Sincronizando prêmios duplicados...');
    
    for (const [name, prizes] of duplicates) {
      console.log(`\n📦 Processando: "${name}" (${prizes.length} ocorrências)`);
      
      // Encontrar o prêmio "mestre" (com melhor imagem ou dados)
      let masterPrize = prizes[0];
      
      for (const prize of prizes) {
        // Priorizar prêmios com imagem
        if (prize.imagem_id && !masterPrize.imagem_id) {
          masterPrize = prize;
        }
        // Priorizar prêmios com imagem_url
        if (prize.imagem_url && !masterPrize.imagem_url) {
          masterPrize = prize;
        }
        // Priorizar prêmios com valor_centavos correto
        if (prize.valor_centavos > 0 && masterPrize.valor_centavos === 0) {
          masterPrize = prize;
        }
      }
      
      console.log(`   🎯 Prêmio mestre escolhido: ID ${masterPrize.id}`);
      console.log(`   📊 Dados do mestre:`);
      console.log(`      - Imagem ID: "${masterPrize.imagem_id || 'null'}"`);
      console.log(`      - Imagem URL: "${masterPrize.imagem_url || 'null'}"`);
      console.log(`      - Valor centavos: ${masterPrize.valor_centavos}`);
      console.log(`      - Tipo: ${masterPrize.tipo || 'não definido'}`);
      
      // Sincronizar outros prêmios com o mestre
      for (const prize of prizes) {
        if (prize.id !== masterPrize.id) {
          console.log(`   🔄 Sincronizando prêmio ${prize.id}...`);
          
          const updateData = {};
          
          // Sincronizar imagem_id se o mestre tem e este não
          if (masterPrize.imagem_id && !prize.imagem_id) {
            updateData.imagem_id = masterPrize.imagem_id;
          }
          
          // Sincronizar imagem_url se o mestre tem e este não
          if (masterPrize.imagem_url && !prize.imagem_url) {
            updateData.imagem_url = masterPrize.imagem_url;
          }
          
          // Sincronizar valor_centavos se o mestre tem e este não
          if (masterPrize.valor_centavos > 0 && prize.valor_centavos === 0) {
            updateData.valor_centavos = masterPrize.valor_centavos;
          }
          
          // Sincronizar tipo se o mestre tem e este não
          if (masterPrize.tipo && !prize.tipo) {
            updateData.tipo = masterPrize.tipo;
          }
          
          // Sincronizar label se o mestre tem e este não
          if (masterPrize.label && !prize.label) {
            updateData.label = masterPrize.label;
          }
          
          if (Object.keys(updateData).length > 0) {
            await prisma.prize.update({
              where: { id: prize.id },
              data: updateData
            });
            
            console.log(`      ✅ Atualizado: ${Object.keys(updateData).join(', ')}`);
          } else {
            console.log(`      ⏭️ Nada para atualizar`);
          }
        }
      }
    }
    
    // 4. Verificar se há imagens que existem na pasta local mas não estão sendo usadas
    console.log('\n4️⃣ Verificando imagens da pasta local...');
    
    const fs = require('fs');
    const path = require('path');
    
    const frontendImagesPath = path.join(__dirname, '../frontend/public/imagens');
    const imageFiles = fs.readdirSync(frontendImagesPath);
    
    console.log(`📁 Encontrados ${imageFiles.length} arquivos na pasta imagens`);
    
    // Mapear nomes de produtos para arquivos de imagem
    const productImageMap = {
      'iphone': ['iphone 16.png', 'iphone.png'],
      'macbook': ['macbook.png'],
      'ipad': ['ipad.png'],
      'airpods': ['airpods.png'],
      'apple watch': ['apple watch.jpg', 'applewatch.jpg', 'applewatch.png'],
      'air jordan': ['jordan.png', 'airforce.webp'],
      'nike': ['nike.png', 'nike dunk.webp'],
      'notebook': ['notebook samsung.png'],
      'steam deck': ['steamdeck.png'],
      'ps5': ['ps5.png'],
      'xbox': ['xboxone.webp'],
      'xiaomi': ['xiaominote12.png', 'redmi-note-13-verde-menta.png']
    };
    
    // Atualizar prêmios que podem ter imagens correspondentes
    console.log('\n5️⃣ Atualizando prêmios com imagens correspondentes...');
    
    for (const [productName, possibleImages] of Object.entries(productImageMap)) {
      // Encontrar arquivo de imagem correspondente
      let foundImage = null;
      for (const possibleImage of possibleImages) {
        if (imageFiles.includes(possibleImage)) {
          foundImage = possibleImage;
          break;
        }
      }
      
      if (foundImage) {
        console.log(`📦 Atualizando prêmios "${productName}" com imagem "${foundImage}"`);
        
        // Buscar prêmios que correspondem ao nome do produto
        const matchingPrizes = await prisma.prize.findMany({
          where: {
            AND: [
              { nome: { contains: productName } },
              { OR: [
                { imagem_id: null },
                { imagem_url: null },
                { imagem_url: 'produto/default.png' }
              ]}
            ]
          }
        });
        
        console.log(`   📋 Encontrados ${matchingPrizes.length} prêmios para atualizar`);
        
        for (const prize of matchingPrizes) {
          await prisma.prize.update({
            where: { id: prize.id },
            data: {
              imagem_url: `/imagens/${foundImage}`,
              imagem_id: `/imagens/${foundImage}`
            }
          });
          
          console.log(`   ✅ Atualizado prêmio ${prize.id}: "${prize.nome}"`);
        }
      }
    }
    
    // 6. Verificar resultado final
    console.log('\n6️⃣ Verificando resultado final...');
    
    const finalPrizes = await prisma.prize.findMany({
      where: { case_id: '900dc9ca-477b-474f-99fe-9788f2d7e7fa' } // Caixa Apple
    });
    
    console.log(`📋 Prêmios da caixa Apple após correção:`);
    finalPrizes.forEach(prize => {
      try {
        const mapped = prizeUtils.mapPrizeToDisplay(prize);
        const status = getValidationStatus(mapped);
        console.log(`   - "${prize.nome}": ${status.toUpperCase()}`);
        console.log(`     Imagem: "${mapped.imagem}"`);
      } catch (error) {
        console.log(`   - "${prize.nome}": ERRO - ${error.message}`);
      }
    });

  } catch (error) {
    console.error('❌ Erro durante correção:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Função de validação simulada
function getValidationStatus(prize) {
  if (prize.tipo === 'cash') {
    const expectedLabel = `R$ ${(prize.valorCentavos / 100).toFixed(2).replace('.', ',')}`;
    
    if (prize.nome !== expectedLabel && prize.label !== expectedLabel) {
      return 'warning';
    }
    
    if (!prize.imagem || prize.imagem === 'produto/default.png') {
      return 'warning';
    }
    
    return 'ok';
  }
  
  if (!prize.imagem || prize.imagem === 'produto/default.png') {
    return 'warning';
  }
  
  if (prize.imagem && (
    prize.imagem.startsWith('/uploads/') || 
    prize.imagem.startsWith('/imagens/') || 
    prize.imagem.startsWith('cash/') ||
    prize.imagem.startsWith('produto/')
  )) {
    return 'ok';
  }
  
  return 'warning';
}

// Executar correção
fixDuplicatePrizes().then(() => {
  console.log('\n🎉 CORREÇÃO DE PRÊMIOS DUPLICADOS CONCLUÍDA!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
