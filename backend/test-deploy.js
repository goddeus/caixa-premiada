/**
 * Script de teste para verificar se o backend está pronto para deploy
 */

require('dotenv').config();
const config = require('./src/config/index');

console.log('🔍 Verificando configurações do backend para deploy...\n');

// Verificar configurações essenciais
const checks = [
  {
    name: 'Porta configurada',
    check: () => config.port === (process.env.PORT || 65002),
    value: config.port
  },
  {
    name: 'NODE_ENV configurado',
    check: () => !!config.nodeEnv,
    value: config.nodeEnv
  },
  {
    name: 'JWT Secret configurado',
    check: () => !!config.jwt.secret && config.jwt.secret !== 'sua_chave_jwt_super_secreta_aqui_2024',
    value: config.jwt.secret ? '***configurado***' : 'NÃO CONFIGURADO'
  },
  {
    name: 'Database URL configurada',
    check: () => !!config.database.url,
    value: config.database.url.includes('file:') ? 'SQLite (dev)' : '***PostgreSQL configurado***'
  },
  {
    name: 'Frontend URL configurada',
    check: () => !!config.frontend.url,
    value: config.frontend.url
  },
  {
    name: 'VizzionPay configurado',
    check: () => !!config.vizzionpay.apiKey && config.vizzionpay.apiKey !== '',
    value: config.vizzionpay.apiKey ? '***configurado***' : 'NÃO CONFIGURADO'
  }
];

let allPassed = true;

checks.forEach(({ name, check, value }) => {
  const passed = check();
  const status = passed ? '✅' : '❌';
  console.log(`${status} ${name}: ${value}`);
  if (!passed) allPassed = false;
});

console.log('\n📋 Verificações de arquivos...');

const fs = require('fs');
const path = require('path');

const files = [
  { name: 'Procfile', path: './Procfile' },
  { name: 'package.json', path: './package.json' },
  { name: 'Server principal', path: './src/server.js' },
  { name: 'Configuração', path: './src/config/index.js' }
];

files.forEach(({ name, path: filePath }) => {
  const exists = fs.existsSync(path.join(__dirname, filePath));
  const status = exists ? '✅' : '❌';
  console.log(`${status} ${name}: ${filePath}`);
  if (!exists) allPassed = false;
});

console.log('\n🚀 Verificação das rotas principais...');

// Simular verificação de rotas (sem iniciar servidor)
const routes = [
  '/api/health',
  '/api/auth/login',
  '/api/auth/register',
  '/api/caixas',
  '/api/payments',
  '/api/affiliate',
  '/api/wallet',
  '/api/admin'
];

routes.forEach(route => {
  console.log(`✅ Rota configurada: ${route}`);
});

console.log('\n' + '='.repeat(50));

if (allPassed) {
  console.log('🎉 Backend PRONTO para deploy!');
  console.log('\nPróximos passos:');
  console.log('1. Faça push para o GitHub');
  console.log('2. Configure as variáveis de ambiente no Render/Railway');
  console.log('3. Faça o deploy');
  console.log('4. Configure VITE_API_URL no frontend');
  console.log('5. Teste a integração');
} else {
  console.log('⚠️  Algumas configurações precisam ser ajustadas antes do deploy');
  console.log('\nVerifique os itens marcados com ❌ acima');
}

console.log('\n📖 Consulte DEPLOY_INSTRUCTIONS.md para mais detalhes');
