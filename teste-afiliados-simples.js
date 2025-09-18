/**
 * Teste Simples do Sistema de Afiliados
 * Verifica se o processamento de comissão está funcionando
 */

const axios = require('axios');

const API_BASE = 'https://slotbox-api.onrender.com/api';

async function testAfiliadosSimples() {
  console.log('🧪 TESTE SIMPLES DO SISTEMA DE AFILIADOS');
  console.log('=' .repeat(50));
  
  try {
    // 1. Criar usuário afiliado
    console.log('1. Criando usuário afiliado...');
    const affiliateUser = {
      nome: 'Afiliado Teste',
      email: `afiliado${Date.now()}@teste.com`,
      senha: '123456',
      cpf: '12345678901'
    };
    
    const affiliateResponse = await axios.post(`${API_BASE}/auth/register`, affiliateUser);
    
    if (!affiliateResponse.data.success) {
      throw new Error('Falha no registro do afiliado: ' + affiliateResponse.data.message);
    }
    
    const affiliateToken = affiliateResponse.data.token;
    const affiliateUserId = affiliateResponse.data.user.id;
    
    console.log('✅ Afiliado criado:', affiliateUser.email);
    
    // 2. Criar conta de afiliado
    console.log('2. Criando conta de afiliado...');
    const affiliateCreateResponse = await axios.post(`${API_BASE}/affiliate/create`, {}, {
      headers: { 'Authorization': `Bearer ${affiliateToken}` }
    });
    
    if (!affiliateCreateResponse.data.success) {
      throw new Error('Falha na criação da conta de afiliado');
    }
    
    const referralCode = affiliateCreateResponse.data.data.codigo_indicacao;
    console.log('✅ Conta de afiliado criada, código:', referralCode);
    
    // 3. Criar usuário indicado
    console.log('3. Criando usuário indicado...');
    const referredUser = {
      nome: 'Usuário Indicado',
      email: `indicado${Date.now()}@teste.com`,
      senha: '123456',
      cpf: '98765432100',
      ref_code: referralCode
    };
    
    const referredResponse = await axios.post(`${API_BASE}/auth/register`, referredUser);
    
    if (!referredResponse.data.success) {
      throw new Error('Falha no registro do usuário indicado');
    }
    
    const referredToken = referredResponse.data.token;
    const referredUserId = referredResponse.data.user.id;
    
    console.log('✅ Usuário indicado criado:', referredUser.email);
    
    // 4. Verificar vinculação
    console.log('4. Verificando vinculação...');
    const userProfile = await axios.get(`${API_BASE}/user/profile`, {
      headers: { 'Authorization': `Bearer ${referredToken}` }
    });
    
    const user = userProfile.data.user;
    console.log('✅ Vinculação verificada:');
    console.log(`   Código usado: ${user.codigo_indicacao_usado}`);
    console.log(`   Afiliado ID: ${user.affiliate_id}`);
    
    // 5. Fazer depósito
    console.log('5. Fazendo depósito...');
    const depositResponse = await axios.post(`${API_BASE}/deposit/pix`, {
      userId: referredUserId,
      amount: 50.00
    }, {
      headers: { 'Authorization': `Bearer ${referredToken}` }
    });
    
    if (!depositResponse.data.success) {
      throw new Error('Falha na criação do depósito');
    }
    
    const depositIdentifier = depositResponse.data.identifier;
    console.log('✅ Depósito criado:', depositIdentifier);
    
    // 6. Simular webhook
    console.log('6. Simulando webhook...');
    const webhookData = {
      event: 'TRANSACTION_PAID',
      transaction: {
        identifier: depositIdentifier,
        amount: 50.00,
        transactionId: 'test_tx_' + Date.now()
      },
      status: 'COMPLETED'
    };
    
    const webhookHeaders = {
      'Content-Type': 'application/json',
      'x-public-key': 'juniorcoxtaa_m5mbahi4jiqphich',
      'x-secret-key': '6u7lv2h871fn9aepj4hugoxlnldoxhpfqhla2rbcrow7mvq50xzut9xdiimzt513'
    };
    
    const webhookResponse = await axios.post(`${API_BASE}/webhook/pix`, webhookData, {
      headers: webhookHeaders
    });
    
    console.log('✅ Webhook processado:', webhookResponse.data.success);
    
    // 7. Verificar saldo do afiliado
    console.log('7. Verificando saldo do afiliado...');
    const balanceResponse = await axios.get(`${API_BASE}/wallet/balance`, {
      headers: { 'Authorization': `Bearer ${affiliateToken}` }
    });
    
    const affiliateBalance = balanceResponse.data.balance;
    console.log('✅ Saldo do afiliado: R$', affiliateBalance);
    
    // 8. Verificar estatísticas
    console.log('8. Verificando estatísticas...');
    const statsResponse = await axios.get(`${API_BASE}/affiliate/stats`, {
      headers: { 'Authorization': `Bearer ${affiliateToken}` }
    });
    
    if (statsResponse.data.success) {
      const stats = statsResponse.data.data;
      console.log('✅ Estatísticas:');
      console.log(`   Total indicados: ${stats.estatisticas.total_indicados}`);
      console.log(`   Indicados com depósito: ${stats.estatisticas.indicados_com_deposito}`);
      console.log(`   Saldo disponível: R$ ${stats.saldo_disponivel}`);
    }
    
    // Resultado
    console.log('\n🎯 RESULTADO:');
    if (affiliateBalance > 0) {
      console.log('✅ SISTEMA FUNCIONANDO! Comissão creditada.');
    } else {
      console.log('❌ PROBLEMA! Comissão não foi creditada.');
    }
    
    return {
      success: affiliateBalance > 0,
      affiliateBalance,
      referralCode,
      webhookSuccess: webhookResponse.data.success
    };
    
  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
    return { success: false, error: error.message };
  }
}

// Executar teste
testAfiliadosSimples().catch(console.error);
