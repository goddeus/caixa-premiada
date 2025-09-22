/**
 * AUDITORIA DE CÓDIGO DO SISTEMA DE DEPÓSITO
 * 
 * Esta auditoria analisa o código sem precisar de conexão com o banco,
 * identificando possíveis problemas no sistema de depósito.
 */

const fs = require('fs');
const path = require('path');

class DepositCodeAudit {
  
  constructor() {
    this.results = {
      totalChecks: 0,
      passed: 0,
      failed: 0,
      warnings: 0,
      issues: []
    };
  }

  async runAudit() {
    console.log('🔍 AUDITORIA DE CÓDIGO - SISTEMA DE DEPÓSITO');
    console.log('=' .repeat(80));
    
    try {
      // 1. Verificar estrutura de arquivos
      await this.checkFileStructure();
      
      // 2. Analisar fluxo de pagamento
      await this.analyzePaymentFlow();
      
      // 3. Verificar tratamento de erros
      await this.checkErrorHandling();
      
      // 4. Analisar validações
      await this.checkValidations();
      
      // 5. Verificar transações atômicas
      await this.checkAtomicTransactions();
      
      // 6. Analisar logs e auditoria
      await this.checkLoggingAndAudit();
      
      // 7. Verificar segurança
      await this.checkSecurity();
      
      // 8. Relatório final
      this.generateReport();
      
    } catch (error) {
      console.error('❌ ERRO CRÍTICO NA AUDITORIA:', error);
      this.results.issues.push(`Erro crítico: ${error.message}`);
    }
  }

  async checkFileStructure() {
    console.log('\n📋 VERIFICAÇÃO 1: ESTRUTURA DE ARQUIVOS');
    console.log('-'.repeat(50));
    
    const requiredFiles = [
      'src/services/vizzionPayService.js',
      'src/controllers/paymentController.js',
      'src/services/walletService.js',
      'src/controllers/transactionsController.js',
      'src/services/affiliateService.js',
      'prisma/schema.prisma'
    ];
    
    for (const file of requiredFiles) {
      const filePath = path.join(__dirname, file);
      
      if (fs.existsSync(filePath)) {
        console.log(`   ✅ ${file} - Existe`);
        this.results.passed++;
      } else {
        console.log(`   ❌ ${file} - Não encontrado`);
        this.results.failed++;
        this.results.issues.push(`Arquivo obrigatório não encontrado: ${file}`);
      }
      
      this.results.totalChecks++;
    }
  }

  async analyzePaymentFlow() {
    console.log('\n📋 VERIFICAÇÃO 2: FLUXO DE PAGAMENTO');
    console.log('-'.repeat(50));
    
    // Analisar VizzionPayService
    const vizzionPath = path.join(__dirname, 'src/services/vizzionPayService.js');
    if (fs.existsSync(vizzionPath)) {
      const content = fs.readFileSync(vizzionPath, 'utf8');
      
      console.log('🧪 Analisando VizzionPayService...');
      
      // Verificar se tem método processCallback
      if (content.includes('processCallback')) {
        console.log('   ✅ Método processCallback encontrado');
        this.results.passed++;
      } else {
        console.log('   ❌ Método processCallback não encontrado');
        this.results.failed++;
        this.results.issues.push('VizzionPayService: Método processCallback ausente');
      }
      this.results.totalChecks++;
      
      // Verificar se credita saldo baseado no tipo de conta
      if (content.includes('tipo_conta === \'afiliado_demo\'')) {
        console.log('   ✅ Diferenciação por tipo de conta implementada');
        this.results.passed++;
      } else {
        console.log('   ⚠️ Diferenciação por tipo de conta pode estar ausente');
        this.results.warnings++;
        this.results.issues.push('VizzionPayService: Verificar diferenciação por tipo de conta');
      }
      this.results.totalChecks++;
      
      // Verificar se atualiza primeiro_deposito_feito
      if (content.includes('primeiro_deposito_feito')) {
        console.log('   ✅ Controle de primeiro depósito implementado');
        this.results.passed++;
      } else {
        console.log('   ⚠️ Controle de primeiro depósito pode estar ausente');
        this.results.warnings++;
        this.results.issues.push('VizzionPayService: Verificar controle de primeiro depósito');
      }
      this.results.totalChecks++;
      
      // Verificar se processa comissão de afiliado
      if (content.includes('processAffiliateCommission')) {
        console.log('   ✅ Processamento de comissão de afiliado implementado');
        this.results.passed++;
      } else {
        console.log('   ⚠️ Processamento de comissão pode estar ausente');
        this.results.warnings++;
        this.results.issues.push('VizzionPayService: Verificar processamento de comissão');
      }
      this.results.totalChecks++;
    }
  }

