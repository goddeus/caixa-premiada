// ========================================
// 🔍 VERIFICAR IMAGENS EXISTENTES
// ========================================
// Cole este código no console do navegador para verificar quais imagens existem

console.log('🔍 VERIFICANDO IMAGENS EXISTENTES...');

// ========================================
// 1. LISTA DE TODAS AS IMAGENS POSSÍVEIS
// ========================================
const ALL_IMAGES = [
  // CAIXA FINAL DE SEMANA
  '/imagens/CAIXA FINAL DE SEMANA/1.png',
  '/imagens/CAIXA FINAL DE SEMANA/2.png',
  '/imagens/CAIXA FINAL DE SEMANA/5.png',
  '/imagens/CAIXA FINAL DE SEMANA/10.png',
  '/imagens/CAIXA FINAL DE SEMANA/100.png',
  '/imagens/CAIXA FINAL DE SEMANA/500.webp',
  
  // CAIXA NIKE
  '/imagens/CAIXA KIT NIKE/1.png',
  '/imagens/CAIXA KIT NIKE/2.png',
  '/imagens/CAIXA KIT NIKE/5.png',
  '/imagens/CAIXA KIT NIKE/10.png',
  '/imagens/CAIXA KIT NIKE/50.png',
  '/imagens/CAIXA KIT NIKE/100.png',
  '/imagens/CAIXA KIT NIKE/500.png',
  '/imagens/CAIXA KIT NIKE/1000.png',
  '/imagens/CAIXA KIT NIKE/jordan.png',
  '/imagens/CAIXA KIT NIKE/airforce.webp',
  '/imagens/CAIXA KIT NIKE/camisa nike.webp',
  '/imagens/CAIXA KIT NIKE/boné nike.png',
  
  // CAIXA SAMSUNG
  '/imagens/CAIXA SAMSUNG/1.png',
  '/imagens/CAIXA SAMSUNG/2.png',
  '/imagens/CAIXA SAMSUNG/5.png',
  '/imagens/CAIXA SAMSUNG/10.png',
  '/imagens/CAIXA SAMSUNG/50.png',
  '/imagens/CAIXA SAMSUNG/100.png',
  '/imagens/CAIXA SAMSUNG/500.webp',
  '/imagens/CAIXA SAMSUNG/s25.png',
  '/imagens/CAIXA SAMSUNG/notebook samsung.png',
  '/imagens/CAIXA SAMSUNG/fone samsung.png',
  
  // CAIXA CONSOLE
  '/imagens/CAIXA CONSOLE DOS SONHOS/1.png',
  '/imagens/CAIXA CONSOLE DOS SONHOS/2.png',
  '/imagens/CAIXA CONSOLE DOS SONHOS/5.png',
  '/imagens/CAIXA CONSOLE DOS SONHOS/10.png',
  '/imagens/CAIXA CONSOLE DOS SONHOS/50.png',
  '/imagens/CAIXA CONSOLE DOS SONHOS/100reais.png',
  '/imagens/CAIXA CONSOLE DOS SONHOS/500.png',
  '/imagens/CAIXA CONSOLE DOS SONHOS/1000.png',
  '/imagens/CAIXA CONSOLE DOS SONHOS/ps5.png',
  '/imagens/CAIXA CONSOLE DOS SONHOS/xboxone.webp',
  '/imagens/CAIXA CONSOLE DOS SONHOS/steamdeck.png',
  
  // CAIXA APPLE
  '/imagens/CAIXA APPLE/1.png',
  '/imagens/CAIXA APPLE/2.png',
  '/imagens/CAIXA APPLE/5.png',
  '/imagens/CAIXA APPLE/10.png',
  '/imagens/CAIXA APPLE/50.png',
  '/imagens/CAIXA APPLE/100.png',
  '/imagens/CAIXA APPLE/500.webp',
  '/imagens/CAIXA APPLE/1000.png',
  '/imagens/CAIXA APPLE/2000.png',
  '/imagens/CAIXA APPLE/iphone 16 pro max.png',
  '/imagens/CAIXA APPLE/macbook.png',
  '/imagens/CAIXA APPLE/air pods.png',
  '/imagens/CAIXA APPLE/ipad.png',
  
  // CAIXA PREMIUM MASTER
  '/imagens/CAIXA PREMIUM MASTER/2.png',
  '/imagens/CAIXA PREMIUM MASTER/5.png',
  '/imagens/CAIXA PREMIUM MASTER/10.png',
  '/imagens/CAIXA PREMIUM MASTER/20.png',
  '/imagens/CAIXA PREMIUM MASTER/50.png',
  '/imagens/CAIXA PREMIUM MASTER/100.png',
  '/imagens/CAIXA PREMIUM MASTER/500.webp',
  '/imagens/CAIXA PREMIUM MASTER/1000.png',
  '/imagens/CAIXA PREMIUM MASTER/2000.png',
  '/imagens/CAIXA PREMIUM MASTER/honda cg fan.webp',
  '/imagens/CAIXA PREMIUM MASTER/macbook.png',
  '/imagens/CAIXA PREMIUM MASTER/iphone 16 pro max.png',
  '/imagens/CAIXA PREMIUM MASTER/samsung s25.png',
  '/imagens/CAIXA PREMIUM MASTER/ipad.png',
  '/imagens/CAIXA PREMIUM MASTER/airpods.png'
];

