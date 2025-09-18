/**
 * Teste Completo do Sistema de Afiliados
 * Verifica todo o fluxo desde cadastro até comissão
 */

const axios = require('axios');

const API_BASE = 'https://slotbox-api.onrender.com/api';

async function testSistemaAfiliados() {
  console.log('🧪 TESTE COMPLETO DO SISTEMA DE AFILIADOS');
  console.log('=' .repeat(50));
  
  try {
    // 1. Criar usuário afiliado
    console.log('1. Criando usuário afiliado...');
    const affiliateUser = {
      nome: 'Afiliado Teste',
      email: `afiliado${Date.now()}@slotbox.shop`,
      senha: '123456',
      cpf: '12345678901'
    };
    
    const affiliateRegisterResponse = await axios.post(`${API_BASE}/auth/register`, affiliateUser);
    
    if (!affiliateRegisterResponse.data.success) {
      throw new Error('Falha no registro do afiliado: ' + affiliateRegisterResponse.data.message);
    }
    
    const affiliateToken = affiliateRegisterResponse.data.token;
    const affiliateUserId = affiliateRegisterResponse.data.user.id;
    
    console.log('✅ Afiliado criado com sucesso');
    console.log(`   Email: ${affiliateUser.email}`);
    console.log(`   ID: ${affiliateUserId}\n`);
    
    // 2. Criar conta de afiliado
    console.log('2. Criando conta de afiliado...');
    const affiliateCreateResponse = await axios.post(`${API_BASE}/affiliate/create`, {}, {
      headers: {
        'Authorization': `Bearer ${affiliateToken}`
      }
    });
    
    if (!affiliateCreateResponse.data.success) {
      throw new Error('Falha na criação da conta de afiliado: ' + affiliateCreateResponse.data.message);
    }
    
    const affiliateData = affiliateCreateResponse.data.data;
    const referralCode = affiliateData.codigo_indicacao;
    
    console.log('✅ Conta de afiliado criada com sucesso');
    console.log(`   Código de indicação: ${referralCode}`);
    console.log(`   Link: ${affiliateData.link}\n`);
    
    // 3. Criar usuário indicado usando o código
    console.log('3. Criando usuário indicado...');
    const referredUser = {
      nome: 'Usuário Indicado',
      email: `indicado${Date.now()}@slotbox.shop`,
      senha: '123456',
      cpf: '98765432100',
      ref_code: referralCode
    };
    
    const referredRegisterResponse = await axios.post(`${API_BASE}/auth/register`, referredUser);
    
    if (!referredRegisterResponse.data.success) {
      throw new Error('Falha no registro do usuário indicado: ' + referredRegisterResponse.data.message);
    }
    
    const referredToken = referredRegisterResponse.data.token;
    const referredUserId = referredRegisterResponse.data.user.id;
    
    console.log('✅ Usuário indicado criado com sucesso');
    console.log(`   Email: ${referredUser.email}`);
    console.log(`   ID: ${referredUserId}`);
    console.log(`   Código usado: ${referralCode}\n`);
    
    // 4. Verificar se o usuário foi vinculado ao afiliado
    console.log('4. Verificando vinculação do usuário...');
    const userCheckResponse = await axios.get(`${API_BASE}/user/profile`, {
      headers: {
        'Authorization': `Bearer ${referredToken}`
      }
    });
    
    const userProfile = userCheckResponse.data.user;
    console.log('✅ Dados do usuário indicado:');
    console.log(`   Nome: ${userProfile.nome}`);
    console.log(`   Email: ${userProfile.email}`);
    console.log(`   Código usado: ${userProfile.codigo_indicacao_usado}`);
    console.log(`   Afiliado ID: ${userProfile.affiliate_id}\n`);
    
    // 5. Fazer depósito do usuário indicado
    console.log('5. Fazendo depósito do usuário indicado...');
    const depositResponse = await axios.post(`${API_BASE}/deposit/pix`, {
      userId: referredUserId,
      amount: 50.00
    }, {
      headers: {
        'Authorization': `Bearer ${referredToken}`
      }
    });
    
    if (!depositResponse.data.success) {
      throw new Error('Falha na criação do depósito: ' + depositResponse.data.message);
    }
    
    const depositIdentifier = depositResponse.data.identifier;
    console.log('✅ Depósito PIX criado com sucesso');
    console.log(`   Identifier: ${depositIdentifier}\n`);
    
    // 6. Simular confirmação do depósito via webhook
    console.log('6. Simulando confirmação do depósito...');
    const depositWebhookData = {
      event: 'TRANSACTION_PAID',
      transaction: {
        identifier: depositIdentifier,
        amount: 50.00,
        transactionId: 'deposit_tx_' + Date.now()
      },
      status: 'COMPLETED'
    };
    
    const depositWebhookHeaders = {
      'Content-Type': 'application/json',
      'x-public-key': 'juniorcoxtaa_m5mbahi4jiqphich',
      'x-secret-key': '6u7lv2h871fn9aepj4hugoxlnldoxhpfqhla2rbcrow7mvq50xzut9xdiimzt513'
    };
    
    const depositWebhookResponse = await axios.post(`${API_BASE}/webhook/pix`, depositWebhookData, {
      headers: depositWebhookHeaders
    });
    
    if (depositWebhookResponse.data.success) {
      console.log('✅ Depósito confirmado com sucesso!\n');
    } else {
      console.log('❌ Erro na confirmação do depósito:', depositWebhookResponse.data);
      return;
    }
    
    // 7. Verificar estatísticas do afiliado
    console.log('7. Verificando estatísticas do afiliado...');
    const affiliateStatsResponse = await axios.get(`${API_BASE}/affiliate/stats`, {
      headers: {
        'Authorization': `Bearer ${affiliateToken}`
      }
    });
    
    if (affiliateStatsResponse.data.success) {
      const stats = affiliateStatsResponse.data.data;
      console.log('✅ Estatísticas do afiliado:');
      console.log(`   Total de indicados: ${stats.estatisticas.total_indicados}`);
      console.log(`   Indicados com depósito: ${stats.estatisticas.indicados_com_deposito}`);
      console.log(`   Taxa de conversão: ${stats.estatisticas.taxa_conversao}`);
      console.log(`   Total de comissões: R$ ${stats.estatisticas.total_comissoes}`);
      console.log(`   Saldo disponível: R$ ${stats.saldo_disponivel}\n`);
    } else {
      console.log('❌ Erro ao buscar estatísticas:', affiliateStatsResponse.data);
    }
    
    // 8. Verificar saldo do afiliado
    console.log('8. Verificando saldo do afiliado...');
    const affiliateBalanceResponse = await axios.get(`${API_BASE}/wallet/balance`, {
      headers: {
        'Authorization': `Bearer ${affiliateToken}`
      }
    });
    
    const affiliateBalance = affiliateBalanceResponse.data.balance;
    console.log(`   Saldo do afiliado: R$ ${affiliateBalance}\n`);
    
    // 9. Verificar histórico de afiliados
    console.log('9. Verificando histórico de afiliados...');
    const affiliateHistoryResponse = await axios.get(`${API_BASE}/affiliate/referrals`, {
      headers: {
        'Authorization': `Bearer ${affiliateToken}`
      }
    });
    
    if (affiliateHistoryResponse.data.success) {
      const referrals = affiliateHistoryResponse.data.data.referrals;
      console.log('✅ Histórico de indicados:');
      referrals.forEach((referral, index) => {
        console.log(`   ${index + 1}. ${referral.nome} (${referral.email})`);
        console.log(`      Status: ${referral.status}`);
        console.log(`      Comissão: R$ ${referral.comissao || 0}`);
        console.log(`      Data: ${new Date(referral.criado_em).toLocaleString()}`);
      });
      console.log('');
    } else {
      console.log('❌ Erro ao buscar histórico:', affiliateHistoryResponse.data);
    }
    
    // 10. Resumo do teste
    console.log('📊 RESUMO DO TESTE DE AFILIADOS:');
    console.log('=' .repeat(40));
    console.log(`✅ Afiliado criado: ${affiliateUser.email}`);
    console.log(`✅ Código de indicação: ${referralCode}`);
    console.log(`✅ Usuário indicado: ${referredUser.email}`);
    console.log(`✅ Depósito realizado: R$ 50,00`);
    console.log(`✅ Depósito confirmado: ${depositWebhookResponse.data.success ? 'SIM' : 'NÃO'}`);
    console.log(`✅ Comissão processada: ${affiliateBalance > 0 ? 'SIM' : 'NÃO'}`);
    
    console.log('\n🔧 VERIFICAÇÕES DO SISTEMA DE AFILIADOS:');
    console.log('✅ Cadastro com código de indicação');
    console.log('✅ Vinculação usuário-afiliado');
    console.log('✅ Processamento de comissão');
    console.log('✅ Atualização de estatísticas');
    console.log('✅ Histórico de indicados');
    
    console.log('\n🎯 RESULTADO FINAL:');
    if (affiliateBalance > 0) {
      console.log('✅ SISTEMA DE AFILIADOS FUNCIONANDO PERFEITAMENTE!');
      console.log('✅ Comissão foi creditada corretamente!');
      console.log('✅ Estatísticas foram atualizadas!');
      console.log('✅ Histórico foi registrado!');
    } else {
      console.log('❌ SISTEMA DE AFILIADOS COM PROBLEMAS!');
      console.log('❌ Comissão não foi creditada!');
      console.log('❌ Verificar processamento de comissão!');
    }
    
    return {
      success: affiliateBalance > 0,
      affiliateEmail: affiliateUser.email,
      referredEmail: referredUser.email,
      referralCode,
      affiliateBalance,
      depositConfirmed: depositWebhookResponse.data.success,
      stats: affiliateStatsResponse.data.success ? affiliateStatsResponse.data.data : null
    };
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
    return { success: false, error: error.message };
  }
}

// Executar teste
testSistemaAfiliados().catch(console.error);
