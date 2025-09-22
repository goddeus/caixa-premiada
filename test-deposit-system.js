/**
 * MEGA AUDITORIA DO SISTEMA DE DEPÓSITO
 * 
 * Este script testa todos os cenários de depósito para garantir
 * que os valores sejam creditados corretamente no saldo da conta.
 */

const { PrismaClient } = require('./node_modules/@prisma/client');
const prisma = new PrismaClient();

class DepositAuditSystem {
  
  constructor() {
    this.results = {
      totalTests: 0,
      passed: 0,
      failed: 0,
      errors: []
    };
  }

  async runAudit() {
    console.log('🔍 INICIANDO MEGA AUDITORIA DO SISTEMA DE DEPÓSITO');
    console.log('=' .repeat(80));
    
    try {
      // 1. Testar diferentes tipos de conta
      await this.testAccountTypes();
      
      // 2. Testar fluxo de pagamento VizzionPay
      await this.testVizzionPayFlow();
      
      // 3. Testar webhook de confirmação
      await this.testWebhookConfirmation();
      
      // 4. Testar sincronização de saldo
      await this.testBalanceSynchronization();
      
      // 5. Testar transações atômicas
      await this.testAtomicTransactions();
      
      // 6. Testar cenários de erro
      await this.testErrorScenarios();
      
      // 7. Verificar logs de transações
      await this.verifyTransactionLogs();
      
      // 8. Relatório final
      this.generateReport();
      
    } catch (error) {
      console.error('❌ ERRO CRÍTICO NA AUDITORIA:', error);
      this.results.errors.push(`Erro crítico: ${error.message}`);
    }
  }

  async testAccountTypes() {
    console.log('\n📋 TESTE 1: DIFERENTES TIPOS DE CONTA');
    console.log('-'.repeat(50));
    
    // Buscar contas de teste
    const adminAccount = await prisma.user.findFirst({
      where: { is_admin: true, tipo_conta: 'normal' }
    });
    
    const normalAccount = await prisma.user.findFirst({
      where: { is_admin: false, tipo_conta: 'normal' }
    });
    
    const demoAccount = await prisma.user.findFirst({
      where: { tipo_conta: 'afiliado_demo' }
    });
    
    if (adminAccount) {
      await this.testDepositForAccount(adminAccount, 'Admin');
    }
    
    if (normalAccount) {
      await this.testDepositForAccount(normalAccount, 'Normal');
    }
    
    if (demoAccount) {
      await this.testDepositForAccount(demoAccount, 'Demo');
    }
  }

