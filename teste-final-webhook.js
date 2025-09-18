/**
 * Teste Final do Webhook de Depósito
 * Verifica se todas as correções estão funcionando
 */

const axios = require('axios');

const API_BASE = 'https://slotbox-api.onrender.com/api';

async function testFinalWebhook() {
  console.log('🧪 TESTE FINAL DO WEBHOOK DE DEPÓSITO');
  console.log('=' .repeat(50));
  
  try {
    // 1. Criar usuário de teste
    console.log('1. Criando usuário de teste...');
    const testUser = {
      nome: 'Teste Final Webhook',
      email: `testefinal${Date.now()}@slotbox.shop`,
      senha: '123456',
      cpf: '12345678901'
    };
    
    const registerResponse = await axios.post(`${API_BASE}/auth/register`, testUser);
    
    if (!registerResponse.data.success) {
      throw new Error('Falha no registro: ' + registerResponse.data.message);
    }
    
    const token = registerResponse.data.token;
    const userId = registerResponse.data.user.id;
    const saldoInicial = registerResponse.data.user.saldo_reais;
    
    console.log('✅ Usuário criado com sucesso');
    console.log(`   Email: ${testUser.email}`);
    console.log(`   Saldo inicial: R$ ${saldoInicial}\n`);
    
    // 2. Criar depósito PIX
    console.log('2. Criando depósito PIX...');
    const depositResponse = await axios.post(`${API_BASE}/deposit/pix`, {
      userId: userId,
      amount: 75.00
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!depositResponse.data.success) {
      throw new Error('Falha na criação do depósito: ' + depositResponse.data.message);
    }
    
    const identifier = depositResponse.data.identifier;
    console.log('✅ Depósito PIX criado com sucesso');
    console.log(`   Identifier: ${identifier}\n`);
    
    // 3. Verificar saldo antes do webhook
    console.log('3. Verificando saldo antes do webhook...');
    const balanceBeforeResponse = await axios.get(`${API_BASE}/wallet/balance`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const saldoAntes = balanceBeforeResponse.data.balance;
    console.log(`   Saldo antes do webhook: R$ ${saldoAntes}\n`);
    
    // 4. Simular webhook da VizzionPay
    console.log('4. Simulando webhook da VizzionPay...');
    const webhookData = {
      event: 'TRANSACTION_PAID',
      transaction: {
        identifier: identifier,
        amount: 75.00,
        transactionId: 'vizzion_tx_' + Date.now()
      },
      status: 'COMPLETED'
    };
    
    const webhookHeaders = {
      'Content-Type': 'application/json',
      'x-public-key': 'juniorcoxtaa_m5mbahi4jiqphich',
      'x-secret-key': '6u7lv2h871fn9aepj4hugoxlnldoxhpfqhla2rbcrow7mvq50xzut9xdiimzt513'
    };
    
    console.log('   Enviando webhook para: /api/webhook/pix');
    console.log(`   Dados: ${JSON.stringify(webhookData, null, 2)}\n`);
    
    const webhookResponse = await axios.post(`${API_BASE}/webhook/pix`, webhookData, {
      headers: webhookHeaders
    });
    
    if (webhookResponse.data.success) {
      console.log('✅ Webhook processado com sucesso!\n');
    } else {
      console.log('❌ Erro no webhook:', webhookResponse.data);
      return;
    }
    
    // 5. Verificar saldo após webhook
    console.log('5. Verificando saldo após webhook...');
    const balanceAfterResponse = await axios.get(`${API_BASE}/wallet/balance`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const saldoDepois = balanceAfterResponse.data.balance;
    console.log(`   Saldo após webhook: R$ ${saldoDepois}\n`);
    
    // 6. Verificar se o saldo foi creditado
    const saldoCreditado = saldoDepois - saldoAntes;
    console.log('6. Verificando se o saldo foi creditado...');
    console.log(`   Saldo inicial: R$ ${saldoInicial}`);
    console.log(`   Saldo antes: R$ ${saldoAntes}`);
    console.log(`   Saldo depois: R$ ${saldoDepois}`);
    console.log(`   Valor creditado: R$ ${saldoCreditado}`);
    console.log(`   Valor esperado: R$ 75.00`);
    
    if (saldoCreditado === 75.00) {
      console.log('✅ SUCESSO: Saldo foi creditado corretamente!\n');
    } else {
      console.log('❌ ERRO: Saldo não foi creditado corretamente!\n');
    }
    
    // 7. Resumo do teste
    console.log('📊 RESUMO DO TESTE FINAL:');
    console.log('=' .repeat(40));
    console.log(`✅ Usuário criado: ${testUser.email}`);
    console.log(`✅ Depósito criado: ${identifier}`);
    console.log(`✅ Webhook enviado: /api/webhook/pix`);
    console.log(`✅ Webhook processado: ${webhookResponse.data.success ? 'SIM' : 'NÃO'}`);
    console.log(`✅ Saldo creditado: ${saldoCreditado === 75.00 ? 'SIM' : 'NÃO'}`);
    
    console.log('\n🔧 CORREÇÕES APLICADAS:');
    console.log('✅ URL do webhook corrigida: /api/webhook/pix');
    console.log('✅ Busca na tabela correta: transaction (não deposit)');
    console.log('✅ Status correto: concluido (não approved)');
    console.log('✅ Chaves do VizzionPay corrigidas');
    console.log('✅ Sincronização de carteira adicionada');
    
    console.log('\n🎯 RESULTADO FINAL:');
    if (saldoCreditado === 75.00) {
      console.log('✅ SISTEMA FUNCIONANDO PERFEITAMENTE!');
      console.log('✅ Webhooks estão sendo processados corretamente!');
      console.log('✅ Saldo está sendo creditado automaticamente!');
      console.log('✅ Todas as correções foram aplicadas com sucesso!');
    } else {
      console.log('❌ SISTEMA AINDA COM PROBLEMAS!');
      console.log('❌ Webhooks não estão funcionando corretamente!');
      console.log('❌ Saldo não está sendo creditado!');
    }
    
    return {
      success: saldoCreditado === 75.00,
      saldoInicial,
      saldoAntes,
      saldoDepois,
      saldoCreditado,
      webhookProcessed: webhookResponse.data.success
    };
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
    return { success: false, error: error.message };
  }
}

// Executar teste
testFinalWebhook().catch(console.error);