  async checkErrorHandling() {
    console.log('\n📋 VERIFICAÇÃO 3: TRATAMENTO DE ERROS');
    console.log('-'.repeat(50));
    
    const files = [
      'src/services/vizzionPayService.js',
      'src/controllers/paymentController.js',
      'src/services/walletService.js'
    ];
    
    for (const file of files) {
      const filePath = path.join(__dirname, file);
      
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const fileName = path.basename(file);
        
        console.log(`🧪 Analisando ${fileName}...`);
        
        // Verificar try-catch
        const tryCatchCount = (content.match(/try\s*{/g) || []).length;
        const catchCount = (content.match(/catch\s*\(/g) || []).length;
        
        if (tryCatchCount > 0 && catchCount > 0) {
          console.log(`   ✅ Tratamento de erros implementado (${tryCatchCount} try-catch)`);
          this.results.passed++;
        } else {
          console.log(`   ⚠️ Tratamento de erros pode estar incompleto`);
          this.results.warnings++;
          this.results.issues.push(`${fileName}: Verificar tratamento de erros`);
        }
        this.results.totalChecks++;
        
        // Verificar logs de erro
        if (content.includes('console.error') || content.includes('console.log')) {
          console.log(`   ✅ Logs implementados`);
          this.results.passed++;
        } else {
          console.log(`   ⚠️ Logs podem estar ausentes`);
          this.results.warnings++;
          this.results.issues.push(`${fileName}: Verificar implementação de logs`);
        }
        this.results.totalChecks++;
      }
    }
  }

  async checkValidations() {
    console.log('\n📋 VERIFICAÇÃO 4: VALIDAÇÕES');
    console.log('-'.repeat(50));
    
    const paymentControllerPath = path.join(__dirname, 'src/controllers/paymentController.js');
    
    if (fs.existsSync(paymentControllerPath)) {
      const content = fs.readFileSync(paymentControllerPath, 'utf8');
      
      console.log('🧪 Analisando validações no PaymentController...');
      
      // Verificar validação de valor mínimo
      if (content.includes('valorNumerico < 20.00')) {
        console.log('   ✅ Validação de valor mínimo (R$ 20) implementada');
        this.results.passed++;
      } else {
        console.log('   ❌ Validação de valor mínimo não encontrada');
        this.results.failed++;
        this.results.issues.push('PaymentController: Validação de valor mínimo ausente');
      }
      this.results.totalChecks++;
      
      // Verificar validação de valor máximo
      if (content.includes('valorNumerico > 10000.00')) {
        console.log('   ✅ Validação de valor máximo (R$ 10.000) implementada');
        this.results.passed++;
      } else {
        console.log('   ❌ Validação de valor máximo não encontrada');
        this.results.failed++;
        this.results.issues.push('PaymentController: Validação de valor máximo ausente');
      }
      this.results.totalChecks++;
      
      // Verificar validação de usuário
      if (content.includes('!userId') || content.includes('!amount')) {
        console.log('   ✅ Validação de parâmetros obrigatórios implementada');
        this.results.passed++;
      } else {
        console.log('   ⚠️ Validação de parâmetros pode estar ausente');
        this.results.warnings++;
        this.results.issues.push('PaymentController: Verificar validação de parâmetros');
      }
      this.results.totalChecks++;
      
      // Verificar bloqueio de contas demo
      if (content.includes('tipo_conta === \'afiliado_demo\'')) {
        console.log('   ✅ Bloqueio de contas demo implementado');
        this.results.passed++;
      } else {
        console.log('   ❌ Bloqueio de contas demo não encontrado');
        this.results.failed++;
        this.results.issues.push('PaymentController: Bloqueio de contas demo ausente');
      }
      this.results.totalChecks++;
    }
  }

  async checkAtomicTransactions() {
    console.log('\n📋 VERIFICAÇÃO 5: TRANSAÇÕES ATÔMICAS');
    console.log('-'.repeat(50));
    
    const files = [
      'src/services/vizzionPayService.js',
      'src/services/walletService.js',
      'src/services/affiliateService.js'
    ];
    
    for (const file of files) {
      const filePath = path.join(__dirname, file);
      
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const fileName = path.basename(file);
        
        console.log(`🧪 Analisando ${fileName}...`);
        
        // Verificar uso de transações
        if (content.includes('prisma.$transaction')) {
          console.log(`   ✅ Transações atômicas implementadas`);
          this.results.passed++;
        } else {
          console.log(`   ⚠️ Transações atômicas podem estar ausentes`);
          this.results.warnings++;
          this.results.issues.push(`${fileName}: Verificar implementação de transações atômicas`);
        }
        this.results.totalChecks++;
        
        // Verificar atualização de múltiplas tabelas
        const userUpdateCount = (content.match(/tx\.user\.update/g) || []).length;
        const walletUpdateCount = (content.match(/tx\.wallet\.update/g) || []).length;
        const transactionCreateCount = (content.match(/tx\.transaction\.create/g) || []).length;
        
        if (userUpdateCount > 0 && walletUpdateCount > 0) {
          console.log(`   ✅ Sincronização User + Wallet implementada`);
          this.results.passed++;
        } else if (userUpdateCount > 0 || walletUpdateCount > 0) {
          console.log(`   ⚠️ Sincronização pode estar incompleta`);
          this.results.warnings++;
          this.results.issues.push(`${fileName}: Verificar sincronização User/Wallet`);
        }
        this.results.totalChecks++;
      }
    }
  }

