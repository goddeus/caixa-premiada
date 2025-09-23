// 🔍 CÓDIGO SIMPLES PARA DESCOBRIR IP DO RENDER
// Cole este código no console do navegador (F12)

console.log('🔍 DESCOBRINDO IP REAL DO RENDER');

// Testar diferentes serviços de IP
const services = [
  'https://api.ipify.org?format=json',
  'https://ipapi.co/json/',
  'https://ipinfo.io/json',
  'https://httpbin.org/ip',
  'https://api.myip.com'
];

services.forEach(async (service) => {
  try {
    const response = await fetch(service);
    const data = await response.json();
    console.log(`🌐 ${service}:`, data);
  } catch (error) {
    console.log(`❌ ${service}:`, error.message);
  }
});

// Testar headers do backend
fetch('https://slotbox-api.onrender.com/api/pixup-test')
  .then(response => {
    console.log('📡 Headers do Backend:');
    for (let [key, value] of response.headers.entries()) {
      console.log(`  ${key}: ${value}`);
    }
  })
  .catch(error => console.log('❌ Erro headers:', error.message));

console.log('✅ Teste iniciado! Verifique os resultados acima.');

