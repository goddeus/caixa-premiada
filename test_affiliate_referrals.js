/**
 * SCRIPT PARA TESTAR A CORREÇÃO DO MODAL DE AFILIADOS
 * 
 * Execute este script localmente para testar as correções
 */

const axios = require('axios');

const API_BASE_URL = 'https://slotbox-api.onrender.com/api';

async function testAffiliateReferrals() {
  try {
    console.log('🔧 TESTANDO CORREÇÃO DO MODAL DE AFILIADOS...\n');
    
    // 1. Verificar se a rota está funcionando
    console.log('1️⃣ Testando rota /affiliate/referrals...');
    const response = await axios.get(`${API_BASE_URL}/affiliate/referrals`);
    console.log('✅ Resposta:', JSON.stringify(response.data, null, 2));
    
    // 2. Verificar se há dados
    if (response.data.success && response.data.data.referrals) {
      const referrals = response.data.data.referrals;
      console.log(`\n2️⃣ Encontrados ${referrals.length} usuários indicados:`);
      
      referrals.forEach((referral, index) => {
        console.log(`\n   ${index + 1}. ${referral.usuario.nome}`);
        console.log(`      ID: ${referral.id}`);
        console.log(`      Email: ${referral.usuario.email}`);
        console.log(`      Valor Depositado: ${referral.valor_deposito ? `R$ ${referral.valor_deposito}` : 'N/A'}`);
        console.log(`      Data: ${new Date(referral.data_indicacao).toLocaleString('pt-BR')}`);
        console.log(`      Status: ${referral.deposito_valido ? 'Pago' : 'Pendente'}`);
        if (referral.comissao_gerada) {
          console.log(`      Comissão: R$ ${referral.comissao_gerada}`);
        }
      });
    } else {
      console.log('❌ Nenhum usuário indicado encontrado');
    }
    
    console.log('\n🎉 TESTE CONCLUÍDO!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
  }
}

// Executar teste
testAffiliateReferrals();
