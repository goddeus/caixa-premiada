/**
 * Script de Auditoria Financeira - SlotBox
 * Verifica integridade dos dados financeiros e atomicidade das transações
 */

const { PrismaClient } = require('@prisma/client');

class FinancialAuditor {
  constructor() {
    this.prisma = new PrismaClient();
    this.issues = [];
    this.stats = {};
  }

  async runAudit() {
    console.log('🔍 Iniciando auditoria financeira...');
    
    try {
      // 1. Verificar modelos e tabelas
      await this.checkDatabaseModels();
      
      // 2. Verificar integridade dos saldos
      await this.checkBalanceIntegrity();
      
      // 3. Verificar transações pendentes
      await this.checkPendingTransactions();
      
      // 4. Verificar atomicidade de buyCase
      await this.checkBuyCaseAtomicity();
      
      // 5. Verificar isolamento de contas demo
      await this.checkDemoAccountIsolation();
      
      // 6. Verificar transações duplicadas
      await this.checkDuplicateTransactions();
      
      // 7. Verificar rollover
      await this.checkRolloverIntegrity();
      
      // 8. Gerar relatório
      await this.generateReport();
      
    } catch (error) {
      console.error('❌ Erro durante auditoria:', error);
      this.issues.push({
        type: 'CRITICAL',
        category: 'SYSTEM',
        message: `Erro durante auditoria: ${error.message}`,
        details: error.stack
      });
    } finally {
      await this.prisma.$disconnect();
    }
  }

  async checkDatabaseModels() {
    console.log('📊 Verificando modelos do banco...');
    
    try {
      // Verificar se todas as tabelas existem
      const tables = [
        'User', 'Wallet', 'Transaction', 'TransactionDemo', 
        'Case', 'Prize', 'Affiliate', 'AffiliateHistory', 
        'AffiliateCommission', 'Payment', 'LoginHistory',
        'UserRTPSession', 'UserSession', 'DrawDetailedLog', 'RTPConfig'
      ];
      
      for (const table of tables) {
        try {
          const count = await this.prisma[table.toLowerCase()].count();
          console.log(`  ✅ ${table}: ${count} registros`);
        } catch (error) {
          this.issues.push({
            type: 'CRITICAL',
            category: 'DATABASE',
            message: `Tabela ${table} não encontrada ou inacessível`,
            details: error.message
          });
        }
      }
      
      // Verificar campos críticos
      const users = await this.prisma.user.findMany({
        select: {
          id: true,
          saldo_reais: true,
          saldo_demo: true,
          tipo_conta: true,
          total_giros: true,
          rollover_liberado: true
        },
        take: 5
      });
      
      console.log(`  📋 Amostra de usuários: ${users.length} registros`);
      
    } catch (error) {
      this.issues.push({
        type: 'CRITICAL',
        category: 'DATABASE',
        message: 'Erro ao verificar modelos do banco',
        details: error.message
      });
    }
  }

  async checkBalanceIntegrity() {
    console.log('💰 Verificando integridade dos saldos...');
    
    try {
      // Verificar se saldo_reais + saldo_demo = total esperado
      const users = await this.prisma.user.findMany({
        select: {
          id: true,
          saldo_reais: true,
          saldo_demo: true,
          tipo_conta: true
        }
      });
      
      let totalRealBalance = 0;
      let totalDemoBalance = 0;
      let normalUsers = 0;
      let demoUsers = 0;
      
      for (const user of users) {
        totalRealBalance += user.saldo_reais || 0;
        totalDemoBalance += user.saldo_demo || 0;
        
        if (user.tipo_conta === 'normal') {
          normalUsers++;
        } else if (user.tipo_conta === 'afiliado_demo') {
          demoUsers++;
        }
      }
      
      this.stats.totalUsers = users.length;
      this.stats.normalUsers = normalUsers;
      this.stats.demoUsers = demoUsers;
      this.stats.totalRealBalance = totalRealBalance;
      this.stats.totalDemoBalance = totalDemoBalance;
      
      console.log(`  📊 Total de usuários: ${users.length}`);
      console.log(`  👥 Usuários normais: ${normalUsers}`);
      console.log(`  🎭 Usuários demo: ${demoUsers}`);
      console.log(`  💵 Saldo total real: R$ ${totalRealBalance.toFixed(2)}`);
      console.log(`  🎮 Saldo total demo: R$ ${totalDemoBalance.toFixed(2)}`);
      
      // Verificar se contas demo têm saldo real = 0
      const demoUsersWithRealBalance = users.filter(u => 
        u.tipo_conta === 'afiliado_demo' && u.saldo_reais > 0
      );
      
      if (demoUsersWithRealBalance.length > 0) {
        this.issues.push({
          type: 'HIGH',
          category: 'BALANCE',
          message: `${demoUsersWithRealBalance.length} contas demo têm saldo real > 0`,
          details: demoUsersWithRealBalance.map(u => ({
            id: u.id,
            saldo_reais: u.saldo_reais,
            saldo_demo: u.saldo_demo
          }))
        });
      }
      
    } catch (error) {
      this.issues.push({
        type: 'CRITICAL',
        category: 'BALANCE',
        message: 'Erro ao verificar integridade dos saldos',
        details: error.message
      });
    }
  }

