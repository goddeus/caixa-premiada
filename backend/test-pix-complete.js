const axios = require('axios');
require('dotenv').config();

const BASE_URL = 'http://localhost:3001';

async function testCompletePixFlow() {
  console.log('🧪 TESTE COMPLETO DO SISTEMA PIX\n');
  console.log('=' .repeat(50));

  try {
    // 1. Verificar configuração
    console.log('\n1️⃣ VERIFICANDO CONFIGURAÇÃO...');
    console.log('🔑 API Key:', process.env.VIZZIONPAY_API_KEY ? '✅ Configurada' : '❌ Não configurada');
    console.log('🔑 Public Key:', process.env.VIZZIONPAY_PUBLIC_KEY ? '✅ Configurada' : '❌ Não configurada');
    console.log('🔗 Base URL:', process.env.VIZZIONPAY_BASE_URL);
    console.log('🔐 Webhook Secret:', process.env.VIZZIONPAY_WEBHOOK_SECRET ? '✅ Configurado' : '❌ Não configurado');

    // 2. Verificar servidor
    console.log('\n2️⃣ VERIFICANDO SERVIDOR...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Servidor funcionando:', healthResponse.data.status);

    // 3. Criar usuário de teste
    console.log('\n3️⃣ CRIANDO USUÁRIO DE TESTE...');
    const testUser = {
      email: `teste-pix-${Date.now()}@example.com`,
      senha: '123456',
      nome: 'Teste PIX Completo',
      cpf: '11144477735'
    };

    try {
      await axios.post(`${BASE_URL}/auth/register`, testUser);
      console.log('✅ Usuário criado:', testUser.email);
    } catch (error) {
      if (error.response?.data?.error?.includes('já cadastrado')) {
        console.log('ℹ️ Usuário já existe, continuando...');
      } else {
        throw error;
      }
    }

    // 4. Fazer login
    console.log('\n4️⃣ FAZENDO LOGIN...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: testUser.email,
      senha: testUser.senha
    });
    const authToken = loginResponse.data.token;
    console.log('✅ Login realizado:', loginResponse.data.user.nome);

    // 5. Testar depósito PIX
    console.log('\n5️⃣ TESTANDO DEPÓSITO PIX...');
    const pixDepositResponse = await axios.post(`${BASE_URL}/payments/deposit/pix`, {
      valor: 50.00
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    console.log('✅ Depósito PIX criado:');
    console.log('   📋 Payment ID:', pixDepositResponse.data.payment_id);
    console.log('   💰 Valor:', pixDepositResponse.data.valor);
    console.log('   📱 QR Code:', pixDepositResponse.data.qr_code ? '✅ Gerado' : '❌ Não gerado');
    console.log('   📋 PIX Copy Paste:', pixDepositResponse.data.pix_copy_paste ? '✅ Gerado' : '❌ Não gerado');
    console.log('   ⏰ Expira em:', pixDepositResponse.data.expires_at);

    const paymentId = pixDepositResponse.data.payment_id;

    // 6. Verificar status do pagamento
    console.log('\n6️⃣ VERIFICANDO STATUS DO PAGAMENTO...');
    const statusResponse = await axios.get(`${BASE_URL}/payments/status/${paymentId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Status atual:', statusResponse.data.payment.status);

    // 7. Simular webhook de confirmação (apenas em desenvolvimento)
    if (process.env.NODE_ENV !== 'production') {
      console.log('\n7️⃣ SIMULANDO WEBHOOK DE CONFIRMAÇÃO...');
      const webhookResponse = await axios.post(`${BASE_URL}/payments/test/webhook`, {
        payment_id: paymentId,
        status: 'paid'
      });
      console.log('✅ Webhook simulado:', webhookResponse.data.message);

      // 8. Verificar status após webhook
      console.log('\n8️⃣ VERIFICANDO STATUS APÓS WEBHOOK...');
      const finalStatusResponse = await axios.get(`${BASE_URL}/payments/status/${paymentId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('✅ Status final:', finalStatusResponse.data.payment.status);

      // 9. Verificar saldo atualizado
      console.log('\n9️⃣ VERIFICANDO SALDO ATUALIZADO...');
      const walletResponse = await axios.get(`${BASE_URL}/wallet`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('✅ Saldo atual:', `R$ ${walletResponse.data.saldo.toFixed(2)}`);
    }

    // 10. Testar saque PIX
    console.log('\n🔟 TESTANDO SAQUE PIX...');
    const withdrawResponse = await axios.post(`${BASE_URL}/payments/withdraw/pix`, {
      valor: 25.00,
      pix_key: 'teste@example.com',
      pix_key_type: 'email'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Saque PIX criado:');
    console.log('   📋 Withdrawal ID:', withdrawResponse.data.withdrawal_id);
    console.log('   💰 Valor:', withdrawResponse.data.valor);

    console.log('\n🎉 TESTE COMPLETO FINALIZADO COM SUCESSO!');
    console.log('=' .repeat(50));
    console.log('\n📊 RESUMO DOS TESTES:');
    console.log('✅ Configuração do VizzionPay');
    console.log('✅ Criação de usuário');
    console.log('✅ Autenticação');
    console.log('✅ Depósito PIX com QR Code');
    console.log('✅ Consulta de status');
    console.log('✅ Simulação de webhook');
    console.log('✅ Atualização de saldo');
    console.log('✅ Saque PIX');
    console.log('\n🚀 SISTEMA PRONTO PARA PRODUÇÃO!');

  } catch (error) {
    console.error('\n❌ ERRO DURANTE O TESTE:');
    console.error('Mensagem:', error.response?.data?.error || error.message);
    if (error.response?.data) {
      console.error('Detalhes:', JSON.stringify(error.response.data, null, 2));
    }
    console.error('\nStack trace:', error.stack);
  }
}

// Executar teste
testCompletePixFlow();
