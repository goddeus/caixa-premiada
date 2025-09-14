// CÓDIGO DE DIAGNÓSTICO DAS CAIXAS - COLE NO CONSOLE DO NAVEGADOR
// Execute este código no console do navegador para diagnosticar problemas com as 6 caixas

console.log('🔍 INICIANDO DIAGNÓSTICO DAS CAIXAS...');
console.log('=====================================');

// Função para fazer requisição à API
async function fetchAPI(endpoint) {
  try {
    const token = localStorage.getItem('token');
    const baseURL = window.location.origin.includes('localhost') 
      ? 'http://localhost:3001' 
      : 'https://caixa-premiada-backend.onrender.com';
    
    const response = await fetch(`${baseURL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`❌ Erro na requisição ${endpoint}:`, error);
    return null;
  }
}

// Função principal de diagnóstico
async function diagnosticarCaixas() {
  console.log('📡 Verificando conexão com a API...');
  
  // 1. Verificar se o usuário está autenticado
  const token = localStorage.getItem('token');
  console.log('🔑 Token encontrado:', token ? 'SIM' : 'NÃO');
  
  if (!token) {
    console.log('❌ PROBLEMA: Usuário não está autenticado!');
    console.log('💡 SOLUÇÃO: Faça login primeiro');
    return;
  }
  
  // 2. Verificar dados do usuário
  console.log('👤 Verificando dados do usuário...');
  const userData = await fetchAPI('/auth/me');
  if (userData) {
    console.log('✅ Usuário autenticado:', userData.nome);
    console.log('💰 Saldo atual:', `R$ ${userData.saldo?.toFixed(2) || '0.00'}`);
  } else {
    console.log('❌ PROBLEMA: Não foi possível obter dados do usuário');
    return;
  }
  
  // 3. Buscar todas as caixas
  console.log('📦 Buscando todas as caixas...');
  const casesResponse = await fetchAPI('/cases');
  
  if (!casesResponse) {
    console.log('❌ PROBLEMA: Não foi possível buscar as caixas');
    return;
  }
  
  const cases = casesResponse.cases || casesResponse;
  console.log(`📊 Total de caixas encontradas: ${cases.length}`);
  
  // 4. Listar todas as caixas com detalhes
  console.log('📋 LISTA COMPLETA DAS CAIXAS:');
  console.log('=============================');
  
  cases.forEach((caixa, index) => {
    console.log(`${index + 1}. ID: ${caixa.id}`);
    console.log(`   Nome: "${caixa.nome}"`);
    console.log(`   Preço: R$ ${caixa.preco}`);
    console.log(`   Ativa: ${caixa.ativa ? 'SIM' : 'NÃO'}`);
    console.log(`   Prêmios: ${caixa.prizes?.length || 0}`);
    console.log('   ---');
  });
  
  // 5. Verificar as 6 caixas específicas
  console.log('🎯 VERIFICANDO AS 6 CAIXAS ESPECÍFICAS:');
  console.log('=======================================');
  
  const caixasEsperadas = [
    'CAIXA CONSOLE DOS SONHOS!',
    'CAIXA PREMIUM MASTER',
    'CAIXA SAMSUNG',
    'CAIXA APPLE',
    'CAIXA KIT NIKE',
    'CAIXA FINAL DE SEMANA'
  ];
  
  const caixasEncontradas = [];
  const caixasNaoEncontradas = [];
  
  caixasEsperadas.forEach(nomeEsperado => {
    const caixaEncontrada = cases.find(c => 
      c.nome === nomeEsperado || 
      c.nome.includes(nomeEsperado.replace('CAIXA ', '')) ||
      c.nome.toLowerCase().includes(nomeEsperado.toLowerCase().replace('caixa ', ''))
    );
    
    if (caixaEncontrada) {
      caixasEncontradas.push(caixaEncontrada);
      console.log(`✅ ENCONTRADA: "${caixaEncontrada.nome}" (ID: ${caixaEncontrada.id})`);
    } else {
      caixasNaoEncontradas.push(nomeEsperado);
      console.log(`❌ NÃO ENCONTRADA: "${nomeEsperado}"`);
    }
  });
  
  // 6. Verificar prêmios de cada caixa encontrada
  console.log('🎁 VERIFICANDO PRÊMIOS DAS CAIXAS:');
  console.log('==================================');
  
  for (const caixa of caixasEncontradas) {
    console.log(`\n📦 CAIXA: "${caixa.nome}"`);
    console.log(`   ID: ${caixa.id}`);
    console.log(`   Preço: R$ ${caixa.preco}`);
    console.log(`   Prêmios: ${caixa.prizes?.length || 0}`);
    
    if (caixa.prizes && caixa.prizes.length > 0) {
      console.log('   Lista de prêmios:');
      caixa.prizes.forEach((premio, index) => {
        console.log(`     ${index + 1}. ${premio.nome} - R$ ${premio.valor}`);
      });
    } else {
      console.log('   ⚠️  NENHUM PRÊMIO ENCONTRADO!');
    }
  }
  
  // 7. Testar compra de uma caixa (se houver saldo)
  if (userData.saldo >= 3.50 && caixasEncontradas.length > 0) {
    console.log('\n🧪 TESTANDO COMPRA DE CAIXA:');
    console.log('============================');
    
    const caixaTeste = caixasEncontradas[0];
    console.log(`Testando compra da caixa: "${caixaTeste.nome}"`);
    
    try {
      const compraResponse = await fetchAPI(`/cases/buy/${caixaTeste.id}`);
      if (compraResponse) {
        console.log('✅ Compra realizada com sucesso!');
        console.log('Prêmio ganho:', compraResponse.wonPrize);
      }
    } catch (error) {
      console.log('❌ Erro na compra:', error.message);
    }
  } else {
    console.log('\n⚠️  Não foi possível testar compra (saldo insuficiente ou nenhuma caixa encontrada)');
  }
  
  // 8. Resumo final
  console.log('\n📊 RESUMO DO DIAGNÓSTICO:');
  console.log('=========================');
  console.log(`✅ Caixas encontradas: ${caixasEncontradas.length}/6`);
  console.log(`❌ Caixas não encontradas: ${caixasNaoEncontradas.length}/6`);
  
  if (caixasNaoEncontradas.length > 0) {
    console.log('\n❌ CAIXAS NÃO ENCONTRADAS:');
    caixasNaoEncontradas.forEach(nome => {
      console.log(`   - ${nome}`);
    });
  }
  
  if (caixasEncontradas.length === 0) {
    console.log('\n🚨 PROBLEMA CRÍTICO: Nenhuma das 6 caixas foi encontrada!');
    console.log('💡 POSSÍVEIS CAUSAS:');
    console.log('   1. Nomes das caixas estão diferentes no banco de dados');
    console.log('   2. Caixas não foram criadas no banco');
    console.log('   3. Problema na API de busca');
    console.log('   4. Caixas estão inativas');
  } else if (caixasEncontradas.length < 6) {
    console.log('\n⚠️  PROBLEMA PARCIAL: Algumas caixas não foram encontradas');
    console.log('💡 Verifique os nomes exatos no banco de dados');
  } else {
    console.log('\n✅ SUCESSO: Todas as 6 caixas foram encontradas!');
  }
  
  // 9. Sugestões de correção
  console.log('\n🔧 SUGESTÕES DE CORREÇÃO:');
  console.log('=========================');
  
  if (caixasNaoEncontradas.length > 0) {
    console.log('1. Verifique os nomes exatos das caixas no banco de dados');
    console.log('2. Confirme se as caixas estão ativas (ativa = true)');
    console.log('3. Verifique se as caixas têm prêmios associados');
    console.log('4. Teste a criação de novas caixas se necessário');
  }
  
  console.log('\n🏁 DIAGNÓSTICO CONCLUÍDO!');
  console.log('=========================');
  
  return {
    totalCaixas: cases.length,
    caixasEncontradas: caixasEncontradas.length,
    caixasNaoEncontradas: caixasNaoEncontradas.length,
    detalhes: {
      encontradas: caixasEncontradas,
      naoEncontradas: caixasNaoEncontradas,
      todas: cases
    }
  };
}

// Executar o diagnóstico
diagnosticarCaixas().then(resultado => {
  console.log('\n📋 RESULTADO FINAL:', resultado);
}).catch(error => {
  console.error('❌ Erro durante o diagnóstico:', error);
});

// Função adicional para testar uma caixa específica
window.testarCaixaEspecifica = async function(nomeCaixa) {
  console.log(`🔍 Testando caixa específica: "${nomeCaixa}"`);
  
  const casesResponse = await fetchAPI('/cases');
  if (!casesResponse) return;
  
  const cases = casesResponse.cases || casesResponse;
  const caixa = cases.find(c => 
    c.nome.toLowerCase().includes(nomeCaixa.toLowerCase()) ||
    c.nome === nomeCaixa
  );
  
  if (caixa) {
    console.log('✅ Caixa encontrada:', caixa);
    return caixa;
  } else {
    console.log('❌ Caixa não encontrada');
    console.log('Caixas disponíveis:');
    cases.forEach(c => console.log(`  - "${c.nome}"`));
    return null;
  }
};

console.log('\n💡 DICAS DE USO:');
console.log('- Use testarCaixaEspecifica("nome da caixa") para testar uma caixa específica');
console.log('- Verifique o console para todos os detalhes do diagnóstico');
console.log('- Copie os resultados e envie para análise');
