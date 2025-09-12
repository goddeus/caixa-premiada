const axios = require('axios');

// Configurações
const API_URL = 'https://slotbox-api.onrender.com';
const FRONTEND_URL = 'https://slotbox.shop';

async function testProduction() {
  console.log('🧪 Testando sistema em produção...');
  console.log(`📡 Backend: ${API_URL}`);
  console.log(`🌐 Frontend: ${FRONTEND_URL}`);
  console.log('');
  
  const tests = [
    {
      name: 'Health Check',
      test: async () => {
        const response = await axios.get(`${API_URL}/api/health`);
        return response.data.success;
      }
    },
    {
      name: 'Database Test',
      test: async () => {
        const response = await axios.get(`${API_URL}/api/db-test`);
        return response.data.success;
      }
    },
    {
      name: 'VizzionPay Config',
      test: async () => {
        const response = await axios.get(`${API_URL}/api/vizzionpay-test`);
        return response.data.success;
      }
    },
    {
      name: 'Cases List',
      test: async () => {
        const response = await axios.get(`${API_URL}/api/cases`);
        return response.data.cases && response.data.cases.length > 0;
      }
    },
    {
      name: 'Frontend Access',
      test: async () => {
        const response = await axios.get(FRONTEND_URL);
        return response.status === 200;
      }
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      console.log(`🔍 Testando: ${test.name}...`);
      const result = await test.test();
      
      if (result) {
        console.log(`✅ ${test.name}: PASSOU`);
        passed++;
      } else {
        console.log(`❌ ${test.name}: FALHOU`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ERRO - ${error.message}`);
      failed++;
    }
  }
  
  console.log('');
  console.log('📊 RESULTADOS:');
  console.log(`✅ Testes passaram: ${passed}`);
  console.log(`❌ Testes falharam: ${failed}`);
  console.log(`📈 Taxa de sucesso: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('🎉 Todos os testes passaram! Sistema pronto para produção!');
  } else {
    console.log('⚠️ Alguns testes falharam. Verifique os problemas antes do deploy.');
  }
}

// Executar testes
testProduction().catch(console.error);
