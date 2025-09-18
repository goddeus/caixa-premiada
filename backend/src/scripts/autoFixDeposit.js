/**
 * SCRIPT DE CORREÇÃO AUTOMÁTICA
 * 
 * Este script será executado automaticamente quando o servidor iniciar
 * para corrigir o depósito pendente e o problema do webhook
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Flag para evitar execução múltipla
let hasRun = false;

async function autoFixDeposit() {
  // Evitar execução múltipla
  if (hasRun) {
    console.log('🔄 Auto-fix já foi executado nesta sessão');
    return;
  }
  
  hasRun = true;
  
  try {
    console.log('🔧 INICIANDO CORREÇÃO AUTOMÁTICA DO DEPÓSITO...\n');
    
    // Dados do depósito que falhou
    const identifier = 'deposit_6f73f55f-f9d6-4108-8838-ab76407d7e63_1758208348757';
    const amount = 20.00;
    const userId = '6f73f55f-f9d6-4108-8838-ab76407d7e63';
    
    console.log('📋 DADOS DO DEPÓSITO:');
    console.log(`   Identifier: ${identifier}`);
    console.log(`   Valor: R$ ${amount}`);
    console.log(`   User ID: ${userId}\n`);
    
    // 1. Verificar e adicionar colunas necessárias
    console.log('🔍 Verificando estrutura da tabela Transaction...');
    
    const requiredColumns = [
      { name: 'related_id', type: 'TEXT' },
      { name: 'metadata', type: 'JSONB' }
    ];
    
    for (const column of requiredColumns) {
      try {
        await prisma.$queryRawUnsafe(`SELECT "${column.name}" FROM "Transaction" LIMIT 1`);
        console.log(`✅ Coluna ${column.name} existe no banco`);
      } catch (error) {
        if (error.message.includes(column.name)) {
          console.log(`❌ Coluna ${column.name} NÃO existe no banco`);
          console.log(`🛠️  Adicionando coluna ${column.name}...`);
          
          try {
            await prisma.$executeRawUnsafe(`ALTER TABLE "Transaction" ADD COLUMN "${column.name}" ${column.type}`);
            console.log(`✅ Coluna ${column.name} adicionada com sucesso!`);
          } catch (alterError) {
            console.log(`⚠️  Erro ao adicionar coluna ${column.name}:`, alterError.message);
            console.log('💡 Continuando sem a coluna...');
          }
        }
      }
    }
    
    // 2. Buscar o usuário
    console.log('\n👤 Buscando usuário...');
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { wallet: true }
    });
    
    if (!user) {
      console.log('❌ Usuário não encontrado - pulando correção');
      return;
    }
    
    console.log(`✅ Usuário encontrado: ${user.email}`);
    console.log(`   Tipo de conta: ${user.tipo_conta}`);
    console.log(`   Saldo atual (reais): R$ ${user.saldo_reais}`);
    console.log(`   Saldo atual (demo): R$ ${user.saldo_demo}`);
    
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
      console.log('❌ Depósito não encontrado - criando...');
      
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
          descricao: 'Depósito PIX confirmado - Corrigido automaticamente'
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
          descricao: 'Depósito PIX confirmado - Corrigido automaticamente'
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
    
    // 7. Verificar e corrigir vinculação de afiliado
    console.log('\n🎯 Verificando vinculação de afiliado...');
    
    if (updatedUser.tipo_conta !== 'afiliado_demo') {
      if (updatedUser.affiliate_id) {
        console.log(`✅ Usuário tem afiliado vinculado: ${updatedUser.affiliate_id}`);
        
        try {
          const AffiliateService = require('../services/affiliateService');
          
          await AffiliateService.processAffiliateCommission({
            userId: userId,
            depositAmount: amount,
            depositStatus: 'concluido'
          });
          
          console.log('✅ Comissão de afiliado processada (R$ 10,00)');
        } catch (error) {
          console.log('⚠️  Erro ao processar comissão (não crítico):', error.message);
        }
      } else {
        console.log('❌ Usuário não tem afiliado vinculado!');
        
        // Verificar se tem código de indicação usado
        if (updatedUser.codigo_indicacao_usado) {
          console.log(`🔍 Código usado: ${updatedUser.codigo_indicacao_usado}`);
          
          // Buscar afiliado pelo código
          const affiliateByCode = await prisma.affiliate.findUnique({
            where: { codigo_indicacao: updatedUser.codigo_indicacao_usado },
            include: { user: true }
          });
          
          if (affiliateByCode) {
            console.log('✅ Código existe! Corrigindo vinculação...');
            
            // Corrigir vinculação
            await prisma.user.update({
              where: { id: userId },
              data: { affiliate_id: affiliateByCode.user_id }
            });
            
            console.log('✅ Vinculação corrigida!');
            console.log(`   Afiliado: ${affiliateByCode.user.nome} (${affiliateByCode.user.email})`);
            
            // Processar comissão
            try {
              const AffiliateService = require('../services/affiliateService');
              
              await AffiliateService.processAffiliateCommission({
                userId: userId,
                depositAmount: amount,
                depositStatus: 'concluido'
              });
              
              console.log('✅ Comissão processada após correção!');
            } catch (error) {
              console.log('⚠️  Erro ao processar comissão:', error.message);
            }
          } else {
            console.log('❌ Código de indicação não existe no banco!');
          }
        } else {
          console.log('ℹ️  Usuário não tem código de indicação usado');
        }
      }
    } else {
      console.log('ℹ️  Conta demo - comissão não aplicável');
    }
    
    // 8. Verificar sistema de afiliados
    console.log('\n🔍 Verificando sistema de afiliados...');
    
    if (updatedUser.affiliate_id) {
      console.log(`✅ Usuário tem afiliado vinculado: ${updatedUser.affiliate_id}`);
      
      // Buscar dados do afiliado
      const affiliate = await prisma.affiliate.findUnique({
        where: { user_id: updatedUser.affiliate_id },
        include: { user: true }
      });
      
      if (affiliate) {
        console.log(`📈 Afiliado: ${affiliate.user.nome} (${affiliate.user.email})`);
        console.log(`💵 Ganhos: R$ ${affiliate.ganhos}`);
        console.log(`💳 Saldo do afiliado: R$ ${affiliate.user.saldo_reais}`);
        
        // Verificar se comissão foi processada
        const commission = await prisma.affiliateCommission.findFirst({
          where: {
            affiliate_id: affiliate.id,
            user_id: userId
          }
        });
        
        if (commission) {
          console.log(`✅ Comissão processada: R$ ${commission.valor} (${commission.status})`);
        } else {
          console.log('❌ Comissão não foi processada!');
        }
      }
    } else {
      console.log('ℹ️  Usuário não tem afiliado vinculado');
    }
    
    // 9. Resultado final
    console.log('\n🎉 CORREÇÃO AUTOMÁTICA CONCLUÍDA!');
    console.log('=====================================');
    console.log(`👤 Usuário: ${user.email}`);
    console.log(`💰 Valor: R$ ${amount}`);
    console.log(`✅ Status: Concluído`);
    console.log(`💳 Saldo final: R$ ${finalBalance}`);
    console.log(`🆔 Transaction ID: ${deposit.id}`);
    console.log(`🎯 Afiliado: ${updatedUser.affiliate_id ? 'Vinculado' : 'Não vinculado'}`);
    console.log('=====================================');
    
  } catch (error) {
    console.error('❌ Erro durante a correção automática:', error);
    console.error(error.stack);
  }
}

module.exports = { autoFixDeposit };
