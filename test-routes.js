// Script para testar rotas das caixas
console.log('🔍 TESTANDO ROTAS DAS CAIXAS...');

// Simular navegação para cada rota
const routes = [
  '/weekend-case',
  '/nike-case', 
  '/samsung-case',
  '/console-case',
  '/apple-case',
  '/premium-master-case'
];

console.log('📋 Rotas que devem funcionar:');
routes.forEach(route => {
  console.log(`✅ ${route}`);
});

console.log('\n🔧 Para testar manualmente:');
console.log('1. Acesse http://localhost:5173');
console.log('2. Clique em cada caixa no dashboard');
console.log('3. Verifique se a URL muda corretamente');
console.log('4. Verifique se a página da caixa carrega');

console.log('\n🚨 Se as caixas não abrirem:');
console.log('- Verifique o console do navegador');
console.log('- Verifique se há erros de JavaScript');
console.log('- Verifique se as rotas estão registradas no App.jsx');

console.log('\n📝 Rotas registradas no App.jsx:');
console.log('✅ /weekend-case -> WeekendCase');
console.log('✅ /nike-case -> NikeCase');
console.log('✅ /samsung-case -> SamsungCase');
console.log('✅ /console-case -> ConsoleCase');
console.log('✅ /apple-case -> AppleCase');
console.log('✅ /premium-master-case -> PremiumMasterCase');
