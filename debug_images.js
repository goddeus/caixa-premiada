// ========================================
// 🖼️ DEBUG ESPECÍFICO DE IMAGENS
// ========================================
// Cole este código no console do navegador para debugar problemas de imagens

console.log('🖼️ INICIANDO DEBUG DE IMAGENS...');

// ========================================
// 1. VERIFICAR IMAGENS DISPONÍVEIS
// ========================================
async function checkAvailableImages() {
  console.log('\n📁 === VERIFICANDO IMAGENS DISPONÍVEIS ===');
  
  const imagePaths = [
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
  
  const results = {
    available: [],
    missing: [],
    errors: []
  };
  
  for (const imagePath of imagePaths) {
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
// 2. TESTAR MAPEAMENTO DE IMAGENS
// ========================================
function testImageMapping() {
  console.log('\n🔄 === TESTANDO MAPEAMENTO DE IMAGENS ===');
  
  // Simular prêmios de teste
  const testPrizes = [
    { nome: 'R$ 1,00', valor: 1, sem_imagem: false },
    { nome: 'R$ 10,00', valor: 10, sem_imagem: false },
    { nome: 'R$ 100,00', valor: 100, sem_imagem: false },
    { nome: 'R$ 500,00', valor: 500, sem_imagem: false },
    { nome: 'R$ 1000,00', valor: 1000, sem_imagem: false },
    { nome: 'R$ 2000,00', valor: 2000, sem_imagem: false },
    { nome: 'IPHONE 16 PRO MAX', valor: 10000, sem_imagem: false },
    { nome: 'MACBOOK', valor: 5000, sem_imagem: false },
    { nome: 'PS5 1TB', valor: 5000, sem_imagem: false },
    { nome: 'JORDAN 1', valor: 700, sem_imagem: false }
  ];
  
  const cases = [
    { name: 'CAIXA FINAL DE SEMANA', folder: 'CAIXA FINAL DE SEMANA' },
    { name: 'CAIXA NIKE', folder: 'CAIXA KIT NIKE' },
    { name: 'CAIXA SAMSUNG', folder: 'CAIXA SAMSUNG' },
    { name: 'CAIXA CONSOLE', folder: 'CAIXA CONSOLE DOS SONHOS' },
    { name: 'CAIXA APPLE', folder: 'CAIXA APPLE' },
    { name: 'CAIXA PREMIUM MASTER', folder: 'CAIXA PREMIUM MASTER' }
  ];
  
  cases.forEach(caseData => {
    console.log(`\n📦 ${caseData.name}:`);
    
    testPrizes.forEach(prize => {
      const mappedPrize = mapPrizeToImage(prize, caseData.folder);
      console.log(`  ${prize.nome} (R$ ${prize.valor}) → ${mappedPrize.image}`);
    });
  });
}

// ========================================
// 3. FUNÇÃO DE MAPEAMENTO (SIMULANDO O FRONTEND)
// ========================================
function mapPrizeToImage(apiPrize, folder) {
  const mappedPrize = {
    name: apiPrize.nome,
    value: `R$ ${parseFloat(apiPrize.valor).toFixed(2).replace('.', ',')}`,
    rarity: 'rarity-1.png',
    image: apiPrize.sem_imagem ? null : `/imagens/${folder}/1.png`,
    bgColor: 'rgb(176, 190, 197)',
    apiPrize: apiPrize,
    sem_imagem: apiPrize.sem_imagem || false
  };
  
  // Mapear prêmios específicos baseado no nome e valor
  if (!apiPrize.sem_imagem) {
    if (apiPrize.nome.includes('R$ 2000,00') || apiPrize.nome.includes('R$2000,00') || apiPrize.valor === 2000) {
      mappedPrize.rarity = 'rarity-5.png';
      mappedPrize.image = `/imagens/${folder}/2000.png`;
      mappedPrize.bgColor = 'rgb(255, 215, 0)';
    } else if (apiPrize.nome.includes('R$ 1000,00') || apiPrize.nome.includes('R$1000,00') || apiPrize.valor === 1000) {
      mappedPrize.rarity = 'rarity-5.png';
      mappedPrize.image = `/imagens/${folder}/1000.png`;
      mappedPrize.bgColor = 'rgb(255, 215, 0)';
    } else if (apiPrize.nome.includes('R$ 500,00') || apiPrize.nome.includes('R$500,00') || apiPrize.valor === 500) {
      mappedPrize.rarity = 'rarity-3.png';
      mappedPrize.image = `/imagens/${folder}/500.webp`;
      mappedPrize.bgColor = 'rgb(162, 89, 255)';
    } else if (apiPrize.nome.includes('R$ 100,00') || apiPrize.nome.includes('R$100,00') || apiPrize.valor === 100) {
      mappedPrize.rarity = 'rarity-2.png';
      mappedPrize.image = `/imagens/${folder}/100.png`;
      mappedPrize.bgColor = 'rgb(59, 130, 246)';
    } else if (apiPrize.nome.includes('R$ 50,00') || apiPrize.nome.includes('R$50,00') || apiPrize.valor === 50) {
      mappedPrize.rarity = 'rarity-2.png';
      mappedPrize.image = `/imagens/${folder}/50.png`;
      mappedPrize.bgColor = 'rgb(59, 130, 246)';
    } else if (apiPrize.nome.includes('R$ 10,00') || apiPrize.nome.includes('R$10,00') || apiPrize.valor === 10) {
      mappedPrize.rarity = 'rarity-1.png';
      mappedPrize.image = `/imagens/${folder}/10.png`;
      mappedPrize.bgColor = 'rgb(176, 190, 197)';
    } else if (apiPrize.nome.includes('R$ 5,00') || apiPrize.nome.includes('R$5,00') || apiPrize.valor === 5) {
      mappedPrize.rarity = 'rarity-1.png';
      mappedPrize.image = `/imagens/${folder}/5.png`;
      mappedPrize.bgColor = 'rgb(176, 190, 197)';
    } else if (apiPrize.nome.includes('R$ 2,00') || apiPrize.nome.includes('R$2,00') || apiPrize.valor === 2) {
      mappedPrize.rarity = 'rarity-1.png';
      mappedPrize.image = `/imagens/${folder}/2.png`;
      mappedPrize.bgColor = 'rgb(176, 190, 197)';
    } else if (apiPrize.nome.includes('R$ 1,00') || apiPrize.nome.includes('R$1,00') || apiPrize.valor === 1) {
      mappedPrize.rarity = 'rarity-1.png';
      mappedPrize.image = `/imagens/${folder}/1.png`;
      mappedPrize.bgColor = 'rgb(176, 190, 197)';
    } else {
      // Fallback para outros prêmios baseado no valor
      if (apiPrize.valor >= 2000) {
        mappedPrize.image = `/imagens/${folder}/2000.png`;
        mappedPrize.rarity = 'rarity-5.png';
        mappedPrize.bgColor = 'rgb(255, 215, 0)';
      } else if (apiPrize.valor >= 1000) {
        mappedPrize.image = `/imagens/${folder}/1000.png`;
        mappedPrize.rarity = 'rarity-5.png';
        mappedPrize.bgColor = 'rgb(255, 215, 0)';
      } else if (apiPrize.valor >= 500) {
        mappedPrize.image = `/imagens/${folder}/500.webp`;
        mappedPrize.rarity = 'rarity-4.png';
        mappedPrize.bgColor = 'rgb(255, 59, 59)';
      } else if (apiPrize.valor >= 100) {
        mappedPrize.image = `/imagens/${folder}/100.png`;
        mappedPrize.rarity = 'rarity-3.png';
        mappedPrize.bgColor = 'rgb(162, 89, 255)';
      } else if (apiPrize.valor >= 50) {
        mappedPrize.image = `/imagens/${folder}/50.png`;
        mappedPrize.rarity = 'rarity-2.png';
        mappedPrize.bgColor = 'rgb(59, 130, 246)';
      } else if (apiPrize.valor >= 10) {
        mappedPrize.image = `/imagens/${folder}/10.png`;
      } else if (apiPrize.valor >= 5) {
        mappedPrize.image = `/imagens/${folder}/5.png`;
      } else if (apiPrize.valor >= 2) {
        mappedPrize.image = `/imagens/${folder}/2.png`;
      } else {
        mappedPrize.image = `/imagens/${folder}/1.png`;
      }
    }
  }
  
  return mappedPrize;
}

// ========================================
// 4. VERIFICAR PROBLEMAS ESPECÍFICOS
// ========================================
async function debugSpecificImageIssues() {
  console.log('\n🔍 === VERIFICANDO PROBLEMAS ESPECÍFICOS ===');
  
  // Verificar se há prêmios com valores altos que não têm imagem
  console.log('🎯 Testando prêmios de alto valor...');
  
  const highValuePrizes = [
    { nome: 'R$ 1000,00', valor: 1000, sem_imagem: false },
    { nome: 'R$ 2000,00', valor: 2000, sem_imagem: false },
    { nome: 'R$ 5000,00', valor: 5000, sem_imagem: false },
    { nome: 'R$ 10000,00', valor: 10000, sem_imagem: false }
  ];
  
  const cases = [
    { name: 'CAIXA FINAL DE SEMANA', folder: 'CAIXA FINAL DE SEMANA' },
    { name: 'CAIXA NIKE', folder: 'CAIXA KIT NIKE' },
    { name: 'CAIXA SAMSUNG', folder: 'CAIXA SAMSUNG' },
    { name: 'CAIXA CONSOLE', folder: 'CAIXA CONSOLE DOS SONHOS' },
    { name: 'CAIXA APPLE', folder: 'CAIXA APPLE' },
    { name: 'CAIXA PREMIUM MASTER', folder: 'CAIXA PREMIUM MASTER' }
  ];
  
  for (const caseData of cases) {
    console.log(`\n📦 ${caseData.name}:`);
    
    for (const prize of highValuePrizes) {
      const mappedPrize = mapPrizeToImage(prize, caseData.folder);
      
      // Verificar se a imagem existe
      try {
        const response = await fetch(mappedPrize.image, { method: 'HEAD' });
        if (response.ok) {
          console.log(`  ✅ ${prize.nome} → ${mappedPrize.image}`);
        } else {
          console.log(`  ❌ ${prize.nome} → ${mappedPrize.image} (Status: ${response.status})`);
        }
      } catch (error) {
        console.log(`  ⚠️ ${prize.nome} → ${mappedPrize.image} (Erro: ${error.message})`);
      }
    }
  }
}

// ========================================
// 5. FUNÇÃO PRINCIPAL DE DEBUG DE IMAGENS
// ========================================
async function runImageDebug() {
  console.log('🖼️ INICIANDO DEBUG DE IMAGENS...');
  
  // 1. Verificar imagens disponíveis
  await checkAvailableImages();
  
  // 2. Testar mapeamento de imagens
  testImageMapping();
  
  // 3. Verificar problemas específicos
  await debugSpecificImageIssues();
  
  console.log('\n✅ DEBUG DE IMAGENS FINALIZADO!');
  console.log('📋 Verifique os logs acima para identificar problemas de imagens.');
}

// ========================================
// 6. FUNÇÕES AUXILIARES
// ========================================

// Função para verificar uma imagem específica
window.checkImage = async function(imagePath) {
  try {
    const response = await fetch(imagePath, { method: 'HEAD' });
    if (response.ok) {
      console.log(`✅ Imagem disponível: ${imagePath}`);
      return true;
    } else {
      console.log(`❌ Imagem não encontrada: ${imagePath} (Status: ${response.status})`);
      return false;
    }
  } catch (error) {
    console.log(`⚠️ Erro ao verificar imagem: ${imagePath} (Erro: ${error.message})`);
    return false;
  }
};

// Função para testar mapeamento de um prêmio específico
window.testPrizeMapping = function(prize, folder) {
  return mapPrizeToImage(prize, folder);
};

// ========================================
// 7. EXECUTAR DEBUG AUTOMATICAMENTE
// ========================================
console.log('🎯 FUNÇÕES DISPONÍVEIS:');
console.log('- runImageDebug() - Executa debug completo de imagens');
console.log('- checkImage(imagePath) - Verifica uma imagem específica');
console.log('- testPrizeMapping(prize, folder) - Testa mapeamento de um prêmio');
console.log('\n🚀 Execute runImageDebug() para começar!');

// Executar debug automaticamente
runImageDebug();
