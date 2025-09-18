// ========================================
// 🔍 DEBUG COMPLETO - TODAS AS 6 CAIXAS
// ========================================
// Cole este código no console do navegador (F12) para debugar todas as caixas

console.log('🔍 INICIANDO DEBUG COMPLETO DE TODAS AS 6 CAIXAS...');

// ========================================
// 1. CONFIGURAÇÃO E DADOS DAS CAIXAS
// ========================================
const ALL_CASES = [
  { id: '1abd77cf-472b-473d-9af0-6cd47f9f1452', nome: 'CAIXA FINAL DE SEMANA', preco: 1.5 },
  { id: '0b5e9b8a-9d56-4769-a45a-55a3025640f4', nome: 'CAIXA NIKE', preco: 2.5 },
  { id: '3f2a9f7a-cb4d-47e7-991a-0e72c0e0f415', nome: 'CAIXA SAMSUNG', preco: 3.0 },
  { id: 'fb0c0175-b478-4fd5-9750-d673c0f374fd', nome: 'CAIXA CONSOLE', preco: 3.5 },
  { id: '61a19df9-d011-429e-a9b5-d2c837551150', nome: 'CAIXA APPLE', preco: 7.0 },
  { id: 'db95bb2b-9b3e-444b-964f-547330010a59', nome: 'CAIXA PREMIUM MASTER', preco: 15.0 }
];

function debugApiConfig() {
  console.log('\n🌐 === CONFIGURAÇÃO DA API ===');
  
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
// 2. VERIFICAR DADOS DO USUÁRIO
// ========================================
async function debugUserData() {
  console.log('\n📋 === DADOS DO USUÁRIO ===');
  
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
      console.error('❌ Erro ao buscar dados do usuário:', response.status);
      return null;
    }
  } catch (error) {
    console.error('❌ Erro na requisição:', error);
    return null;
  }
}

// ========================================
// 3. TESTAR COMPRA DE CAIXA COM DETALHES
// ========================================
async function debugBuyCaseDetailed(caseId, caseName) {
  console.log(`\n🛒 === COMPRANDO ${caseName} ===`);
  
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
    
    console.log(`📡 Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Compra realizada:`, data);
      
      // Verificar estrutura da resposta
      if (data.data) {
        console.log('📦 Dados da compra:', data.data);
        
        if (data.data.premio) {
          const premio = data.data.premio;
          console.log('🎁 PRÊMIO RECEBIDO:');
          console.log('  📝 Nome:', premio.nome);
          console.log('  💰 Valor:', premio.valor);
          console.log('  🏷️ Tipo:', premio.tipo);
          console.log('  🖼️ Sem Imagem:', premio.sem_imagem);
          console.log('  🖼️ Imagem URL:', premio.imagem);
          console.log('  📊 Prêmio completo:', premio);
          
          // Verificar se o prêmio tem imagem
          if (premio.sem_imagem) {
            console.log('⚠️ ATENÇÃO: Prêmio marcado como sem imagem!');
          } else {
            console.log('✅ Prêmio tem imagem configurada');
          }
          
          return premio;
        } else {
          console.log('⚠️ Nenhum prêmio encontrado na resposta');
        }
      } else {
        console.log('⚠️ Estrutura de resposta inesperada:', data);
      }
      
      return data;
    } else {
      const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
      console.error(`❌ Erro na compra:`, errorData);
      return null;
    }
  } catch (error) {
    console.error(`❌ Erro na requisição:`, error);
    return null;
  }
}

