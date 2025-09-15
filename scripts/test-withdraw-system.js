/**
 * Script de Teste - Sistema de Saques
 * Testa funcionalidades de saque, validações e webhooks
 */

require('dotenv').config({ path: 'backend/.env.production' });
const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const prisma = new PrismaClient();

class WithdrawSystemTester {
  constructor() {
    this.apiUrl = process.env.API_URL || 'http://localhost:3001';
    this.testResults = [];
  }

  /**
   * Executar todos os testes
   */
  async runAllTests() {
    console.log('🧪 Iniciando testes do sistema de saques...\n');

    try {
      // Criar usuário de teste
      const testUser = await this.createTestUser();
      
      // Executar testes
      await this.testWithdrawValidation();
      await this.testWithdrawCreation(testUser);
      await this.testWithdrawLimits(testUser);
      await this.testWithdrawHistory(testUser);
      await this.testWithdrawWebhook();
      await this.testAdminStats();
      
      // Limpar dados de teste
      await this.cleanupTestData(testUser);
      
      // Relatório final
      this.generateReport();
      
    } catch (error) {
      console.error('❌ Erro durante execução dos testes:', error);
    } finally {
      await prisma.$disconnect();
    }
  }

  /**
   * Criar usuário de teste
   */
  async createTestUser() {
    console.log('👤 Criando usuário de teste...');
    
    const testUser = await prisma.user.create({
      data: {
        email: `test-withdraw-${Date.now()}@example.com`,
        senha: 'hashedpassword',
        nome: 'Test Withdraw User',
        tipo_conta: 'normal',
        saldo_reais: 1000.00,
        saldo_demo: 0,
        cpf: '12345678901'
      }
    });

    await prisma.wallet.create({
      data: {
        user_id: testUser.id,
        saldo_reais: 1000.00,
        saldo_demo: 0
      }
    });

    console.log(`✅ Usuário de teste criado: ${testUser.id}`);
    return testUser;
  }

  /**
   * Testar validações de saque
   */
  async testWithdrawValidation() {
    console.log('\n🔍 Testando validações de saque...');
    
    const testCases = [
      {
        name: 'Valor muito baixo',
        data: { amount: 10, pixKey: 'test@example.com', pixKeyType: 'email' },
        expectedError: 'Valor mínimo'
      },
      {
        name: 'Valor muito alto',
        data: { amount: 10000, pixKey: 'test@example.com', pixKeyType: 'email' },
        expectedError: 'Valor máximo'
      },
      {
        name: 'Chave PIX inválida',
        data: { amount: 100, pixKey: 'invalid-email', pixKeyType: 'email' },
        expectedError: 'Chave PIX inválida'
      },
      {
        name: 'Dados obrigatórios faltando',
        data: { amount: 100 },
        expectedError: 'obrigatório'
      }
    ];

    for (const testCase of testCases) {
      try {
        const response = await axios.post(`${this.apiUrl}/api/withdraw/pix`, testCase.data, {
          headers: { 'Authorization': 'Bearer test-token' }
        });
        
        this.addTestResult(testCase.name, false, 'Deveria ter falhado mas passou');
      } catch (error) {
        const hasExpectedError = error.response?.data?.error?.includes(testCase.expectedError);
        this.addTestResult(testCase.name, hasExpectedError, hasExpectedError ? 'OK' : error.response?.data?.error);
      }
    }
  }

