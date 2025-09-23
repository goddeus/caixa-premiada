// Script para testar integração Pixup completa
// Execute: node test-pixup-integration.js

const axios = require('axios');
const config = require('./src/config/index');

console.log('🔍 TESTE COMPLETO DA INTEGRAÇÃO PIXUP');
console.log('=====================================');

// 1. Verificar configurações
console.log('\n📋 CONFIGURAÇÕES:');
console.log('Client ID:', config.pixup.clientId ? '✅ Configurado' : '❌ Não configurado');
console.log('Client Secret:', config.pixup.clientSecret ? '✅ Configurado' : '❌ Não configurado');
console.log('API URL:', config.pixup.apiUrl || '❌ Não configurado');

// 2. Testar autenticação
async function testAuthentication() {
  console.log('\n🔐 TESTANDO AUTENTICAÇÃO:');
  
  try {
    const authHeader = Buffer.from(`${config.pixup.clientId}:${config.pixup.clientSecret}`).toString('base64');
    
    const response = await axios.post(`${config.pixup.apiUrl}/v2/oauth/token`, {}, {
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 30000
    });
    
    console.log('✅ Autenticação bem-sucedida!');
    console.log('Token:', response.data.access_token ? '✅ Recebido' : '❌ Não recebido');
    console.log('Expires in:', response.data.expires_in, 'segundos');
    
    return response.data.access_token;
    
  } catch (error) {
    console.log('❌ Erro na autenticação:');
    console.log('Status:', error.response?.status);
    console.log('Data:', error.response?.data);
    console.log('Message:', error.message);
    return null;
  }
}

// 3. Testar criação de depósito
async function testDeposit(token) {
  if (!token) {
    console.log('\n❌ Não é possível testar depósito sem token');
    return;
  }
  
  console.log('\n💰 TESTANDO CRIAÇÃO DE DEPÓSITO:');
  
  try {
    const depositData = {
      amount: 20,
      external_id: `test_${Date.now()}`,
      payer: {
        name: "Teste Usuario",
        document: "12345678901"
      },
      description: "Teste de depósito"
    };
    
    const response = await axios.post(`${config.pixup.apiUrl}/v2/pix/qrcode`, depositData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 30000
    });
    
    console.log('✅ Depósito criado com sucesso!');
    console.log('Transaction ID:', response.data.transactionId);
    console.log('External ID:', response.data.external_id);
    console.log('QR Code:', response.data.qrcode ? '✅ Gerado' : '❌ Não gerado');
    console.log('Status:', response.data.status);
    
    return response.data;
    
  } catch (error) {
    console.log('❌ Erro ao criar depósito:');
    console.log('Status:', error.response?.status);
    console.log('Data:', error.response?.data);
    console.log('Message:', error.message);
    return null;
  }
}

// 4. Testar criação de saque
async function testWithdraw(token) {
  if (!token) {
    console.log('\n❌ Não é possível testar saque sem token');
    return;
  }
  
  console.log('\n💸 TESTANDO CRIAÇÃO DE SAQUE:');
  
  try {
    const withdrawData = {
      amount: 20,
      external_id: `withdraw_test_${Date.now()}`,
      pix_key: "test@email.com",
      pix_key_type: "email",
      payer: {
        name: "Teste Usuario",
        document: "12345678901"
      },
      description: "Teste de saque"
    };
    
    const response = await axios.post(`${config.pixup.apiUrl}/v2/pix/payment`, withdrawData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 30000
    });
    
    console.log('✅ Saque criado com sucesso!');
    console.log('Transaction ID:', response.data.transactionId);
    console.log('External ID:', response.data.external_id);
    console.log('Status:', response.data.status);
    
    return response.data;
    
  } catch (error) {
    console.log('❌ Erro ao criar saque:');
    console.log('Status:', error.response?.status);
    console.log('Data:', error.response?.data);
    console.log('Message:', error.message);
    return null;
  }
}

// 5. Executar todos os testes
async function runAllTests() {
  const token = await testAuthentication();
  await testDeposit(token);
  await testWithdraw(token);
  
  console.log('\n🏁 TESTE COMPLETO FINALIZADO!');
  console.log('Verifique os resultados acima para identificar problemas.');
}

runAllTests().catch(console.error);
