/**
 * CÓDIGO PARA ATUALIZAR DADOS DO USUÁRIO NO FRONTEND
 * 
 * Cole este código no console do navegador (F12 > Console)
 * e pressione Enter para executar
 */

(async function() {
  console.log('🔄 ATUALIZANDO DADOS DO USUÁRIO NO FRONTEND...\n');
  
  try {
    const userId = '6f73f55f-f9d6-4108-8838-ab76407d7e63';
    
    // 1. Buscar dados atualizados do backend
    console.log('1️⃣ Buscando dados atualizados do backend...');
    const response = await fetch(`https://slotbox-api.onrender.com/api/refresh-user/${userId}`);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Dados atualizados do backend:');
      console.log(`   Usuário: ${data.data.user.email}`);
      console.log(`   Saldo: R$ ${data.data.user.saldo_reais}`);
      console.log(`   Tipo: ${data.data.user.tipo_conta}`);
      console.log(`   Afiliado: ${data.data.user.affiliate_id ? 'SIM' : 'NÃO'}`);
      
      // 2. Atualizar localStorage
      console.log('\n2️⃣ Atualizando localStorage...');
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...currentUser, ...data.data.user };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      console.log('✅ localStorage atualizado');
      
      // 3. Forçar atualização do React (se possível)
      console.log('\n3️⃣ Tentando forçar atualização do React...');
      
      // Verificar se há uma instância do React disponível
      if (window.React && window.ReactDOM) {
        console.log('✅ React encontrado, tentando forçar re-render...');
        
        // Disparar evento customizado para forçar atualização
        window.dispatchEvent(new CustomEvent('userDataUpdated', {
          detail: { user: updatedUser }
        }));
        
        console.log('✅ Evento de atualização disparado');
      } else {
        console.log('⚠️ React não encontrado, apenas localStorage foi atualizado');
      }
      
      // 4. Verificar se a atualização funcionou
      console.log('\n4️⃣ Verificando se a atualização funcionou...');
      
      // Aguardar um pouco para o React processar
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verificar se o saldo aparece na interface
      const balanceElements = document.querySelectorAll('[class*="balance"], [class*="saldo"], [class*="wallet"]');
      console.log(`   Elementos de saldo encontrados: ${balanceElements.length}`);
      
      balanceElements.forEach((el, index) => {
        console.log(`   ${index + 1}. ${el.textContent} (${el.className})`);
      });
      
      // 5. Instruções para o usuário
      console.log('\n5️⃣ INSTRUÇÕES:');
      console.log('   ✅ Dados atualizados no localStorage');
      console.log('   ✅ Saldo correto: R$ ' + data.data.user.saldo_reais);
      console.log('   📱 Se o saldo ainda não aparecer:');
      console.log('      1. Recarregue a página (F5)');
      console.log('      2. Ou faça logout e login novamente');
      console.log('      3. Ou aguarde alguns segundos para o React atualizar');
      
      console.log('\n🎉 ATUALIZAÇÃO CONCLUÍDA!');
      console.log('💡 O saldo correto agora está no localStorage e deve aparecer na interface!');
      
    } else {
      console.error('❌ Erro ao buscar dados:', data.message);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
    console.log('\n💡 Dicas:');
    console.log('   - Verifique se o servidor está online');
    console.log('   - Tente recarregar a página (F5)');
    console.log('   - Verifique se está logado corretamente');
  }
})();
