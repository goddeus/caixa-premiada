const https = require('https');

console.log('🔍 Testando conexão com o backend...\n');

// Testar diferentes endpoints
const endpoints = [
  'https://slotbox-api.onrender.com/api/cases',
  'https://slotbox-api.onrender.com/api/wallet/',
  'https://slotbox-api.onrender.com/api/auth/me'
];

async function testEndpoint(url) {
  return new Promise((resolve) => {
    console.log(`📡 Testando: ${url}`);
    
    const options = {
      method: 'GET',
      headers: {
        'Origin': 'https://slotbox.shop',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    };

    const req = https.request(url, options, (res) => {
      console.log(`  Status: ${res.statusCode}`);
      console.log(`  Headers:`);
      console.log(`    Access-Control-Allow-Origin: ${res.headers['access-control-allow-origin'] || 'NÃO DEFINIDO'}`);
      console.log(`    Access-Control-Allow-Methods: ${res.headers['access-control-allow-methods'] || 'NÃO DEFINIDO'}`);
      console.log(`    Access-Control-Allow-Headers: ${res.headers['access-control-allow-headers'] || 'NÃO DEFINIDO'}`);
      console.log(`    Access-Control-Allow-Credentials: ${res.headers['access-control-allow-credentials'] || 'NÃO DEFINIDO'}`);
      console.log(`    Content-Type: ${res.headers['content-type'] || 'NÃO DEFINIDO'}`);
      console.log('');
      
      resolve({
        status: res.statusCode,
        headers: res.headers,
        url
      });
    });

    req.on('error', (error) => {
      console.log(`  ❌ Erro: ${error.message}`);
      console.log('');
      resolve({
        error: error.message,
        url
      });
    });

    req.setTimeout(10000, () => {
      console.log(`  ⏰ Timeout após 10 segundos`);
      console.log('');
      req.destroy();
      resolve({
        error: 'Timeout',
        url
      });
    });

    req.end();
  });
}

async function runTests() {
  console.log('🚀 Iniciando testes de conectividade...\n');
  
  for (const endpoint of endpoints) {
    await testEndpoint(endpoint);
  }
  
  console.log('✅ Testes concluídos!');
  console.log('\n📋 DIAGNÓSTICO:');
  console.log('Se você vê "NÃO DEFINIDO" nos headers CORS, o problema é configuração do backend.');
  console.log('Se você vê erros de conexão, o backend pode estar offline.');
  console.log('Se você vê status 200 mas sem CORS headers, precisa reconfigurar o CORS.');
}

runTests().catch(console.error);

