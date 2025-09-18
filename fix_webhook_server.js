/**
 * SCRIPT DE CORREÇÃO PARA O SERVIDOR
 * 
 * Execute este script no servidor em produção para corrigir:
 * 1. O problema do webhook (coluna related_id)
 * 2. Processar o depósito pendente
 * 3. Creditar o saldo do usuário
 */

const { PrismaClient } = require('@prisma/client');
const AffiliateService = require('./src/services/affiliateService');

const prisma = new PrismaClient();

async function fixWebhookAndProcessDeposit() {
  try {
    console.log('🔧 INICIANDO CORREÇÃO DO WEBHOOK E DEPÓSITO...\n');
    
    // Dados do depósito que falhou
    const identifier = 'deposit_6f73f55f-f9d6-4108-8838-ab76407d7e63_1758208348757';
    const amount = 20.00;
    const userId = '6f73f55f-f9d6-4108-8838-ab76407d7e63';
    
    console.log('📋 DADOS DO DEPÓSITO:');
    console.log(`   Identifier: ${identifier}`);
    console.log(`   Valor: R$ ${amount}`);
    console.log(`   User ID: ${userId}\n`);
    
    // 1. Verificar se a coluna related_id existe
    console.log('🔍 Verificando estrutura da tabela Transaction...');
    
    try {
      // Tentar uma query simples para verificar se a coluna existe
      await prisma.$queryRaw`SELECT related_id FROM "Transaction" LIMIT 1`;
      console.log('✅ Coluna related_id existe no banco');
    } catch (error) {
      if (error.message.includes('related_id')) {
        console.log('❌ Coluna related_id NÃO existe no banco');
        console.log('🛠️  Adicionando coluna related_id...');
        
        try {
          await prisma.$executeRaw`ALTER TABLE "Transaction" ADD COLUMN "related_id" TEXT`;
          console.log('✅ Coluna related_id adicionada com sucesso!');
        } catch (alterError) {
          console.log('⚠️  Erro ao adicionar coluna:', alterError.message);
          console.log('💡 Continuando sem a coluna...');
        }
      } else {
        console.log('⚠️  Erro inesperado:', error.message);
      }
    }
    
    // 2. Buscar o usuário
    console.log('\n👤 Buscando usuário...');
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
    console.log(`   Affiliate ID: ${user.affiliate_id || 'Nenhum'}`);
    
    // 3. Buscar o depósito
    console.log('\n🔍 Buscando depósito...');
    let deposit = await prisma.transaction.findFirst({
      where: { 
        identifier,
        tipo: 'deposito'
      },
      include: { user: true }
    });
    
    if (!deposit) {
      console.log('❌ Depósito não encontrado! Criando...');
      
      deposit = await prisma.transaction.create({
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
      
      console.log(`✅ Depósito criado: ${deposit.id}`);
    } else {
      console.log(`✅ Depósito encontrado: ${deposit.id}`);
      console.log(`   Status atual: ${deposit.status}`);
    }
    
    // 4. Verificar se já foi processado
    if (deposit.status === 'concluido') {
      console.log('✅ Depósito já foi processado anteriormente!');
      return;
    }
    
    // 5. Processar o depósito
    console.log('\n🔄 PROCESSANDO DEPÓSITO...');
    
    await prisma.$transaction(async (tx) => {
      // Atualizar status da transação
      await tx.transaction.update({
        where: { id: deposit.id },
        data: {
          status: 'concluido',
          processado_em: new Date(),
          descricao: 'Depósito PIX confirmado - Corrigido via script'
        }
      });
      
      console.log('✅ Status da transação atualizado para "concluido"');
      
      // Creditar saldo do usuário
      if (user.tipo_conta === 'afiliado_demo') {
        // Conta demo
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
        // Conta normal
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
          descricao: 'Depósito PIX confirmado - Corrigido via script'
        }
      });
      
      console.log('✅ Saldos da transação atualizados');
    });
    
    // 6. Verificar saldo final
    console.log('\n💰 Verificando saldo final...');
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    const finalBalance = updatedUser.tipo_conta === 'afiliado_demo' 
      ? updatedUser.saldo_demo 
      : updatedUser.saldo_reais;
    
    console.log(`✅ Saldo final: R$ ${finalBalance}`);
    
    // 7. Processar comissão de afiliado
    if (updatedUser.tipo_conta !== 'afiliado_demo' && updatedUser.affiliate_id) {
      console.log('\n🎯 Processando comissão de afiliado...');
      
      try {
        await AffiliateService.processAffiliateCommission({
          userId: userId,
          depositAmount: amount,
          depositStatus: 'concluido'
        });
        
        console.log('✅ Comissão de afiliado processada (R$ 10,00)');
      } catch (error) {
        console.log('⚠️  Erro ao processar comissão (não crítico):', error.message);
      }
    }
    
    // 8. Resultado final
    console.log('\n🎉 CORREÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('=====================================');
    console.log(`👤 Usuário: ${user.email}`);
    console.log(`💰 Valor: R$ ${amount}`);
    console.log(`✅ Status: Concluído`);
    console.log(`💳 Saldo final: R$ ${finalBalance}`);
    console.log(`🆔 Transaction ID: ${deposit.id}`);
    console.log('=====================================');
    
    // 9. Instruções para evitar o problema no futuro
    console.log('\n🛠️  PARA EVITAR O PROBLEMA NO FUTURO:');
    console.log('1. Execute: npx prisma db push');
    console.log('2. Ou: npx prisma migrate deploy');
    console.log('3. Reinicie o servidor após a migração');
    
  } catch (error) {
    console.error('❌ Erro durante a correção:', error);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar correção
fixWebhookAndProcessDeposit();
