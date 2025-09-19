/**
 * Teste simples do sistema de saque
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';

async function testWithdrawSystem() {
  console.log('🚀 Testando sistema de saque...');
  
  try {
    // Teste 1: Verificar se a rota de saque existe
    console.log('\n1. Testando rota de saque...');
    const response = await axios.post(`${API_BASE_URL}/api/withdraw/pix`, {
      amount: 25.00,
      pixKey: 'teste@email.com',
      pixKeyType: 'email'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer invalid-token'
      }
    });
    
    console.log('❌ Rota não está protegida corretamente');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Rota protegida corretamente (401 Unauthorized)');
    } else {
      console.log(`❌ Erro inesperado: ${error.response?.status} - ${error.response?.data?.message}`);
    }
  }

  // Teste 2: Verificar rota de estatísticas
  console.log('\n2. Testando rota de estatísticas...');
  try {
    const response = await axios.get(`${API_BASE_URL}/api/withdraw/stats`, {
      headers: {
        'Authorization': 'Bearer invalid-token'
      }
    });
    console.log('❌ Rota de estatísticas não está protegida');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Rota de estatísticas protegida corretamente');
    } else {
      console.log(`❌ Erro inesperado: ${error.response?.status}`);
    }
  }

  // Teste 3: Verificar rota de histórico
  console.log('\n3. Testando rota de histórico...');
  try {
    const response = await axios.get(`${API_BASE_URL}/api/withdraw/history`, {
      headers: {
        'Authorization': 'Bearer invalid-token'
      }
    });
    console.log('❌ Rota de histórico não está protegida');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Rota de histórico protegida corretamente');
    } else {
      console.log(`❌ Erro inesperado: ${error.response?.status}`);
    }
  }

  // Teste 4: Verificar rota de todos os saques (admin)
  console.log('\n4. Testando rota de todos os saques...');
  try {
    const response = await axios.get(`${API_BASE_URL}/api/withdraw/all`, {
      headers: {
        'Authorization': 'Bearer invalid-token'
      }
    });
    console.log('❌ Rota de admin não está protegida');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Rota de admin protegida corretamente');
    } else {
      console.log(`❌ Erro inesperado: ${error.response?.status}`);
    }
  }

  console.log('\n🎉 Testes de rotas concluídos!');
}

// Executar teste
testWithdrawSystem().catch(console.error);
