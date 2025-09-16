const axios = require('axios');

async function testHealthCheck() {
    const endpoints = [
        'https://slotbox-api.onrender.com/api/health',
        'https://slotbox-api.onrender.com/api',
        'http://localhost:3001/api/health',
        'http://localhost:3001/api'
    ];
    
    console.log('Testando healthcheck do backend...\n');
    
    for (const endpoint of endpoints) {
        try {
            console.log(`Testando: ${endpoint}`);
            const response = await axios.get(endpoint, { timeout: 10000 });
            console.log(`✅ Status: ${response.status}`);
            console.log(`   Response: ${JSON.stringify(response.data, null, 2)}`);
        } catch (error) {
            if (error.response) {
                console.log(`❌ Status: ${error.response.status}`);
                console.log(`   Error: ${error.response.data}`);
            } else if (error.code === 'ECONNREFUSED') {
                console.log(`❌ Conexão recusada - servidor não está rodando`);
            } else if (error.code === 'ENOTFOUND') {
                console.log(`❌ Host não encontrado`);
            } else {
                console.log(`❌ Erro: ${error.message}`);
            }
        }
        console.log('');
    }
}

testHealthCheck().catch(console.error);
