/**
 * Teste Completo e Profundo do Sistema de Afiliados
 * Verifica todos os cenários e edge cases
 */

const axios = require('axios');

const API_BASE = 'https://slotbox-api.onrender.com/api';

async function testAfiliadosCompleto() {
  console.log('🧪 TESTE COMPLETO E PROFUNDO DO SISTEMA DE AFILIADOS');
  console.log('=' .repeat(60));
  
  const results = {
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    errors: []
  };
  
  function addTest(name, passed, error = null) {
    results.totalTests++;
    if (passed) {
      results.passedTests++;
      console.log(`✅ ${name}`);
    } else {
      results.failedTests++;
      console.log(`❌ ${name}`);
      if (error) {
        results.errors.push({ test: name, error });
        console.log(`   Erro: ${error}`);
      }
    }
  }
  
  try {
    // TESTE 1: Criar usuário afiliado
    console.log('\n1. TESTE: Criar usuário afiliado');
    const affiliateUser = {
      nome: 'Afiliado Teste Completo',
      email: `afiliado${Date.now()}@teste.com`,
      senha: '123456',
      cpf: '12345678901'
    };
    
    const affiliateResponse = await axios.post(`${API_BASE}/auth/register`, affiliateUser);
    const affiliateCreated = affiliateResponse.data.success;
    addTest('Criar usuário afiliado', affiliateCreated, affiliateResponse.data.message);
    
    if (!affiliateCreated) return results;
    
    const affiliateToken = affiliateResponse.data.token;
    const affiliateUserId = affiliateResponse.data.user.id;
    
    // TESTE 2: Criar conta de afiliado
    console.log('\n2. TESTE: Criar conta de afiliado');
    const affiliateCreateResponse = await axios.post(`${API_BASE}/affiliate/create`, {}, {
      headers: { 'Authorization': `Bearer ${affiliateToken}` }
    });
    
    const affiliateAccountCreated = affiliateCreateResponse.data.success;
    addTest('Criar conta de afiliado', affiliateAccountCreated, affiliateCreateResponse.data.message);
    
    if (!affiliateAccountCreated) return results;
    
    const referralCode = affiliateCreateResponse.data.data.codigo_indicacao;
    const affiliateLink = affiliateCreateResponse.data.data.link;
    
    // TESTE 3: Validar código de indicação
    console.log('\n3. TESTE: Validar código de indicação');
    const validateResponse = await axios.get(`${API_BASE}/affiliate/validate/${referralCode}`);
    const codeValid = validateResponse.data.success;
    addTest('Validar código de indicação', codeValid, validateResponse.data.message);
    
    // TESTE 4: Criar usuário indicado
    console.log('\n4. TESTE: Criar usuário indicado');
    const referredUser = {
      nome: 'Usuário Indicado Teste',
      email: `indicado${Date.now()}@teste.com`,
      senha: '123456',
      cpf: '98765432100',
      ref_code: referralCode
    };
    
    const referredResponse = await axios.post(`${API_BASE}/auth/register`, referredUser);
    const referredCreated = referredResponse.data.success;
    addTest('Criar usuário indicado', referredCreated, referredResponse.data.message);
    
    if (!referredCreated) return results;
    
    const referredToken = referredResponse.data.token;
    const referredUserId = referredResponse.data.user.id;
    
    // TESTE 5: Verificar vinculação
    console.log('\n5. TESTE: Verificar vinculação usuário-afiliado');
    const userProfile = await axios.get(`${API_BASE}/user/profile`, {
      headers: { 'Authorization': `Bearer ${referredToken}` }
    });
    
    const user = userProfile.data.user;
    const isLinked = user.affiliate_id === affiliateUserId && user.codigo_indicacao_usado === referralCode;
    addTest('Verificar vinculação usuário-afiliado', isLinked, 
      isLinked ? null : `affiliate_id: ${user.affiliate_id}, expected: ${affiliateUserId}, code: ${user.codigo_indicacao_usado}`);
    
    // TESTE 6: Fazer depósito
    console.log('\n6. TESTE: Fazer depósito do usuário indicado');
    const depositResponse = await axios.post(`${API_BASE}/deposit/pix`, {
      userId: referredUserId,
      amount: 50.00
    }, {
      headers: { 'Authorization': `Bearer ${referredToken}` }
    });
    
    const depositCreated = depositResponse.data.success;
    addTest('Criar depósito PIX', depositCreated, depositResponse.data.message);
    
    if (!depositCreated) return results;
    
    const depositIdentifier = depositResponse.data.identifier;
    
    // TESTE 7: Simular webhook de confirmação
    console.log('\n7. TESTE: Simular webhook de confirmação');
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
    
    const webhookProcessed = webhookResponse.data.success;
    addTest('Processar webhook de depósito', webhookProcessed, webhookResponse.data.error);
    
    // TESTE 8: Verificar saldo do afiliado
    console.log('\n8. TESTE: Verificar saldo do afiliado');
    const balanceResponse = await axios.get(`${API_BASE}/wallet/balance`, {
      headers: { 'Authorization': `Bearer ${affiliateToken}` }
    });
    
    const affiliateBalance = balanceResponse.data.balance;
    const commissionCredited = affiliateBalance >= 10.00;
    addTest('Comissão creditada no saldo', commissionCredited, 
      commissionCredited ? null : `Saldo atual: R$ ${affiliateBalance}, esperado: R$ 10.00+`);
    
    // TESTE 9: Verificar estatísticas do afiliado
    console.log('\n9. TESTE: Verificar estatísticas do afiliado');
    const statsResponse = await axios.get(`${API_BASE}/affiliate/stats`, {
      headers: { 'Authorization': `Bearer ${affiliateToken}` }
    });
    
    const statsSuccess = statsResponse.data.success;
    addTest('Buscar estatísticas do afiliado', statsSuccess, statsResponse.data.message);
    
    if (statsSuccess) {
      const stats = statsResponse.data.data;
      
      // TESTE 9.1: Verificar total de indicados
      const totalIndicados = stats.estatisticas.total_indicados;
      addTest('Total de indicados correto', totalIndicados >= 1, 
        totalIndicados >= 1 ? null : `Total indicados: ${totalIndicados}, esperado: 1+`);
      
      // TESTE 9.2: Verificar indicados com depósito
      const indicadosComDeposito = stats.estatisticas.indicados_com_deposito;
      addTest('Indicados com depósito correto', indicadosComDeposito >= 1, 
        indicadosComDeposito >= 1 ? null : `Indicados com depósito: ${indicadosComDeposito}, esperado: 1+`);
      
      // TESTE 9.3: Verificar total de comissões
      const totalComissoes = stats.estatisticas.total_comissoes;
      addTest('Total de comissões correto', totalComissoes >= 10.00, 
        totalComissoes >= 10.00 ? null : `Total comissões: R$ ${totalComissoes}, esperado: R$ 10.00+`);
      
      // TESTE 9.4: Verificar saldo disponível
      const saldoDisponivel = stats.saldo_disponivel;
      addTest('Saldo disponível correto', saldoDisponivel >= 10.00, 
        saldoDisponivel >= 10.00 ? null : `Saldo disponível: R$ ${saldoDisponivel}, esperado: R$ 10.00+`);
    }
    
    // TESTE 10: Verificar histórico de indicados
    console.log('\n10. TESTE: Verificar histórico de indicados');
    const referralsResponse = await axios.get(`${API_BASE}/affiliate/referrals`, {
      headers: { 'Authorization': `Bearer ${affiliateToken}` }
    });
    
    const referralsSuccess = referralsResponse.data.success;
    addTest('Buscar histórico de indicados', referralsSuccess, referralsResponse.data.message);
    
    if (referralsSuccess) {
      const referrals = referralsResponse.data.data.referrals;
      const hasReferrals = referrals && referrals.length > 0;
      addTest('Histórico contém indicados', hasReferrals, 
        hasReferrals ? null : `Histórico vazio, esperado: pelo menos 1 indicado`);
    }
    
    // TESTE 11: Testar depósito duplicado (não deve gerar comissão)
    console.log('\n11. TESTE: Depósito duplicado (não deve gerar comissão)');
    const deposit2Response = await axios.post(`${API_BASE}/deposit/pix`, {
      userId: referredUserId,
      amount: 30.00
    }, {
      headers: { 'Authorization': `Bearer ${referredToken}` }
    });
    
    if (deposit2Response.data.success) {
      const deposit2Identifier = deposit2Response.data.identifier;
      
      // Simular webhook do segundo depósito
      const webhook2Data = {
        event: 'TRANSACTION_PAID',
        transaction: {
          identifier: deposit2Identifier,
          amount: 30.00,
          transactionId: 'test_tx2_' + Date.now()
        },
        status: 'COMPLETED'
      };
      
      const webhook2Response = await axios.post(`${API_BASE}/webhook/pix`, webhook2Data, {
        headers: webhookHeaders
      });
      
      if (webhook2Response.data.success) {
        // Verificar se o saldo não aumentou (não deve gerar comissão duplicada)
        const balance2Response = await axios.get(`${API_BASE}/wallet/balance`, {
          headers: { 'Authorization': `Bearer ${affiliateToken}` }
        });
        
        const affiliateBalance2 = balance2Response.data.balance;
        const noDuplicateCommission = affiliateBalance2 < 20.00; // Deve ser apenas R$ 10,00
        addTest('Não gerar comissão duplicada', noDuplicateCommission, 
          noDuplicateCommission ? null : `Saldo: R$ ${affiliateBalance2}, esperado: R$ 10.00 (sem duplicação)`);
      }
    }
    
    // TESTE 12: Testar depósito menor que R$ 20 (não deve gerar comissão)
    console.log('\n12. TESTE: Depósito menor que R$ 20 (não deve gerar comissão)');
    const referredUser2 = {
      nome: 'Usuário Teste R$ 10',
      email: `teste10${Date.now()}@teste.com`,
      senha: '123456',
      cpf: '11122233344',
      ref_code: referralCode
    };
    
    const referred2Response = await axios.post(`${API_BASE}/auth/register`, referredUser2);
    
    if (referred2Response.data.success) {
      const referred2Token = referred2Response.data.token;
      const referred2UserId = referred2Response.data.user.id;
      
      const deposit3Response = await axios.post(`${API_BASE}/deposit/pix`, {
        userId: referred2UserId,
        amount: 10.00
      }, {
        headers: { 'Authorization': `Bearer ${referred2Token}` }
      });
      
      if (deposit3Response.data.success) {
        const deposit3Identifier = deposit3Response.data.identifier;
        
        // Simular webhook do depósito de R$ 10
        const webhook3Data = {
          event: 'TRANSACTION_PAID',
          transaction: {
            identifier: deposit3Identifier,
            amount: 10.00,
            transactionId: 'test_tx3_' + Date.now()
          },
          status: 'COMPLETED'
        };
        
        const webhook3Response = await axios.post(`${API_BASE}/webhook/pix`, webhook3Data, {
          headers: webhookHeaders
        });
        
        if (webhook3Response.data.success) {
          // Verificar se o saldo não aumentou (não deve gerar comissão para R$ 10)
          const balance3Response = await axios.get(`${API_BASE}/wallet/balance`, {
            headers: { 'Authorization': `Bearer ${affiliateToken}` }
          });
          
          const affiliateBalance3 = balance3Response.data.balance;
          const noCommissionForSmallDeposit = affiliateBalance3 < 20.00; // Deve ser apenas R$ 10,00
          addTest('Não gerar comissão para depósito < R$ 20', noCommissionForSmallDeposit, 
            noCommissionForSmallDeposit ? null : `Saldo: R$ ${affiliateBalance3}, esperado: R$ 10.00 (sem comissão para R$ 10)`);
        }
      }
    }
    
    // RESULTADO FINAL
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESULTADO FINAL DOS TESTES:');
    console.log(`✅ Testes aprovados: ${results.passedTests}`);
    console.log(`❌ Testes falharam: ${results.failedTests}`);
    console.log(`📈 Taxa de sucesso: ${((results.passedTests / results.totalTests) * 100).toFixed(1)}%`);
    
    if (results.errors.length > 0) {
      console.log('\n🔍 ERROS DETALHADOS:');
      results.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.test}: ${error.error}`);
      });
    }
    
    const systemWorking = results.passedTests >= results.totalTests * 0.9; // 90% de sucesso
    console.log(`\n🎯 SISTEMA DE AFILIADOS: ${systemWorking ? '✅ FUNCIONANDO' : '❌ COM PROBLEMAS'}`);
    
    return results;
    
  } catch (error) {
    console.error('❌ Erro geral no teste:', error.response?.data || error.message);
    results.errors.push({ test: 'Erro geral', error: error.message });
    return results;
  }
}

// Executar teste
testAfiliadosCompleto().catch(console.error);
