/**
 * CÓDIGO PARA COLA NO CONSOLE DO NAVEGADOR
 * 
 * Cole este código no console do navegador (F12 > Console)
 * e pressione Enter para executar
 */

(async function() {
  console.log('🔧 INICIANDO CORREÇÃO VIA CONSOLE...\n');
  
  try {
    // 1. Verificar status atual
    console.log('1️⃣ Verificando status atual...');
    const statusResponse = await fetch('https://slotbox-api.onrender.com/api/status-now');
    const statusData = await statusResponse.json();
    
    if (statusData.success) {
      console.log('✅ Status atual:');
      console.log(`   Usuário: ${statusData.data.user.email}`);
      console.log(`   Saldo: R$ ${statusData.data.user.saldo_reais}`);
      console.log(`   Afiliado: ${statusData.data.user.affiliate_id ? 'SIM' : 'NÃO'}`);
      console.log(`   Código usado: ${statusData.data.user.codigo_indicacao_usado || 'NENHUM'}`);
      console.log(`   Depósitos: ${statusData.data.deposits.length} encontrados`);
      
      statusData.data.deposits.forEach((dep, index) => {
        console.log(`     ${index + 1}. R$ ${dep.valor} - ${dep.status}`);
      });
    } else {
      console.error('❌ Erro ao verificar status:', statusData.error);
    }
    
    // 2. Executar correção
    console.log('\n2️⃣ Executando correção...');
    const fixResponse = await fetch('https://slotbox-api.onrender.com/api/fix-now', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const fixData = await fixResponse.json();
    
    if (fixData.success) {
      console.log('✅ Correção executada com sucesso!');
      console.log(`   Mensagem: ${fixData.message}`);
      console.log(`   Timestamp: ${fixData.timestamp}`);
    } else {
      console.error('❌ Erro na correção:', fixData.error);
    }
    
    // 3. Verificar status após correção
    console.log('\n3️⃣ Verificando status após correção...');
    const finalStatusResponse = await fetch('https://slotbox-api.onrender.com/api/status-now');
    const finalStatusData = await finalStatusResponse.json();
    
    if (finalStatusData.success) {
      console.log('✅ Status final:');
      console.log(`   Usuário: ${finalStatusData.data.user.email}`);
      console.log(`   Saldo: R$ ${finalStatusData.data.user.saldo_reais}`);
      console.log(`   Afiliado: ${finalStatusData.data.user.affiliate_id ? 'SIM' : 'NÃO'}`);
      console.log(`   Código usado: ${finalStatusData.data.user.codigo_indicacao_usado || 'NENHUM'}`);
      console.log(`   Depósitos: ${finalStatusData.data.deposits.length} encontrados`);
      
      finalStatusData.data.deposits.forEach((dep, index) => {
        console.log(`     ${index + 1}. R$ ${dep.valor} - ${dep.status}`);
      });
      
      // Verificar se houve mudança
      const saldoAntes = statusData.data.user.saldo_reais;
      const saldoDepois = finalStatusData.data.user.saldo_reais;
      
      if (saldoDepois > saldoAntes) {
        console.log(`\n🎉 SUCESSO! Saldo aumentou de R$ ${saldoAntes} para R$ ${saldoDepois}`);
        console.log(`   Diferença: R$ ${saldoDepois - saldoAntes}`);
      } else {
        console.log('\n⚠️ Saldo não mudou. Verifique se a correção foi necessária.');
      }
    } else {
      console.error('❌ Erro ao verificar status final:', finalStatusData.error);
    }
    
    console.log('\n🎉 CORREÇÃO CONCLUÍDA!');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
    console.log('\n💡 Dicas:');
    console.log('   - Verifique se o servidor está online');
    console.log('   - Tente novamente em alguns segundos');
    console.log('   - Verifique se as rotas estão funcionando');
  }
})();
