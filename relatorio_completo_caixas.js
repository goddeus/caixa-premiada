// ========================================
// 📋 RELATÓRIO COMPLETO DE TODAS AS CAIXAS
// ========================================
// Cole este código no console do navegador para ver todos os prêmios

console.log('📋 RELATÓRIO COMPLETO DE TODAS AS CAIXAS...');

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

// ========================================
// 2. VERIFICAR DADOS DO USUÁRIO
// ========================================
async function debugUserData() {
  console.log('\n📋 === DADOS DO USUÁRIO ===');
  
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('❌ Token não encontrado. Faça login primeiro.');
    return null;
  }
  
  const baseUrl = 'https://slotbox-api.onrender.com/api';
  
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
      return userData.data || userData;
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
// 3. BUSCAR DADOS DE UMA CAIXA
// ========================================
async function getCaseData(caseId, caseName) {
  console.log(`\n📦 === BUSCANDO DADOS DE ${caseName} ===`);
  
  const token = localStorage.getItem('token');
  const baseUrl = 'https://slotbox-api.onrender.com/api';
  
  try {
    const response = await fetch(`${baseUrl}/cases/${caseId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Dados de ${caseName}:`, data);
      
      if (data.prizes && data.prizes.length > 0) {
        console.log(`📋 Prêmios encontrados (${data.prizes.length}):`);
        data.prizes.forEach((prize, index) => {
          console.log(`  ${index + 1}. ${prize.nome} - R$ ${prize.valor} - ID: ${prize.id}`);
        });
        
        return data.prizes;
      } else {
        console.log('⚠️ Nenhum prêmio encontrado na resposta');
        return [];
      }
    } else {
      console.error(`❌ Erro ao buscar ${caseName}:`, response.status);
      return [];
    }
  } catch (error) {
    console.error(`❌ Erro na requisição ${caseName}:`, error);
    return [];
  }
}

// ========================================
// 4. BUSCAR TODAS AS CAIXAS
// ========================================
async function getAllCasesData() {
  console.log('🔍 BUSCANDO DADOS DE TODAS AS CAIXAS...');
  
  const allCasesData = {};
  
  for (const caseData of ALL_CASES) {
    try {
      const prizes = await getCaseData(caseData.id, caseData.nome);
      allCasesData[caseData.nome] = {
        id: caseData.id,
        preco: caseData.preco,
        prizes: prizes
      };
    } catch (error) {
      console.error(`❌ Erro ao buscar ${caseData.nome}:`, error);
      allCasesData[caseData.nome] = {
        id: caseData.id,
        preco: caseData.preco,
        prizes: []
      };
    }
    
    // Delay entre requisições
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return allCasesData;
}

// ========================================
// 5. GERAR RELATÓRIO COMPLETO
// ========================================
async function generateCompleteReport() {
  console.log('📊 GERANDO RELATÓRIO COMPLETO...');
  
  // 1. Verificar dados do usuário
  const userData = await debugUserData();
  if (!userData) {
    console.error('❌ Não foi possível obter dados do usuário. Verifique se está logado.');
    return;
  }
  
  // 2. Buscar dados de todas as caixas
  const allCasesData = await getAllCasesData();
  
  // 3. Gerar relatório formatado
  console.log('\n🎯 === RELATÓRIO COMPLETO DE TODAS AS CAIXAS ===');
  
  Object.entries(allCasesData).forEach(([caseName, caseData]) => {
    console.log(`\n📦 ${caseName} (R$ ${caseData.preco})`);
    console.log(`   ID: ${caseData.id}`);
    console.log(`   Prêmios (${caseData.prizes.length}):`);
    
    if (caseData.prizes.length > 0) {
      caseData.prizes.forEach((prize, index) => {
        console.log(`     ${index + 1}. ${prize.nome} - R$ ${prize.valor} - ID: ${prize.id}`);
      });
    } else {
      console.log('     ❌ Nenhum prêmio encontrado');
    }
  });
  
  // 4. Gerar relatório em formato de texto
  console.log('\n📝 === RELATÓRIO EM FORMATO DE TEXTO ===');
  console.log('Copie e cole o texto abaixo para análise:');
  console.log('\n' + '='.repeat(80));
  
  Object.entries(allCasesData).forEach(([caseName, caseData]) => {
    console.log(`\n${caseName} (R$ ${caseData.preco})`);
    console.log(`ID: ${caseData.id}`);
    console.log(`Prêmios (${caseData.prizes.length}):`);
    
    if (caseData.prizes.length > 0) {
      caseData.prizes.forEach((prize, index) => {
        console.log(`  ${index + 1}. ${prize.nome} - R$ ${prize.valor} - ID: ${prize.id}`);
      });
    } else {
      console.log('  ❌ Nenhum prêmio encontrado');
    }
  });
  
  console.log('\n' + '='.repeat(80));
  
  return allCasesData;
}

// ========================================
// 6. FUNÇÃO PARA TESTAR COMPRA E VER PRÊMIO
// ========================================
async function testCasePurchase(caseId, caseName) {
  console.log(`\n🛒 === TESTANDO COMPRA DE ${caseName} ===`);
  
  const token = localStorage.getItem('token');
  const baseUrl = 'https://slotbox-api.onrender.com/api';
  
  try {
    const response = await fetch(`${baseUrl}/cases/buy/${caseId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ quantidade: 1 })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Compra realizada:`, data);
      
      if (data.data && data.data.premio) {
        const premio = data.data.premio;
        console.log('🎁 PRÊMIO RECEBIDO:');
        console.log(`  📝 Nome: ${premio.nome}`);
        console.log(`  💰 Valor: R$ ${premio.valor}`);
        console.log(`  🏷️ Tipo: ${premio.tipo}`);
        console.log(`  🖼️ Sem Imagem: ${premio.sem_imagem}`);
        console.log(`  🖼️ Imagem URL: ${premio.imagem}`);
        console.log(`  📊 Prêmio completo:`, premio);
        
        return premio;
      } else {
        console.log('⚠️ Nenhum prêmio encontrado na resposta');
        return null;
      }
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
// 7. FUNÇÃO PARA TESTAR MÚLTIPLAS COMPRAS
// ========================================
async function testMultiplePurchases(caseId, caseName, quantity = 10) {
  console.log(`\n🔄 === TESTANDO ${quantity} COMPRAS DE ${caseName} ===`);
  
  const results = [];
  
  for (let i = 0; i < quantity; i++) {
    console.log(`\n--- Compra ${i + 1}/${quantity} ---`);
    
    const result = await testCasePurchase(caseId, caseName);
    if (result) {
      results.push(result);
    }
    
    // Delay entre compras
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log(`\n📊 RESUMO DE ${quantity} COMPRAS DE ${caseName}:`);
  results.forEach((prize, index) => {
    console.log(`${index + 1}. ${prize.nome} - R$ ${prize.valor} - ID: ${prize.id}`);
  });
  
  return results;
}

// ========================================
// 8. EXECUTAR RELATÓRIO
// ========================================
console.log('🎯 FUNÇÕES DISPONÍVEIS:');
console.log('- generateCompleteReport() - Gera relatório completo de todas as caixas');
console.log('- testCasePurchase(caseId, caseName) - Testa compra de uma caixa');
console.log('- testMultiplePurchases(caseId, caseName, quantity) - Testa múltiplas compras');
console.log('\n🚀 Execute generateCompleteReport() para começar!');

// Executar automaticamente
generateCompleteReport();
