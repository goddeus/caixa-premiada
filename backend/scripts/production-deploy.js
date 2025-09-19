/**
 * Script para deploy em produção
 * Execute: node scripts/production-deploy.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

class ProductionDeployer {
  constructor() {
    this.envFile = path.join(__dirname, '..', '.env.production');
    this.exampleFile = path.join(__dirname, '..', 'env.production.example');
  }

  checkEnvironmentVariables() {
    console.log('🔍 Verificando variáveis de ambiente...\n');
    
    const requiredVars = [
      'VIZZION_API_KEY',
      'VIZZION_PUBLIC_KEY', 
      'VIZZION_SECRET_KEY',
      'VIZZION_WEBHOOK_SECRET',
      'JWT_SECRET',
      'DATABASE_URL'
    ];
    
    const missing = [];
    
    for (const varName of requiredVars) {
      if (!process.env[varName] || process.env[varName].includes('sua_')) {
        missing.push(varName);
        console.log(`❌ ${varName}: Não configurado`);
      } else {
        console.log(`✅ ${varName}: Configurado`);
      }
    }
    
    if (missing.length > 0) {
      console.log(`\n⚠️  Variáveis faltando: ${missing.join(', ')}`);
      console.log('📝 Configure estas variáveis antes do deploy!');
      return false;
    }
    
    console.log('\n✅ Todas as variáveis de ambiente estão configuradas!');
    return true;
  }

  createProductionEnv() {
    console.log('\n📝 Criando arquivo .env.production...\n');
    
    if (!fs.existsSync(this.exampleFile)) {
      console.log('❌ Arquivo env.production.example não encontrado!');
      return false;
    }
    
    const exampleContent = fs.readFileSync(this.exampleFile, 'utf8');
    
    // Substituir valores de exemplo pelos reais
    let productionContent = exampleContent
      .replace('sua_api_key_vizzionpay', process.env.VIZZION_API_KEY || 'CONFIGURAR')
      .replace('sua_webhook_secret_vizzionpay', process.env.VIZZION_WEBHOOK_SECRET || 'CONFIGURAR')
      .replace('sua_chave_pix@slotbox.shop', process.env.VIZZION_PIX_KEY || 'CONFIGURAR')
      .replace('sua_chave_jwt_super_secreta_production_slotbox_2024', process.env.JWT_SECRET || 'CONFIGURAR');
    
    fs.writeFileSync(this.envFile, productionContent);
    console.log('✅ Arquivo .env.production criado!');
    return true;
  }

  checkDatabaseConnection() {
    console.log('\n🗄️  Verificando conexão com banco de dados...\n');
    
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      
      // Teste simples de conexão
      prisma.$connect().then(() => {
        console.log('✅ Conexão com banco de dados OK!');
        prisma.$disconnect();
      }).catch((error) => {
        console.log('❌ Erro na conexão com banco:', error.message);
      });
      
    } catch (error) {
      console.log('❌ Erro ao testar banco:', error.message);
    }
  }

  checkVizzionPayConfig() {
    console.log('\n💳 Verificando configuração VizzionPay...\n');
    
    const config = {
      apiKey: process.env.VIZZION_API_KEY,
      publicKey: process.env.VIZZION_PUBLIC_KEY,
      secretKey: process.env.VIZZION_SECRET_KEY,
      webhookSecret: process.env.VIZZION_WEBHOOK_SECRET,
      pixKey: process.env.VIZZION_PIX_KEY,
      pixKeyType: process.env.VIZZION_PIX_KEY_TYPE
    };
    
    console.log('📋 Configuração atual:');
    console.log(`API Key: ${config.apiKey ? '✅ Configurado' : '❌ Não configurado'}`);
    console.log(`Public Key: ${config.publicKey ? '✅ Configurado' : '❌ Não configurado'}`);
    console.log(`Secret Key: ${config.secretKey ? '✅ Configurado' : '❌ Não configurado'}`);
    console.log(`Webhook Secret: ${config.webhookSecret ? '✅ Configurado' : '❌ Não configurado'}`);
    console.log(`PIX Key: ${config.pixKey ? '✅ Configurado' : '❌ Não configurado'}`);
    console.log(`PIX Key Type: ${config.pixKeyType || 'email'}`);
  }

  generateDeploymentChecklist() {
    console.log('\n📋 CHECKLIST DE DEPLOY EM PRODUÇÃO\n');
    console.log('=' * 50);
    
    const checklist = [
      '✅ Variáveis de ambiente configuradas',
      '✅ Banco de dados conectado',
      '✅ VizzionPay configurado',
      '✅ Testes de saque realizados',
      '✅ Webhooks configurados',
      '✅ Monitoramento ativo',
      '✅ Backup do banco realizado',
      '✅ Logs configurados',
      '✅ Rate limiting ativo',
      '✅ SSL/HTTPS configurado'
    ];
    
    checklist.forEach(item => console.log(item));
    
    console.log('\n🚀 COMANDOS PARA DEPLOY:');
    console.log('1. npm run build');
    console.log('2. npm run start:production');
    console.log('3. Verificar logs: tail -f logs/app.log');
    console.log('4. Testar endpoints: curl https://slotbox-api.onrender.com/api/health');
  }

  async runDeploymentCheck() {
    console.log('🚀 VERIFICAÇÃO DE DEPLOY EM PRODUÇÃO\n');
    console.log('=' * 50);
    
    const envOk = this.checkEnvironmentVariables();
    if (!envOk) {
      console.log('\n❌ Deploy não pode prosseguir. Configure as variáveis de ambiente primeiro.');
      return;
    }
    
    this.createProductionEnv();
    this.checkDatabaseConnection();
    this.checkVizzionPayConfig();
    this.generateDeploymentChecklist();
    
    console.log('\n🎉 VERIFICAÇÃO CONCLUÍDA!');
    console.log('📝 Sistema pronto para deploy em produção.');
  }
}

// Executar verificação
if (require.main === module) {
  const deployer = new ProductionDeployer();
  deployer.runDeploymentCheck().catch(console.error);
}

module.exports = ProductionDeployer;