// ========================================
// 4. MAPEAR IMAGEM DO PRÊMIO
// ========================================
function mapPrizeImage(prize, caseName) {
  console.log(`\n🖼️ === MAPEANDO IMAGEM PARA ${caseName} ===`);
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
  
  // Mapear prêmio para imagem
  let imagePath = null;
  let rarity = 'rarity-1.png';
  let bgColor = 'rgb(176, 190, 197)';
  
  if (!prize.sem_imagem) {
    // Mapear baseado no nome e valor
    if (prize.nome.includes('R$ 2000,00') || prize.nome.includes('R$2000,00') || prize.valor === 2000) {
      imagePath = `/imagens/${folder}/2000.png`;
      rarity = 'rarity-5.png';
      bgColor = 'rgb(255, 215, 0)';
    } else if (prize.nome.includes('R$ 1000,00') || prize.nome.includes('R$1000,00') || prize.valor === 1000) {
      imagePath = `/imagens/${folder}/1000.png`;
      rarity = 'rarity-5.png';
      bgColor = 'rgb(255, 215, 0)';
    } else if (prize.nome.includes('R$ 500,00') || prize.nome.includes('R$500,00') || prize.valor === 500) {
      imagePath = `/imagens/${folder}/500.webp`;
      rarity = 'rarity-3.png';
      bgColor = 'rgb(162, 89, 255)';
    } else if (prize.nome.includes('R$ 100,00') || prize.nome.includes('R$100,00') || prize.valor === 100) {
      imagePath = `/imagens/${folder}/100.png`;
      rarity = 'rarity-2.png';
      bgColor = 'rgb(59, 130, 246)';
    } else if (prize.nome.includes('R$ 50,00') || prize.nome.includes('R$50,00') || prize.valor === 50) {
      imagePath = `/imagens/${folder}/50.png`;
      rarity = 'rarity-2.png';
      bgColor = 'rgb(59, 130, 246)';
    } else if (prize.nome.includes('R$ 10,00') || prize.nome.includes('R$10,00') || prize.valor === 10) {
      imagePath = `/imagens/${folder}/10.png`;
      rarity = 'rarity-1.png';
      bgColor = 'rgb(176, 190, 197)';
    } else if (prize.nome.includes('R$ 5,00') || prize.nome.includes('R$5,00') || prize.valor === 5) {
      imagePath = `/imagens/${folder}/5.png`;
      rarity = 'rarity-1.png';
      bgColor = 'rgb(176, 190, 197)';
    } else if (prize.nome.includes('R$ 2,00') || prize.nome.includes('R$2,00') || prize.valor === 2) {
      imagePath = `/imagens/${folder}/2.png`;
      rarity = 'rarity-1.png';
      bgColor = 'rgb(176, 190, 197)';
    } else if (prize.nome.includes('R$ 1,00') || prize.nome.includes('R$1,00') || prize.valor === 1) {
      imagePath = `/imagens/${folder}/1.png`;
      rarity = 'rarity-1.png';
      bgColor = 'rgb(176, 190, 197)';
    } else {
      // Fallback baseado no valor
      if (prize.valor >= 2000) {
        imagePath = `/imagens/${folder}/2000.png`;
        rarity = 'rarity-5.png';
        bgColor = 'rgb(255, 215, 0)';
      } else if (prize.valor >= 1000) {
        imagePath = `/imagens/${folder}/1000.png`;
        rarity = 'rarity-5.png';
        bgColor = 'rgb(255, 215, 0)';
      } else if (prize.valor >= 500) {
        imagePath = `/imagens/${folder}/500.webp`;
        rarity = 'rarity-4.png';
        bgColor = 'rgb(255, 59, 59)';
      } else if (prize.valor >= 100) {
        imagePath = `/imagens/${folder}/100.png`;
        rarity = 'rarity-3.png';
        bgColor = 'rgb(162, 89, 255)';
      } else if (prize.valor >= 50) {
        imagePath = `/imagens/${folder}/50.png`;
        rarity = 'rarity-2.png';
        bgColor = 'rgb(59, 130, 246)';
      } else if (prize.valor >= 10) {
        imagePath = `/imagens/${folder}/10.png`;
      } else if (prize.valor >= 5) {
        imagePath = `/imagens/${folder}/5.png`;
      } else if (prize.valor >= 2) {
        imagePath = `/imagens/${folder}/2.png`;
      } else {
        imagePath = `/imagens/${folder}/1.png`;
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
// 5. TESTAR UMA CAIXA ESPECÍFICA
// ========================================
async function testSingleCase(caseData, quantity = 2) {
  console.log(`\n📦 === TESTANDO ${caseData.nome} (R$ ${caseData.preco}) ===`);
  
  const results = [];
  
  for (let i = 0; i < quantity; i++) {
    console.log(`\n--- Compra ${i + 1}/${quantity} ---`);
    
    const result = await debugBuyCaseDetailed(caseData.id, caseData.nome);
    
    if (result && result.nome) {
      results.push(result);
      
      // Mapear imagem do prêmio
      mapPrizeImage(result, caseData.nome);
    }
    
    // Delay entre compras
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  console.log(`\n📊 RESUMO DE ${caseData.nome}:`);
  results.forEach((prize, index) => {
    console.log(`${index + 1}. ${prize.nome} - R$ ${prize.valor} - Sem Imagem: ${prize.sem_imagem}`);
  });
  
  return results;
}

// ========================================
// 6. TESTAR TODAS AS CAIXAS
// ========================================
async function testAllCases() {
  console.log('🚀 INICIANDO TESTE DE TODAS AS 6 CAIXAS...');
  
  const allResults = {};
  
  for (const caseData of ALL_CASES) {
    try {
      const results = await testSingleCase(caseData, 2);
      allResults[caseData.nome] = results;
    } catch (error) {
      console.error(`❌ Erro ao testar ${caseData.nome}:`, error);
      allResults[caseData.nome] = [];
    }
    
    // Delay entre caixas
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Resumo final
  console.log('\n🎯 === RESUMO FINAL DE TODAS AS CAIXAS ===');
  Object.entries(allResults).forEach(([caseName, prizes]) => {
    console.log(`\n📦 ${caseName}:`);
    if (prizes.length > 0) {
      prizes.forEach((prize, index) => {
        console.log(`  ${index + 1}. ${prize.nome} - R$ ${prize.valor} - Sem Imagem: ${prize.sem_imagem}`);
      });
    } else {
      console.log('  ❌ Nenhum prêmio obtido');
    }
  });
  
  return allResults;
}

// ========================================
// 7. FUNÇÃO PRINCIPAL
// ========================================
async function runCompleteTest() {
  console.log('🔍 INICIANDO TESTE COMPLETO DE TODAS AS CAIXAS...');
  
  // 1. Verificar dados do usuário
  const userData = await debugUserData();
  if (!userData) {
    console.error('❌ Não foi possível obter dados do usuário. Verifique se está logado.');
    return;
  }
  
  // 2. Testar todas as caixas
  const results = await testAllCases();
  
  console.log('\n✅ TESTE COMPLETO FINALIZADO!');
  console.log('📋 Verifique os logs acima para identificar problemas.');
  
  return results;
}

// ========================================
// 8. FUNÇÕES AUXILIARES
// ========================================

// Função para testar uma caixa específica
window.testCase = async function(caseId, caseName, quantity = 2) {
  const caseData = ALL_CASES.find(c => c.id === caseId || c.nome === caseName);
  if (caseData) {
    return await testSingleCase(caseData, quantity);
  } else {
    console.error('❌ Caixa não encontrada');
    return null;
  }
};

// Função para testar todas as caixas
window.testAllCases = testAllCases;

// Função para verificar dados do usuário
window.checkUser = debugUserData;

// ========================================
// 9. EXECUTAR TESTE AUTOMATICAMENTE
// ========================================
console.log('🎯 FUNÇÕES DISPONÍVEIS:');
console.log('- runCompleteTest() - Testa todas as 6 caixas');
console.log('- testAllCases() - Testa todas as caixas');
console.log('- testCase(caseId, caseName, quantity) - Testa uma caixa específica');
console.log('- checkUser() - Verifica dados do usuário');
console.log('\n🚀 Execute runCompleteTest() para começar!');

// Executar teste automaticamente
runCompleteTest();
