/**
 * SCRIPT PARA TESTAR A CORREÇÃO DO ROLLOVER
 * 
 * Execute este script localmente para testar as correções
 */

const axios = require('axios');

const API_BASE_URL = 'https://slotbox-api.onrender.com/api';

async function testRolloverFix() {
  try {
    console.log('🔧 TESTANDO CORREÇÃO DO ROLLOVER...\n');
    
    // 1. Verificar status atual do usuário
    console.log('1️⃣ Verificando status atual do usuário...');
    const response = await axios.get(`${API_BASE_URL}/refresh-user/6f73f55f-f9d6-4108-8838-ab76407d7e63`);
    
    if (response.data.success) {
      const user = response.data.data.user;
      console.log('✅ Status atual:');
      console.log(`   Usuário: ${user.email}`);
      console.log(`   Saldo: R$ ${user.saldo_reais}`);
      console.log(`   Total giros: R$ ${user.total_giros || 0}`);
      console.log(`   Rollover mínimo: R$ ${user.rollover_minimo || 20}`);
      console.log(`   Rollover liberado: ${user.rollover_liberado ? 'SIM' : 'NÃO'}`);
      
      // Verificar se o rollover está correto
      const totalGiros = user.total_giros || 0;
      const rolloverMinimo = user.rollover_minimo || 20;
      const rolloverLiberado = user.rollover_liberado;
      
      console.log('\n2️⃣ Análise do rollover:');
      console.log(`   Total giros: R$ ${totalGiros.toFixed(2)}`);
      console.log(`   Rollover mínimo: R$ ${rolloverMinimo.toFixed(2)}`);
      console.log(`   Progresso: ${((totalGiros / rolloverMinimo) * 100).toFixed(1)}%`);
      
      if (totalGiros >= rolloverMinimo && rolloverLiberado) {
        console.log('✅ Rollover está correto! Usuário pode sacar.');
      } else if (totalGiros >= rolloverMinimo && !rolloverLiberado) {
        console.log('❌ PROBLEMA: Usuário bateu o rollover mas não está liberado!');
      } else if (totalGiros < rolloverMinimo && !rolloverLiberado) {
        console.log('✅ Rollover está correto! Usuário ainda não bateu o rollover.');
      } else {
        console.log('❌ PROBLEMA: Usuário não bateu o rollover mas está liberado!');
      }
      
      // Verificar se o botão de saque deveria estar disponível
      console.log('\n3️⃣ Verificação do botão de saque:');
      if (rolloverLiberado) {
        console.log('✅ Botão de saque DEVE estar disponível');
      } else {
        console.log('❌ Botão de saque NÃO DEVE estar disponível');
        console.log(`   Faltam R$ ${(rolloverMinimo - totalGiros).toFixed(2)} para liberar`);
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
testRolloverFix();
