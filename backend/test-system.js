const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const API_BASE = 'http://localhost:3001/api';

/**
 * Script de teste do sistema reconstruído
 */
class SystemTester {
  
  constructor() {
    this.testResults = [];
    this.testUser = null;
    this.testToken = null;
  }
  
  async runAllTests() {
    console.log('🚀 Iniciando testes do sistema reconstruído...\n');
    
    try {
      await this.testDatabaseConnection();
      await this.testServerHealth();
      await this.testUserRegistration();
      await this.testUserLogin();
      await this.testCaixasList();
      await this.testCaixaDetails();
      await this.testCaixaOpening();
      await this.testAffiliateSystem();
      await this.testPaymentCreation();
      
      this.printResults();
      
    } catch (error) {
      console.error('❌ Erro geral nos testes:', error.message);
    } finally {
      await prisma.$disconnect();
    }
  }
  
  async testDatabaseConnection() {
    try {
      await prisma.user.count();
      this.addResult('✅ Conexão com banco de dados', true);
    } catch (error) {
      this.addResult('❌ Conexão com banco de dados', false, error.message);
    }
  }
  
  async testServerHealth() {
    try {
      const response = await axios.get(`${API_BASE}/health`);
      if (response.data.success) {
        this.addResult('✅ Health check do servidor', true);
      } else {
        throw new Error('Resposta de saúde inválida');
      }
    } catch (error) {
      this.addResult('❌ Health check do servidor', false, error.message);
    }
  }
  
  async testUserRegistration() {
    try {
      const testUserData = {
        nome: 'Usuário Teste',
        email: `teste_${Date.now()}@test.com`,
        senha: 'senha123456',
        cpf: '12345678901'
      };
      
      const response = await axios.post(`${API_BASE}/auth/register`, testUserData);
      
      if (response.data.success && response.data.data.token) {
        this.testUser = response.data.data.user;
        this.testToken = response.data.data.token;
        this.addResult('✅ Registro de usuário', true);
      } else {
        throw new Error('Resposta de registro inválida');
      }
    } catch (error) {
      this.addResult('❌ Registro de usuário', false, error.response?.data?.message || error.message);
    }
  }
  
  async testUserLogin() {
    if (!this.testUser) {
      this.addResult('⏭️ Login de usuário (pulado - registro falhou)', false);
      return;
    }
    
    try {
      const response = await axios.post(`${API_BASE}/auth/login`, {
        email: this.testUser.email,
        senha: 'senha123456'
      });
      
      if (response.data.success && response.data.data.token) {
        this.testToken = response.data.data.token;
        this.addResult('✅ Login de usuário', true);
      } else {
        throw new Error('Resposta de login inválida');
      }
    } catch (error) {
      this.addResult('❌ Login de usuário', false, error.response?.data?.message || error.message);
    }
  }
  
  async testCaixasList() {
    try {
      const response = await axios.get(`${API_BASE}/caixas`);
      
      if (response.data.success && Array.isArray(response.data.data)) {
        this.addResult('✅ Listagem de caixas', true, `${response.data.data.length} caixas encontradas`);
      } else {
        throw new Error('Resposta de listagem inválida');
      }
    } catch (error) {
      this.addResult('❌ Listagem de caixas', false, error.response?.data?.message || error.message);
    }
  }
  
  async testCaixaDetails() {
    try {
      // Buscar primeira caixa disponível
      const caixasResponse = await axios.get(`${API_BASE}/caixas`);
      const caixas = caixasResponse.data.data;
      
      if (!caixas || caixas.length === 0) {
        throw new Error('Nenhuma caixa disponível para teste');
      }
      
      const primeiraCapitalization = caixas[0];
      const response = await axios.get(`${API_BASE}/caixas/${primeiraCapitalization.id}`);
      
      if (response.data.success && response.data.data.id) {
        this.addResult('✅ Detalhes da caixa', true, `Caixa: ${response.data.data.nome}`);
      } else {
        throw new Error('Resposta de detalhes inválida');
      }
    } catch (error) {
      this.addResult('❌ Detalhes da caixa', false, error.response?.data?.message || error.message);
    }
  }
  
