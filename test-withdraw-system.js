/**
 * Script de teste para o sistema de saque automático via Vizzion Pay
 * Testa todas as funcionalidades implementadas
 */

const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Configuração da API
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const TEST_USER_EMAIL = 'teste@saque.com';
const TEST_USER_PASSWORD = 'teste123';

class WithdrawSystemTester {
  constructor() {
    this.authToken = null;
    this.testUserId = null;
    this.testResults = [];
  }

  async log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
    console.log(logMessage);
    this.testResults.push({ timestamp, type, message });
  }

  async makeRequest(method, endpoint, data = null, headers = {}) {
    try {
      const config = {
        method,
        url: `${API_BASE_URL}${endpoint}`,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      };

      if (this.authToken) {
        config.headers.Authorization = `Bearer ${this.authToken}`;
      }

      if (data) {
        config.data = data;
      }

      const response = await axios(config);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message,
        status: error.response?.status
      };
    }
  }

  async createTestUser() {
    await this.log('Criando usuário de teste...');
    
    // Verificar se usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: TEST_USER_EMAIL }
    });

    if (existingUser) {
      this.testUserId = existingUser.id;
      await this.log(`Usuário de teste já existe: ${this.testUserId}`);
      return;
    }

    // Criar usuário de teste
    const bcrypt = require('bcryptjs');
    const senhaHash = await bcrypt.hash(TEST_USER_PASSWORD, 12);

    const user = await prisma.user.create({
      data: {
        nome: 'Usuário Teste Saque',
        email: TEST_USER_EMAIL,
        senha_hash: senhaHash,
        cpf: '12345678901',
        saldo_reais: 100.00, // Saldo para testar saques
        primeiro_deposito_feito: true, // Permitir saques
        tipo_conta: 'normal'
      }
    });

    // Criar wallet
    await prisma.wallet.create({
      data: {
        user_id: user.id,
        saldo_reais: 100.00,
        saldo_demo: 0
      }
    });

    this.testUserId = user.id;
    await this.log(`Usuário de teste criado: ${this.testUserId}`);
  }

  async loginTestUser() {
    await this.log('Fazendo login do usuário de teste...');
    
    const response = await this.makeRequest('POST', '/api/auth/login', {
      email: TEST_USER_EMAIL,
      senha: TEST_USER_PASSWORD
    });

    if (response.success && response.data.token) {
      this.authToken = response.data.token;
      await this.log('Login realizado com sucesso');
      return true;
    } else {
      await this.log(`Erro no login: ${JSON.stringify(response.error)}`, 'error');
      return false;
    }
  }

  async testWithdrawValidation() {
    await this.log('Testando validações de saque...');

    // Teste 1: Valor menor que R$ 20,00
    const response1 = await this.makeRequest('POST', '/api/withdraw/pix', {
      amount: 10.00,
      pixKey: 'teste@email.com',
      pixKeyType: 'email'
    });

    if (!response1.success && response1.error?.error?.includes('20,00')) {
      await this.log('✅ Validação de valor mínimo funcionando');
    } else {
      await this.log('❌ Validação de valor mínimo falhou', 'error');
    }

    // Teste 2: Chave PIX inválida
    const response2 = await this.makeRequest('POST', '/api/withdraw/pix', {
      amount: 50.00,
      pixKey: '',
      pixKeyType: 'email'
    });

    if (!response2.success && response2.error?.error?.includes('obrigatória')) {
      await this.log('✅ Validação de chave PIX funcionando');
    } else {
      await this.log('❌ Validação de chave PIX falhou', 'error');
    }

    // Teste 3: Saldo insuficiente
    const response3 = await this.makeRequest('POST', '/api/withdraw/pix', {
      amount: 200.00,
      pixKey: 'teste@email.com',
      pixKeyType: 'email'
    });

    if (!response3.success && response3.error?.error?.includes('insuficiente')) {
      await this.log('✅ Validação de saldo insuficiente funcionando');
    } else {
      await this.log('❌ Validação de saldo insuficiente falhou', 'error');
    }
  }

  async testWithdrawHistory() {
    await this.log('Testando histórico de saques...');

    const response = await this.makeRequest('GET', '/api/withdraw/history');

    if (response.success) {
      await this.log('✅ Histórico de saques carregado com sucesso');
      await this.log(`Total de saques: ${response.data.data?.withdrawals?.length || 0}`);
    } else {
      await this.log('❌ Erro ao carregar histórico de saques', 'error');
    }
  }

  async testWithdrawStats() {
    await this.log('Testando estatísticas de saques...');

    const response = await this.makeRequest('GET', '/api/withdraw/stats');

    if (response.success) {
      await this.log('✅ Estatísticas de saques carregadas com sucesso');
      await this.log(`Estatísticas: ${JSON.stringify(response.data.data)}`);
    } else {
      await this.log('❌ Erro ao carregar estatísticas de saques', 'error');
    }
  }

  async testValidWithdraw() {
    await this.log('Testando saque válido...');

    const response = await this.makeRequest('POST', '/api/withdraw/pix', {
      amount: 25.00,
      pixKey: 'teste@email.com',
      pixKeyType: 'email'
    });

    if (response.success) {
      await this.log('✅ Saque válido processado com sucesso');
      await this.log(`ID do saque: ${response.data.data?.identifier}`);
    } else {
      await this.log(`❌ Erro no saque válido: ${JSON.stringify(response.error)}`, 'error');
    }
  }

  async testAdminWithdrawList() {
    await this.log('Testando lista de saques para admin...');

    const response = await this.makeRequest('GET', '/api/withdraw/all');

    if (response.success) {
      await this.log('✅ Lista de saques para admin carregada com sucesso');
      await this.log(`Total de saques: ${response.data.data?.withdrawals?.length || 0}`);
    } else {
      await this.log('❌ Erro ao carregar lista de saques para admin', 'error');
    }
  }

  async testDatabaseIntegrity() {
    await this.log('Testando integridade do banco de dados...');

    try {
      // Verificar se as tabelas existem
      const withdrawals = await prisma.transaction.findMany({
        where: { tipo: 'saque' },
        take: 5
      });

      await this.log(`✅ Tabela de transações de saque acessível. Total: ${withdrawals.length}`);

      // Verificar estrutura dos dados
      if (withdrawals.length > 0) {
        const withdrawal = withdrawals[0];
        const requiredFields = ['id', 'user_id', 'valor', 'tipo', 'status', 'criado_em'];
        const missingFields = requiredFields.filter(field => !withdrawal[field]);
        
        if (missingFields.length === 0) {
          await this.log('✅ Estrutura dos dados de saque está correta');
        } else {
          await this.log(`❌ Campos faltando: ${missingFields.join(', ')}`, 'error');
        }
      }

    } catch (error) {
      await this.log(`❌ Erro na integridade do banco: ${error.message}`, 'error');
    }
  }

  async cleanup() {
    await this.log('Limpando dados de teste...');
    
    try {
      // Remover transações de teste
      await prisma.transaction.deleteMany({
        where: {
          user_id: this.testUserId,
          tipo: 'saque'
        }
      });

      // Remover usuário de teste
      if (this.testUserId) {
        await prisma.wallet.deleteMany({
          where: { user_id: this.testUserId }
        });
        
        await prisma.user.delete({
          where: { id: this.testUserId }
        });
      }

      await this.log('✅ Limpeza concluída');
    } catch (error) {
      await this.log(`❌ Erro na limpeza: ${error.message}`, 'error');
    }
  }

  async runAllTests() {
    await this.log('🚀 Iniciando testes do sistema de saque...');
    
    try {
      // Preparação
      await this.createTestUser();
      const loginSuccess = await this.loginTestUser();
      
      if (!loginSuccess) {
        await this.log('❌ Não foi possível fazer login. Abortando testes.', 'error');
        return;
      }

      // Testes de validação
      await this.testWithdrawValidation();
      
      // Testes de funcionalidade
      await this.testWithdrawHistory();
      await this.testWithdrawStats();
      await this.testValidWithdraw();
      await this.testAdminWithdrawList();
      
      // Testes de integridade
      await this.testDatabaseIntegrity();

      // Resumo dos testes
      await this.log('📊 Resumo dos testes:');
      const successCount = this.testResults.filter(r => r.type === 'info' && r.message.includes('✅')).length;
      const errorCount = this.testResults.filter(r => r.type === 'error').length;
      
      await this.log(`✅ Sucessos: ${successCount}`);
      await this.log(`❌ Erros: ${errorCount}`);
      
      if (errorCount === 0) {
        await this.log('🎉 Todos os testes passaram com sucesso!');
      } else {
        await this.log('⚠️ Alguns testes falharam. Verifique os logs acima.', 'error');
      }

    } catch (error) {
      await this.log(`❌ Erro geral nos testes: ${error.message}`, 'error');
    } finally {
      await this.cleanup();
      await prisma.$disconnect();
    }
  }
}

// Executar testes se o script for chamado diretamente
if (require.main === module) {
  const tester = new WithdrawSystemTester();
  tester.runAllTests().catch(console.error);
}

module.exports = WithdrawSystemTester;
