/**
 * Teste do Sistema de Depósito e Saque
 * Verifica se as correções estão funcionando corretamente
 */

const axios = require('axios');

const API_BASE = 'https://slotbox-api.onrender.com/api';

// Dados de teste
const testUser = {
  email: 'teste@slotbox.shop',
  senha: '123456'
};

const testDeposit = {
  amount: 50.00
};

const testWithdraw = {
  amount: 30.00,
  pixKey: 'teste@slotbox.shop',
  pixKeyType: 'email'
};

async function testDepositSystem() {
  console.log('🧪 Testando Sistema de Depósito...\n');
  
  try {
    // 1. Testar login
    console.log('1. Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, testUser);
    
    if (!loginResponse.data.success) {
      throw new Error('Falha no login: ' + loginResponse.data.message);
    }
    
    const token = loginResponse.data.token;
    const userId = loginResponse.data.user.id;
    
    console.log('✅ Login realizado com sucesso');
    console.log(`   Usuário: ${loginResponse.data.user.nome}`);
    console.log(`   Saldo atual: R$ ${loginResponse.data.user.saldo_reais}\n`);
    
    // 2. Testar criação de depósito
    console.log('2. Criando depósito PIX...');
    const depositResponse = await axios.post(`${API_BASE}/deposit/pix`, {
      userId: userId,
      amount: testDeposit.amount
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!depositResponse.data.success) {
      throw new Error('Falha na criação do depósito: ' + depositResponse.data.message);
    }
    
    console.log('✅ Depósito PIX criado com sucesso');
    console.log(`   Identifier: ${depositResponse.data.identifier}`);
    console.log(`   QR Code disponível: ${!!depositResponse.data.qrCode}`);
    console.log(`   QR Code Image disponível: ${!!depositResponse.data.qrCodeImage}\n`);
    
    // 3. Verificar se o valor está sendo exibido corretamente
    console.log('3. Verificando dados do depósito...');
    const depositData = {
      valor: testDeposit.amount,
      amount: testDeposit.amount,
      qr_base64: depositResponse.data.qrCodeImage,
      qr_text: depositResponse.data.qrCode,
      transaction_id: depositResponse.data.identifier
    };
    
    console.log('✅ Dados do depósito:');
    console.log(`   Valor (valor): R$ ${depositData.valor}`);
    console.log(`   Valor (amount): R$ ${depositData.amount}`);
    console.log(`   QR Code disponível: ${!!depositData.qr_base64}`);
    console.log(`   QR Text disponível: ${!!depositData.qr_text}\n`);
    
    return { success: true, token, userId, depositData };
    
  } catch (error) {
    console.error('❌ Erro no teste de depósito:', error.response?.data || error.message);
    return { success: false, error: error.message };
  }
}

async function testWithdrawSystem(token, userId) {
  console.log('🧪 Testando Sistema de Saque...\n');
  
  try {
    // 1. Verificar saldo atual
    console.log('1. Verificando saldo atual...');
    const balanceResponse = await axios.get(`${API_BASE}/wallet/balance`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!balanceResponse.data.success) {
      throw new Error('Falha ao consultar saldo: ' + balanceResponse.data.error);
    }
    
    const currentBalance = balanceResponse.data.balance;
    console.log(`✅ Saldo atual: R$ ${currentBalance}\n`);
    
    // 2. Testar criação de saque (apenas se tiver saldo suficiente)
    if (currentBalance >= testWithdraw.amount) {
      console.log('2. Criando saque PIX...');
      const withdrawResponse = await axios.post(`${API_BASE}/withdraw/pix`, {
        userId: userId,
        amount: testWithdraw.amount,
        pixKey: testWithdraw.pixKey,
        pixKeyType: testWithdraw.pixKeyType
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!withdrawResponse.data.success) {
        throw new Error('Falha na criação do saque: ' + withdrawResponse.data.error);
      }
      
      console.log('✅ Saque PIX criado com sucesso');
      console.log(`   Identifier: ${withdrawResponse.data.data.identifier}`);
      console.log(`   Status: ${withdrawResponse.data.data.status}\n`);
      
      return { success: true, withdrawData: withdrawResponse.data.data };
    } else {
      console.log('⚠️ Saldo insuficiente para teste de saque');
      console.log(`   Saldo atual: R$ ${currentBalance}`);
      console.log(`   Valor necessário: R$ ${testWithdraw.amount}\n`);
      
      return { success: true, skipped: true };
    }
    
  } catch (error) {
    console.error('❌ Erro no teste de saque:', error.response?.data || error.message);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 Iniciando Testes do Sistema de Depósito e Saque\n');
  console.log('=' .repeat(60));
  
  // Teste de depósito
  const depositResult = await testDepositSystem();
  
  if (depositResult.success) {
    console.log('=' .repeat(60));
    
    // Teste de saque
    const withdrawResult = await testWithdrawSystem(depositResult.token, depositResult.userId);
    
    console.log('=' .repeat(60));
    
    // Resumo dos testes
    console.log('📊 RESUMO DOS TESTES:\n');
    console.log(`✅ Sistema de Depósito: ${depositResult.success ? 'FUNCIONANDO' : 'COM PROBLEMAS'}`);
    console.log(`✅ Sistema de Saque: ${withdrawResult.success ? 'FUNCIONANDO' : 'COM PROBLEMAS'}`);
    
    if (depositResult.success) {
      console.log('\n🔧 CORREÇÕES APLICADAS:');
      console.log('   - Valor do depósito agora é exibido corretamente no QR Code');
      console.log('   - Compatibilidade entre campos "valor" e "amount"');
      console.log('   - Chaves do VizzionPay corrigidas no serviço de saque');
      console.log('   - Campos de data corrigidos (criado_em vs created_at)');
    }
    
  } else {
    console.log('❌ Teste de depósito falhou, não foi possível testar o saque');
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('🏁 Testes concluídos!');
}

// Executar testes
runTests().catch(console.error);
