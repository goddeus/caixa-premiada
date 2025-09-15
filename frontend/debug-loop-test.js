// 🔍 SCRIPT DE TESTE PARA VERIFICAR SE O LOOP FOI RESOLVIDO
// Cole este código no console do navegador após as correções

console.log('🧪 Iniciando teste de loop infinito...');

// Contador de requisições
let requestCount = 0;
let lastRequestTime = Date.now();
let requestLog = [];

// Interceptar todas as requisições
const originalFetch = window.fetch;
window.fetch = function(...args) {
  requestCount++;
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  requestLog.push({
    count: requestCount,
    url: args[0],
    timestamp: now,
    timeSinceLastRequest: timeSinceLastRequest
  });
  
  console.log(`📡 REQUEST #${requestCount}: ${args[0]} (${timeSinceLastRequest}ms desde última)`);
  lastRequestTime = now;
  
  return originalFetch.apply(this, args);
};

// Interceptar XMLHttpRequest
const originalXHR = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(method, url, ...args) {
  requestCount++;
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  requestLog.push({
    count: requestCount,
    method: method,
    url: url,
    timestamp: now,
    timeSinceLastRequest: timeSinceLastRequest
  });
  
  console.log(`📡 XHR #${requestCount}: ${method} ${url} (${timeSinceLastRequest}ms desde última)`);
  lastRequestTime = now;
  
  return originalXHR.apply(this, [method, url, ...args]);
};

// Função para analisar resultados
window.analyzeLoopTest = function() {
  console.log('\n📊 ANÁLISE DO TESTE:');
  console.log(`Total de requisições: ${requestCount}`);
  
  // Verificar se há muitas requisições em pouco tempo
  const recentRequests = requestLog.filter(req => {
    const timeSince = Date.now() - req.timestamp;
    return timeSince < 10000; // Últimos 10 segundos
  });
  
  console.log(`Requisições nos últimos 10 segundos: ${recentRequests.length}`);
  
  if (recentRequests.length > 5) {
    console.log('⚠️ POSSÍVEL LOOP AINDA EXISTE!');
    console.log('Requisições recentes:');
    recentRequests.forEach(req => {
      const url = req.url || `${req.method} ${req.url}`;
      console.log(`  - ${url} (${req.timeSinceLastRequest}ms)`);
    });
  } else {
    console.log('✅ LOOP APARENTEMENTE RESOLVIDO!');
  }
  
  return {
    totalRequests: requestCount,
    recentRequests: recentRequests.length,
    requestLog: requestLog
  };
};

// Auto-análise a cada 10 segundos
let testInterval = setInterval(() => {
  const analysis = window.analyzeLoopTest();
  if (analysis.recentRequests > 5) {
    console.log('🚨 ALERTA: Muitas requisições detectadas!');
  }
}, 10000);

// Função para parar o teste
window.stopLoopTest = function() {
  clearInterval(testInterval);
  window.fetch = originalFetch;
  XMLHttpRequest.prototype.open = originalXHR;
  console.log('🛑 Teste de loop interrompido!');
};

console.log('✅ Script de teste carregado!');
console.log('📋 Comandos disponíveis:');
console.log('  - analyzeLoopTest() - Analisar resultados do teste');
console.log('  - stopLoopTest() - Parar o teste');
console.log('\n🎯 Agora navegue para as caixas e observe se há loops...');
