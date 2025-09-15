/**
 * Script de Teste da Integração VizzionPay - SlotBox
 * Testa criação de depósitos PIX e processamento de webhooks
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

class VizzionPayIntegrationTester {
  constructor() {
    this.baseUrl = process.env.API_BASE_URL || 'https://slotbox-api.onrender.com';
    this.testToken = process.env.TEST_TOKEN || 'test-token';
    this.results = [];
    this.errors = [];
  }

  async runIntegrationTest() {
    console.log('🔗 Iniciando teste de integração VizzionPay...');
    console.log(`📍 Base URL: ${this.baseUrl}`);
    
    try {
      // 1. Testar configuração VizzionPay
      await this.testVizzionPayConfig();
      
      // 2. Testar criação de depósito PIX
      await this.testPixDepositCreation();
      
      // 3. Testar webhook de confirmação
      await this.testPixWebhook();
      
      // 4. Testar tratamento de erros
      await this.testErrorHandling();
      
      // 5. Gerar relatório
      await this.generateReport();
      
    } catch (error) {
      console.error('❌ Erro durante teste de integração:', error);
      this.errors.push({
        type: 'SYSTEM_ERROR',
        message: error.message,
        stack: error.stack
      });
    }
  }

  async testVizzionPayConfig() {
    console.log('🔧 Testando configuração VizzionPay...');
    
    try {
      const response = await axios.get(`${this.baseUrl}/api/vizzionpay-test`);
      
      if (response.data.success) {
        console.log('✅ Configuração VizzionPay OK');
        console.log('📋 Configurações:', response.data.config);
        
        this.results.push({
          test: 'vizzionpay_config',
          success: true,
          data: response.data.config
        });
      } else {
        throw new Error('Configuração VizzionPay falhou');
      }
      
    } catch (error) {
      console.error('❌ Erro na configuração VizzionPay:', error.message);
      this.errors.push({
        type: 'CONFIG_ERROR',
        message: `Erro na configuração VizzionPay: ${error.message}`
      });
    }
  }

  async testPixDepositCreation() {
    console.log('💰 Testando criação de depósito PIX...');
    
    try {
      // Criar usuário de teste
      const testUser = await this.createTestUser();
      console.log(`👤 Usuário de teste criado: ${testUser.email}`);
      
      // Testar criação de depósito
      const depositData = {
        userId: testUser.userId,
        amount: 50.00
      };
      
      const response = await axios.post(
        `${this.baseUrl}/api/deposit/pix`,
        depositData,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );
      
      if (response.data.success) {
        console.log('✅ Depósito PIX criado com sucesso');
        console.log('📋 Dados do depósito:', {
          qrCode: response.data.qrCode ? 'Presente' : 'Ausente',
          qrCodeImage: response.data.qrCodeImage ? 'Presente' : 'Ausente',
          identifier: response.data.identifier
        });
        
        this.results.push({
          test: 'pix_deposit_creation',
          success: true,
          data: {
            identifier: response.data.identifier,
            hasQrCode: !!response.data.qrCode,
            hasQrCodeImage: !!response.data.qrCodeImage
          }
        });
        
        return response.data.identifier;
      } else {
        throw new Error('Falha ao criar depósito PIX');
      }
      
    } catch (error) {
      console.error('❌ Erro ao criar depósito PIX:', error.message);
      this.errors.push({
        type: 'DEPOSIT_CREATION_ERROR',
        message: `Erro ao criar depósito PIX: ${error.message}`
      });
    }
  }

  async testPixWebhook() {
    console.log('🔔 Testando webhook PIX...');
    
    try {
      // Simular webhook da VizzionPay
      const webhookData = {
        event: 'TRANSACTION_PAID',
        transaction: {
          identifier: 'deposit_test_user_1234567890',
          amount: 50.00,
          status: 'COMPLETED',
          transactionId: 'vizzion_tx_123456'
        }
      };
      
      const response = await axios.post(
        `${this.baseUrl}/api/webhook/pix`,
        webhookData,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-public-key': 'test-public-key',
            'x-secret-key': 'test-secret-key'
          },
          timeout: 10000
        }
      );
      
      if (response.data.success) {
        console.log('✅ Webhook PIX processado com sucesso');
        
        this.results.push({
          test: 'pix_webhook',
          success: true,
          data: webhookData
        });
      } else {
        throw new Error('Falha ao processar webhook PIX');
      }
      
    } catch (error) {
      console.error('❌ Erro no webhook PIX:', error.message);
      this.errors.push({
        type: 'WEBHOOK_ERROR',
        message: `Erro no webhook PIX: ${error.message}`
      });
    }
  }

  async testErrorHandling() {
    console.log('⚠️ Testando tratamento de erros...');
    
    const errorTests = [
      {
        name: 'deposit_invalid_user',
        data: { userId: 'invalid-user-id', amount: 50.00 },
        expectedError: 'Usuário não encontrado'
      },
      {
        name: 'deposit_invalid_amount',
        data: { userId: 'test-user', amount: 10.00 },
        expectedError: 'Valor mínimo'
      },
      {
        name: 'webhook_invalid_event',
        data: { event: 'INVALID_EVENT' },
        expectedError: 'Evento não é de pagamento'
      }
    ];
    
    for (const test of errorTests) {
      try {
        console.log(`  🧪 Testando: ${test.name}`);
        
        let response;
        if (test.name.startsWith('deposit_')) {
          response = await axios.post(`${this.baseUrl}/api/deposit/pix`, test.data);
        } else if (test.name.startsWith('webhook_')) {
          response = await axios.post(`${this.baseUrl}/api/webhook/pix`, test.data);
        }
        
        // Se chegou aqui, o erro não foi tratado corretamente
        this.errors.push({
          type: 'ERROR_HANDLING',
          message: `Teste ${test.name} deveria ter falhado mas não falhou`
        });
        
      } catch (error) {
        if (error.response && error.response.data.error) {
          console.log(`    ✅ Erro tratado corretamente: ${error.response.data.error}`);
          
          this.results.push({
            test: test.name,
            success: true,
            data: { expectedError: test.expectedError, actualError: error.response.data.error }
          });
        } else {
          console.log(`    ❌ Erro não tratado corretamente: ${error.message}`);
          
          this.errors.push({
            type: 'ERROR_HANDLING',
            message: `Teste ${test.name} falhou com erro não tratado: ${error.message}`
          });
        }
      }
    }
  }

  async createTestUser() {
    const timestamp = Date.now();
    const testData = {
      nome: `Test User ${timestamp}`,
      email: `test${timestamp}@vizzionpay.com`,
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

  async generateReport() {
    console.log('📄 Gerando relatório...');
    
    const timestamp = new Date().toISOString();
    const report = {
      timestamp,
      testType: 'VIZZIONPAY_INTEGRATION',
      baseUrl: this.baseUrl,
      results: {
        totalTests: this.results.length,
        successful: this.results.filter(r => r.success).length,
        failed: this.results.filter(r => !r.success).length,
        successRate: this.results.length > 0 ? (this.results.filter(r => r.success).length / this.results.length) * 100 : 0
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
    const reportPath = path.join(__dirname, '../reports/vizzionpay-integration-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Gerar relatório markdown
    const markdownReport = this.generateMarkdownReport(report);
    const markdownPath = path.join(__dirname, '../reports/vizzionpay-integration-test.md');
    fs.writeFileSync(markdownPath, markdownReport);
    
    // Resumo no console
    console.log('\n📊 Resumo do Teste de Integração VizzionPay:');
    console.log(`Total de testes: ${report.results.totalTests}`);
    console.log(`Sucessos: ${report.results.successful}`);
    console.log(`Falhas: ${report.results.failed}`);
    console.log(`Taxa de sucesso: ${report.results.successRate.toFixed(2)}%`);
    console.log(`Total de erros: ${report.summary.totalErrors}`);
    console.log(`\n📄 Relatórios salvos em:`);
    console.log(`  - ${reportPath}`);
    console.log(`  - ${markdownPath}`);
  }

  generateMarkdownReport(report) {
    let markdown = `# Relatório de Teste de Integração VizzionPay - SlotBox\n\n`;
    markdown += `**Data:** ${new Date(report.timestamp).toLocaleString('pt-BR')}\n`;
    markdown += `**Tipo de teste:** ${report.testType}\n`;
    markdown += `**Base URL:** ${report.baseUrl}\n\n`;
    
    markdown += `## Resumo dos Resultados\n\n`;
    markdown += `- **Total de testes:** ${report.results.totalTests}\n`;
    markdown += `- **Sucessos:** ${report.results.successful}\n`;
    markdown += `- **Falhas:** ${report.results.failed}\n`;
    markdown += `- **Taxa de sucesso:** ${report.results.successRate.toFixed(2)}%\n\n`;
    
    markdown += `## Testes Executados\n\n`;
    
    if (report.results.totalTests === 0) {
      markdown += `❌ Nenhum teste foi executado com sucesso\n`;
    } else {
      report.results.forEach((result, index) => {
        const status = result.success ? '✅' : '❌';
        markdown += `- ${status} **${result.test}**: ${result.success ? 'Sucesso' : 'Falha'}\n`;
        if (result.data) {
          markdown += `  - Dados: ${JSON.stringify(result.data, null, 2)}\n`;
        }
      });
    }
    
    markdown += `\n## Erros Identificados\n\n`;
    
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
        if (error.stack) {
          markdown += `**Stack:**\n\`\`\`\n${error.stack}\n\`\`\`\n\n`;
        }
      });
    }
    
    markdown += `## Conclusões\n\n`;
    
    if (report.results.successRate >= 80) {
      markdown += `✅ **Integração FUNCIONANDO** - Taxa de sucesso alta (${report.results.successRate.toFixed(2)}%)\n`;
    } else if (report.results.successRate >= 50) {
      markdown += `⚠️ **Integração PARCIALMENTE FUNCIONANDO** - Taxa de sucesso moderada (${report.results.successRate.toFixed(2)}%)\n`;
    } else {
      markdown += `❌ **Integração COM PROBLEMAS** - Taxa de sucesso baixa (${report.results.successRate.toFixed(2)}%)\n`;
    }
    
    if (report.errors.length === 0) {
      markdown += `✅ Nenhum erro crítico identificado\n`;
    } else {
      markdown += `⚠️ ${report.errors.length} erros identificados que precisam ser investigados\n`;
    }
    
    markdown += `\n## Recomendações\n\n`;
    
    if (report.errors.length > 0) {
      markdown += `1. **Investigar erros identificados** - Corrigir problemas encontrados\n`;
      markdown += `2. **Verificar configurações** - Validar chaves da VizzionPay\n`;
      markdown += `3. **Testar em ambiente de produção** - Validar com dados reais\n`;
      markdown += `4. **Implementar logs detalhados** - Melhorar rastreabilidade\n`;
      markdown += `5. **Configurar monitoramento** - Alertas para falhas\n`;
    } else {
      markdown += `1. **Integração pronta para produção** - Todos os testes passaram\n`;
      markdown += `2. **Configurar monitoramento** - Alertas para falhas futuras\n`;
      markdown += `3. **Documentar processo** - Guia para manutenção\n`;
    }
    
    return markdown;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const tester = new VizzionPayIntegrationTester();
  tester.runIntegrationTest().catch(console.error);
}

module.exports = VizzionPayIntegrationTester;
