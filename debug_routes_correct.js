// ========================================
// 🔍 DEBUG COM ROTAS CORRETAS - CAIXA PREMIADA
// ========================================
// Cole este código no console do navegador (F12) para debugar o sistema completo

console.log('🔍 INICIANDO DEBUG COM ROTAS CORRETAS...');

// ========================================
// 1. VERIFICAR CONFIGURAÇÃO DA API
// ========================================
function debugApiConfig() {
  console.log('\n🌐 === VERIFICANDO CONFIGURAÇÃO DA API ===');
  
  // Verificar token
  const token = localStorage.getItem('token');
  if (token) {
    console.log('✅ Token encontrado:', token.substring(0, 20) + '...');
  } else {
    console.log('❌ Nenhum token encontrado');
  }
  
  // Verificar base URL da API
  const baseUrl = 'https://slotbox-api.onrender.com/api';
  console.log('🌐 Base URL da API:', baseUrl);
  
  return { baseUrl, token };
}

// ========================================
// 2. VERIFICAR DADOS DO USUÁRIO
// ========================================
async function debugUserData() {
  console.log('\n📋 === VERIFICANDO DADOS DO USUÁRIO ===');
  
  const { baseUrl, token } = debugApiConfig();
  
  if (!token) {
    console.error('❌ Token não encontrado. Faça login primeiro.');
    return null;
  }
  
  try {
    const response = await fetch(`${baseUrl}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const userData = await response.json();
      console.log('✅ Usuário logado:', userData);
      
      if (userData.data) {
        console.log('💰 Saldo Reais:', userData.data.saldo_reais);
        console.log('🎮 Saldo Demo:', userData.data.saldo_demo);
        console.log('👤 Tipo de Conta:', userData.data.tipo_conta);
        return userData.data;
      }
      return userData;
    } else {
      const errorText = await response.text();
      console.error('❌ Erro ao buscar dados do usuário:', response.status);
      console.error('❌ Resposta da API:', errorText);
      return null;
    }
  } catch (error) {
    console.error('❌ Erro na requisição:', error);
    return null;
  }
}

// ========================================
// 3. TESTAR COMPRA DE CAIXA (ROTA CORRETA)
// ========================================
async function debugBuyCase(caseId, caseName) {
  console.log(`\n🛒 === TESTANDO COMPRA DE ${caseName} ===`);
  
  const { baseUrl, token } = debugApiConfig();
  
  try {
    // Usar a rota correta: /cases/buy/:id
    const response = await fetch(`${baseUrl}/cases/buy/${caseId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ quantidade: 1 })
    });
    
    console.log(`📡 Status da resposta para compra de ${caseName}:`, response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Compra realizada com sucesso:`, data);
      
      if (data.premio) {
        console.log('🎁 Prêmio recebido:', data.premio);
        console.log('📊 Detalhes do prêmio:');
        console.log('  - Nome:', data.premio.nome);
        console.log('  - Valor:', data.premio.valor);
        console.log('  - Tipo:', data.premio.tipo);
        console.log('  - Sem Imagem:', data.premio.sem_imagem);
        console.log('  - Imagem URL:', data.premio.imagem);
        
        // Verificar se o prêmio tem imagem
        if (data.premio.sem_imagem) {
          console.log('⚠️ ATENÇÃO: Prêmio marcado como sem imagem!');
        } else {
          console.log('✅ Prêmio tem imagem configurada');
        }
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
// 4. TESTAR MÉTODO DEBIT + DRAW (NOVO SISTEMA)
// ========================================
async function debugDebitAndDraw(caseId, caseName) {
  console.log(`\n🔄 === TESTANDO DEBIT + DRAW DE ${caseName} ===`);
  
  const { baseUrl, token } = debugApiConfig();
  
  try {
    // 1. Primeiro fazer o debit
    console.log('1️⃣ Fazendo debit...');
    const debitResponse = await fetch(`${baseUrl}/cases/debit/${caseId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ quantidade: 1 })
    });
    
    console.log(`📡 Status do debit:`, debitResponse.status);
    
    if (!debitResponse.ok) {
      const errorData = await debitResponse.json().catch(() => ({ error: 'Erro desconhecido' }));
      console.error('❌ Erro no debit:', errorData);
      return null;
    }
    
    const debitData = await debitResponse.json();
    console.log('✅ Debit realizado:', debitData);
    
    // 2. Depois fazer o draw
    console.log('2️⃣ Fazendo draw...');
    const drawResponse = await fetch(`${baseUrl}/cases/draw/${caseId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    
    console.log(`📡 Status do draw:`, drawResponse.status);
    
    if (!drawResponse.ok) {
      const errorData = await drawResponse.json().catch(() => ({ error: 'Erro desconhecido' }));
      console.error('❌ Erro no draw:', errorData);
      return null;
    }
    
    const drawData = await drawResponse.json();
    console.log('✅ Draw realizado:', drawData);
    
    // 3. Verificar prêmio
    if (drawData.premio) {
      console.log('🎁 Prêmio recebido:');
      console.log('  - Nome:', drawData.premio.nome);
      console.log('  - Valor:', drawData.premio.valor);
      console.log('  - Tipo:', drawData.premio.tipo);
      console.log('  - Sem Imagem:', drawData.premio.sem_imagem);
      console.log('  - Imagem URL:', drawData.premio.imagem);
      
      // Verificar se o prêmio tem imagem
      if (drawData.premio.sem_imagem) {
        console.log('⚠️ ATENÇÃO: Prêmio marcado como sem imagem!');
      } else {
        console.log('✅ Prêmio tem imagem configurada');
      }
    }
    
    return drawData;
  } catch (error) {
    console.error('❌ Erro no processo debit+draw:', error);
    return null;
  }
}

// ========================================
// 5. VERIFICAR MAPEAMENTO DE IMAGENS
// ========================================
function debugImageMapping(prize, caseName) {
  console.log('\n🖼️ === VERIFICANDO MAPEAMENTO DE IMAGENS ===');
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
  
  console.log('Prêmio mapeado:', mappedPrize);
  
  // Verificar se a imagem existe
  if (mappedPrize.image) {
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
// 6. TESTAR MÚLTIPLAS COMPRAS
// ========================================
async function debugMultipleBuys(caseId, caseName, quantity = 3) {
  console.log(`\n🔄 === TESTANDO ${quantity} COMPRAS DE ${caseName} ===`);
  
  const results = [];
  
  for (let i = 0; i < quantity; i++) {
    console.log(`\n--- Compra ${i + 1}/${quantity} ---`);
    
    // Tentar primeiro o método buy (antigo)
    let result = await debugBuyCase(caseId, caseName);
    
    // Se não funcionar, tentar o método debit+draw (novo)
    if (!result) {
      console.log('🔄 Tentando método debit+draw...');
      result = await debugDebitAndDraw(caseId, caseName);
    }
    
    if (result && result.premio) {
      results.push(result.premio);
      
      // Verificar mapeamento de imagem
      debugImageMapping(result.premio, caseName);
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
// 7. FUNÇÃO PRINCIPAL DE DEBUG
// ========================================
async function runFullDebug() {
  console.log('🚀 INICIANDO DEBUG COM ROTAS CORRETAS...');
  
  // 1. Verificar dados do usuário
  const userData = await debugUserData();
  if (!userData) {
    console.error('❌ Não foi possível obter dados do usuário. Verifique se está logado.');
    return;
  }
  
  // 2. Testar compra de uma caixa específica
  console.log('\n🎯 Testando caixa console (que estava com problema)...');
  await debugMultipleBuys('fb0c0175-b478-4fd5-9750-d673c0f374fd', 'CAIXA CONSOLE', 3);
  
  // 3. Testar outras caixas
  console.log('\n🎯 Testando caixa Apple...');
  await debugMultipleBuys('61a19df9-d011-429e-a9b5-d2c837551150', 'CAIXA APPLE', 2);
  
  console.log('\n✅ DEBUG COMPLETO FINALIZADO!');
  console.log('📋 Verifique os logs acima para identificar problemas.');
}

// ========================================
// 8. FUNÇÕES AUXILIARES
// ========================================

// Função para testar uma caixa específica
window.testCase = async function(caseId, caseName) {
  return await debugMultipleBuys(caseId, caseName, 3);
};

// Função para testar método buy
window.testBuy = debugBuyCase;

// Função para testar método debit+draw
window.testDebitDraw = debugDebitAndDraw;

// Função para verificar dados do usuário
window.checkUser = debugUserData;

// ========================================
// 9. EXECUTAR DEBUG AUTOMATICAMENTE
// ========================================
console.log('🎯 FUNÇÕES DISPONÍVEIS:');
console.log('- runFullDebug() - Executa debug completo');
console.log('- testCase(caseId, caseName) - Testa uma caixa específica');
console.log('- testBuy(caseId, caseName) - Testa método buy');
console.log('- testDebitDraw(caseId, caseName) - Testa método debit+draw');
console.log('- checkUser() - Verifica dados do usuário');
console.log('\n🚀 Execute runFullDebug() para começar!');

// Executar debug automaticamente
runFullDebug();
