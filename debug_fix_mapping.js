// ========================================
// 🔧 CORRIGIR MAPEAMENTO DE IMAGENS
// ========================================
// Cole este código no console do navegador para corrigir o mapeamento

console.log('🔧 CORRIGINDO MAPEAMENTO DE IMAGENS...');

// ========================================
// 1. MAPEAMENTO CORRETO BASEADO EM IMAGENS QUE FUNCIONAM
// ========================================
const WORKING_IMAGE_MAPPING = {
  'CAIXA FINAL DE SEMANA': {
    folder: 'CAIXA FINAL DE SEMANA',
    workingImages: [
      '/imagens/CAIXA FINAL DE SEMANA/1.png',
      '/imagens/CAIXA FINAL DE SEMANA/2.png',
      '/imagens/CAIXA FINAL DE SEMANA/5.png',
      '/imagens/CAIXA FINAL DE SEMANA/10.png',
      '/imagens/CAIXA FINAL DE SEMANA/100.png',
      '/imagens/CAIXA FINAL DE SEMANA/500.webp'
    ]
  },
  'CAIXA NIKE': {
    folder: 'CAIXA KIT NIKE',
    workingImages: [
      '/imagens/CAIXA KIT NIKE/1.png',
      '/imagens/CAIXA KIT NIKE/2.png',
      '/imagens/CAIXA KIT NIKE/5.png',
      '/imagens/CAIXA KIT NIKE/10.png',
      '/imagens/CAIXA KIT NIKE/jordan.png',
      '/imagens/CAIXA KIT NIKE/airforce.webp',
      '/imagens/CAIXA KIT NIKE/camisa nike.webp',
      '/imagens/CAIXA KIT NIKE/boné nike.png'
    ]
  },
  'CAIXA SAMSUNG': {
    folder: 'CAIXA SAMSUNG',
    workingImages: [
      '/imagens/CAIXA SAMSUNG/1.png',
      '/imagens/CAIXA SAMSUNG/2.png',
      '/imagens/CAIXA SAMSUNG/5.png',
      '/imagens/CAIXA SAMSUNG/10.png',
      '/imagens/CAIXA SAMSUNG/500.webp',
      '/imagens/CAIXA SAMSUNG/s25.png',
      '/imagens/CAIXA SAMSUNG/notebook samsung.png',
      '/imagens/CAIXA SAMSUNG/fone samsung.png'
    ]
  },
  'CAIXA CONSOLE': {
    folder: 'CAIXA CONSOLE DOS SONHOS',
    workingImages: [
      '/imagens/CAIXA CONSOLE DOS SONHOS/1.png',
      '/imagens/CAIXA CONSOLE DOS SONHOS/2.png',
      '/imagens/CAIXA CONSOLE DOS SONHOS/5.png',
      '/imagens/CAIXA CONSOLE DOS SONHOS/10.png',
      '/imagens/CAIXA CONSOLE DOS SONHOS/100reais.png',
      '/imagens/CAIXA CONSOLE DOS SONHOS/ps5.png',
      '/imagens/CAIXA CONSOLE DOS SONHOS/xboxone.webp',
      '/imagens/CAIXA CONSOLE DOS SONHOS/steamdeck.png'
    ]
  },
  'CAIXA APPLE': {
    folder: 'CAIXA APPLE',
    workingImages: [
      '/imagens/CAIXA APPLE/1.png',
      '/imagens/CAIXA APPLE/2.png',
      '/imagens/CAIXA APPLE/5.png',
      '/imagens/CAIXA APPLE/10.png',
      '/imagens/CAIXA APPLE/500.webp',
      '/imagens/CAIXA APPLE/2000.png',
      '/imagens/CAIXA APPLE/iphone 16 pro max.png',
      '/imagens/CAIXA APPLE/macbook.png',
      '/imagens/CAIXA APPLE/air pods.png',
      '/imagens/CAIXA APPLE/ipad.png'
    ]
  },
  'CAIXA PREMIUM MASTER': {
    folder: 'CAIXA PREMIUM MASTER',
    workingImages: [
      '/imagens/CAIXA PREMIUM MASTER/2.png',
      '/imagens/CAIXA PREMIUM MASTER/5.png',
      '/imagens/CAIXA PREMIUM MASTER/10.png',
      '/imagens/CAIXA PREMIUM MASTER/20.png',
      '/imagens/CAIXA PREMIUM MASTER/500.webp',
      '/imagens/CAIXA PREMIUM MASTER/2000.png',
      '/imagens/CAIXA PREMIUM MASTER/honda cg fan.webp',
      '/imagens/CAIXA PREMIUM MASTER/macbook.png',
      '/imagens/CAIXA PREMIUM MASTER/iphone 16 pro max.png',
      '/imagens/CAIXA PREMIUM MASTER/samsung s25.png',
      '/imagens/CAIXA PREMIUM MASTER/ipad.png',
      '/imagens/CAIXA PREMIUM MASTER/airpods.png'
    ]
  }
};