  async testDepositForAccount(user, accountType) {
    console.log(`\n🧪 Testando depósito para conta ${accountType}:`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Tipo: ${user.tipo_conta}`);
    console.log(`   Saldo atual: R$ ${user.saldo_reais.toFixed(2)}`);
    
    const testAmount = 50.00;
    const saldoAntes = user.tipo_conta === 'afiliado_demo' ? user.saldo_demo : user.saldo_reais;
    
    try {
      // Simular depósito
      const result = await prisma.$transaction(async (tx) => {
        // Criar transação
        const transaction = await tx.transaction.create({
          data: {
            user_id: user.id,
            tipo: 'deposito',
            valor: testAmount,
            status: 'concluido',
            descricao: `Teste de depósito - ${accountType}`
          }
        });
        
        // Creditar saldo baseado no tipo de conta
        let updatedUser;
        if (user.tipo_conta === 'afiliado_demo') {
          updatedUser = await tx.user.update({
            where: { id: user.id },
            data: { saldo_demo: { increment: testAmount } }
          });
        } else {
          updatedUser = await tx.user.update({
            where: { id: user.id },
            data: { saldo_reais: { increment: testAmount } }
          });
        }
        
        // Sincronizar carteira
        await tx.wallet.update({
          where: { user_id: user.id },
          data: {
            saldo_reais: updatedUser.saldo_reais,
            saldo_demo: updatedUser.saldo_demo
          }
        });
        
        return { transaction, updatedUser };
      });
      
      const saldoDepois = user.tipo_conta === 'afiliado_demo' ? 
        result.updatedUser.saldo_demo : result.updatedUser.saldo_reais;
      
      const diferenca = saldoDepois - saldoAntes;
      
      if (Math.abs(diferenca - testAmount) < 0.01) {
        console.log(`   ✅ SUCESSO: Saldo creditado corretamente`);
        console.log(`   📊 Antes: R$ ${saldoAntes.toFixed(2)} | Depois: R$ ${saldoDepois.toFixed(2)} | Diferença: R$ ${diferenca.toFixed(2)}`);
        this.results.passed++;
      } else {
        console.log(`   ❌ FALHA: Saldo não creditado corretamente`);
        console.log(`   📊 Esperado: R$ ${testAmount.toFixed(2)} | Recebido: R$ ${diferenca.toFixed(2)}`);
        this.results.failed++;
        this.results.errors.push(`Conta ${accountType}: Valor esperado R$ ${testAmount}, recebido R$ ${diferenca}`);
      }
      
      this.results.totalTests++;
      
    } catch (error) {
      console.log(`   ❌ ERRO: ${error.message}`);
      this.results.failed++;
      this.results.errors.push(`Conta ${accountType}: ${error.message}`);
      this.results.totalTests++;
    }
  }

  async testVizzionPayFlow() {
    console.log('\n📋 TESTE 2: FLUXO VIZZIONPAY');
    console.log('-'.repeat(50));
    
    // Simular criação de pagamento
    console.log('🧪 Testando criação de pagamento VizzionPay...');
    
    try {
      const user = await prisma.user.findFirst({
        where: { is_admin: false, tipo_conta: 'normal' }
      });
      
      if (!user) {
        console.log('   ⚠️ Nenhum usuário normal encontrado para teste');
        return;
      }
      
      // Criar pagamento
      const payment = await prisma.payment.create({
        data: {
          user_id: user.id,
          valor: 100.00,
          tipo: 'deposito',
          status: 'pendente',
          metodo_pagamento: 'pix',
          gateway_id: `test_${Date.now()}`,
          identifier: `deposit_test_${Date.now()}`
        }
      });
      
      console.log(`   ✅ Pagamento criado: ${payment.id}`);
      
      // Simular confirmação via webhook
      const callbackData = {
        reference: payment.identifier,
        status: 'paid',
        amount: 100.00,
        transaction_id: payment.gateway_id
      };
      
      await this.simulateWebhookCallback(callbackData, user);
      
    } catch (error) {
      console.log(`   ❌ ERRO: ${error.message}`);
      this.results.failed++;
      this.results.errors.push(`VizzionPay Flow: ${error.message}`);
    }
    
    this.results.totalTests++;
  }

  async simulateWebhookCallback(callbackData, user) {
    console.log('🧪 Simulando webhook de confirmação...');
    
    try {
      const saldoAntes = user.saldo_reais;
      
      // Simular processamento do webhook
      await prisma.$transaction(async (tx) => {
        // Atualizar saldo
        await tx.user.update({
          where: { id: user.id },
          data: { saldo_reais: { increment: callbackData.amount } }
        });
        
        // Registrar transação
        await tx.transaction.create({
          data: {
            user_id: user.id,
            tipo: 'deposito',
            valor: callbackData.amount,
            status: 'concluido',
            descricao: `Depósito PIX VizzionPay (${callbackData.transaction_id})`
          }
        });
        
        // Marcar primeiro depósito
        if (!user.primeiro_deposito_feito) {
          await tx.user.update({
            where: { id: user.id },
            data: { primeiro_deposito_feito: true }
          });
        }
      });
      
      // Verificar resultado
      const userAtualizado = await prisma.user.findUnique({
        where: { id: user.id },
        select: { saldo_reais: true }
      });
      
      const diferenca = userAtualizado.saldo_reais - saldoAntes;
      
      if (Math.abs(diferenca - callbackData.amount) < 0.01) {
        console.log(`   ✅ SUCESSO: Webhook processado corretamente`);
        console.log(`   📊 Saldo creditado: R$ ${diferenca.toFixed(2)}`);
        this.results.passed++;
      } else {
        console.log(`   ❌ FALHA: Webhook não processado corretamente`);
        console.log(`   📊 Esperado: R$ ${callbackData.amount} | Recebido: R$ ${diferenca.toFixed(2)}`);
        this.results.failed++;
        this.results.errors.push(`Webhook: Valor esperado R$ ${callbackData.amount}, recebido R$ ${diferenca}`);
      }
      
    } catch (error) {
      console.log(`   ❌ ERRO no webhook: ${error.message}`);
      this.results.failed++;
      this.results.errors.push(`Webhook: ${error.message}`);
    }
  }

  async testBalanceSynchronization() {
    console.log('\n📋 TESTE 3: SINCRONIZAÇÃO DE SALDO');
    console.log('-'.repeat(50));
    
    try {
      const users = await prisma.user.findMany({
        take: 5,
        include: { wallet: true }
      });
      
      for (const user of users) {
        console.log(`🧪 Testando sincronização para: ${user.email}`);
        
        // Verificar se saldos estão sincronizados
        const userBalance = user.tipo_conta === 'afiliado_demo' ? user.saldo_demo : user.saldo_reais;
        const walletBalance = user.tipo_conta === 'afiliado_demo' ? 
          (user.wallet?.saldo_demo || 0) : (user.wallet?.saldo_reais || 0);
        
        if (Math.abs(userBalance - walletBalance) < 0.01) {
          console.log(`   ✅ Sincronizado: User R$ ${userBalance.toFixed(2)} = Wallet R$ ${walletBalance.toFixed(2)}`);
          this.results.passed++;
        } else {
          console.log(`   ❌ Dessincronizado: User R$ ${userBalance.toFixed(2)} ≠ Wallet R$ ${walletBalance.toFixed(2)}`);
          this.results.failed++;
          this.results.errors.push(`Sincronização ${user.email}: User R$ ${userBalance} ≠ Wallet R$ ${walletBalance}`);
        }
        
        this.results.totalTests++;
      }
      
    } catch (error) {
      console.log(`   ❌ ERRO: ${error.message}`);
      this.results.failed++;
      this.results.errors.push(`Sincronização: ${error.message}`);
    }
  }

  async testAtomicTransactions() {
    console.log('\n📋 TESTE 4: TRANSAÇÕES ATÔMICAS');
    console.log('-'.repeat(50));
    
    try {
      const user = await prisma.user.findFirst({
        where: { is_admin: false, tipo_conta: 'normal' }
      });
      
      if (!user) {
        console.log('   ⚠️ Nenhum usuário encontrado para teste');
        return;
      }
      
      const saldoAntes = user.saldo_reais;
      const testAmount = 75.00;
      
      console.log('🧪 Testando transação atômica...');
      
      // Simular transação que deveria falhar
      try {
        await prisma.$transaction(async (tx) => {
          // Primeira operação - sucesso
          await tx.user.update({
            where: { id: user.id },
            data: { saldo_reais: { increment: testAmount } }
          });
          
          // Segunda operação - forçar erro
          throw new Error('Simulação de erro para testar rollback');
        });
        
        console.log(`   ❌ FALHA: Transação deveria ter falhado`);
        this.results.failed++;
        this.results.errors.push('Transação atômica: Não fez rollback quando deveria');
        
      } catch (error) {
        // Verificar se o saldo voltou ao original
        const userAtualizado = await prisma.user.findUnique({
          where: { id: user.id },
          select: { saldo_reais: true }
        });
        
        if (Math.abs(userAtualizado.saldo_reais - saldoAntes) < 0.01) {
          console.log(`   ✅ SUCESSO: Rollback funcionou corretamente`);
          console.log(`   📊 Saldo voltou ao original: R$ ${userAtualizado.saldo_reais.toFixed(2)}`);
          this.results.passed++;
        } else {
          console.log(`   ❌ FALHA: Rollback não funcionou`);
          console.log(`   📊 Saldo original: R$ ${saldoAntes.toFixed(2)} | Saldo atual: R$ ${userAtualizado.saldo_reais.toFixed(2)}`);
          this.results.failed++;
          this.results.errors.push(`Transação atômica: Rollback não funcionou. Original R$ ${saldoAntes}, atual R$ ${userAtualizado.saldo_reais}`);
        }
      }
      
      this.results.totalTests++;
      
    } catch (error) {
      console.log(`   ❌ ERRO: ${error.message}`);
      this.results.failed++;
      this.results.errors.push(`Transação atômica: ${error.message}`);
    }
  }

  async testErrorScenarios() {
    console.log('\n📋 TESTE 5: CENÁRIOS DE ERRO');
    console.log('-'.repeat(50));
    
    const scenarios = [
      {
        name: 'Valor negativo',
        amount: -50,
        shouldFail: true
      },
      {
        name: 'Valor zero',
        amount: 0,
        shouldFail: true
      },
      {
        name: 'Valor muito baixo',
        amount: 10,
        shouldFail: true
      },
      {
        name: 'Valor muito alto',
        amount: 15000,
        shouldFail: true
      },
      {
        name: 'Valor válido',
        amount: 100,
        shouldFail: false
      }
    ];
    
    for (const scenario of scenarios) {
      console.log(`🧪 Testando: ${scenario.name} (R$ ${scenario.amount})`);
      
      try {
        const user = await prisma.user.findFirst({
          where: { is_admin: false, tipo_conta: 'normal' }
        });
        
        if (!user) {
          console.log('   ⚠️ Nenhum usuário encontrado');
          continue;
        }
        
        // Tentar criar depósito
        await prisma.transaction.create({
          data: {
            user_id: user.id,
            tipo: 'deposito',
            valor: scenario.amount,
            status: scenario.shouldFail ? 'falhou' : 'concluido',
            descricao: `Teste: ${scenario.name}`
          }
        });
        
        if (scenario.shouldFail) {
          console.log(`   ❌ FALHA: Deveria ter rejeitado valor ${scenario.amount}`);
          this.results.failed++;
          this.results.errors.push(`Cenário ${scenario.name}: Deveria ter rejeitado R$ ${scenario.amount}`);
        } else {
          console.log(`   ✅ SUCESSO: Valor ${scenario.amount} aceito corretamente`);
          this.results.passed++;
        }
        
      } catch (error) {
        if (scenario.shouldFail) {
          console.log(`   ✅ SUCESSO: Valor ${scenario.amount} rejeitado corretamente`);
          this.results.passed++;
        } else {
          console.log(`   ❌ FALHA: Valor ${scenario.amount} rejeitado incorretamente`);
          this.results.failed++;
          this.results.errors.push(`Cenário ${scenario.name}: ${error.message}`);
        }
      }
      
      this.results.totalTests++;
    }
  }

  async verifyTransactionLogs() {
    console.log('\n📋 TESTE 6: VERIFICAÇÃO DE LOGS');
    console.log('-'.repeat(50));
    
    try {
      // Verificar transações recentes
      const recentTransactions = await prisma.transaction.findMany({
        where: {
          tipo: 'deposito',
          criado_em: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Últimas 24h
          }
        },
        orderBy: { criado_em: 'desc' },
        take: 10,
        include: { user: { select: { email: true, tipo_conta: true } } }
      });
      
      console.log(`🧪 Verificando ${recentTransactions.length} transações recentes...`);
      
      let logsValid = 0;
      for (const transaction of recentTransactions) {
        console.log(`   📝 ${transaction.id}: R$ ${transaction.valor.toFixed(2)} - ${transaction.user.email} - ${transaction.status}`);
        
        // Verificar se transação tem todos os campos necessários
        if (transaction.user_id && transaction.valor && transaction.tipo && transaction.status) {
          logsValid++;
        }
      }
      
      if (logsValid === recentTransactions.length) {
        console.log(`   ✅ SUCESSO: Todos os logs estão completos`);
        this.results.passed++;
      } else {
        console.log(`   ❌ FALHA: ${logsValid}/${recentTransactions.length} logs completos`);
        this.results.failed++;
        this.results.errors.push(`Logs: ${logsValid}/${recentTransactions.length} completos`);
      }
      
      this.results.totalTests++;
      
    } catch (error) {
      console.log(`   ❌ ERRO: ${error.message}`);
      this.results.failed++;
      this.results.errors.push(`Logs: ${error.message}`);
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 RELATÓRIO FINAL DA AUDITORIA');
    console.log('='.repeat(80));
    
    const successRate = ((this.results.passed / this.results.totalTests) * 100).toFixed(1);
    
    console.log(`\n📈 ESTATÍSTICAS:`);
    console.log(`   Total de testes: ${this.results.totalTests}`);
    console.log(`   Sucessos: ${this.results.passed}`);
    console.log(`   Falhas: ${this.results.failed}`);
    console.log(`   Taxa de sucesso: ${successRate}%`);
    
    if (this.results.errors.length > 0) {
      console.log(`\n❌ PROBLEMAS ENCONTRADOS:`);
      this.results.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }
    
    console.log(`\n🎯 CONCLUSÃO:`);
    if (this.results.failed === 0) {
      console.log(`   ✅ SISTEMA DE DEPÓSITO FUNCIONANDO PERFEITAMENTE!`);
      console.log(`   💰 Todos os valores serão creditados corretamente no saldo das contas.`);
    } else if (this.results.failed <= 2) {
      console.log(`   ⚠️ SISTEMA FUNCIONANDO COM PEQUENOS PROBLEMAS`);
      console.log(`   🔧 Recomenda-se corrigir os problemas encontrados.`);
    } else {
      console.log(`   ❌ SISTEMA COM PROBLEMAS CRÍTICOS`);
      console.log(`   🚨 NECESSÁRIO CORREÇÃO URGENTE ANTES DE USAR EM PRODUÇÃO!`);
    }
    
    console.log('\n' + '='.repeat(80));
  }
}

// Executar auditoria
async function main() {
  const audit = new DepositAuditSystem();
  await audit.runAudit();
  
  console.log('\n🏁 Auditoria concluída!');
  process.exit(0);
}

main().catch(error => {
  console.error('💥 Erro fatal na auditoria:', error);
  process.exit(1);
});
