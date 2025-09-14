// COLE ESTE CÓDIGO NO CONSOLE DO NAVEGADOR
// Diagnóstico rápido das 6 caixas

(async function() {
  console.log('🔍 DIAGNÓSTICO RÁPIDO DAS CAIXAS');
  console.log('================================');
  
  // Verificar token
  const token = localStorage.getItem('token');
  console.log('Token:', token ? '✅ Encontrado' : '❌ Não encontrado');
  
  if (!token) {
    console.log('❌ Faça login primeiro!');
    return;
  }
  
  // URL da API
  const baseURL = window.location.origin.includes('localhost') 
    ? 'http://localhost:3001' 
    : 'https://caixa-premiada-backend.onrender.com';
  
  try {
    // Buscar caixas
    console.log('📡 Buscando caixas...');
    const response = await fetch(`${baseURL}/cases`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    const cases = data.cases || data;
    
    console.log(`📊 Total de caixas: ${cases.length}`);
    
    // Listar todas as caixas
    console.log('\n📋 TODAS AS CAIXAS:');
    cases.forEach((c, i) => {
      console.log(`${i+1}. "${c.nome}" - R$ ${c.preco} - ID: ${c.id}`);
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
    nomesEsperados.forEach(nome => {
      const encontrada = cases.find(c => 
        c.nome.includes(nome.replace('CAIXA ', '')) ||
        c.nome.toLowerCase().includes(nome.toLowerCase())
      );
      
      if (encontrada) {
        console.log(`✅ "${encontrada.nome}"`);
        encontradas++;
      } else {
        console.log(`❌ "${nome}" - NÃO ENCONTRADA`);
      }
    });
    
    console.log(`\n📊 RESULTADO: ${encontradas}/6 caixas encontradas`);
    
    if (encontradas === 0) {
      console.log('\n🚨 PROBLEMA: Nenhuma das 6 caixas foi encontrada!');
      console.log('💡 Verifique se as caixas foram criadas no banco de dados');
    } else if (encontradas < 6) {
      console.log('\n⚠️ PROBLEMA PARCIAL: Algumas caixas não foram encontradas');
    } else {
      console.log('\n✅ SUCESSO: Todas as 6 caixas foram encontradas!');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
})();