// ========================================
// 2. FUNÇÃO PARA MAPEAR PRÊMIO CORRETAMENTE
// ========================================
function mapPrizeCorrectly(prize, caseName) {
  console.log(`\n🖼️ === MAPEANDO PRÊMIO CORRETAMENTE PARA ${caseName} ===`);
  console.log('Prêmio:', prize);
  
  const caseConfig = WORKING_IMAGE_MAPPING[caseName];
  if (!caseConfig) {
    console.error('❌ Configuração não encontrada para:', caseName);
    return null;
  }
  
  const workingImages = caseConfig.workingImages;
  console.log('📁 Imagens que funcionam:', workingImages);
  
  // Mapear prêmio para imagem que funciona
  let imagePath = null;
  let rarity = 'rarity-1.png';
  let bgColor = 'rgb(176, 190, 197)';
  
  if (!prize.sem_imagem) {
    const valor = prize.valor;
    
    // Mapear baseado no valor, usando apenas imagens que funcionam
    if (valor >= 2000) {
      // Procurar imagem de 2000
      imagePath = workingImages.find(img => img.includes('2000.png'));
      if (imagePath) {
        rarity = 'rarity-5.png';
        bgColor = 'rgb(255, 215, 0)';
      }
    } else if (valor >= 1000) {
      // Procurar imagem de 1000 ou produto premium
      imagePath = workingImages.find(img => 
        img.includes('1000.png') || 
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
      // Procurar imagem de 500 ou produto premium
      imagePath = workingImages.find(img => 
        img.includes('500.webp') || 
        img.includes('500.png') ||
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
      // Procurar imagem de 100 ou produto premium
      imagePath = workingImages.find(img => 
        img.includes('100.png') || 
        img.includes('100reais.png') ||
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
      // Procurar imagem de 50 ou produto premium
      imagePath = workingImages.find(img => 
        img.includes('50.png') ||
        img.includes('boné')
      );
      if (imagePath) {
        rarity = 'rarity-2.png';
        bgColor = 'rgb(59, 130, 246)';
      }
    } else if (valor >= 10) {
      // Procurar imagem de 10
      imagePath = workingImages.find(img => img.includes('10.png'));
      if (imagePath) {
        rarity = 'rarity-1.png';
        bgColor = 'rgb(176, 190, 197)';
      }
    } else if (valor >= 5) {
      // Procurar imagem de 5
      imagePath = workingImages.find(img => img.includes('5.png'));
      if (imagePath) {
        rarity = 'rarity-1.png';
        bgColor = 'rgb(176, 190, 197)';
      }
    } else if (valor >= 2) {
      // Procurar imagem de 2
      imagePath = workingImages.find(img => img.includes('2.png'));
      if (imagePath) {
        rarity = 'rarity-1.png';
        bgColor = 'rgb(176, 190, 197)';
      }
    } else {
      // Procurar imagem de 1
      imagePath = workingImages.find(img => img.includes('1.png'));
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
        imagePath = workingImages.find(img => 
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
        imagePath = workingImages.find(img => 
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
        imagePath = workingImages.find(img => 
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
        imagePath = workingImages.find(img => 
          img.includes('boné') || 
          img.includes('100reais')
        );
        if (imagePath) {
          rarity = 'rarity-2.png';
          bgColor = 'rgb(59, 130, 246)';
        }
      }
      
      // Se ainda não encontrou, usar a primeira imagem disponível
      if (!imagePath && workingImages.length > 0) {
        imagePath = workingImages[0];
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
  
  console.log('🎨 Prêmio mapeado corretamente:', mappedPrize);
  
  // Verificar se a imagem funciona
  if (mappedPrize.image) {
    const img = new Image();
    img.onload = () => console.log('✅ Imagem carregada com sucesso:', mappedPrize.image);
    img.onerror = () => console.error('❌ Erro ao carregar:', mappedPrize.image);
    img.src = mappedPrize.image;
  } else {
    console.log('⚠️ Prêmio sem imagem configurada');
  }
  
  return mappedPrize;
}

// ========================================
// 3. TESTAR MAPEAMENTO CORRETO
// ========================================
async function testCorrectMapping() {
  console.log('🧪 TESTANDO MAPEAMENTO CORRETO...');
  
  // Testar mapeamento com prêmios de exemplo
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
  
  console.log('\n🧪 TESTANDO MAPEAMENTO CORRETO PARA TODAS AS CAIXAS:');
  
  for (const caseName of testCases) {
    console.log(`\n📦 === ${caseName} ===`);
    
    for (const prize of testPrizes) {
      const mapped = mapPrizeCorrectly(prize, caseName);
      if (mapped) {
        console.log(`  ${prize.nome} → ${mapped.image || 'SEM IMAGEM'}`);
      }
    }
  }
}

// ========================================
// 4. FUNÇÃO PARA APLICAR CORREÇÃO NO FRONTEND
// ========================================
function applyFrontendFix() {
  console.log('🔧 APLICANDO CORREÇÃO NO FRONTEND...');
  
  // Esta função seria usada para aplicar a correção no código do frontend
  console.log('📝 Para aplicar a correção, você precisa:');
  console.log('1. Atualizar o mapeamento de imagens em cada componente de caixa');
  console.log('2. Usar apenas as imagens que funcionam (listadas acima)');
  console.log('3. Implementar fallback inteligente para produtos premium');
  
  // Exemplo de como seria o código corrigido
  const correctedMapping = `
// Exemplo de mapeamento corrigido para CAIXA NIKE:
function mapPrizeImage(prize, caseName) {
  const workingImages = [
    '/imagens/CAIXA KIT NIKE/1.png',
    '/imagens/CAIXA KIT NIKE/2.png',
    '/imagens/CAIXA KIT NIKE/5.png',
    '/imagens/CAIXA KIT NIKE/10.png',
    '/imagens/CAIXA KIT NIKE/jordan.png',
    '/imagens/CAIXA KIT NIKE/airforce.webp',
    '/imagens/CAIXA KIT NIKE/camisa nike.webp',
    '/imagens/CAIXA KIT NIKE/boné nike.png'
  ];
  
  // Mapear baseado no valor, usando apenas imagens que funcionam
  if (prize.valor >= 1000) {
    return workingImages.find(img => img.includes('jordan')) || workingImages[0];
  } else if (prize.valor >= 500) {
    return workingImages.find(img => img.includes('airforce')) || workingImages[0];
  } else if (prize.valor >= 100) {
    return workingImages.find(img => img.includes('camisa')) || workingImages[0];
  } else if (prize.valor >= 50) {
    return workingImages.find(img => img.includes('boné')) || workingImages[0];
  } else {
    return workingImages.find(img => img.includes(\`\${prize.valor}.png\`)) || workingImages[0];
  }
}
  `;
  
  console.log('📝 Código de exemplo:', correctedMapping);
}

// ========================================
// 5. EXECUTAR CORREÇÃO
// ========================================
console.log('🎯 FUNÇÕES DISPONÍVEIS:');
console.log('- testCorrectMapping() - Testa mapeamento correto');
console.log('- applyFrontendFix() - Aplica correção no frontend');
console.log('- mapPrizeCorrectly(prize, caseName) - Mapeia prêmio corretamente');
console.log('\n🚀 Execute testCorrectMapping() para começar!');

// Executar automaticamente
testCorrectMapping();
