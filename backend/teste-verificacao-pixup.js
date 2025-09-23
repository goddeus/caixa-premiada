// 🧪 SCRIPT DE TESTE - VERIFICAR SE PROBLEMA FOI RESOLVIDO
// Cole este código no console do navegador (F12) e execute

console.log('🧪 TESTE DE VERIFICAÇÃO - PROBLEMA RESOLVIDO?');
console.log('==============================================');

async function testarPixup() {
  try {
    console.log('\n🔍 TESTE 1: Verificar IPs atuais');
    console.log('--------------------------------');
    
    // Verificar IPs atuais
    try {
      const backendResponse = await fetch('https://slotbox-api.onrender.com/api/pixup-test');
      const backendData = await backendResponse.json();
      
      if (backendData.ipInfo) {
        console.log('📋 IPs ATUAIS:');
        console.log('Client IP:', backendData.ipInfo.clientIP);
        console.log('X-Forwarded-For:', backendData.ipInfo.xForwardedFor);
        console.log('CF-Connecting-IP:', backendData.ipInfo.cfConnectingIP);
        console.log('True-Client-IP:', backendData.ipInfo.allHeaders['true-client-ip']);
        console.log('CF-Ray:', backendData.ipInfo.cfRay);
        
        // Analisar cadeia de IPs
        const forwardedIPs = backendData.ipInfo.xForwardedFor?.split(',') || [];
        console.log('\n🔗 CADEIA DE IPs:');
        forwardedIPs.forEach((ip, index) => {
          console.log(`  ${index + 1}. ${ip.trim()}`);
        });
      }
    } catch (error) {
      console.log('❌ Erro ao verificar IPs:', error.message);
    }
    
    console.log('\n🧪 TESTE 2: Testar autenticação Pixup');
    console.log('------------------------------------');
    
    // Testar autenticação diretamente
    try {
      const authResponse = await fetch('https://slotbox-api.onrender.com/api/pixup-test');
      const authData = await authResponse.json();
      
      if (authData.success) {
        console.log('✅ Autenticação básica funcionando');
        console.log('Configurações:', authData.config);
      } else {
        console.log('❌ Problema na autenticação básica');
      }
    } catch (error) {
      console.log('❌ Erro na autenticação:', error.message);
    }
    
    console.log('\n🧪 TESTE 3: Testar criação de depósito');
    console.log('--------------------------------------');
    
    // Testar criação de depósito
    try {
      const depositResponse = await fetch('https://slotbox-api.onrender.com/api/pixup/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || 'test-token'}`
        },
        body: JSON.stringify({
          userId: 'test-user-id',
          amount: 20
        })
      });
      
      console.log('📊 Status da requisição:', depositResponse.status);
      
      if (depositResponse.status === 200) {
        const successData = await depositResponse.json();
        console.log('🎉 SUCESSO! Depósito criado:');
        console.log('QR Code:', successData.qrCode ? 'Presente' : 'Ausente');
        console.log('Transaction ID:', successData.transaction_id);
        console.log('Amount:', successData.amount);
        console.log('\n✅ PROBLEMA RESOLVIDO! Sistema funcionando!');
        
      } else if (depositResponse.status === 500) {
        const errorData = await depositResponse.json();
        console.log('❌ Erro na requisição:', errorData);
        
        if (errorData.message?.includes('IP bloqueado')) {
          console.log('\n🚨 AINDA BLOQUEADO!');
          console.log('💡 Verifique se o IP foi adicionado corretamente na Pixup');
          console.log('💡 Pode levar alguns minutos para propagar');
        } else {
          console.log('\n⚠️ Outro tipo de erro - não é mais IP bloqueado');
        }
        
      } else {
        console.log('⚠️ Status inesperado:', depositResponse.status);
        const responseData = await depositResponse.json();
        console.log('Resposta:', responseData);
      }
      
    } catch (error) {
      console.log('❌ Erro na requisição de depósito:', error.message);
    }
    
    console.log('\n🧪 TESTE 4: Testar com usuário real');
    console.log('----------------------------------');
    
    // Testar com usuário real se estiver logado
    const userToken = localStorage.getItem('token');
    if (userToken) {
      try {
        console.log('🔐 Usuário logado detectado, testando com dados reais...');
        
        const realDepositResponse = await fetch('https://slotbox-api.onrender.com/api/pixup/deposit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`
          },
          body: JSON.stringify({
            userId: '2a3eb9e5-5c7e-4602-bd06-4302dd47c75f', // ID do usuário logado
            amount: 20
          })
        });
        
        console.log('📊 Status da requisição real:', realDepositResponse.status);
        
        if (realDepositResponse.status === 200) {
          const realSuccessData = await realDepositResponse.json();
          console.log('🎉 SUCESSO TOTAL! Depósito real criado:');
          console.log('QR Code:', realSuccessData.qrCode ? 'Presente' : 'Ausente');
          console.log('QR Code Image:', realSuccessData.qrCodeImage ? 'Presente' : 'Ausente');
          console.log('Transaction ID:', realSuccessData.transaction_id);
          console.log('Amount:', realSuccessData.amount);
          console.log('Expires At:', realSuccessData.expires_at);
          console.log('\n🚀 SISTEMA TOTALMENTE FUNCIONAL!');
          
        } else if (realDepositResponse.status === 500) {
          const realErrorData = await realDepositResponse.json();
          console.log('❌ Erro na requisição real:', realErrorData);
          
          if (realErrorData.message?.includes('IP bloqueado')) {
            console.log('\n🚨 AINDA BLOQUEADO COM USUÁRIO REAL!');
          } else {
            console.log('\n⚠️ Outro erro com usuário real');
          }
        }
        
      } catch (error) {
        console.log('❌ Erro na requisição real:', error.message);
      }
    } else {
      console.log('ℹ️ Usuário não logado - pulando teste com dados reais');
    }
    
  } catch (error) {
    console.log('❌ Erro geral no teste:', error.message);
  }
}

// Executar teste
testarPixup().then(() => {
  console.log('\n✅ TESTE CONCLUÍDO!');
  console.log('📋 Verifique os resultados acima');
  console.log('🎯 Se aparecer "SUCESSO" ou "FUNCIONAL", o problema foi resolvido!');
}).catch(error => {
  console.log('❌ Erro no teste:', error.message);
});
