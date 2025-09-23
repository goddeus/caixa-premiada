const axios = require('axios');

console.log('🔍 DEBUG PIXUP IP - Testando autenticação...\n');

// Configurações Pixup
const PIXUP_CLIENT_ID = 'ocosta4m_2683309738242919';
const PIXUP_CLIENT_SECRET = 'fc0cd43b330bc26fcdf3514c60f2d7690ebc642f983659f2644152cdafa451e1';
const PIXUP_API_URL = 'https://api.pixupbr.com';

async function testPixupAuth() {
  try {
    console.log('📡 Testando autenticação Pixup...');
    console.log('Client ID:', PIXUP_CLIENT_ID);
    console.log('API URL:', PIXUP_API_URL);
    
    // Criar header Basic Auth
    const authHeader = Buffer.from(`${PIXUP_CLIENT_ID}:${PIXUP_CLIENT_SECRET}`).toString('base64');
    console.log('Auth Header:', `Basic ${authHeader.substring(0, 20)}...`);
    
    // Fazer requisição de autenticação
    const response = await axios.post(`${PIXUP_API_URL}/v2/oauth/token`, {}, {
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Sucesso na autenticação!');
    console.log('Status:', response.status);
    console.log('Response:', response.data);
    
  } catch (error) {
    console.log('❌ Erro na autenticação:');
    console.log('Status:', error.response?.status);
    console.log('Message:', error.response?.data?.message || error.message);
    console.log('Data:', error.response?.data);
    
    // Verificar se é erro de IP bloqueado
    if (error.response?.data?.message?.includes('IP bloqueado')) {
      console.log('\n🚨 ERRO DE IP BLOQUEADO DETECTADO!');
      console.log('Isso significa que o IP do Render não está na whitelist da Pixup.');
    }
  }
}

async function testIPDetection() {
  try {
    console.log('\n🌐 Testando detecção de IP...');
    
    // Testar diferentes serviços de IP
    const ipServices = [
      'https://api.ipify.org?format=json',
      'https://httpbin.org/ip',
      'https://ipinfo.io/json'
    ];
    
    for (const service of ipServices) {
      try {
        const response = await axios.get(service, { timeout: 5000 });
        console.log(`${service}:`, response.data);
      } catch (error) {
        console.log(`${service}: Erro -`, error.message);
      }
    }
    
  } catch (error) {
    console.log('Erro ao testar IPs:', error.message);
  }
}

async function testPixupEndpoints() {
  try {
    console.log('\n🔗 Testando diferentes endpoints da Pixup...');
    
    const endpoints = [
      '/v2/oauth/token',
      '/oauth/token',
      '/v1/oauth/token',
      '/api/oauth/token'
    ];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`\nTestando: ${PIXUP_API_URL}${endpoint}`);
        const authHeader = Buffer.from(`${PIXUP_CLIENT_ID}:${PIXUP_CLIENT_SECRET}`).toString('base64');
        
        const response = await axios.post(`${PIXUP_API_URL}${endpoint}`, {}, {
          headers: {
            'Authorization': `Basic ${authHeader}`,
            'Content-Type': 'application/json'
          },
          timeout: 5000
        });
        
        console.log(`✅ ${endpoint} - Status: ${response.status}`);
        
      } catch (error) {
        console.log(`❌ ${endpoint} - Status: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
      }
    }
    
  } catch (error) {
    console.log('Erro ao testar endpoints:', error.message);
  }
}

async function main() {
  console.log('🚀 Iniciando debug completo da Pixup...\n');
  
  await testIPDetection();
  await testPixupEndpoints();
  await testPixupAuth();
  
  console.log('\n✅ Debug completo finalizado!');
}

main().catch(console.error);