// ========================================
// 2. VERIFICAR IMAGENS
// ========================================
async function checkAllImages() {
  console.log('🔍 Verificando todas as imagens...');
  
  const results = {
    available: [],
    missing: [],
    errors: []
  };
  
  for (const imagePath of ALL_IMAGES) {
    try {
      const response = await fetch(imagePath, { method: 'HEAD' });
      if (response.ok) {
        results.available.push(imagePath);
        console.log(`✅ ${imagePath}`);
      } else {
        results.missing.push(imagePath);
        console.log(`❌ ${imagePath} - Status: ${response.status}`);
      }
    } catch (error) {
      results.errors.push({ path: imagePath, error: error.message });
      console.log(`⚠️ ${imagePath} - Erro: ${error.message}`);
    }
  }
  
  console.log(`\n📊 RESUMO:`);
  console.log(`✅ Imagens disponíveis: ${results.available.length}`);
  console.log(`❌ Imagens faltando: ${results.missing.length}`);
  console.log(`⚠️ Erros: ${results.errors.length}`);
  
  if (results.missing.length > 0) {
    console.log('\n❌ IMAGENS FALTANDO:');
    results.missing.forEach(path => console.log(`  - ${path}`));
  }
  
  if (results.errors.length > 0) {
    console.log('\n⚠️ ERROS:');
    results.errors.forEach(item => console.log(`  - ${item.path}: ${item.error}`));
  }
  
  return results;
}

// ========================================
// 3. MAPEAR PRÊMIOS PARA IMAGENS EXISTENTES
// ========================================
function mapPrizesToExistingImages(prize, caseName, availableImages) {
  console.log(`\n🖼️ === MAPEANDO PRÊMIO PARA ${caseName} ===`);
  console.log('Prêmio:', prize);
  
  // Determinar pasta da caixa
  let folder = '';
  switch (caseName) {
    case 'CAIXA FINAL DE SEMANA':
      folder = 'CAIXA FINAL DE SEMANA';
      break;
    case 'CAIXA NIKE':
      folder = 'CAIXA KIT NIKE';
      break;
    case 'CAIXA SAMSUNG':
      folder = 'CAIXA SAMSUNG';
      break;
    case 'CAIXA CONSOLE':
      folder = 'CAIXA CONSOLE DOS SONHOS';
      break;
    case 'CAIXA APPLE':
      folder = 'CAIXA APPLE';
      break;
    case 'CAIXA PREMIUM MASTER':
      folder = 'CAIXA PREMIUM MASTER';
      break;
  }
  
  // Filtrar imagens disponíveis para esta caixa
  const caseImages = availableImages.filter(img => img.includes(folder));
  console.log(`📁 Imagens disponíveis para ${caseName}:`, caseImages);
  
  // Mapear prêmio para imagem existente
  let imagePath = null;
  let rarity = 'rarity-1.png';
  let bgColor = 'rgb(176, 190, 197)';
  
  if (!prize.sem_imagem) {
    // Tentar mapear baseado no valor
    const valor = prize.valor;
    
    if (valor >= 2000) {
      // Procurar imagem de 2000
      imagePath = caseImages.find(img => img.includes('2000.png'));
      if (imagePath) {
        rarity = 'rarity-5.png';
        bgColor = 'rgb(255, 215, 0)';
      }
    } else if (valor >= 1000) {
      // Procurar imagem de 1000
      imagePath = caseImages.find(img => img.includes('1000.png'));
      if (imagePath) {
        rarity = 'rarity-5.png';
        bgColor = 'rgb(255, 215, 0)';
      }
    } else if (valor >= 500) {
      // Procurar imagem de 500
      imagePath = caseImages.find(img => img.includes('500.webp') || img.includes('500.png'));
      if (imagePath) {
        rarity = 'rarity-4.png';
        bgColor = 'rgb(255, 59, 59)';
      }
    } else if (valor >= 100) {
      // Procurar imagem de 100
      imagePath = caseImages.find(img => img.includes('100.png') || img.includes('100reais.png'));
      if (imagePath) {
        rarity = 'rarity-3.png';
        bgColor = 'rgb(162, 89, 255)';
      }
    } else if (valor >= 50) {
      // Procurar imagem de 50
      imagePath = caseImages.find(img => img.includes('50.png'));
      if (imagePath) {
        rarity = 'rarity-2.png';
        bgColor = 'rgb(59, 130, 246)';
      }
    } else if (valor >= 10) {
      // Procurar imagem de 10
      imagePath = caseImages.find(img => img.includes('10.png'));
      if (imagePath) {
        rarity = 'rarity-1.png';
        bgColor = 'rgb(176, 190, 197)';
      }
    } else if (valor >= 5) {
      // Procurar imagem de 5
      imagePath = caseImages.find(img => img.includes('5.png'));
      if (imagePath) {
        rarity = 'rarity-1.png';
        bgColor = 'rgb(176, 190, 197)';
      }
    } else if (valor >= 2) {
      // Procurar imagem de 2
      imagePath = caseImages.find(img => img.includes('2.png'));
      if (imagePath) {
        rarity = 'rarity-1.png';
        bgColor = 'rgb(176, 190, 197)';
      }
    } else {
      // Procurar imagem de 1
      imagePath = caseImages.find(img => img.includes('1.png'));
      if (imagePath) {
        rarity = 'rarity-1.png';
        bgColor = 'rgb(176, 190, 197)';
      }
    }
    
    // Se não encontrou imagem específica, usar fallback
    if (!imagePath) {
      console.log('⚠️ Imagem específica não encontrada, usando fallback...');
      
      // Fallback para produtos premium
      if (valor >= 1000) {
        imagePath = caseImages.find(img => 
          img.includes('iphone') || 
          img.includes('macbook') || 
          img.includes('ps5') || 
          img.includes('s25') ||
          img.includes('jordan')
        );
        if (imagePath) {
          rarity = 'rarity-5.png';
          bgColor = 'rgb(255, 215, 0)';
        }
      } else if (valor >= 500) {
        imagePath = caseImages.find(img => 
          img.includes('airforce') || 
          img.includes('xboxone') || 
          img.includes('notebook') ||
          img.includes('ipad')
        );
        if (imagePath) {
          rarity = 'rarity-4.png';
          bgColor = 'rgb(255, 59, 59)';
        }
      } else if (valor >= 100) {
        imagePath = caseImages.find(img => 
          img.includes('camisa') || 
          img.includes('steamdeck') || 
          img.includes('airpods') ||
          img.includes('fone')
        );
        if (imagePath) {
          rarity = 'rarity-3.png';
          bgColor = 'rgb(162, 89, 255)';
        }
      } else if (valor >= 50) {
        imagePath = caseImages.find(img => 
          img.includes('boné') || 
          img.includes('100reais')
        );
        if (imagePath) {
          rarity = 'rarity-2.png';
          bgColor = 'rgb(59, 130, 246)';
        }
      }
      
      // Se ainda não encontrou, usar a primeira imagem disponível
      if (!imagePath && caseImages.length > 0) {
        imagePath = caseImages[0];
        console.log('⚠️ Usando primeira imagem disponível como fallback');
      }
    }
  }
  
  const mappedPrize = {
    name: prize.nome,
    value: `R$ ${parseFloat(prize.valor).toFixed(2).replace('.', ',')}`,
    rarity: rarity,
    image: imagePath,
    bgColor: bgColor,
    apiPrize: prize,
    sem_imagem: prize.sem_imagem || false
  };
  
  console.log('🎨 Prêmio mapeado:', mappedPrize);
  
  // Verificar se a imagem existe
  if (mappedPrize.image) {
    const img = new Image();
    img.onload = () => console.log('✅ Imagem carregada:', mappedPrize.image);
    img.onerror = () => console.error('❌ Erro ao carregar:', mappedPrize.image);
    img.src = mappedPrize.image;
  } else {
    console.log('⚠️ Prêmio sem imagem configurada');
  }
  
  return mappedPrize;
}

