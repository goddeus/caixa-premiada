// Script para manter o backend ativo no Render Free Tier
const https = require('https');

const BACKEND_URL = 'https://slotbox-api.onrender.com/api/health';
const PING_INTERVAL = 14 * 60 * 1000; // 14 minutos (antes dos 15min de sleep)

function pingBackend() {
  const now = new Date().toISOString();
  console.log(`[${now}] 🔄 Fazendo ping para manter backend ativo...`);
  
  https.get(BACKEND_URL, (res) => {
    console.log(`[${now}] ✅ Ping OK - Status: ${res.statusCode}`);
  }).on('error', (err) => {
    console.log(`[${now}] ❌ Ping Error:`, err.message);
  });
}

// Ping inicial
pingBackend();

// Ping a cada 14 minutos
setInterval(pingBackend, PING_INTERVAL);

console.log('🚀 Keep-alive iniciado! Backend será mantido ativo.');
console.log(`⏰ Ping a cada ${PING_INTERVAL / 60000} minutos`);
