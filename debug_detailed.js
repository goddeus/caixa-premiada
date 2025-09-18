// ========================================
// 🔍 DEBUG DETALHADO - CAIXA PREMIADA
// ========================================
// Cole este código no console do navegador (F12) para debugar o sistema completo

console.log('🔍 INICIANDO DEBUG DETALHADO...');

// ========================================
// 1. VERIFICAR CONFIGURAÇÃO DA API
// ========================================
function debugApiConfig() {
  console.log('\n🌐 === VERIFICANDO CONFIGURAÇÃO DA API ===');
  
  const token = localStorage.getItem('token');
  if (token) {
    console.log('✅ Token encontrado:', token.substring(0, 20) + '...');
  } else {
    console.log('❌ Nenhum token encontrado');
  }
  
  const baseUrl = 'https://slotbox-api.onrender.com/api';
  console.log('🌐 Base URL da API:', baseUrl);
  
  return { baseUrl, token };
}

// ========================================
// 2. TESTAR COMPRA DETALHADA
// ========================================
async function debugDetailedBuy(caseId, caseName) {
  console.log(`\n🛒 === TESTANDO COMPRA DETALHADA DE ${caseName} ===`);
  
  const { baseUrl, token } = debugApiConfig();
  
  try {
    const response = await fetch(`${baseUrl}/cases/buy/${caseId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ quantidade: 1 })
    });
    
    console.log(`📡 Status da resposta:`, response.status);
    console.log(`📡 Headers da resposta:`, Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Resposta completa da API:`, data);
      
      // Verificar estrutura da resposta
      if (data.success) {
        console.log('✅ Success: true');
        
        if (data.data) {
          console.log('✅ Data encontrada:', data.data);
          
          if (data.data.premio) {
            console.log('🎁 PRÊMIO ENCONTRADO:', data.data.premio);
            console.log('📊 Detalhes do prêmio:');
            console.log('  - Nome:', data.data.premio.nome);
            console.log('  - Valor:', data.data.premio.valor);
            console.log('  - Tipo:', data.data.premio.tipo);
            console.log('  - Sem Imagem:', data.data.premio.sem_imagem);
            console.log('  - Imagem URL:', data.data.premio.imagem);
            
            // Verificar se o prêmio tem imagem
            if (data.data.premio.sem_imagem) {
              console.log('⚠️ ATENÇÃO: Prêmio marcado como sem imagem!');
            } else {
              console.log('✅ Prêmio tem imagem configurada');
            }
            
            return data.data.premio;
          } else {
            console.log('❌ Nenhum prêmio encontrado na resposta');
          }
        } else {
          console.log('❌ Nenhum data encontrado na resposta');
        }
      } else {
        console.log('❌ Success: false');
      }
      
      return data;
    } else {
      const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
      console.error(`❌ Erro na compra:`, errorData);
      return null;
    }
  } catch (error) {
    console.error(`❌ Erro na requisição de compra:`, error);
    return null;
  }
}

// ========================================
// 3. VERIFICAR MAPEAMENTO DE IMAGENS DETALHADO
// ========================================
function debugDetailedImageMapping(prize, caseName) {
  console.log('\n🖼️ === VERIFICANDO MAPEAMENTO DETALHADO DE IMAGENS ===');
  console.log('Prêmio recebido:', prize);
  console.log('Caixa:', caseName);
  
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
  
  console.log('📁 Pasta da caixa:', folder);
  
  // Simular o mapeamento do frontend
  const mappedPrize = {
    name: prize.nome,
    value: `R$ ${parseFloat(prize.valor).toFixed(2).replace('.', ',')}`,
    rarity: 'rarity-1.png',
    image: prize.sem_imagem ? null : `/imagens/${folder}/1.png`,
    bgColor: 'rgb(176, 190, 197)',
    apiPrize: prize,
    sem_imagem: prize.sem_imagem || false
  };
  
  console.log('🎨 Prêmio mapeado:', mappedPrize);
  
  // Verificar se a imagem existe
  if (mappedPrize.image) {
    console.log('🖼️ Verificando imagem:', mappedPrize.image);
    const img = new Image();
    img.onload = () => console.log('✅ Imagem carregada com sucesso:', mappedPrize.image);
    img.onerror = () => console.error('❌ Erro ao carregar imagem:', mappedPrize.image);
    img.src = mappedPrize.image;
  } else {
    console.log('⚠️ Prêmio sem imagem configurada');
  }
  
  return mappedPrize;
}

// ========================================
// 4. TESTAR MÚLTIPLAS COMPRAS DETALHADAS
// ========================================
async function debugMultipleDetailedBuys(caseId, caseName, quantity = 3) {
  console.log(`\n🔄 === TESTANDO ${quantity} COMPRAS DETALHADAS DE ${caseName} ===`);
  
  const results = [];
  
  for (let i = 0; i < quantity; i++) {
    console.log(`\n--- Compra ${i + 1}/${quantity} ---`);
    
    const result = await debugDetailedBuy(caseId, caseName);
    if (result) {
      results.push(result);
      
      // Verificar mapeamento de imagem
      debugDetailedImageMapping(result, caseName);
    }
    
    // Delay entre compras
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log(`\n📊 RESUMO DAS ${quantity} COMPRAS:`);
  results.forEach((prize, index) => {
    console.log(`${index + 1}. ${prize.nome} - R$ ${prize.valor} - Sem Imagem: ${prize.sem_imagem}`);
  });
  
  return results;
}

// ========================================
// 5. FUNÇÃO PRINCIPAL DE DEBUG DETALHADO
// ========================================
async function runDetailedDebug() {
  console.log('🚀 INICIANDO DEBUG DETALHADO...');
  
  // 1. Testar compra detalhada de uma caixa específica
  console.log('\n🎯 Testando caixa console com detalhes...');
  await debugMultipleDetailedBuys('fb0c0175-b478-4fd5-9750-d673c0f374fd', 'CAIXA CONSOLE', 2);
  
  // 2. Testar outra caixa
  console.log('\n🎯 Testando caixa Apple com detalhes...');
  await debugMultipleDetailedBuys('61a19df9-d011-429e-a9b5-d2c837551150', 'CAIXA APPLE', 2);
  
  console.log('\n✅ DEBUG DETALHADO FINALIZADO!');
  console.log('📋 Verifique os logs acima para identificar problemas.');
}

// ========================================
// 6. FUNÇÕES AUXILIARES
// ========================================

// Função para testar uma caixa específica com detalhes
window.testCaseDetailed = async function(caseId, caseName) {
  return await debugMultipleDetailedBuys(caseId, caseName, 2);
};

// Função para testar compra única com detalhes
window.testBuyDetailed = debugDetailedBuy;

// ========================================
// 7. EXECUTAR DEBUG AUTOMATICAMENTE
// ========================================
console.log('🎯 FUNÇÕES DISPONÍVEIS:');
console.log('- runDetailedDebug() - Executa debug detalhado');
console.log('- testCaseDetailed(caseId, caseName) - Testa uma caixa específica com detalhes');
console.log('- testBuyDetailed(caseId, caseName) - Testa compra única com detalhes');
console.log('\n🚀 Execute runDetailedDebug() para começar!');

// Executar debug automaticamente
runDetailedDebug();