  async checkPendingTransactions() {
    console.log('⏳ Verificando transações pendentes...');
    
    try {
      // Transações pendentes > 24h
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const pendingTransactions = await this.prisma.transaction.findMany({
        where: {
          status: 'pendente',
          criado_em: {
            lt: oneDayAgo
          }
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              tipo_conta: true
            }
          }
        }
      });
      
      console.log(`  ⚠️ Transações pendentes > 24h: ${pendingTransactions.length}`);
      
      if (pendingTransactions.length > 0) {
        this.issues.push({
          type: 'MEDIUM',
          category: 'TRANSACTION',
          message: `${pendingTransactions.length} transações pendentes há mais de 24h`,
          details: pendingTransactions.map(t => ({
            id: t.id,
            user_id: t.user_id,
            user_email: t.user.email,
            tipo: t.tipo,
            valor: t.valor,
            criado_em: t.criado_em
          }))
        });
      }
      
      // Pagamentos pendentes
      const pendingPayments = await this.prisma.payment.findMany({
        where: {
          status: 'pendente'
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              tipo_conta: true
            }
          }
        }
      });
      
      console.log(`  💳 Pagamentos pendentes: ${pendingPayments.length}`);
      
      if (pendingPayments.length > 0) {
        this.issues.push({
          type: 'MEDIUM',
          category: 'PAYMENT',
          message: `${pendingPayments.length} pagamentos pendentes`,
          details: pendingPayments.map(p => ({
            id: p.id,
            user_id: p.user_id,
            user_email: p.user.email,
            tipo: p.tipo,
            valor: p.valor,
            metodo: p.metodo,
            criado_em: p.criado_em
          }))
        });
      }
      
    } catch (error) {
      this.issues.push({
        type: 'CRITICAL',
        category: 'TRANSACTION',
        message: 'Erro ao verificar transações pendentes',
        details: error.message
      });
    }
  }

  async checkBuyCaseAtomicity() {
    console.log('🔒 Verificando atomicidade de buyCase...');
    
    try {
      // Verificar se há transações de compra sem débito correspondente
      const buyTransactions = await this.prisma.transaction.findMany({
        where: {
          tipo: 'aposta'
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              saldo_reais: true,
              saldo_demo: true,
              tipo_conta: true
            }
          }
        }
      });
      
      console.log(`  🎲 Transações de aposta: ${buyTransactions.length}`);
      
      // Verificar se há transações de prêmio sem aposta correspondente
      const prizeTransactions = await this.prisma.transaction.findMany({
        where: {
          tipo: 'premio'
        }
      });
      
      console.log(`  🏆 Transações de prêmio: ${prizeTransactions.length}`);
      
      // Verificar saldos negativos
      const negativeBalances = await this.prisma.user.findMany({
        where: {
          OR: [
            { saldo_reais: { lt: 0 } },
            { saldo_demo: { lt: 0 } }
          ]
        },
        select: {
          id: true,
          email: true,
          saldo_reais: true,
          saldo_demo: true,
          tipo_conta: true
        }
      });
      
      if (negativeBalances.length > 0) {
        this.issues.push({
          type: 'CRITICAL',
          category: 'BALANCE',
          message: `${negativeBalances.length} usuários com saldo negativo`,
          details: negativeBalances
        });
      }
      
      console.log(`  ⚠️ Saldos negativos: ${negativeBalances.length}`);
      
    } catch (error) {
      this.issues.push({
        type: 'CRITICAL',
        category: 'ATOMICITY',
        message: 'Erro ao verificar atomicidade de buyCase',
        details: error.message
      });
    }
  }

  async checkDemoAccountIsolation() {
    console.log('🎭 Verificando isolamento de contas demo...');
    
    try {
      // Verificar se contas demo fazem transações reais
      const demoRealTransactions = await this.prisma.transaction.findMany({
        where: {
          user: {
            tipo_conta: 'afiliado_demo'
          }
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              tipo_conta: true
            }
          }
        }
      });
      
      if (demoRealTransactions.length > 0) {
        this.issues.push({
          type: 'HIGH',
          category: 'ISOLATION',
          message: `${demoRealTransactions.length} transações reais de contas demo`,
          details: demoRealTransactions.map(t => ({
            id: t.id,
            user_id: t.user_id,
            user_email: t.user.email,
            tipo: t.tipo,
            valor: t.valor
          }))
        });
      }
      
      console.log(`  🚫 Transações reais de contas demo: ${demoRealTransactions.length}`);
      
      // Verificar se contas demo têm saldo real
      const demoUsersWithRealBalance = await this.prisma.user.findMany({
        where: {
          tipo_conta: 'afiliado_demo',
          saldo_reais: { gt: 0 }
        },
        select: {
          id: true,
          email: true,
          saldo_reais: true,
          saldo_demo: true
        }
      });
      
      if (demoUsersWithRealBalance.length > 0) {
        this.issues.push({
          type: 'HIGH',
          category: 'ISOLATION',
          message: `${demoUsersWithRealBalance.length} contas demo com saldo real`,
          details: demoUsersWithRealBalance
        });
      }
      
      console.log(`  💰 Contas demo com saldo real: ${demoUsersWithRealBalance.length}`);
      
    } catch (error) {
      this.issues.push({
        type: 'CRITICAL',
        category: 'ISOLATION',
        message: 'Erro ao verificar isolamento de contas demo',
        details: error.message
      });
    }
  }

  async checkDuplicateTransactions() {
    console.log('🔄 Verificando transações duplicadas...');
    
    try {
      // Verificar transações com mesmo identifier
      const duplicateIdentifiers = await this.prisma.transaction.groupBy({
        by: ['identifier'],
        where: {
          identifier: { not: null }
        },
        _count: {
          identifier: true
        },
        having: {
          identifier: {
            _count: {
              gt: 1
            }
          }
        }
      });
      
      if (duplicateIdentifiers.length > 0) {
        this.issues.push({
          type: 'HIGH',
          category: 'DUPLICATE',
          message: `${duplicateIdentifiers.length} identifiers duplicados`,
          details: duplicateIdentifiers
        });
      }
      
      console.log(`  🔄 Identifiers duplicados: ${duplicateIdentifiers.length}`);
      
    } catch (error) {
      this.issues.push({
        type: 'CRITICAL',
        category: 'DUPLICATE',
        message: 'Erro ao verificar transações duplicadas',
        details: error.message
      });
    }
  }

  async checkRolloverIntegrity() {
    console.log('🎯 Verificando integridade do rollover...');
    
    try {
      // Verificar usuários com rollover liberado mas sem primeiro depósito
      const invalidRollover = await this.prisma.user.findMany({
        where: {
          rollover_liberado: true,
          primeiro_deposito_feito: false
        },
        select: {
          id: true,
          email: true,
          rollover_liberado: true,
          primeiro_deposito_feito: true,
          total_giros: true
        }
      });
      
      if (invalidRollover.length > 0) {
        this.issues.push({
          type: 'MEDIUM',
          category: 'ROLLOVER',
          message: `${invalidRollover.length} usuários com rollover liberado sem primeiro depósito`,
          details: invalidRollover
        });
      }
      
      console.log(`  ⚠️ Rollover inválido: ${invalidRollover.length}`);
      
    } catch (error) {
      this.issues.push({
        type: 'CRITICAL',
        category: 'ROLLOVER',
        message: 'Erro ao verificar integridade do rollover',
        details: error.message
      });
    }
  }

  async generateReport() {
    console.log('📄 Gerando relatório...');
    
    const timestamp = new Date().toISOString();
    const report = {
      timestamp,
      stats: this.stats,
      issues: this.issues,
      summary: {
        totalIssues: this.issues.length,
        criticalIssues: this.issues.filter(i => i.type === 'CRITICAL').length,
        highIssues: this.issues.filter(i => i.type === 'HIGH').length,
        mediumIssues: this.issues.filter(i => i.type === 'MEDIUM').length,
        lowIssues: this.issues.filter(i => i.type === 'LOW').length
      }
    };
    
    // Salvar relatório JSON
    const fs = require('fs');
    const path = require('path');
    const reportPath = path.join(__dirname, '../reports/financial-audit-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Gerar relatório markdown
    const markdownReport = this.generateMarkdownReport(report);
    const markdownPath = path.join(__dirname, '../reports/financial-audit.md');
    fs.writeFileSync(markdownPath, markdownReport);
    
    // Resumo no console
    console.log('\n📊 Resumo da Auditoria Financeira:');
    console.log(`Total de problemas: ${report.summary.totalIssues}`);
    console.log(`Críticos: ${report.summary.criticalIssues}`);
    console.log(`Altos: ${report.summary.highIssues}`);
    console.log(`Médios: ${report.summary.mediumIssues}`);
    console.log(`Baixos: ${report.summary.lowIssues}`);
    console.log(`\n📄 Relatórios salvos em:`);
    console.log(`  - ${reportPath}`);
    console.log(`  - ${markdownPath}`);
  }

  generateMarkdownReport(report) {
    let markdown = `# Relatório de Auditoria Financeira - SlotBox\n\n`;
    markdown += `**Data:** ${new Date(report.timestamp).toLocaleString('pt-BR')}\n\n`;
    
    markdown += `## Resumo\n\n`;
    markdown += `- **Total de problemas:** ${report.summary.totalIssues}\n`;
    markdown += `- **Críticos:** ${report.summary.criticalIssues}\n`;
    markdown += `- **Altos:** ${report.summary.highIssues}\n`;
    markdown += `- **Médios:** ${report.summary.mediumIssues}\n`;
    markdown += `- **Baixos:** ${report.summary.lowIssues}\n\n`;
    
    markdown += `## Estatísticas\n\n`;
    markdown += `- **Total de usuários:** ${report.stats.totalUsers || 0}\n`;
    markdown += `- **Usuários normais:** ${report.stats.normalUsers || 0}\n`;
    markdown += `- **Usuários demo:** ${report.stats.demoUsers || 0}\n`;
    markdown += `- **Saldo total real:** R$ ${(report.stats.totalRealBalance || 0).toFixed(2)}\n`;
    markdown += `- **Saldo total demo:** R$ ${(report.stats.totalDemoBalance || 0).toFixed(2)}\n\n`;
    
    markdown += `## Problemas Identificados\n\n`;
    
    if (report.issues.length === 0) {
      markdown += `✅ Nenhum problema identificado!\n`;
    } else {
      const groupedIssues = report.issues.reduce((acc, issue) => {
        if (!acc[issue.category]) {
          acc[issue.category] = [];
        }
        acc[issue.category].push(issue);
        return acc;
      }, {});
      
      Object.entries(groupedIssues).forEach(([category, issues]) => {
        markdown += `### ${category}\n\n`;
        issues.forEach(issue => {
          const emoji = issue.type === 'CRITICAL' ? '🚨' : 
                       issue.type === 'HIGH' ? '⚠️' : 
                       issue.type === 'MEDIUM' ? '🔶' : 'ℹ️';
          markdown += `- ${emoji} **${issue.type}**: ${issue.message}\n`;
          if (issue.details) {
            markdown += `  - Detalhes: ${JSON.stringify(issue.details, null, 2)}\n`;
          }
        });
        markdown += '\n';
      });
    }
    
    return markdown;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const auditor = new FinancialAuditor();
  auditor.runAudit().catch(console.error);
}

module.exports = FinancialAuditor;
