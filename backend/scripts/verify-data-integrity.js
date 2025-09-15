/**
 * Script de Verificação de Integridade dos Dados
 * Verifica consistência entre tabelas após rollback
 */

require('dotenv').config({ path: '../.env.production' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyDataIntegrity() {
  console.log('🔍 Iniciando verificação de integridade dos dados...');
  
  const issues = [];
  
  try {
    // 1. Verificar consistência de saldos entre User e Wallet
    console.log('📊 Verificando consistência de saldos...');
    
    const users = await prisma.user.findMany({
      include: {
        wallet: true
      }
    });
    
    for (const user of users) {
      if (user.wallet) {
        if (user.saldo_reais !== user.wallet.saldo_reais) {
          issues.push({
            type: 'SALDO_REAIS_INCONSISTENTE',
            user_id: user.id,
            user_saldo: user.saldo_reais,
            wallet_saldo: user.wallet.saldo_reais
          });
        }
        
        if (user.saldo_demo !== user.wallet.saldo_demo) {
          issues.push({
            type: 'SALDO_DEMO_INCONSISTENTE',
            user_id: user.id,
            user_saldo: user.saldo_demo,
            wallet_saldo: user.wallet.saldo_demo
          });
        }
      } else {
        issues.push({
          type: 'WALLET_NAO_ENCONTRADO',
          user_id: user.id
        });
      }
    }
    
    // 2. Verificar transações órfãs
    console.log('🔗 Verificando transações órfãs...');
    
    const orphanTransactions = await prisma.transaction.findMany({
      where: {
        user: null
      }
    });
    
    if (orphanTransactions.length > 0) {
      issues.push({
        type: 'TRANSACOES_ORFAS',
        count: orphanTransactions.length,
        transaction_ids: orphanTransactions.map(t => t.id)
      });
    }
    
    // 3. Verificar pagamentos órfãos
    console.log('💳 Verificando pagamentos órfãos...');
    
    const orphanPayments = await prisma.payment.findMany({
      where: {
        user: null
      }
    });
    
    if (orphanPayments.length > 0) {
      issues.push({
        type: 'PAGAMENTOS_ORFAOS',
        count: orphanPayments.length,
        payment_ids: orphanPayments.map(p => p.id)
      });
    }
    
    // 4. Verificar prêmios órfãos
    console.log('🎁 Verificando prêmios órfãos...');
    
    const orphanPrizes = await prisma.prize.findMany({
      where: {
        case: null
      }
    });
    
    if (orphanPrizes.length > 0) {
      issues.push({
        type: 'PREMIOS_ORFAOS',
        count: orphanPrizes.length,
        prize_ids: orphanPrizes.map(p => p.id)
      });
    }
    
    // 5. Verificar sessões órfãs
    console.log('👤 Verificando sessões órfãs...');
    
    const orphanSessions = await prisma.userSession.findMany({
      where: {
        user: null
      }
    });
    
    if (orphanSessions.length > 0) {
      issues.push({
        type: 'SESSOES_ORFAS',
        count: orphanSessions.length,
        session_ids: orphanSessions.map(s => s.id)
      });
    }
    
    // 6. Verificar saldos negativos
    console.log('💰 Verificando saldos negativos...');
    
    const negativeBalances = await prisma.user.findMany({
      where: {
        OR: [
          { saldo_reais: { lt: 0 } },
          { saldo_demo: { lt: 0 } }
        ]
      }
    });
    
    if (negativeBalances.length > 0) {
      issues.push({
        type: 'SALDOS_NEGATIVOS',
        count: negativeBalances.length,
        users: negativeBalances.map(u => ({
          id: u.id,
          saldo_reais: u.saldo_reais,
          saldo_demo: u.saldo_demo
        }))
      });
    }
    
    // 7. Verificar transações com valores inconsistentes
    console.log('🔢 Verificando valores inconsistentes...');
    
    const inconsistentTransactions = await prisma.transaction.findMany({
      where: {
        OR: [
          { valor: null },
          { valor: 0, tipo: { not: 'ilustrativo' } }
        ]
      }
    });
    
    if (inconsistentTransactions.length > 0) {
      issues.push({
        type: 'TRANSACOES_VALOR_INCONSISTENTE',
        count: inconsistentTransactions.length,
        transaction_ids: inconsistentTransactions.map(t => t.id)
      });
    }
    
    // 8. Verificar configuração de RTP
    console.log('🎯 Verificando configuração de RTP...');
    
    const rtpConfigs = await prisma.rTPConfig.findMany({
      where: {
        ativo: true
      }
    });
    
    if (rtpConfigs.length === 0) {
      issues.push({
        type: 'RTP_CONFIG_NAO_ENCONTRADO',
        message: 'Nenhuma configuração de RTP ativa encontrada'
      });
    } else if (rtpConfigs.length > 1) {
      issues.push({
        type: 'MULTIPLAS_RTP_CONFIGS',
        count: rtpConfigs.length,
        config_ids: rtpConfigs.map(c => c.id)
      });
    }
    
    // 9. Verificar caixas sem prêmios
    console.log('📦 Verificando caixas sem prêmios...');
    
    const casesWithoutPrizes = await prisma.case.findMany({
      where: {
        ativo: true,
        prizes: {
          none: {
            ativo: true
          }
        }
      }
    });
    
    if (casesWithoutPrizes.length > 0) {
      issues.push({
        type: 'CAIXAS_SEM_PREMIOS',
        count: casesWithoutPrizes.length,
        case_ids: casesWithoutPrizes.map(c => c.id)
      });
    }
    
    // 10. Verificar estatísticas gerais
    console.log('📈 Calculando estatísticas gerais...');
    
    const stats = {
      total_users: await prisma.user.count(),
      total_cases: await prisma.case.count(),
      total_prizes: await prisma.prize.count(),
      total_transactions: await prisma.transaction.count(),
      total_payments: await prisma.payment.count(),
      total_sessions: await prisma.userSession.count(),
      total_affiliates: await prisma.affiliate.count()
    };
    
    console.log('📊 Estatísticas do sistema:');
    console.log(`   • Usuários: ${stats.total_users}`);
    console.log(`   • Caixas: ${stats.total_cases}`);
    console.log(`   • Prêmios: ${stats.total_prizes}`);
    console.log(`   • Transações: ${stats.total_transactions}`);
    console.log(`   • Pagamentos: ${stats.total_payments}`);
    console.log(`   • Sessões: ${stats.total_sessions}`);
    console.log(`   • Afiliados: ${stats.total_affiliates}`);
    
    // Relatório final
    console.log('\n📋 RELATÓRIO DE INTEGRIDADE:');
    
    if (issues.length === 0) {
      console.log('✅ Nenhum problema de integridade encontrado!');
    } else {
      console.log(`❌ ${issues.length} problema(s) de integridade encontrado(s):`);
      
      issues.forEach((issue, index) => {
        console.log(`\n${index + 1}. ${issue.type}:`);
        console.log(JSON.stringify(issue, null, 2));
      });
      
      // Salvar relatório em arquivo
      const fs = require('fs');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const reportFile = `logs/integrity_report_${timestamp}.json`;
      
      fs.writeFileSync(reportFile, JSON.stringify({
        timestamp: new Date().toISOString(),
        issues,
        stats
      }, null, 2));
      
      console.log(`\n📄 Relatório salvo em: ${reportFile}`);
    }
    
  } catch (error) {
    console.error('❌ Erro durante verificação de integridade:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar verificação
verifyDataIntegrity()
  .then(() => {
    console.log('✅ Verificação de integridade concluída');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Falha na verificação de integridade:', error);
    process.exit(1);
  });
