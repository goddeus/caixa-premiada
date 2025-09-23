require('dotenv').config();

console.log('🔍 VERIFICANDO CONFIGURAÇÕES PIXUP...\n');

console.log('PIXUP_CLIENT_ID:', process.env.PIXUP_CLIENT_ID);
console.log('PIXUP_CLIENT_SECRET:', process.env.PIXUP_CLIENT_SECRET ? 'Presente' : 'Ausente');
console.log('PIXUP_API_URL:', process.env.PIXUP_API_URL);

console.log('\n📡 TESTANDO AUTENTICAÇÃO PIXUP...\n');

const axios = require('axios');

async function testAuth() {
  try {
    const clientId = process.env.PIXUP_CLIENT_ID;
    const clientSecret = process.env.PIXUP_CLIENT_SECRET;
    const apiUrl = process.env.PIXUP_API_URL;
    
    console.log('Client ID:', clientId);
    console.log('API URL:', apiUrl);
    
    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    console.log('Auth Header:', `Basic ${authHeader.substring(0, 20)}...`);
    
    const response = await axios.post(`${apiUrl}/v2/oauth/token`, {}, {
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ SUCESSO!');
    console.log('Status:', response.status);
    console.log('Response:', response.data);
    
  } catch (error) {
    console.log('❌ ERRO:');
    console.log('Status:', error.response?.status);
    console.log('Message:', error.response?.data?.message || error.message);
    console.log('Data:', error.response?.data);
    
    if (error.response?.data?.message?.includes('IP bloqueado')) {
      console.log('\n🚨 ERRO DE IP BLOQUEADO!');
      console.log('O IP do Render não está na whitelist da Pixup.');
    }
  }
}

testAuth();
