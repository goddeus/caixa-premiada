/**
 * SCRIPT PARA VERIFICAR E CORRIGIR SALDO DO USUÁRIO
 * 
 * Este script verifica o saldo atual do usuário paulotest@gmail.com
 * e corrige se necessário
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUserBalance() {
  try {
    console.log('🔍 VERIFICANDO SALDO DO USUÁRIO...\n');
    
    const userId = '6f73f55f-f9d6-4108-8838-ab76407d7e63';
    const userEmail = 'paulotest@gmail.com';
    
    // 1. Buscar dados completos do usuário
    console.log('👤 Buscando dados do usuário...');
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { 
        wallet: true,
        transactions: {
          where: { tipo: 'deposito' },
          orderBy: { criado_em: 'desc' },
          take: 5
        }
      }
    });
    
    if (!user) {
      console.error('❌ Usuário não encontrado!');
      return;
    }
    
    console.log(`✅ Usuário encontrado: ${user.email}`);
    console.log(`   Nome: ${user.nome}`);
    console.log(`   Tipo de conta: ${user.tipo_conta}`);
    console.log(`   Saldo reais (User): R$ ${user.saldo_reais}`);
    console.log(`   Saldo demo (User): R$ ${user.saldo_demo}`);
    console.log(`   Saldo reais (Wallet): R$ ${user.wallet?.saldo_reais || 0}`);
    console.log(`   Saldo demo (Wallet): R$ ${user.wallet?.saldo_demo || 0}`);
    console.log(`   Affiliate ID: ${user.affiliate_id || 'Nenhum'}`);
    console.log(`   Código usado: ${user.codigo_indicacao_usado || 'Nenhum'}`);
    
    // 2. Verificar transações de depósito
    console.log('\n💰 Verificando transações de depósito...');
    if (user.transactions.length > 0) {
      console.log(`✅ Encontradas ${user.transactions.length} transações de depósito:`);
      
      user.transactions.forEach((tx, index) => {
        console.log(`   ${index + 1}. ID: ${tx.id}`);
        console.log(`      Valor: R$ ${tx.valor}`);
        console.log(`      Status: ${tx.status}`);
        console.log(`      Data: ${tx.criado_em}`);
        console.log(`      Identifier: ${tx.identifier || 'N/A'}`);
        console.log(`      Saldo antes: R$ ${tx.saldo_antes || 0}`);
        console.log(`      Saldo depois: R$ ${tx.saldo_depois || 0}`);
        console.log('');
      });
      
      // Calcular saldo esperado
      const depositosConcluidos = user.transactions.filter(tx => tx.status === 'concluido');
      const totalDepositado = depositosConcluidos.reduce((sum, tx) => sum + tx.valor, 0);
      
      console.log(`📊 RESUMO:`);
      console.log(`   Total depositado: R$ ${totalDepositado}`);
      console.log(`   Saldo atual: R$ ${user.saldo_reais}`);
      console.log(`   Diferença: R$ ${totalDepositado - user.saldo_reais}`);
      
      // 3. Verificar se há discrepância
      if (Math.abs(totalDepositado - user.saldo_reais) > 0.01) {
        console.log('\n❌ DISCREPÂNCIA ENCONTRADA!');
        console.log('🔧 Corrigindo saldo...');
        
        // Corrigir saldo do usuário
        await prisma.user.update({
          where: { id: userId },
          data: { saldo_reais: totalDepositado }
        });
        
        // Corrigir saldo da carteira
        await prisma.wallet.update({
          where: { user_id: userId },
          data: { saldo_reais: totalDepositado }
        });
        
        console.log('✅ Saldo corrigido!');
        console.log(`   Novo saldo: R$ ${totalDepositado}`);
      } else {
        console.log('\n✅ Saldo está correto!');
      }
      
    } else {
      console.log('❌ Nenhuma transação de depósito encontrada!');
    }
    
    // 4. Verificar transações por identifier específico
    console.log('\n🔍 Verificando transação específica...');
    const specificTransaction = await prisma.transaction.findFirst({
      where: {
        identifier: 'deposit_6f73f55f-f9d6-4108-8838-ab76407d7e63_1758208348757',
        tipo: 'deposito'
      }
    });
    
    if (specificTransaction) {
      console.log(`✅ Transação específica encontrada:`);
      console.log(`   ID: ${specificTransaction.id}`);
      console.log(`   Valor: R$ ${specificTransaction.valor}`);
      console.log(`   Status: ${specificTransaction.status}`);
      console.log(`   Data: ${specificTransaction.criado_em}`);
      console.log(`   Saldo antes: R$ ${specificTransaction.saldo_antes || 0}`);
      console.log(`   Saldo depois: R$ ${specificTransaction.saldo_depois || 0}`);
      
      if (specificTransaction.status === 'concluido' && specificTransaction.valor === 20.00) {
        console.log('✅ Transação está correta!');
      } else {
        console.log('❌ Transação com problema!');
      }
    } else {
      console.log('❌ Transação específica não encontrada!');
    }
    
    // 5. Verificar dados finais
    console.log('\n📋 DADOS FINAIS:');
    console.log('================');
    
    const finalUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { wallet: true }
    });
    
    console.log(`👤 Usuário: ${finalUser.email}`);
    console.log(`💰 Saldo reais: R$ ${finalUser.saldo_reais}`);
    console.log(`💰 Saldo demo: R$ ${finalUser.saldo_demo}`);
    console.log(`💳 Wallet reais: R$ ${finalUser.wallet?.saldo_reais || 0}`);
    console.log(`💳 Wallet demo: R$ ${finalUser.wallet?.saldo_demo || 0}`);
    console.log(`🎯 Afiliado: ${finalUser.affiliate_id ? 'Vinculado' : 'Não vinculado'}`);
    console.log(`📝 Código usado: ${finalUser.codigo_indicacao_usado || 'Nenhum'}`);
    
    // 6. Verificar se há problemas de sincronização
    const userBalance = finalUser.saldo_reais;
    const walletBalance = finalUser.wallet?.saldo_reais || 0;
    const difference = Math.abs(userBalance - walletBalance);
    
    if (difference > 0.01) {
      console.log(`\n⚠️  PROBLEMA DE SINCRONIZAÇÃO:`);
      console.log(`   User: R$ ${userBalance}`);
      console.log(`   Wallet: R$ ${walletBalance}`);
      console.log(`   Diferença: R$ ${difference}`);
      
      console.log('🔧 Sincronizando carteira...');
      await prisma.wallet.update({
        where: { user_id: userId },
        data: { saldo_reais: userBalance }
      });
      
      console.log('✅ Carteira sincronizada!');
    } else {
      console.log('\n✅ Carteira sincronizada!');
    }
    
  } catch (error) {
    console.error('❌ Erro durante verificação:', error);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar verificação
checkUserBalance();