  /**
   * Testar criação de saque
   */
  async testWithdrawCreation(testUser) {
    console.log('\n💰 Testando criação de saque...');
    
    try {
      // Fazer login para obter token
      const loginResponse = await axios.post(`${this.apiUrl}/api/auth/login`, {
        email: testUser.email,
        senha: 'hashedpassword'
      });
      
      const token = loginResponse.data.token;
      
      // Criar saque válido
      const withdrawData = {
        userId: testUser.id,
        amount: 100.00,
        pixKey: 'test@example.com',
        pixKeyType: 'email'
      };
      
      const response = await axios.post(`${this.apiUrl}/api/withdraw/pix`, withdrawData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const success = response.status === 200 && response.data.success;
      this.addTestResult('Criação de saque válido', success, success ? 'OK' : response.data);
      
      // Verificar se saldo foi debitado
      const updatedUser = await prisma.user.findUnique({
        where: { id: testUser.id }
      });
      
      const balanceCorrect = updatedUser.saldo_reais === 900.00;
      this.addTestResult('Débito de saldo', balanceCorrect, balanceCorrect ? 'OK' : `Saldo: ${updatedUser.saldo_reais}`);
      
    } catch (error) {
      this.addTestResult('Criação de saque válido', false, error.response?.data?.error || error.message);
    }
  }

  /**
   * Testar limites de saque
   */
  async testWithdrawLimits(testUser) {
    console.log('\n🚫 Testando limites de saque...');
    
    try {
      // Fazer login
      const loginResponse = await axios.post(`${this.apiUrl}/api/auth/login`, {
        email: testUser.email,
        senha: 'hashedpassword'
      });
      
      const token = loginResponse.data.token;
      
      // Tentar saque com saldo insuficiente
      const withdrawData = {
        userId: testUser.id,
        amount: 1000.00, // Mais que o saldo disponível
        pixKey: 'test@example.com',
        pixKeyType: 'email'
      };
      
      try {
        await axios.post(`${this.apiUrl}/api/withdraw/pix`, withdrawData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        this.addTestResult('Limite de saldo insuficiente', false, 'Deveria ter falhado');
      } catch (error) {
        const hasExpectedError = error.response?.data?.error?.includes('Saldo insuficiente');
        this.addTestResult('Limite de saldo insuficiente', hasExpectedError, hasExpectedError ? 'OK' : error.response?.data?.error);
      }
      
    } catch (error) {
      this.addTestResult('Limite de saldo insuficiente', false, error.message);
    }
  }

  /**
   * Testar histórico de saques
   */
  async testWithdrawHistory(testUser) {
    console.log('\n📋 Testando histórico de saques...');
    
    try {
      // Fazer login
      const loginResponse = await axios.post(`${this.apiUrl}/api/auth/login`, {
        email: testUser.email,
        senha: 'hashedpassword'
      });
      
      const token = loginResponse.data.token;
      
      // Obter histórico
      const response = await axios.get(`${this.apiUrl}/api/withdraw/history/${testUser.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const success = response.status === 200 && response.data.success;
      this.addTestResult('Histórico de saques', success, success ? 'OK' : response.data);
      
    } catch (error) {
      this.addTestResult('Histórico de saques', false, error.response?.data?.error || error.message);
    }
  }

  /**
   * Testar webhook de saque
   */
  async testWithdrawWebhook() {
    console.log('\n🔗 Testando webhook de saque...');
    
    try {
      // Simular webhook de saque aprovado
      const webhookData = {
        identifier: 'withdraw_test_1234567890',
        status: 'approved',
        transactionId: 'vizzion_test_123'
      };
      
      const response = await axios.post(`${this.apiUrl}/api/webhook/withdraw`, webhookData, {
        headers: {
          'x-public-key': process.env.VIZZION_PUBLIC_KEY,
          'x-secret-key': process.env.VIZZION_SECRET_KEY
        }
      });
      
      const success = response.status === 200;
      this.addTestResult('Webhook de saque', success, success ? 'OK' : response.data);
      
    } catch (error) {
      // Webhook pode falhar se não encontrar a transação (comportamento esperado)
      const expectedError = error.response?.status === 404;
      this.addTestResult('Webhook de saque', expectedError, expectedError ? 'OK (transação não encontrada)' : error.response?.data?.error);
    }
  }

  /**
   * Testar estatísticas admin
   */
  async testAdminStats() {
    console.log('\n📊 Testando estatísticas admin...');
    
    try {
      // Tentar acessar sem token admin (deve falhar)
      try {
        await axios.get(`${this.apiUrl}/api/withdraw/stats`);
        this.addTestResult('Proteção admin', false, 'Deveria ter falhado');
      } catch (error) {
        const hasAuthError = error.response?.status === 401;
        this.addTestResult('Proteção admin', hasAuthError, hasAuthError ? 'OK' : error.response?.data?.error);
      }
      
    } catch (error) {
      this.addTestResult('Proteção admin', false, error.message);
    }
  }

  /**
   * Limpar dados de teste
   */
  async cleanupTestData(testUser) {
    console.log('\n🧹 Limpando dados de teste...');
    
    try {
      await prisma.transaction.deleteMany({
        where: { user_id: testUser.id }
      });
      
      await prisma.wallet.deleteMany({
        where: { user_id: testUser.id }
      });
      
      await prisma.user.deleteMany({
        where: { id: testUser.id }
      });
      
      console.log('✅ Dados de teste limpos');
    } catch (error) {
      console.error('❌ Erro ao limpar dados de teste:', error);
    }
  }

  /**
   * Adicionar resultado de teste
   */
  addTestResult(testName, passed, message) {
    this.testResults.push({
      test: testName,
      passed,
      message
    });
    
    const status = passed ? '✅' : '❌';
    console.log(`  ${status} ${testName}: ${message}`);
  }

  /**
   * Gerar relatório final
   */
  generateReport() {
    console.log('\n📋 RELATÓRIO FINAL DOS TESTES DE SAQUE:');
    console.log('=' .repeat(50));
    
    const passed = this.testResults.filter(r => r.passed).length;
    const total = this.testResults.length;
    const percentage = ((passed / total) * 100).toFixed(1);
    
    console.log(`📊 Resultados: ${passed}/${total} (${percentage}%)`);
    console.log('');
    
    this.testResults.forEach(result => {
      const status = result.passed ? '✅' : '❌';
      console.log(`${status} ${result.test}: ${result.message}`);
    });
    
    console.log('\n' + '=' .repeat(50));
    
    if (percentage >= 80) {
      console.log('🎉 Sistema de saques funcionando corretamente!');
    } else {
      console.log('⚠️ Sistema de saques precisa de correções');
    }
    
    // Salvar relatório em arquivo
    const fs = require('fs');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFile = `logs/withdraw_test_report_${timestamp}.json`;
    
    fs.writeFileSync(reportFile, JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: {
        passed,
        total,
        percentage: parseFloat(percentage)
      },
      results: this.testResults
    }, null, 2));
    
    console.log(`📄 Relatório salvo em: ${reportFile}`);
  }
}

// Executar testes
const tester = new WithdrawSystemTester();
tester.runAllTests();
