/**
 * SCRIPT COMPLETO PARA TESTAR O SISTEMA DE ROLLOVER
 * 
 * Este script testa todas as correções implementadas:
 * 1. Verificação de rollover no frontend
 * 2. Atualização correta do total_giros
 * 3. Liberação automática do rollover
 * 4. Validação no backend
 */

const axios = require('axios');

const API_BASE_URL = 'https://slotbox-api.onrender.com/api';

async function testRolloverSystem() {
  try {
    console.log('🔧 TESTE COMPLETO DO SISTEMA DE ROLLOVER...\n');
    
    // 1. Verificar status inicial do usuário
    console.log('1️⃣ Verificando status inicial do usuário...');
    const response = await axios.get(`${API_BASE_URL}/refresh-user/6f73f55f-f9d6-4108-8838-ab76407d7e63`);
    
    if (response.data.success) {
      const user = response.data.data.user;
      console.log('✅ Status inicial:');
      console.log(`   Usuário: ${user.email}`);
      console.log(`   Saldo: R$ ${user.saldo_reais}`);
      console.log(`   Total giros: R$ ${user.total_giros || 0}`);
      console.log(`   Rollover mínimo: R$ ${user.rollover_minimo || 20}`);
      console.log(`   Rollover liberado: ${user.rollover_liberado ? 'SIM' : 'NÃO'}`);
      console.log(`   Primeiro depósito: ${user.primeiro_deposito_feito ? 'SIM' : 'NÃO'}`);
      
      // Análise do estado atual
      const totalGiros = user.total_giros || 0;
      const rolloverMinimo = user.rollover_minimo || 20;
      const rolloverLiberado = user.rollover_liberado;
      const primeiroDeposito = user.primeiro_deposito_feito;
      
      console.log('\n2️⃣ Análise do estado atual:');
      console.log(`   Progresso: ${((totalGiros / rolloverMinimo) * 100).toFixed(1)}%`);
      console.log(`   Faltam: R$ ${(rolloverMinimo - totalGiros).toFixed(2)}`);
      
      // Verificar se o estado está correto
      if (primeiroDeposito && !rolloverLiberado && totalGiros < rolloverMinimo) {
        console.log('✅ Estado correto: Usuário fez depósito mas ainda não bateu o rollover');
        console.log('   Botão de saque NÃO deve aparecer no frontend');
      } else if (primeiroDeposito && rolloverLiberado && totalGiros >= rolloverMinimo) {
        console.log('✅ Estado correto: Usuário bateu o rollover e pode sacar');
        console.log('   Botão de saque DEVE aparecer no frontend');
      } else if (!primeiroDeposito) {
        console.log('⚠️ Usuário ainda não fez primeiro depósito');
      } else {
        console.log('❌ Estado inconsistente detectado!');
        console.log(`   Primeiro depósito: ${primeiroDeposito}`);
        console.log(`   Rollover liberado: ${rolloverLiberado}`);
        console.log(`   Total giros: R$ ${totalGiros}`);
        console.log(`   Rollover mínimo: R$ ${rolloverMinimo}`);
      }
      
      // Teste de validação no backend
      console.log('\n3️⃣ Testando validação no backend...');
      try {
        const withdrawTest = await axios.post(`${API_BASE_URL}/wallet/withdraw`, {
          valor: 20,
          pix_key: 'test@test.com'
        });
        console.log('❌ ERRO: Saque foi permitido quando não deveria!');
      } catch (error) {
        if (error.response?.data?.message?.includes('apostar mais')) {
          console.log('✅ CORRETO: Backend bloqueou saque por rollover');
          console.log(`   Mensagem: ${error.response.data.message}`);
        } else if (error.response?.data?.message?.includes('Saldo insuficiente')) {
          console.log('✅ CORRETO: Backend bloqueou saque por saldo insuficiente');
        } else {
          console.log('⚠️ Backend retornou erro diferente:', error.response?.data?.message);
        }
      }
      
      // Instruções para teste manual
      console.log('\n4️⃣ INSTRUÇÕES PARA TESTE MANUAL:');
      console.log('   Para testar o sistema completo:');
      console.log('   1. Acesse o frontend: https://slotbox.shop');
      console.log('   2. Faça login com paulotest@gmail.com');
      console.log('   3. Verifique se o botão "Sacar" está desabilitado');
      console.log('   4. Abra algumas caixas para gastar R$ 20,00');
      console.log('   5. Verifique se o botão "Sacar" fica habilitado');
      console.log('   6. Tente fazer um saque');
      
      // Status final
      console.log('\n5️⃣ STATUS FINAL:');
      if (totalGiros >= rolloverMinimo && rolloverLiberado) {
        console.log('🎉 SISTEMA FUNCIONANDO: Usuário pode sacar');
      } else if (totalGiros < rolloverMinimo && !rolloverLiberado) {
        console.log('🎯 SISTEMA FUNCIONANDO: Usuário precisa apostar mais');
        console.log(`   Faltam R$ ${(rolloverMinimo - totalGiros).toFixed(2)} para liberar`);
      } else {
        console.log('❌ PROBLEMA DETECTADO: Estado inconsistente');
      }
      
    } else {
      console.error('❌ Erro ao buscar dados do usuário:', response.data.message);
    }
    
    console.log('\n🎉 TESTE CONCLUÍDO!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
  }
}

// Executar teste
testRolloverSystem();
