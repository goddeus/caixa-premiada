// CÓDIGO CORRIGIDO - COLE NO CONSOLE DO NAVEGADOR
// Usando a URL correta da API

(async function() {
  console.log('🔍 DIAGNÓSTICO CORRIGIDO DAS CAIXAS');
  console.log('===================================');
  
  // Verificar token
  const token = localStorage.getItem('token');
  console.log('Token:', token ? '✅ Encontrado' : '❌ Não encontrado');
  
  if (!token) {
    console.log('❌ Faça login primeiro!');
    return;
  }
  
  // URL CORRETA da API (baseada no log que você mostrou)
  const baseURL = 'https://slotbox-api.onrender.com/api';
  
  try {
    // Buscar caixas
    console.log('📡 Buscando caixas na URL correta...');
    console.log('URL:', baseURL + '/cases');
    
    const response = await fetch(`${baseURL}/cases`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('📡 Resposta completa da API:', data);
    
    // Verificar estrutura da resposta
    let cases = [];
    if (data.success && data.data) {
      cases = data.data.cases || data.data;
    } else if (data.cases) {
      cases = data.cases;
    } else if (Array.isArray(data)) {
      cases = data;
    } else {
      console.log('⚠️ Estrutura de resposta inesperada:', data);
      cases = data.data || data;
    }
    
    console.log(`📊 Total de caixas: ${cases.length}`);
    
    // Listar todas as caixas
    console.log('\n📋 TODAS AS CAIXAS:');
    cases.forEach((c, i) => {
      console.log(`${i+1}. "${c.nome}" - R$ ${c.preco} - ID: ${c.id} - Ativa: ${c.ativa}`);
    });
    
    // Verificar as 6 caixas específicas
    console.log('\n🎯 VERIFICANDO AS 6 CAIXAS:');
    const nomesEsperados = [
      'CAIXA CONSOLE DOS SONHOS',
      'CAIXA PREMIUM MASTER', 
      'CAIXA SAMSUNG',
      'CAIXA APPLE',
      'CAIXA KIT NIKE',
      'CAIXA FINAL DE SEMANA'
    ];
    
    let encontradas = 0;
    const caixasEncontradas = [];
    const caixasNaoEncontradas = [];
    
    nomesEsperados.forEach(nome => {
      const encontrada = cases.find(c => 
        c.nome === nome ||
        c.nome.includes(nome.replace('CAIXA ', '')) ||
        c.nome.toLowerCase().includes(nome.toLowerCase()) ||
        c.nome.toLowerCase().includes(nome.toLowerCase().replace('caixa ', ''))
      );
      
      if (encontrada) {
        console.log(`✅ "${encontrada.nome}" (ID: ${encontrada.id})`);
        caixasEncontradas.push(encontrada);
        encontradas++;
      } else {
        console.log(`❌ "${nome}" - NÃO ENCONTRADA`);
        caixasNaoEncontradas.push(nome);
      }
    });
    
    console.log(`\n📊 RESULTADO: ${encontradas}/6 caixas encontradas`);
    
    // Análise detalhada
    if (encontradas === 0) {
      console.log('\n🚨 PROBLEMA CRÍTICO: Nenhuma das 6 caixas foi encontrada!');
      console.log('💡 POSSÍVEIS CAUSAS:');
      console.log('   1. Caixas não foram criadas no banco de dados');
      console.log('   2. Nomes das caixas estão diferentes');
      console.log('   3. Caixas estão inativas');
    } else if (encontradas < 6) {
      console.log('\n⚠️ PROBLEMA PARCIAL: Algumas caixas não foram encontradas');
      console.log('❌ Caixas não encontradas:');
      caixasNaoEncontradas.forEach(nome => console.log(`   - ${nome}`));
    } else {
      console.log('\n✅ SUCESSO: Todas as 6 caixas foram encontradas!');
    }
    
    // Verificar prêmios das caixas encontradas
    if (caixasEncontradas.length > 0) {
      console.log('\n🎁 VERIFICANDO PRÊMIOS:');
      caixasEncontradas.forEach(caixa => {
        console.log(`\n📦 "${caixa.nome}":`);
        console.log(`   Prêmios: ${caixa.prizes?.length || 0}`);
        if (caixa.prizes && caixa.prizes.length > 0) {
          caixa.prizes.slice(0, 3).forEach((p, i) => {
            console.log(`   ${i+1}. ${p.nome} - R$ ${p.valor}`);
          });
          if (caixa.prizes.length > 3) {
            console.log(`   ... e mais ${caixa.prizes.length - 3} prêmios`);
          }
        } else {
          console.log('   ⚠️ NENHUM PRÊMIO ENCONTRADO!');
        }
      });
    }
    
    // Retornar resultado para análise
    window.diagnosticoResultado = {
      totalCaixas: cases.length,
      caixasEncontradas: encontradas,
      caixasNaoEncontradas: caixasNaoEncontradas.length,
      todasAsCaixas: cases,
      caixasEncontradasDetalhes: caixasEncontradas
    };
    
    console.log('\n📋 Resultado salvo em: window.diagnosticoResultado');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.log('🔍 Detalhes do erro:', error);
  }
})();