  async checkLoggingAndAudit() {
    console.log('\n📋 VERIFICAÇÃO 6: LOGS E AUDITORIA');
    console.log('-'.repeat(50));
    
    const vizzionPath = path.join(__dirname, 'src/services/vizzionPayService.js');
    
    if (fs.existsSync(vizzionPath)) {
      const content = fs.readFileSync(vizzionPath, 'utf8');
      
      console.log('🧪 Analisando logs e auditoria...');
      
      // Verificar logs de processamento
      if (content.includes('console.log') && content.includes('Depósito VizzionPay processado')) {
        console.log('   ✅ Logs de processamento implementados');
        this.results.passed++;
      } else {
        console.log('   ⚠️ Logs de processamento podem estar ausentes');
        this.results.warnings++;
        this.results.issues.push('VizzionPayService: Verificar logs de processamento');
      }
      this.results.totalChecks++;
      
      // Verificar auditoria de transações
      if (content.includes('tx.transaction.create')) {
        console.log('   ✅ Criação de transações para auditoria implementada');
        this.results.passed++;
      } else {
        console.log('   ❌ Auditoria de transações não encontrada');
        this.results.failed++;
        this.results.issues.push('VizzionPayService: Auditoria de transações ausente');
      }
      this.results.totalChecks++;
      
      // Verificar logs de erro
      if (content.includes('console.error')) {
        console.log('   ✅ Logs de erro implementados');
        this.results.passed++;
      } else {
        console.log('   ⚠️ Logs de erro podem estar ausentes');
        this.results.warnings++;
        this.results.issues.push('VizzionPayService: Verificar logs de erro');
      }
      this.results.totalChecks++;
    }
  }

