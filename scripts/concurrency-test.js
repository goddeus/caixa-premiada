/**
 * Script de Teste de Concorrência - SlotBox
 * Simula múltiplas requisições paralelas para testar atomicidade
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

class ConcurrencyTester {
  constructor() {
    this.baseUrl = process.env.API_BASE_URL || 'https://slotbox-api.onrender.com';
    this.testToken = process.env.TEST_TOKEN || 'test-token';
    this.results = [];
    this.errors = [];
  }

  async runConcurrencyTest() {
    console.log('🚀 Iniciando teste de concorrência...');
    console.log(`📍 Base URL: ${this.baseUrl}`);
    
    try {
      // 1. Criar usuário de teste
      const testUser = await this.createTestUser();
      console.log(`👤 Usuário de teste criado: ${testUser.email}`);
      
      // 2. Fazer depósito inicial
      await this.makeInitialDeposit(testUser.token);
      console.log('💰 Depósito inicial realizado');
      
      // 3. Executar teste de concorrência
      await this.runConcurrentPurchases(testUser.token);
      
      // 4. Verificar resultados
      await this.verifyResults(testUser.token);
      
      // 5. Gerar relatório
      await this.generateReport();
      
    } catch (error) {
      console.error('❌ Erro durante teste de concorrência:', error);
      this.errors.push({
        type: 'SYSTEM_ERROR',
        message: error.message,
        stack: error.stack
      });
    }
  }

  async createTestUser() {
    const timestamp = Date.now();
    const testData = {
      nome: `Test User ${timestamp}`,
      email: `test${timestamp}@concurrency.com`,
      senha: 'test123456',
      cpf: `${timestamp.toString().slice(-11)}`
    };
    
    try {
      const response = await axios.post(`${this.baseUrl}/api/auth/register`, testData);
      return {
        ...testData,
        token: response.data.token,
        userId: response.data.user.id
      };
    } catch (error) {
      throw new Error(`Falha ao criar usuário de teste: ${error.message}`);
    }
  }

  async makeInitialDeposit(token) {
    try {
      // Simular depósito de R$ 100
      const depositData = {
        valor: 100,
        metodo: 'pix'
      };
      
      const response = await axios.post(
        `${this.baseUrl}/api/payments/deposit`,
        depositData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Simular aprovação do depósito
      await axios.post(`${this.baseUrl}/api/payments/deposit/callback`, {
        payment_id: response.data.data.id,
        status: 'aprovado',
        valor: 100
      });
      
    } catch (error) {
      throw new Error(`Falha ao fazer depósito inicial: ${error.message}`);
    }
  }

  async runConcurrentPurchases(token) {
    console.log('🔄 Executando 50 compras concorrentes...');
    
    const promises = [];
    const caseId = 'test-case-id'; // ID de uma caixa de teste
    
    for (let i = 0; i < 50; i++) {
      promises.push(this.makePurchase(token, caseId, i));
    }
    
    const results = await Promise.allSettled(promises);
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        this.results.push({
          index,
          success: true,
          data: result.value
        });
      } else {
        this.results.push({
          index,
          success: false,
          error: result.reason.message
        });
        this.errors.push({
          type: 'PURCHASE_ERROR',
          index,
          message: result.reason.message
        });
      }
    });
    
    const successful = this.results.filter(r => r.success).length;
    const failed = this.results.filter(r => !r.success).length;
    
    console.log(`✅ Compras bem-sucedidas: ${successful}`);
    console.log(`❌ Compras falharam: ${failed}`);
  }

  async makePurchase(token, caseId, index) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/api/cases/buy/${caseId}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );
      
      return {
        index,
        status: response.status,
        data: response.data,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      return {
        index,
        status: error.response?.status || 0,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async verifyResults(token) {
    console.log('🔍 Verificando resultados...');
    
    try {
      // Verificar saldo final
      const walletResponse = await axios.get(
        `${this.baseUrl}/api/wallet`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      const finalBalance = walletResponse.data.data.saldo_reais;
      console.log(`💰 Saldo final: R$ ${finalBalance.toFixed(2)}`);
      
      // Verificar transações
      const transactionsResponse = await axios.get(
        `${this.baseUrl}/api/transactions`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      const transactions = transactionsResponse.data.data;
      const buyTransactions = transactions.filter(t => t.tipo === 'aposta');
      const prizeTransactions = transactions.filter(t => t.tipo === 'premio');
      
      console.log(`📊 Transações de aposta: ${buyTransactions.length}`);
      console.log(`🏆 Transações de prêmio: ${prizeTransactions.length}`);
      
      // Verificar se saldo nunca ficou negativo
      const negativeTransactions = transactions.filter(t => 
        t.saldo_depois < 0
      );
      
      if (negativeTransactions.length > 0) {
        this.errors.push({
          type: 'NEGATIVE_BALANCE',
          message: `${negativeTransactions.length} transações resultaram em saldo negativo`,
          details: negativeTransactions
        });
      }
      
      // Verificar duplicatas
      const duplicateTransactions = this.findDuplicateTransactions(transactions);
      if (duplicateTransactions.length > 0) {
        this.errors.push({
          type: 'DUPLICATE_TRANSACTIONS',
          message: `${duplicateTransactions.length} transações duplicadas encontradas`,
          details: duplicateTransactions
        });
      }
      
    } catch (error) {
      this.errors.push({
        type: 'VERIFICATION_ERROR',
        message: `Erro ao verificar resultados: ${error.message}`
      });
    }
  }

  findDuplicateTransactions(transactions) {
    const seen = new Set();
    const duplicates = [];
    
    transactions.forEach(transaction => {
      const key = `${transaction.user_id}-${transaction.tipo}-${transaction.valor}-${transaction.criado_em}`;
      if (seen.has(key)) {
        duplicates.push(transaction);
      } else {
        seen.add(key);
      }
    });
    
    return duplicates;
  }

  async generateReport() {
    console.log('📄 Gerando relatório...');
    
    const timestamp = new Date().toISOString();
    const report = {
      timestamp,
      testType: 'CONCURRENCY',
      baseUrl: this.baseUrl,
      results: {
        totalPurchases: this.results.length,
        successful: this.results.filter(r => r.success).length,
        failed: this.results.filter(r => !r.success).length,
        successRate: (this.results.filter(r => r.success).length / this.results.length) * 100
      },
      errors: this.errors,
      summary: {
        totalErrors: this.errors.length,
        errorTypes: this.errors.reduce((acc, error) => {
          acc[error.type] = (acc[error.type] || 0) + 1;
          return acc;
        }, {})
      }
    };
    
    // Salvar relatório JSON
    const reportPath = path.join(__dirname, '../reports/concurrency-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Gerar relatório markdown
    const markdownReport = this.generateMarkdownReport(report);
    const markdownPath = path.join(__dirname, '../reports/concurrency-test.md');
    fs.writeFileSync(markdownPath, markdownReport);
    
    // Resumo no console
    console.log('\n📊 Resumo do Teste de Concorrência:');
    console.log(`Total de compras: ${report.results.totalPurchases}`);
    console.log(`Sucessos: ${report.results.successful}`);
    console.log(`Falhas: ${report.results.failed}`);
    console.log(`Taxa de sucesso: ${report.results.successRate.toFixed(2)}%`);
    console.log(`Total de erros: ${report.summary.totalErrors}`);
    console.log(`\n📄 Relatórios salvos em:`);
    console.log(`  - ${reportPath}`);
    console.log(`  - ${markdownPath}`);
  }

  generateMarkdownReport(report) {
    let markdown = `# Relatório de Teste de Concorrência - SlotBox\n\n`;
    markdown += `**Data:** ${new Date(report.timestamp).toLocaleString('pt-BR')}\n`;
    markdown += `**Tipo de teste:** ${report.testType}\n`;
    markdown += `**Base URL:** ${report.baseUrl}\n\n`;
    
    markdown += `## Resumo dos Resultados\n\n`;
    markdown += `- **Total de compras:** ${report.results.totalPurchases}\n`;
    markdown += `- **Sucessos:** ${report.results.successful}\n`;
    markdown += `- **Falhas:** ${report.results.failed}\n`;
    markdown += `- **Taxa de sucesso:** ${report.results.successRate.toFixed(2)}%\n\n`;
    
    markdown += `## Erros Identificados\n\n`;
    
    if (report.errors.length === 0) {
      markdown += `✅ Nenhum erro identificado!\n`;
    } else {
      markdown += `- **Total de erros:** ${report.summary.totalErrors}\n\n`;
      
      Object.entries(report.summary.errorTypes).forEach(([type, count]) => {
        markdown += `- **${type}:** ${count} ocorrências\n`;
      });
      
      markdown += `\n### Detalhes dos Erros\n\n`;
      report.errors.forEach((error, index) => {
        markdown += `#### Erro ${index + 1}: ${error.type}\n\n`;
        markdown += `**Mensagem:** ${error.message}\n\n`;
        if (error.details) {
          markdown += `**Detalhes:**\n\`\`\`json\n${JSON.stringify(error.details, null, 2)}\n\`\`\`\n\n`;
        }
      });
    }
    
    markdown += `## Conclusões\n\n`;
    
    if (report.results.successRate >= 95) {
      markdown += `✅ **Teste PASSOU** - Taxa de sucesso alta (${report.results.successRate.toFixed(2)}%)\n`;
    } else if (report.results.successRate >= 80) {
      markdown += `⚠️ **Teste PARCIALMENTE PASSOU** - Taxa de sucesso moderada (${report.results.successRate.toFixed(2)}%)\n`;
    } else {
      markdown += `❌ **Teste FALHOU** - Taxa de sucesso baixa (${report.results.successRate.toFixed(2)}%)\n`;
    }
    
    if (report.errors.length === 0) {
      markdown += `✅ Nenhum erro crítico identificado\n`;
    } else {
      markdown += `⚠️ ${report.errors.length} erros identificados que precisam ser investigados\n`;
    }
    
    return markdown;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const tester = new ConcurrencyTester();
  tester.runConcurrencyTest().catch(console.error);
}

module.exports = ConcurrencyTester;