// ========================================
// 4. TESTAR MAPEAMENTO CORRETO
// ========================================
async function testCorrectMapping() {
  console.log('🧪 TESTANDO MAPEAMENTO CORRETO...');
  
  // 1. Verificar imagens disponíveis
  const imageResults = await checkAllImages();
  
  // 2. Testar mapeamento com prêmios de exemplo
  const testPrizes = [
    { nome: 'R$ 50,00', valor: 50, sem_imagem: false },
    { nome: 'R$ 100,00', valor: 100, sem_imagem: false },
    { nome: 'R$ 200,00', valor: 200, sem_imagem: false },
    { nome: 'R$ 500,00', valor: 500, sem_imagem: false },
    { nome: 'R$ 1000,00', valor: 1000, sem_imagem: false }
  ];
  
  const testCases = [
    'CAIXA FINAL DE SEMANA',
    'CAIXA NIKE',
    'CAIXA SAMSUNG',
    'CAIXA CONSOLE',
    'CAIXA APPLE',
    'CAIXA PREMIUM MASTER'
  ];
  
  console.log('\n🧪 TESTANDO MAPEAMENTO PARA TODAS AS CAIXAS:');
  
  for (const caseName of testCases) {
    console.log(`\n📦 === ${caseName} ===`);
    
    for (const prize of testPrizes) {
      const mapped = mapPrizesToExistingImages(prize, caseName, imageResults.available);
      console.log(`  ${prize.nome} → ${mapped.image || 'SEM IMAGEM'}`);
    }
  }
  
  return imageResults;
}

// ========================================
// 5. EXECUTAR VERIFICAÇÃO
// ========================================
console.log('🎯 FUNÇÕES DISPONÍVEIS:');
console.log('- testCorrectMapping() - Testa mapeamento correto');
console.log('- checkAllImages() - Verifica todas as imagens');
console.log('\n🚀 Execute testCorrectMapping() para começar!');

// Executar automaticamente
testCorrectMapping();