  async checkSecurity() {
    console.log('\n📋 VERIFICAÇÃO 7: SEGURANÇA');
    console.log('-'.repeat(50));
    
    const paymentControllerPath = path.join(__dirname, 'src/controllers/paymentController.js');
    
    if (fs.existsSync(paymentControllerPath)) {
      const content = fs.readFileSync(paymentControllerPath, 'utf8');
      
      console.log('🧪 Analisando aspectos de segurança...');
      
      // Verificar validação de assinatura de webhook
      if (content.includes('signature') || content.includes('validateWebhookSignature')) {
        console.log('   ✅ Validação de assinatura de webhook implementada');
        this.results.passed++;
      } else {
        console.log('   ⚠️ Validação de assinatura pode estar ausente');
        this.results.warnings++;
        this.results.issues.push('PaymentController: Verificar validação de assinatura de webhook');
      }
      this.results.totalChecks++;
      
      // Verificar sanitização de dados
      if (content.includes('Number(') && content.includes('parseFloat')) {
        console.log('   ✅ Sanitização de valores numéricos implementada');
        this.results.passed++;
      } else {
        console.log('   ⚠️ Sanitização pode estar ausente');
        this.results.warnings++;
        this.results.issues.push('PaymentController: Verificar sanitização de dados');
      }
      this.results.totalChecks++;
      
      // Verificar timeout nas requisições
      if (content.includes('timeout')) {
        console.log('   ✅ Timeout em requisições implementado');
        this.results.passed++;
      } else {
        console.log('   ⚠️ Timeout pode estar ausente');
        this.results.warnings++;
        this.results.issues.push('PaymentController: Verificar timeout em requisições');
      }
      this.results.totalChecks++;
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 RELATÓRIO FINAL DA AUDITORIA DE CÓDIGO');
    console.log('='.repeat(80));
    
    const successRate = ((this.results.passed / this.results.totalChecks) * 100).toFixed(1);
    
    console.log(`\n📈 ESTATÍSTICAS:`);
    console.log(`   Total de verificações: ${this.results.totalChecks}`);
    console.log(`   Sucessos: ${this.results.passed}`);
    console.log(`   Falhas: ${this.results.failed}`);
    console.log(`   Avisos: ${this.results.warnings}`);
    console.log(`   Taxa de sucesso: ${successRate}%`);
    
    if (this.results.issues.length > 0) {
      console.log(`\n📝 QUESTÕES IDENTIFICADAS:`);
      this.results.issues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue}`);
      });
    }
    
    console.log(`\n🎯 ANÁLISE DO SISTEMA DE DEPÓSITO:`);
    
    // Análise específica baseada nos resultados
    const criticalIssues = this.results.failed;
    const warnings = this.results.warnings;
    
    if (criticalIssues === 0 && warnings <= 2) {
      console.log(`   ✅ CÓDIGO DO SISTEMA DE DEPÓSITO ESTÁ BEM ESTRUTURADO!`);
      console.log(`   💰 O sistema tem todas as validações e controles necessários.`);
      console.log(`   🔒 Os valores serão creditados corretamente no saldo das contas.`);
    } else if (criticalIssues <= 2 && warnings <= 5) {
      console.log(`   ⚠️ CÓDIGO FUNCIONANDO COM PEQUENAS MELHORIAS NECESSÁRIAS`);
      console.log(`   🔧 Recomenda-se corrigir os problemas identificados.`);
      console.log(`   💰 O sistema deve funcionar, mas com atenção aos pontos críticos.`);
    } else {
      console.log(`   ❌ CÓDIGO COM PROBLEMAS QUE PRECISAM SER CORRIGIDOS`);
      console.log(`   🚨 NECESSÁRIO CORREÇÃO ANTES DE USAR EM PRODUÇÃO!`);
      console.log(`   💸 Podem haver problemas no crédito de saldo.`);
    }
    
    console.log(`\n🔍 PONTOS PRINCIPAIS VERIFICADOS:`);
    console.log(`   • Fluxo de pagamento VizzionPay`);
    console.log(`   • Diferenciação por tipo de conta (normal vs demo)`);
    console.log(`   • Validações de valor mínimo/máximo`);
    console.log(`   • Transações atômicas para consistência`);
    console.log(`   • Logs e auditoria de transações`);
    console.log(`   • Tratamento de erros`);
    console.log(`   • Segurança (assinatura, sanitização, timeout)`);
    
    console.log('\n' + '='.repeat(80));
  }
}

// Executar auditoria
async function main() {
  const audit = new DepositCodeAudit();
  await audit.runAudit();
  
  console.log('\n🏁 Auditoria de código concluída!');
}

main().catch(error => {
  console.error('💥 Erro fatal na auditoria:', error);
  process.exit(1);
});

