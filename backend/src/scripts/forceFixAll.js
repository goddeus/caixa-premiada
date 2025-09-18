/**
 * SCRIPT PARA FORÇAR CORREÇÃO COMPLETA
 * 
 * Este script força a correção de todos os problemas:
 * 1. Saldo do usuário
 * 2. Vinculação do afiliado
 * 3. Comissão do afiliado
 */

const { PrismaClient } = require('@prisma/client');
const AffiliateService = require('../services/affiliateService');

const prisma = new PrismaClient();

async function forceFixAll() {
  try {
    console.log('🔧 FORÇANDO CORREÇÃO COMPLETA...\n');
    
    const userId = '6f73f55f-f9d6-4108-8838-ab76407d7e63';
    const userEmail = 'paulotest@gmail.com';
    const referralCode = 'AFFJUVGKTUTSYCQ';
    const depositAmount = 20.00;
    
    console.log('📋 DADOS:');
    console.log(`   Usuário: ${userEmail}`);
    console.log(`   User ID: ${userId}`);
    console.log(`   Código: ${referralCode}`);
    console.log(`   Valor: R$ ${depositAmount}\n`);
    
    // 1. FORÇAR SALDO CORRETO
    console.log('💰 FORÇANDO SALDO CORRETO...');
    
    await prisma.$transaction(async (tx) => {
      // Atualizar saldo do usuário
      await tx.user.update({
        where: { id: userId },
        data: { 
          saldo_reais: depositAmount,
          primeiro_deposito_feito: true
        }
      });
      
      // Atualizar carteira
      await tx.wallet.upsert({
        where: { user_id: userId },
        update: { saldo_reais: depositAmount },
        create: {
          user_id: userId,
          saldo_reais: depositAmount,
          saldo_demo: 0
        }
      });
      
      console.log('✅ Saldo forçado para R$ 20,00');
    });
    
    // 2. FORÇAR VINCULAÇÃO DO AFILIADO
    console.log('\n🎯 FORÇANDO VINCULAÇÃO DO AFILIADO...');
    
    // Buscar afiliado pelo código
    const affiliate = await prisma.affiliate.findUnique({
      where: { codigo_indicacao: referralCode },
      include: { user: true }
    });
    
    if (!affiliate) {
      console.error('❌ Código de indicação não encontrado!');
      return;
    }
    
    console.log(`✅ Afiliado encontrado: ${affiliate.user.nome} (${affiliate.user.email})`);
    
    // Forçar vinculação
    await prisma.user.update({
      where: { id: userId },
      data: {
        affiliate_id: affiliate.user_id,
        codigo_indicacao_usado: referralCode
      }
    });
    
    console.log('✅ Vinculação forçada!');
    
    // 3. FORÇAR COMISSÃO DO AFILIADO
    console.log('\n💵 FORÇANDO COMISSÃO DO AFILIADO...');
    
    // Verificar se já existe comissão
    const existingCommission = await prisma.affiliateCommission.findFirst({
      where: {
        affiliate_id: affiliate.id,
        user_id: userId
      }
    });
    
    if (existingCommission) {
      console.log('✅ Comissão já existe!');
    } else {
      console.log('🔄 Criando comissão...');
      
      await prisma.$transaction(async (tx) => {
        // Criar comissão
        const commission = await tx.affiliateCommission.create({
          data: {
            affiliate_id: affiliate.id,
            user_id: userId,
            valor: 10.00,
            status: 'creditado'
          }
        });
        
        // Creditar saldo do afiliado
        await tx.user.update({
          where: { id: affiliate.user_id },
          data: { saldo_reais: { increment: 10.00 } }
        });
        
        // Sincronizar carteira do afiliado
        await tx.wallet.upsert({
          where: { user_id: affiliate.user_id },
          update: { saldo_reais: { increment: 10.00 } },
          create: {
            user_id: affiliate.user_id,
            saldo_reais: 10.00,
            saldo_demo: 0
          }
        });
        
        // Atualizar dados do afiliado
        await tx.affiliate.update({
          where: { id: affiliate.id },
          data: {
            ganhos: { increment: 10.00 },
            saldo_disponivel: { increment: 10.00 }
          }
        });
        
        // Registrar transação de comissão
        await tx.transaction.create({
          data: {
            user_id: affiliate.user_id,
            tipo: 'affiliate_credit',
            valor: 10.00,
            status: 'concluido',
            descricao: `Comissão por indicação - ${userEmail}`
          }
        });
        
        // Registrar no histórico de afiliados
        await tx.affiliateHistory.create({
          data: {
            affiliate_id: affiliate.id,
            indicado_id: userId,
            deposito_valido: true,
            valor_deposito: depositAmount,
            comissao: 10.00,
            status: 'pago'
          }
        });
        
        console.log('✅ Comissão criada e processada!');
      });
    }
    
    // 4. VERIFICAR DADOS FINAIS
    console.log('\n📋 DADOS FINAIS:');
    console.log('================');
    
    const finalUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { wallet: true }
    });
    
    const finalAffiliate = await prisma.affiliate.findUnique({
      where: { user_id: finalUser.affiliate_id },
      include: { user: true }
    });
    
    const finalCommission = await prisma.affiliateCommission.findFirst({
      where: {
        affiliate_id: affiliate.id,
        user_id: userId
      }
    });
    
    console.log(`👤 Usuário: ${finalUser.email}`);
    console.log(`💰 Saldo: R$ ${finalUser.saldo_reais}`);
    console.log(`💳 Wallet: R$ ${finalUser.wallet?.saldo_reais || 0}`);
    console.log(`🎯 Afiliado: ${finalUser.affiliate_id ? 'Vinculado' : 'Não vinculado'}`);
    console.log(`📝 Código: ${finalUser.codigo_indicacao_usado}`);
    
    if (finalAffiliate) {
      console.log(`📈 Afiliado: ${finalAffiliate.user.nome}`);
      console.log(`💵 Ganhos: R$ ${finalAffiliate.ganhos}`);
      console.log(`💳 Saldo afiliado: R$ ${finalAffiliate.user.saldo_reais}`);
    }
    
    if (finalCommission) {
      console.log(`✅ Comissão: R$ ${finalCommission.valor} (${finalCommission.status})`);
    }
    
    // 5. TESTAR API DE SALDO
    console.log('\n🔍 TESTANDO API DE SALDO...');
    
    // Simular chamada da API
    const apiUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        saldo_reais: true,
        saldo_demo: true,
        tipo_conta: true
      }
    });
    
    console.log(`📊 API Response:`);
    console.log(`   saldo_reais: R$ ${apiUser.saldo_reais}`);
    console.log(`   saldo_demo: R$ ${apiUser.saldo_demo}`);
    console.log(`   tipo_conta: ${apiUser.tipo_conta}`);
    
    console.log('\n🎉 CORREÇÃO FORÇADA CONCLUÍDA!');
    console.log('=====================================');
    console.log('✅ Saldo: R$ 20,00');
    console.log('✅ Afiliado: Vinculado');
    console.log('✅ Comissão: R$ 10,00');
    console.log('=====================================');
    
  } catch (error) {
    console.error('❌ Erro durante correção forçada:', error);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar correção forçada
forceFixAll();
