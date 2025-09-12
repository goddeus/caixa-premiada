const { spawn } = require('child_process');
const axios = require('axios');

console.log('🚀 Iniciando servidor com ngrok...');

// Iniciar servidor
const server = spawn('node', ['src/server.js'], {
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'production' }
});

// Aguardar servidor iniciar
setTimeout(async () => {
  try {
    // Verificar se servidor está rodando
    await axios.get('http://localhost:3001/health');
    console.log('✅ Servidor rodando na porta 3001');
    
    // Iniciar ngrok
    const ngrok = spawn('ngrok', ['http', '3001'], {
      stdio: 'pipe'
    });
    
    ngrok.stdout.on('data', (data) => {
      const output = data.toString();
      console.log('ngrok:', output);
      
      // Extrair URL do ngrok
      const urlMatch = output.match(/https:\/\/[a-z0-9]+\.ngrok\.io/);
      if (urlMatch) {
        const ngrokUrl = urlMatch[0];
        console.log('\n🌐 URL pública gerada:', ngrokUrl);
        console.log('📋 Configure no VizzionPay:');
        console.log(`   Webhook URL: ${ngrokUrl}/webhooks/vizzionpay`);
        console.log(`   Redirect URL: ${ngrokUrl}`);
        console.log('\n🔗 Acesse o frontend em:', ngrokUrl);
      }
    });
    
    ngrok.stderr.on('data', (data) => {
      console.error('ngrok error:', data.toString());
    });
    
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error.message);
  }
}, 3000);

// Cleanup
process.on('SIGINT', () => {
  console.log('\n🛑 Parando servidor...');
  server.kill();
  process.exit();
});
