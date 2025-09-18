// ========================================
// 🎨 DEBUG ESPECÍFICO DO FRONTEND
// ========================================
// Cole este código no console do navegador para debugar problemas do frontend

console.log('🎨 INICIANDO DEBUG DO FRONTEND...');

// ========================================
// 1. VERIFICAR COMPONENTES REACT
// ========================================
function debugReactComponents() {
  console.log('\n⚛️ === VERIFICANDO COMPONENTES REACT ===');
  
  // Verificar se os componentes estão carregados
  const components = [
    'AppleCase',
    'NikeCase', 
    'ConsoleCase',
    'SamsungCase',
    'PremiumMasterCase',
    'WeekendCase'
  ];
  
  components.forEach(componentName => {
    console.log(`🔍 Verificando componente ${componentName}...`);
    
    // Verificar se o componente está no DOM
    const componentElement = document.querySelector(`[data-testid="${componentName}"]`) || 
                           document.querySelector(`.${componentName.toLowerCase()}`) ||
                           document.querySelector(`#${componentName.toLowerCase()}`);
    
    if (componentElement) {
      console.log(`✅ Componente ${componentName} encontrado no DOM`);
    } else {
      console.log(`❌ Componente ${componentName} não encontrado no DOM`);
    }
  });
}

// ========================================
// 2. VERIFICAR ESTADO DOS COMPONENTES
// ========================================
function debugComponentState() {
  console.log('\n📊 === VERIFICANDO ESTADO DOS COMPONENTES ===');
  
  // Verificar se há elementos de prêmios no DOM
  const prizeElements = document.querySelectorAll('[class*="prize"], [class*="item"], [class*="card"]');
  console.log(`🎁 Elementos de prêmios encontrados: ${prizeElements.length}`);
  
  prizeElements.forEach((element, index) => {
    console.log(`\n🎁 Prêmio ${index + 1}:`);
    console.log('  - Elemento:', element);
    console.log('  - Classes:', element.className);
    console.log('  - Texto:', element.textContent?.trim());
    
    // Verificar se há imagem
    const img = element.querySelector('img');
    if (img) {
      console.log('  - Imagem:', img.src);
      console.log('  - Alt:', img.alt);
      
      // Verificar se a imagem carregou
      if (img.complete && img.naturalHeight !== 0) {
        console.log('  - Status da imagem: ✅ Carregada');
      } else {
        console.log('  - Status da imagem: ❌ Não carregada');
      }
    } else {
      console.log('  - Imagem: ❌ Não encontrada');
    }
  });
}

// ========================================
// 3. VERIFICAR MAPEAMENTO DE IMAGENS
// ========================================
function debugImageMapping() {
  console.log('\n🖼️ === VERIFICANDO MAPEAMENTO DE IMAGENS ===');
  
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
      
      // Verificar se a imagem existe
      if (mappedPrize.image) {
        const img = new Image();
        img.onload = () => console.log(`    ✅ Imagem carregada: ${mappedPrize.image}`);
        img.onerror = () => console.log(`    ❌ Erro ao carregar: ${mappedPrize.image}`);
        img.src = mappedPrize.image;
      }
    });
  });
}

// ========================================
// 4. FUNÇÃO DE MAPEAMENTO (SIMULANDO O FRONTEND)
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
// 5. VERIFICAR PROBLEMAS ESPECÍFICOS
// ========================================
function debugSpecificIssues() {
  console.log('\n🔍 === VERIFICANDO PROBLEMAS ESPECÍFICOS ===');
  
  // Verificar se há elementos com imagens quebradas
  const images = document.querySelectorAll('img');
  console.log(`🖼️ Total de imagens no DOM: ${images.length}`);
  
  let brokenImages = 0;
  let loadedImages = 0;
  
  images.forEach((img, index) => {
    if (img.complete && img.naturalHeight !== 0) {
      loadedImages++;
    } else {
      brokenImages++;
      console.log(`❌ Imagem quebrada ${index + 1}:`, img.src);
    }
  });
  
  console.log(`✅ Imagens carregadas: ${loadedImages}`);
  console.log(`❌ Imagens quebradas: ${brokenImages}`);
  
  // Verificar se há elementos de prêmios sem imagem
  const prizeElements = document.querySelectorAll('[class*="prize"], [class*="item"], [class*="card"]');
  let prizesWithoutImage = 0;
  
  prizeElements.forEach((element, index) => {
    const img = element.querySelector('img');
    if (!img) {
      prizesWithoutImage++;
      console.log(`⚠️ Prêmio ${index + 1} sem imagem:`, element.textContent?.trim());
    }
  });
  
  console.log(`⚠️ Prêmios sem imagem: ${prizesWithoutImage}`);
}

