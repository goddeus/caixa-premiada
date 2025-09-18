/**
 * Script para corrigir o problema do webhook e processar o depósito manualmente
 */

const { PrismaClient } = require('@prisma/client');
const AffiliateService = require('./src/services/affiliateService');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔧 Iniciando correção do depósito...\n');
    
    // Dados do depósito que falhou
    const identifier = 'deposit_6f73f55f-f9d6-4108-8838-ab76407d7e63_1758208348757';
    const amount = 20.00;
    const userId = '6f73f55f-f9d6-4108-8838-ab76407d7e63';
    
    console.log(`📋 Dados do depósito:`);
    console.log(`   Identifier: ${identifier}`);
    console.log(`   Valor: R$ ${amount}`);
    console.log(`   User ID: ${userId}\n`);
    
    // 1. Verificar se o usuário existe
    console.log('👤 Verificando usuário...');
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { wallet: true }
    });
    
    if (!user) {
      console.error('❌ Usuário não encontrado!');
      return;
    }
    
    console.log(`✅ Usuário encontrado: ${user.email}`);
    console.log(`   Tipo de conta: ${user.tipo_conta}`);
    console.log(`   Saldo atual (reais): R$ ${user.saldo_reais}`);
    console.log(`   Saldo atual (demo): R$ ${user.saldo_demo}`);
    
    // 2. Verificar se o depósito existe
    console.log('\n🔍 Buscando depósito na base de dados...');
    
    let deposit = await prisma.transaction.findFirst({
      where: { 
        identifier,
        tipo: 'deposito'
      },
      include: { user: true }
    });
    
    if (!deposit) {
      console.log('❌ Depósito não encontrado na base de dados!');
      
      // Criar o depósito se não existir
      console.log('🆕 Criando registro de depósito...');
      
      const newDeposit = await prisma.transaction.create({
        data: {
          user_id: userId,
          tipo: 'deposito',
          valor: amount,
          status: 'pendente',
          identifier,
          descricao: 'Depósito PIX via VizzionPay',
          criado_em: new Date()
        }
      });
      
      console.log(`✅ Depósito criado: ${newDeposit.id}`);
      
      // Atualizar referência
      deposit = await prisma.transaction.findUnique({
        where: { id: newDeposit.id },
        include: { user: true }
      });
    } else {
      console.log(`✅ Depósito encontrado: ${deposit.id}`);
      console.log(`   Status atual: ${deposit.status}`);
    }
    
    // 3. Verificar se já foi processado
    if (deposit.status === 'concluido') {
      console.log('✅ Depósito já foi processado anteriormente!');
      return;
    }
    
    console.log('\n🔄 Processando depósito...');
    
    // 4. Processar depósito de forma atômica
    await prisma.$transaction(async (tx) => {
      // Atualizar status da transação
      await tx.transaction.update({
        where: { id: deposit.id },
        data: {
          status: 'concluido',
          processado_em: new Date(),
          descricao: 'Depósito PIX confirmado - Processado manualmente'
        }
      });
      
      console.log('✅ Status da transação atualizado para "concluido"');
      
      // Creditar saldo do usuário
      if (user.tipo_conta === 'afiliado_demo') {
        // Conta demo - creditar saldo_demo
        await tx.user.update({
          where: { id: userId },
          data: { 
            saldo_demo: { increment: amount },
            primeiro_deposito_feito: true
          }
        });
        
        console.log(`✅ Creditado R$ ${amount} no saldo demo`);
        
        // Sincronizar carteira demo
        await tx.wallet.upsert({
          where: { user_id: userId },
          update: { saldo_demo: { increment: amount } },
          create: {
            user_id: userId,
            saldo_demo: amount,
            saldo_reais: 0
          }
        });
        
        console.log('✅ Carteira demo sincronizada');
      } else {
        // Conta normal - creditar saldo_reais
        await tx.user.update({
          where: { id: userId },
          data: { 
            saldo_reais: { increment: amount },
            primeiro_deposito_feito: true
          }
        });
        
        console.log(`✅ Creditado R$ ${amount} no saldo real`);
        
        // Sincronizar carteira normal
        await tx.wallet.upsert({
          where: { user_id: userId },
          update: { saldo_reais: { increment: amount } },
          create: {
            user_id: userId,
            saldo_reais: amount,
            saldo_demo: 0
          }
        });
        
        console.log('✅ Carteira real sincronizada');
      }
      
      // Atualizar transação com saldos
      const saldoAntes = user.tipo_conta === 'afiliado_demo' 
        ? user.saldo_demo 
        : user.saldo_reais;
      
      await tx.transaction.update({
        where: { id: deposit.id },
        data: {
          saldo_antes: saldoAntes,
          saldo_depois: saldoAntes + amount,
          descricao: 'Depósito PIX confirmado - Processado manualmente'
        }
      });
      
      console.log('✅ Saldos da transação atualizados');
    });
    
    console.log('\n💰 Verificando saldo final...');
    
    // 5. Verificar saldo final
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    const finalBalance = updatedUser.tipo_conta === 'afiliado_demo' 
      ? updatedUser.saldo_demo 
      : updatedUser.saldo_reais;
    
    console.log(`✅ Saldo final: R$ ${finalBalance}`);
    
    // 6. Processar comissão de afiliado (se conta normal)
    if (updatedUser.tipo_conta !== 'afiliado_demo' && updatedUser.affiliate_id) {
      console.log('\n🎯 Processando comissão de afiliado...');
      
      try {
        await AffiliateService.processAffiliateCommission({
          userId: userId,
          depositAmount: amount,
          depositStatus: 'concluido'
        });
        
        console.log('✅ Comissão de afiliado processada');
      } catch (error) {
        console.log('⚠️  Erro ao processar comissão (não crítico):', error.message);
      }
    }
    
    console.log('\n🎉 DEPÓSITO PROCESSADO COM SUCESSO!');
    console.log(`   Usuário: ${user.email}`);
    console.log(`   Valor: R$ ${amount}`);
    console.log(`   Status: Concluído`);
    console.log(`   Saldo final: R$ ${finalBalance}`);
    
  } catch (error) {
    console.error('❌ Erro ao processar depósito:', error);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar script
main();
