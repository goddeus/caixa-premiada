// Teste simples do backend
console.log('🧪 Testando backend...');

const https = require('https');

// Testar health check
const options = {
  hostname: 'slotbox-api.onrender.com',
  port: 443,
  path: '/api/health',
  method: 'GET'
};

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Resposta:', data);
  });
});

req.on('error', (error) => {
  console.error('Erro:', error.message);
});

req.end();
