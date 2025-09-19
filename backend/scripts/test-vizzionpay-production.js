/**
 * Script para testar VizzionPay em produção
 * Execute: node scripts/test-vizzionpay-production.js
 */

require('dotenv').config();
const axios = require('axios');

class VizzionPayTester {
  constructor() {
    this.apiKey = process.env.VIZZION_API_KEY || 'juniorcoxtaa_m5mbahi4jiqphich';
    this.publicKey = process.env.VIZZION_PUBLIC_KEY || 'juniorcoxtaa_m5mbahi4jiqphich';
    this.secretKey = process.env.VIZZION_SECRET_KEY || '6u7lv2h871fn9aepj4hugoxlnldoxhpfqhla2rbcrow7mvq50xzut9xdiimzt513';
    
    this.endpoints = [
      'https://api.vizzionpay.com/v1/pix/transfer',
      'https://api.vizzionpay.com/v1/pix/payout',
      'https://api.vizzionpay.com/v1/gateway/pix/transfer',
      'https://api.vizzionpay.com/v1/gateway/pix/payout',
      'https://app.vizzionpay.com/api/v1/pix/transfer',
      'https://app.vizzionpay.com/api/v1/pix/payout',
      'https://app.vizzionpay.com/api/v1/gateway/pix/transfer',
      'https://app.vizzionpay.com/api/v1/gateway/pix/payout'
    ];
  }

  async testConnectivity() {
    console.log('🔍 Testando conectividade com VizzionPay...\n');
    
    const testEndpoints = [
      'https://api.vizzionpay.com/v1/status',
      'https://api.vizzionpay.com/v1/health',
      'https://app.vizzionpay.com/api/v1/status',
      'https://app.vizzionpay.com/api/v1/health'
    ];

    for (const endpoint of testEndpoints) {
      try {
        console.log(`📡 Testando: ${endpoint}`);
        const response = await axios.get(endpoint, {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        });
        
        console.log(`✅ Sucesso: ${response.status} - ${JSON.stringify(response.data)}`);
      } catch (error) {
        console.log(`❌ Falha: ${error.response?.status || error.message}`);
      }
    }
  }

  async testWithdrawEndpoints() {
    console.log('\n💰 Testando endpoints de saque...\n');
    
    const testData = {
      identifier: `test_withdraw_${Date.now()}`,
      amount: 1.00, // R$ 1,00 para teste
      pixKey: 'teste@exemplo.com',
      pixKeyType: 'email',
      client: {
        name: 'Teste Slotbox',
        document: '12345678901',
        email: 'teste@slotbox.shop'
      }
    };

    for (const endpoint of this.endpoints) {
      try {
        console.log(`📡 Testando: ${endpoint}`);
        
        const response = await axios.post(endpoint, testData, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            'x-public-key': this.publicKey,
            'x-secret-key': this.secretKey
          },
          timeout: 30000
        });
        
        console.log(`✅ Sucesso: ${response.status}`);
        console.log(`📄 Resposta: ${JSON.stringify(response.data, null, 2)}`);
        
        // Se encontrou um endpoint funcionando, salvar
        this.saveWorkingEndpoint(endpoint);
        
      } catch (error) {
        console.log(`❌ Falha: ${error.response?.status || error.message}`);
        if (error.response?.data) {
          console.log(`📄 Erro: ${JSON.stringify(error.response.data, null, 2)}`);
        }
      }
    }
  }

  async testDepositEndpoints() {
    console.log('\n💳 Testando endpoints de depósito...\n');
    
    const testData = {
      identifier: `test_deposit_${Date.now()}`,
      amount: 10.00,
      pixKey: 'teste@exemplo.com',
      pixKeyType: 'email',
      client: {
        name: 'Teste Slotbox',
        document: '12345678901',
        email: 'teste@slotbox.shop'
      }
    };

    const depositEndpoints = [
      'https://api.vizzionpay.com/v1/pix/receive',
      'https://api.vizzionpay.com/v1/gateway/pix/receive',
      'https://app.vizzionpay.com/api/v1/pix/receive',
      'https://app.vizzionpay.com/api/v1/gateway/pix/receive'
    ];

    for (const endpoint of depositEndpoints) {
      try {
        console.log(`📡 Testando: ${endpoint}`);
        
        const response = await axios.post(endpoint, testData, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            'x-public-key': this.publicKey,
            'x-secret-key': this.secretKey
          },
          timeout: 30000
        });
        
        console.log(`✅ Sucesso: ${response.status}`);
        console.log(`📄 Resposta: ${JSON.stringify(response.data, null, 2)}`);
        
      } catch (error) {
        console.log(`❌ Falha: ${error.response?.status || error.message}`);
        if (error.response?.data) {
          console.log(`📄 Erro: ${JSON.stringify(error.response.data, null, 2)}`);
        }
      }
    }
  }

  saveWorkingEndpoint(endpoint) {
    console.log(`\n💾 Endpoint funcionando encontrado: ${endpoint}`);
    console.log('📝 Atualize o arquivo withdrawService.js com este endpoint!');
  }

  async testCredentials() {
    console.log('\n🔑 Testando credenciais...\n');
    
    console.log(`API Key: ${this.apiKey.substring(0, 10)}...`);
    console.log(`Public Key: ${this.publicKey.substring(0, 10)}...`);
    console.log(`Secret Key: ${this.secretKey.substring(0, 10)}...`);
    
    // Testar com endpoint de status
    try {
      const response = await axios.get('https://api.vizzionpay.com/v1/account', {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      console.log('✅ Credenciais válidas!');
      console.log(`📄 Conta: ${JSON.stringify(response.data, null, 2)}`);
      
    } catch (error) {
      console.log('❌ Credenciais inválidas ou endpoint não disponível');
      console.log(`Erro: ${error.response?.status || error.message}`);
    }
  }

  async runAllTests() {
    console.log('🚀 INICIANDO TESTES DA VIZZIONPAY\n');
    console.log('=' * 50);
    
    await this.testCredentials();
    await this.testConnectivity();
    await this.testDepositEndpoints();
    await this.testWithdrawEndpoints();
    
    console.log('\n' + '=' * 50);
    console.log('✅ TESTES CONCLUÍDOS');
    console.log('\n📋 PRÓXIMOS PASSOS:');
    console.log('1. Verifique os endpoints que funcionaram');
    console.log('2. Atualize o withdrawService.js com o endpoint correto');
    console.log('3. Configure as variáveis de ambiente de produção');
    console.log('4. Teste com valores baixos em produção');
  }
}

// Executar testes
if (require.main === module) {
  const tester = new VizzionPayTester();
  tester.runAllTests().catch(console.error);
}

module.exports = VizzionPayTester;
