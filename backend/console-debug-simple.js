// 🔍 CÓDIGO SIMPLES PARA CONSOLE DO NAVEGADOR
// Cole este código no console do navegador (F12)

console.log('🔍 DEBUG RÁPIDO - IPs E CONFIGURAÇÕES');

// 1. IP Público do Frontend
fetch('https://api.ipify.org?format=json')
  .then(r => r.json())
  .then(data => console.log('🌐 IP Público (Frontend):', data.ip))
  .catch(e => console.log('❌ Erro ao obter IP:', e.message));

// 2. Testar Backend
fetch('https://slotbox-api.onrender.com/api/pixup-test')
  .then(r => r.json())
  .then(data => console.log('🔌 Backend Status:', data))
  .catch(e => console.log('❌ Backend Error:', e.message));

// 3. Testar Rota de Depósito
fetch('https://slotbox-api.onrender.com/api/pixup/deposit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  },
  body: JSON.stringify({ userId: 'test', amount: 20 })
})
  .then(r => r.json())
  .then(data => console.log('💰 Deposit Route:', data))
  .catch(e => console.log('❌ Deposit Error:', e.message));

// 4. Informações do Navegador
console.log('🌐 Navegador:', navigator.userAgent);
console.log('🔗 URL Atual:', window.location.href);
console.log('💾 Token:', localStorage.getItem('token') ? 'Presente' : 'Ausente');

console.log('✅ Debug executado! Verifique os resultados acima.');

