const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Mapeamento das caixas com suas pastas de imagens
const CASE_IMAGE_FOLDERS = {
  'CAIXA APPLE': 'CAIXA APPLE',
  'CAIXA CONSOLE DOS SONHOS': 'CAIXA CONSOLE DOS SONHOS',
  'CAIXA FINAL DE SEMANA': 'CAIXA FINAL DE SEMANA',
  'CAIXA KIT NIKE': 'CAIXA KIT NIKE',
  'CAIXA PREMIUM MASTER': 'CAIXA PREMIUM MASTER',
  'CAIXA SAMSUNG': 'CAIXA SAMSUNG'
};

// Mapeamento de valores baseado nos nomes dos arquivos
const VALUE_MAPPING = {
  '1.png': 1.00,
  '1real.png': 1.00,
  '2.png': 2.00,
  '2reais.png': 2.00,
  '5.png': 5.00,
  '5reais.png': 5.00,
  '10.png': 10.00,
  '10reais.png': 10.00,
  '20.png': 20.00,
  '100.png': 100.00,
  '100reais.png': 100.00,
  '500.webp': 500.00,
  '500.png': 500.00
};

// Mapeamento de prêmios especiais
const SPECIAL_PRIZES = {
  'air pods.png': { nome: 'AirPods', valor: 800.00, tipo: 'produto' },
  'airpods.png': { nome: 'AirPods', valor: 800.00, tipo: 'produto' },
  'iphone 16 pro max.png': { nome: 'iPhone 16 Pro Max', valor: 8000.00, tipo: 'produto' },
  'macbook.png': { nome: 'MacBook Pro', valor: 12000.00, tipo: 'produto' },
  'ipad.png': { nome: 'iPad Pro', valor: 6000.00, tipo: 'produto' },
  'samsung s25.png': { nome: 'Samsung Galaxy S25', valor: 5000.00, tipo: 'produto' },
  's25.png': { nome: 'Samsung Galaxy S25', valor: 5000.00, tipo: 'produto' },
  'ps5.png': { nome: 'PlayStation 5', valor: 4000.00, tipo: 'produto' },
  'steamdeck.png': { nome: 'Steam Deck', valor: 3000.00, tipo: 'produto' },
  'xboxone.webp': { nome: 'Xbox One', valor: 2500.00, tipo: 'produto' },
  'airforce.webp': { nome: 'Nike Air Force', valor: 400.00, tipo: 'produto' },
  'boné nike.png': { nome: 'Boné Nike', valor: 80.00, tipo: 'produto' },
  'camisa nike.webp': { nome: 'Camisa Nike', valor: 120.00, tipo: 'produto' },
  'jordan.png': { nome: 'Nike Jordan', valor: 600.00, tipo: 'produto' },
  'nike dunk.webp': { nome: 'Nike Dunk', valor: 500.00, tipo: 'produto' },
  'honda cg fan.webp': { nome: 'Honda CG Fan', valor: 15000.00, tipo: 'produto' },
  'fone samsung.png': { nome: 'Fone Samsung', valor: 200.00, tipo: 'produto' },
  'notebook samsung.png': { nome: 'Notebook Samsung', valor: 3000.00, tipo: 'produto' }
};

async function syncPrizesWithImages() {
  try {
    console.log('🔄 SINCRONIZANDO PRÊMIOS COM IMAGENS REAIS');
    console.log('==================================================');

    const imagesPath = path.join(__dirname, '..', 'frontend', 'public', 'imagens');

    for (const [caseName, folderName] of Object.entries(CASE_IMAGE_FOLDERS)) {
      console.log(`\n📦 Processando: ${caseName}`);
      
      // Buscar a caixa no banco
      const caseItem = await prisma.case.findFirst({
        where: { nome: caseName }
      });

      if (!caseItem) {
        console.log(`❌ Caixa ${caseName} não encontrada no banco`);
        continue;
      }

      console.log(`✅ Caixa encontrada: ${caseItem.nome} (ID: ${caseItem.id})`);

      // Ler arquivos da pasta
      const folderPath = path.join(imagesPath, folderName);
      
      if (!fs.existsSync(folderPath)) {
        console.log(`❌ Pasta ${folderName} não encontrada`);
        continue;
      }

      const imageFiles = fs.readdirSync(folderPath)
        .filter(file => file.endsWith('.png') || file.endsWith('.webp'));

      console.log(`📁 Encontrados ${imageFiles.length} arquivos de imagem`);

      // Deletar prêmios existentes da caixa
      await prisma.prize.deleteMany({
        where: { case_id: caseItem.id }
      });
      console.log(`🗑️ Prêmios antigos removidos`);

      // Criar novos prêmios baseados nas imagens
      const prizes = [];
      
      for (const imageFile of imageFiles) {
        let prizeData = null;

        // Verificar se é um prêmio especial
        if (SPECIAL_PRIZES[imageFile]) {
          const special = SPECIAL_PRIZES[imageFile];
          prizeData = {
            nome: special.nome,
            valor: special.valor,
            tipo: special.tipo,
            imagem_url: `/imagens/${folderName}/${imageFile}`,
            case_id: caseItem.id,
            ativo: true,
            probabilidade: 0.01 // 1% para prêmios especiais
          };
        } else if (VALUE_MAPPING[imageFile]) {
          // Prêmio de dinheiro
          const valor = VALUE_MAPPING[imageFile];
          let probabilidade = 0.1; // 10% padrão
          
          // Ajustar probabilidade baseada no valor
          if (valor <= 5) probabilidade = 0.3; // 30% para valores baixos
          else if (valor <= 20) probabilidade = 0.15; // 15% para valores médios
          else if (valor <= 100) probabilidade = 0.05; // 5% para valores altos
          else probabilidade = 0.01; // 1% para valores muito altos
          
          prizeData = {
            nome: `R$ ${valor.toFixed(2)}`,
            valor: valor,
            tipo: 'dinheiro',
            imagem_url: `/imagens/${folderName}/${imageFile}`,
            case_id: caseItem.id,
            ativo: true,
            probabilidade: probabilidade
          };
        } else {
          // Prêmio genérico
          const fileName = imageFile.replace(/\.(png|webp)$/, '');
          prizeData = {
            nome: fileName.replace(/_/g, ' ').toUpperCase(),
            valor: 10.00, // Valor padrão
            tipo: 'produto',
            imagem_url: `/imagens/${folderName}/${imageFile}`,
            case_id: caseItem.id,
            ativo: true,
            probabilidade: 0.05 // 5% para produtos genéricos
          };
        }

        if (prizeData) {
          prizes.push(prizeData);
        }
      }

      // Inserir prêmios no banco
      if (prizes.length > 0) {
        await prisma.prize.createMany({
          data: prizes
        });
        console.log(`✅ ${prizes.length} prêmios criados para ${caseName}`);
        
        // Mostrar resumo dos prêmios
        prizes.forEach(prize => {
          console.log(`   - ${prize.nome}: R$ ${prize.valor.toFixed(2)} (${prize.tipo})`);
        });
      }
    }

    console.log('\n🎉 SINCRONIZAÇÃO CONCLUÍDA!');
    console.log('==================================================');

  } catch (error) {
    console.error('❌ Erro durante a sincronização:', error);
  } finally {
    await prisma.$disconnect();
  }
}

syncPrizesWithImages();
