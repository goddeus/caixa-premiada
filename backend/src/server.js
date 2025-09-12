// ... existing code ...

// Setup inicial do banco (executar apenas uma vez)
if (process.env.RUN_SETUP === 'true') {
  console.log('🔧 EXECUTANDO SETUP INICIAL DO BANCO...');
  
  const { setupDatabase } = require('../setup-database');
  setupDatabase().then(() => {
    console.log('✅ Setup concluído! Removendo variável RUN_SETUP...');
    // Não removemos automaticamente para evitar loops
    console.log('⚠️  LEMBRE-SE: Remover RUN_SETUP=true das Environment Variables!');
  }).catch(error => {
    console.error('❌ Erro no setup:', error);
  });
}

// ... existing code ...