// ========================================
// 6. VERIFICAR CONSOLE DE ERROS
// ========================================
function debugConsoleErrors() {
  console.log('\n🚨 === VERIFICANDO CONSOLE DE ERROS ===');
  
  // Verificar se há erros no console
  const originalError = console.error;
  const errors = [];
  
  console.error = function(...args) {
    errors.push(args);
    originalError.apply(console, args);
  };
  
  // Verificar se há warnings no console
  const originalWarn = console.warn;
  const warnings = [];
  
  console.warn = function(...args) {
    warnings.push(args);
    originalWarn.apply(console, args);
  };
  
  console.log(`📊 Erros capturados: ${errors.length}`);
  console.log(`📊 Warnings capturados: ${warnings.length}`);
  
  if (errors.length > 0) {
    console.log('❌ ERROS ENCONTRADOS:');
    errors.forEach((error, index) => {
      console.log(`${index + 1}.`, error);
    });
  }
  
  if (warnings.length > 0) {
    console.log('⚠️ WARNINGS ENCONTRADOS:');
    warnings.forEach((warning, index) => {
      console.log(`${index + 1}.`, warning);
    });
  }
  
  // Restaurar funções originais
  console.error = originalError;
  console.warn = originalWarn;
}

// ========================================
// 7. FUNÇÃO PRINCIPAL DE DEBUG DO FRONTEND
// ========================================
function runFrontendDebug() {
  console.log('🎨 INICIANDO DEBUG DO FRONTEND...');
  
  // 1. Verificar componentes React
  debugReactComponents();
  
  // 2. Verificar estado dos componentes
  debugComponentState();
  
  // 3. Verificar mapeamento de imagens
  debugImageMapping();
  
  // 4. Verificar problemas específicos
  debugSpecificIssues();
  
  // 5. Verificar console de erros
  debugConsoleErrors();
  
  console.log('\n✅ DEBUG DO FRONTEND FINALIZADO!');
  console.log('📋 Verifique os logs acima para identificar problemas do frontend.');
}

// ========================================
// 8. FUNÇÕES AUXILIARES
// ========================================

// Função para verificar uma imagem específica
window.checkImage = function(imagePath) {
  const img = new Image();
  img.onload = () => console.log(`✅ Imagem carregada: ${imagePath}`);
  img.onerror = () => console.log(`❌ Erro ao carregar imagem: ${imagePath}`);
  img.src = imagePath;
};

// Função para testar mapeamento de um prêmio específico
window.testPrizeMapping = function(prize, folder) {
  return mapPrizeToImage(prize, folder);
};

// Função para verificar elementos do DOM
window.checkDOM = function() {
  debugComponentState();
  debugSpecificIssues();
};

// ========================================
// 9. EXECUTAR DEBUG AUTOMATICAMENTE
// ========================================
console.log('🎯 FUNÇÕES DISPONÍVEIS:');
console.log('- runFrontendDebug() - Executa debug completo do frontend');
console.log('- checkImage(imagePath) - Verifica uma imagem específica');
console.log('- testPrizeMapping(prize, folder) - Testa mapeamento de um prêmio');
console.log('- checkDOM() - Verifica elementos do DOM');
console.log('\n🚀 Execute runFrontendDebug() para começar!');

// Executar debug automaticamente
runFrontendDebug();
