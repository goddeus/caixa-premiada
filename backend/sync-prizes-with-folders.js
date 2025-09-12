const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function syncPrizesWithFolders() {
  console.log('🔄 SINCRONIZANDO PRÊMIOS COM PASTAS DE CAIXAS...\n');

  try {
    // 1. Mapear pastas de caixas
    console.log('1️⃣ Mapeando pastas de caixas...');
    
    const frontendImagesPath = path.join(__dirname, '../frontend/public/imagens');
    const folders = fs.readdirSync(frontendImagesPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    console.log(`📁 Pastas encontradas: ${folders.join(', ')}`);
    
    // 2. Mapear caixas do banco para pastas
    const caseFolderMap = {
      'CAIXA APPLE': 'CAIXA APPLE',
      'CAIXA CONSOLE DO SONHOS!': 'CAIXA CONSOLE DOS SONHOS',
      'CAIXA FINAL DE SEMANA': 'CAIXA FINAL DE SEMANA',
      'CAIXA KIT NIKE': 'CAIXA KIT NIKE',
      'CAIXA PREMIUM MASTER!': 'CAIXA PREMIUM MASTER!',
      'CAIXA SAMSUNG': 'CAIXA SAMSUNG'
    };
    
    // 3. Buscar todas as caixas do banco
    console.log('\n2️⃣ Buscando caixas do banco...');
    
    const cases = await prisma.case.findMany();
    console.log(`📋 Caixas no banco: ${cases.length}`);
    
    for (const caseItem of cases) {
      console.log(`   - "${caseItem.nome}" (ID: ${caseItem.id})`);
    }
    
    // 4. Para cada caixa, sincronizar prêmios
    console.log('\n3️⃣ Sincronizando prêmios por caixa...');
    
    const allResults = {};
    
    for (const caseItem of cases) {
      const folderName = caseFolderMap[caseItem.nome];
      
      if (!folderName) {
        console.log(`⚠️ Pasta não encontrada para caixa: "${caseItem.nome}"`);
        continue;
      }
      
      const folderPath = path.join(frontendImagesPath, folderName);
      
      if (!fs.existsSync(folderPath)) {
        console.log(`⚠️ Pasta não existe: ${folderPath}`);
        continue;
      }
      
      console.log(`\n📦 Processando caixa: "${caseItem.nome}"`);
      console.log(`📁 Pasta: ${folderName}`);
      
      // Ler imagens da pasta
      const images = fs.readdirSync(folderPath)
        .filter(file => /\.(png|jpg|jpeg|webp|gif)$/i.test(file))
        .map(file => ({
          filename: file,
          path: `/imagens/${folderName}/${file}`,
          name: file.replace(/\.[^/.]+$/, '').toLowerCase()
        }));
      
      console.log(`🖼️ Imagens encontradas: ${images.length}`);
      images.forEach(img => console.log(`   - ${img.filename}`));
      
      // Mapear imagens para prêmios
      const prizeMap = new Map();
      
      for (const image of images) {
        let prizeName = '';
        let valorCentavos = 0;
        let tipo = 'produto';
        
        // Detectar prêmios de dinheiro
        if (image.name.match(/^\d+$/)) {
          const valor = parseInt(image.name);
          if (valor === 1) {
            prizeName = 'R$ 1,00';
            valorCentavos = 100;
            tipo = 'cash';
          } else if (valor === 2) {
            prizeName = 'R$ 2,00';
            valorCentavos = 200;
            tipo = 'cash';
          } else if (valor === 5) {
            prizeName = 'R$ 5,00';
            valorCentavos = 500;
            tipo = 'cash';
          } else if (valor === 10) {
            prizeName = 'R$ 10,00';
            valorCentavos = 1000;
            tipo = 'cash';
          } else if (valor === 100) {
            prizeName = 'R$ 100,00';
            valorCentavos = 10000;
            tipo = 'cash';
          } else if (valor === 500) {
            prizeName = 'R$ 500,00';
            valorCentavos = 50000;
            tipo = 'cash';
          }
        }
        // Detectar prêmios com nomes específicos
        else if (image.name.includes('iphone') || image.name.includes('iphone16')) {
          prizeName = 'IPHONE';
          valorCentavos = 1000000; // R$ 10.000,00
          tipo = 'produto';
        } else if (image.name.includes('macbook')) {
          prizeName = 'MACBOOK';
          valorCentavos = 1500000; // R$ 15.000,00
          tipo = 'produto';
        } else if (image.name.includes('ipad')) {
          prizeName = 'IPAD';
          valorCentavos = 800000; // R$ 8.000,00
          tipo = 'produto';
        } else if (image.name.includes('airpods')) {
          prizeName = 'AIRPODS';
          valorCentavos = 250000; // R$ 2.500,00
          tipo = 'produto';
        } else if (image.name.includes('apple') && image.name.includes('watch')) {
          prizeName = 'APPLE WATCH';
          valorCentavos = 350000; // R$ 3.500,00
          tipo = 'produto';
        } else if (image.name.includes('ps5')) {
          prizeName = 'PS5';
          valorCentavos = 400000; // R$ 4.000,00
          tipo = 'produto';
        } else if (image.name.includes('xbox')) {
          prizeName = 'XBOX SERIES X';
          valorCentavos = 400000; // R$ 4.000,00
          tipo = 'produto';
        } else if (image.name.includes('steam')) {
          prizeName = 'STEAM DECK';
          valorCentavos = 300000; // R$ 3.000,00
          tipo = 'produto';
        } else if (image.name.includes('samsung') && image.name.includes('notebook')) {
          prizeName = 'NOTEBOOK SAMSUNG';
          valorCentavos = 300000; // R$ 3.000,00
          tipo = 'produto';
        } else if (image.name.includes('s25')) {
          prizeName = 'SAMSUNG S25';
          valorCentavos = 500000; // R$ 5.000,00
          tipo = 'produto';
        } else if (image.name.includes('redmi')) {
          prizeName = 'REDMI NOTE 13';
          valorCentavos = 150000; // R$ 1.500,00
          tipo = 'produto';
        } else if (image.name.includes('jordan')) {
          prizeName = 'AIR JORDAN';
          valorCentavos = 800000; // R$ 8.000,00
          tipo = 'produto';
        } else if (image.name.includes('airforce')) {
          prizeName = 'AIR FORCE 1';
          valorCentavos = 600000; // R$ 6.000,00
          tipo = 'produto';
        } else if (image.name.includes('nike') && image.name.includes('dunk')) {
          prizeName = 'NIKE DUNK';
          valorCentavos = 500000; // R$ 5.000,00
          tipo = 'produto';
        } else if (image.name.includes('nike') && image.name.includes('boné')) {
          prizeName = 'BONÉ NIKE';
          valorCentavos = 150000; // R$ 1.500,00
          tipo = 'produto';
        } else if (image.name.includes('nike') && image.name.includes('camisa')) {
          prizeName = 'CAMISA NIKE';
          valorCentavos = 200000; // R$ 2.000,00
          tipo = 'produto';
        } else if (image.name.includes('power')) {
          prizeName = 'POWER BANK';
          valorCentavos = 100000; // R$ 1.000,00
          tipo = 'produto';
        } else if (image.name.includes('fone') && image.name.includes('samsung')) {
          prizeName = 'FONE SAMSUNG';
          valorCentavos = 200000; // R$ 2.000,00
          tipo = 'produto';
        } else if (image.name.includes('honda')) {
          prizeName = 'HONDA CIVIC';
          valorCentavos = 10000000; // R$ 100.000,00
          tipo = 'ilustrativo';
        } else if (image.name.includes('pcgamer')) {
          prizeName = 'PC GAMER';
          valorCentavos = 8000000; // R$ 80.000,00
          tipo = 'ilustrativo';
        } else {
          // Prêmio genérico baseado no nome do arquivo
          prizeName = image.name.toUpperCase().replace(/[^A-Z0-9\s]/g, '');
          valorCentavos = 100000; // R$ 1.000,00 padrão
          tipo = 'produto';
        }
        
        if (prizeName) {
          prizeMap.set(prizeName, {
            nome: prizeName,
            valor: valorCentavos / 100,
            valor_centavos: valorCentavos,
            tipo: tipo,
            imagem_url: image.path,
            imagem_id: image.path,
            label: tipo === 'cash' ? prizeName : prizeName,
            ativo: true
          });
        }
      }
      
      console.log(`📋 Prêmios mapeados: ${prizeMap.size}`);
      for (const [name, prize] of prizeMap) {
        console.log(`   - ${name}: R$ ${(prize.valor_centavos / 100).toFixed(2)} (${prize.tipo})`);
      }
      
      // Remover prêmios antigos da caixa
      console.log(`🗑️ Removendo prêmios antigos da caixa...`);
      const deleteResult = await prisma.prize.deleteMany({
        where: { case_id: caseItem.id }
      });
      console.log(`   ✅ Removidos ${deleteResult.count} prêmios antigos`);
      
      // Adicionar novos prêmios
      console.log(`➕ Adicionando novos prêmios...`);
      const newPrizes = [];
      
      for (const [name, prize] of prizeMap) {
        const newPrize = await prisma.prize.create({
          data: {
            id: require('crypto').randomUUID(),
            case_id: caseItem.id,
            nome: prize.nome,
            valor: prize.valor,
            valor_centavos: prize.valor_centavos,
            tipo: prize.tipo,
            imagem_url: prize.imagem_url,
            imagem_id: prize.imagem_id,
            label: prize.label,
            ativo: prize.ativo,
            probabilidade: 0.1 // Probabilidade padrão de 10%
          }
        });
        newPrizes.push(newPrize);
      }
      
      console.log(`   ✅ Adicionados ${newPrizes.length} novos prêmios`);
      
      // Armazenar resultado
      allResults[caseItem.nome] = {
        folder: folderName,
        prizes: newPrizes.map(p => ({
          nome: p.nome,
          valor: p.valor,
          valor_centavos: p.valor_centavos,
          tipo: p.tipo,
          imagem: p.imagem_url
        }))
      };
    }
    
    // 5. Relatório final
    console.log('\n4️⃣ RELATÓRIO FINAL POR CAIXA:');
    console.log('=' * 80);
    
    for (const [caseName, result] of Object.entries(allResults)) {
      console.log(`\n📦 CAIXA: ${caseName}`);
      console.log(`📁 Pasta: ${result.folder}`);
      console.log(`📋 Prêmios: ${result.prizes.length}`);
      console.log('-'.repeat(60));
      
      result.prizes.forEach((prize, index) => {
        const valorFormatado = `R$ ${(prize.valor_centavos / 100).toFixed(2).replace('.', ',')}`;
        console.log(`${index + 1}. ${prize.nome} → ${valorFormatado} (${prize.tipo})`);
      });
    }
    
    console.log('\n🎉 SINCRONIZAÇÃO CONCLUÍDA COM SUCESSO!');

  } catch (error) {
    console.error('❌ Erro durante sincronização:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar sincronização
syncPrizesWithFolders().then(() => {
  console.log('\n✅ SCRIPT FINALIZADO!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