  async testCaixaOpening() {
    if (!this.testToken) {
      this.addResult('⏭️ Abertura de caixa (pulado - sem token)', false);
      return;
    }
    
    try {
      // Primeiro, creditar saldo de teste para o usuário
      if (this.testUser) {
        await prisma.user.update({
          where: { id: this.testUser.id },
          data: { saldo_reais: 100.00 }
        });
      }
      
      // Buscar primeira caixa
      const caixasResponse = await axios.get(`${API_BASE}/caixas`);
      const caixas = caixasResponse.data.data;
      
      if (!caixas || caixas.length === 0) {
        throw new Error('Nenhuma caixa disponível');
      }
      
      const primeiraCaixa = caixas[0];
      
      const response = await axios.post(
        `${API_BASE}/caixas/${primeiraCaixa.id}/abrir`,
        { quantidade: 1 },
        {
          headers: { Authorization: `Bearer ${this.testToken}` }
        }
      );
      
      if (response.data.success) {
        this.addResult('✅ Abertura de caixa', true, `Prêmios: ${response.data.data.premios?.length || 0}`);
      } else {
        throw new Error('Resposta de abertura inválida');
      }
    } catch (error) {
      this.addResult('❌ Abertura de caixa', false, error.response?.data?.message || error.message);
    }
  }
  
  async testAffiliateSystem() {
    if (!this.testToken) {
      this.addResult('⏭️ Sistema de afiliados (pulado - sem token)', false);
      return;
    }
    
    try {
      const response = await axios.post(
        `${API_BASE}/affiliate/create`,
        {},
        {
          headers: { Authorization: `Bearer ${this.testToken}` }
        }
      );
      
      if (response.data.success && response.data.data.codigo_indicacao) {
        this.addResult('✅ Criação de afiliado', true, `Código: ${response.data.data.codigo_indicacao}`);
      } else {
        throw new Error('Resposta de criação de afiliado inválida');
      }
    } catch (error) {
      this.addResult('❌ Criação de afiliado', false, error.response?.data?.message || error.message);
    }
  }
  
  async testPaymentCreation() {
    if (!this.testToken) {
      this.addResult('⏭️ Criação de pagamento (pulado - sem token)', false);
      return;
    }
    
    try {
      const response = await axios.post(
        `${API_BASE}/payments/deposit`,
        { valor: 20.00 },
        {
          headers: { Authorization: `Bearer ${this.testToken}` }
        }
      );
      
      if (response.data.success && response.data.data.transaction_id) {
        this.addResult('✅ Criação de depósito PIX', true, `ID: ${response.data.data.transaction_id}`);
      } else {
        throw new Error('Resposta de depósito inválida');
      }
    } catch (error) {
      this.addResult('❌ Criação de depósito PIX', false, error.response?.data?.message || error.message);
    }
  }
  
  addResult(test, success, details = '') {
    this.testResults.push({ test, success, details });
  }
  
  printResults() {
    console.log('\n📊 RESULTADOS DOS TESTES:\n');
    
    let passed = 0;
    let failed = 0;
    
    this.testResults.forEach(result => {
      console.log(`${result.test} ${result.details ? `- ${result.details}` : ''}`);
      if (result.success) {
        passed++;
      } else {
        failed++;
      }
    });
    
    console.log(`\n📈 RESUMO: ${passed} passou(m), ${failed} falhou(ram)`);
    
    if (failed === 0) {
      console.log('🎉 TODOS OS TESTES PASSARAM! Sistema pronto para produção.');
    } else {
      console.log('⚠️ Alguns testes falharam. Revisar antes do deploy.');
    }
  }
}

// Executar testes
const tester = new SystemTester();
tester.runAllTests().catch(console.error);
