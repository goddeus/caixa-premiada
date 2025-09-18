// ========================================
// 🎯 TESTAR PRÊMIOS REAIS ATRAVÉS DE COMPRAS
// ========================================
// Cole este código no console do navegador para descobrir os prêmios reais

console.log('🎯 TESTANDO PRÊMIOS REAIS ATRAVÉS DE COMPRAS...');

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
// 2. FUNÇÃO PARA TESTAR COMPRA E VER PRÊMIO
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
// 3. FUNÇÃO PARA TESTAR MÚLTIPLAS COMPRAS
// ========================================
async function testMultiplePurchases(caseId, caseName, quantity = 20) {
  console.log(`\n🔄 === TESTANDO ${quantity} COMPRAS DE ${caseName} ===`);
  
  const results = [];
  const uniquePrizes = new Map(); // Para armazenar prêmios únicos
  
  for (let i = 0; i < quantity; i++) {
    console.log(`\n--- Compra ${i + 1}/${quantity} ---`);
    
    const result = await testCasePurchase(caseId, caseName);
    if (result) {
      results.push(result);
      
      // Armazenar prêmio único
      const key = `${result.nome}_${result.valor}`;
      if (!uniquePrizes.has(key)) {
        uniquePrizes.set(key, result);
      }
    }
    
    // Delay entre compras
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  console.log(`\n📊 RESUMO DE ${quantity} COMPRAS DE ${caseName}:`);
  console.log(`Total de prêmios recebidos: ${results.length}`);
  console.log(`Prêmios únicos encontrados: ${uniquePrizes.size}`);
  
  console.log('\n🎁 PRÊMIOS ÚNICOS ENCONTRADOS:');
  uniquePrizes.forEach((prize, key) => {
    console.log(`  - ${prize.nome} - R$ ${prize.valor} - ID: ${prize.id}`);
  });
  
  return {
    total: results.length,
    unique: Array.from(uniquePrizes.values()),
    all: results
  };
}

// ========================================
// 4. TESTAR TODAS AS CAIXAS
// ========================================
async function testAllCases() {
  console.log('🚀 TESTANDO TODAS AS CAIXAS...');
  
  const allResults = {};
  
  for (const caseData of ALL_CASES) {
    try {
      console.log(`\n🎯 === TESTANDO ${caseData.nome} ===`);
      const results = await testMultiplePurchases(caseData.id, caseData.nome, 15);
      allResults[caseData.nome] = results;
    } catch (error) {
      console.error(`❌ Erro ao testar ${caseData.nome}:`, error);
      allResults[caseData.nome] = { total: 0, unique: [], all: [] };
    }
    
    // Delay entre caixas
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  // Resumo final
  console.log('\n🎯 === RESUMO FINAL DE TODAS AS CAIXAS ===');
  Object.entries(allResults).forEach(([caseName, results]) => {
    console.log(`\n📦 ${caseName}:`);
    console.log(`  Total de prêmios: ${results.total}`);
    console.log(`  Prêmios únicos: ${results.unique.length}`);
    
    if (results.unique.length > 0) {
      console.log('  Prêmios encontrados:');
      results.unique.forEach(prize => {
        console.log(`    - ${prize.nome} - R$ ${prize.valor} - ID: ${prize.id}`);
      });
    } else {
      console.log('  ❌ Nenhum prêmio encontrado');
    }
  });
  
  // Gerar relatório em formato de texto
  console.log('\n📝 === RELATÓRIO EM FORMATO DE TEXTO ===');
  console.log('Copie e cole o texto abaixo para análise:');
  console.log('\n' + '='.repeat(80));
  
  Object.entries(allResults).forEach(([caseName, results]) => {
    console.log(`\n${caseName}:`);
    console.log(`Total de prêmios: ${results.total}`);
    console.log(`Prêmios únicos: ${results.unique.length}`);
    
    if (results.unique.length > 0) {
      console.log('Prêmios encontrados:');
      results.unique.forEach(prize => {
        console.log(`  - ${prize.nome} - R$ ${prize.valor} - ID: ${prize.id}`);
      });
    } else {
      console.log('  ❌ Nenhum prêmio encontrado');
    }
  });
  
  console.log('\n' + '='.repeat(80));
  
  return allResults;
}

// ========================================
// 5. TESTAR UMA CAIXA ESPECÍFICA
// ========================================
async function testSingleCase(caseId, caseName, quantity = 20) {
  console.log(`🎯 TESTANDO ${caseName}...`);
  return await testMultiplePurchases(caseId, caseName, quantity);
}

// ========================================
// 6. EXECUTAR TESTE
// ========================================
console.log('🎯 FUNÇÕES DISPONÍVEIS:');
console.log('- testAllCases() - Testa todas as caixas');
console.log('- testSingleCase(caseId, caseName, quantity) - Testa uma caixa específica');
console.log('- testCasePurchase(caseId, caseName) - Testa uma compra');
console.log('\n🚀 Execute testAllCases() para começar!');

// Executar automaticamente
testAllCases();
