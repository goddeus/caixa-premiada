/**
 * SCRIPT PARA CORRIGIR VINCULAÇÃO DE AFILIADO
 * 
 * Este script corrige a vinculação do usuário paulotest@gmail.com
 * com o código de indicação AFFJUVGKTUTSYCQ
 */

const { PrismaClient } = require('@prisma/client');
const AffiliateService = require('../services/affiliateService');

const prisma = new PrismaClient();

async function fixAffiliateLink() {
  try {
    console.log('🔧 CORRIGINDO VINCULAÇÃO DE AFILIADO...\n');
    
    const userId = '6f73f55f-f9d6-4108-8838-ab76407d7e63';
    const userEmail = 'paulotest@gmail.com';
    const referralCode = 'AFFJUVGKTUTSYCQ';
    
    console.log('📋 DADOS:');
    console.log(`   Usuário: ${userEmail}`);
    console.log(`   User ID: ${userId}`);
    console.log(`   Código: ${referralCode}\n`);
    
    // 1. Verificar se o código de indicação existe
    console.log('🔍 Verificando código de indicação...');
    const affiliate = await prisma.affiliate.findUnique({
      where: { codigo_indicacao: referralCode },
      include: { user: true }
    });
    
    if (!affiliate) {
      console.error('❌ Código de indicação não encontrado!');
      return;
    }
    
    console.log(`✅ Código encontrado:`);
    console.log(`   Afiliado: ${affiliate.user.nome} (${affiliate.user.email})`);
    console.log(`   User ID do afiliado: ${affiliate.user_id}`);
    console.log(`   Ganhos: R$ ${affiliate.ganhos}`);
    
    // 2. Verificar dados atuais do usuário
    console.log('\n👤 Verificando dados atuais do usuário...');
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { wallet: true }
    });
    
    if (!user) {
      console.error('❌ Usuário não encontrado!');
      return;
    }
    
    console.log(`✅ Usuário encontrado:`);
    console.log(`   Nome: ${user.nome}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Affiliate ID atual: ${user.affiliate_id || 'Nenhum'}`);
    console.log(`   Código usado: ${user.codigo_indicacao_usado || 'Nenhum'}`);
    console.log(`   Saldo: R$ ${user.saldo_reais}`);
    
    // 3. Corrigir vinculação
    console.log('\n🔧 Corrigindo vinculação...');
    
    await prisma.user.update({
      where: { id: userId },
      data: {
        affiliate_id: affiliate.user_id,
        codigo_indicacao_usado: referralCode
      }
    });
    
    console.log('✅ Vinculação corrigida!');
    console.log(`   Affiliate ID: ${affiliate.user_id}`);
    console.log(`   Código usado: ${referralCode}`);
    
    // 4. Verificar se já existe comissão
    console.log('\n💰 Verificando comissões existentes...');
    const existingCommission = await prisma.affiliateCommission.findFirst({
      where: {
        affiliate_id: affiliate.id,
        user_id: userId
      }
    });
    
    if (existingCommission) {
      console.log(`✅ Comissão já existe:`);
      console.log(`   Valor: R$ ${existingCommission.valor}`);
      console.log(`   Status: ${existingCommission.status}`);
      console.log(`   Data: ${existingCommission.criado_em}`);
    } else {
      console.log('❌ Comissão não existe! Processando...');
      
      // 5. Processar comissão
      try {
        await AffiliateService.processAffiliateCommission({
          userId: userId,
          depositAmount: 20.00,
          depositStatus: 'concluido'
        });
        
        console.log('✅ Comissão processada com sucesso!');
        
        // Verificar dados atualizados
        const updatedAffiliate = await prisma.affiliate.findUnique({
          where: { user_id: affiliate.user_id },
          include: { user: true }
        });
        
        console.log(`\n📊 Dados atualizados do afiliado:`);
        console.log(`   Ganhos: R$ ${updatedAffiliate.ganhos}`);
        console.log(`   Saldo disponível: R$ ${updatedAffiliate.saldo_disponivel}`);
        console.log(`   Saldo do usuário: R$ ${updatedAffiliate.user.saldo_reais}`);
        
      } catch (error) {
        console.error('❌ Erro ao processar comissão:', error.message);
      }
    }
    
    // 6. Verificar dados finais
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
    
    console.log(`👤 Usuário: ${finalUser.email}`);
    console.log(`💰 Saldo: R$ ${finalUser.saldo_reais}`);
    console.log(`🎯 Afiliado vinculado: ${finalUser.affiliate_id ? 'Sim' : 'Não'}`);
    console.log(`📝 Código usado: ${finalUser.codigo_indicacao_usado}`);
    
    if (finalAffiliate) {
      console.log(`📈 Afiliado: ${finalAffiliate.user.nome}`);
      console.log(`💵 Ganhos do afiliado: R$ ${finalAffiliate.ganhos}`);
      console.log(`💳 Saldo do afiliado: R$ ${finalAffiliate.user.saldo_reais}`);
    }
    
    // 7. Verificar comissão final
    const finalCommission = await prisma.affiliateCommission.findFirst({
      where: {
        affiliate_id: affiliate.id,
        user_id: userId
      }
    });
    
    if (finalCommission) {
      console.log(`✅ Comissão: R$ ${finalCommission.valor} (${finalCommission.status})`);
    } else {
      console.log('❌ Comissão não encontrada');
    }
    
    console.log('\n🎉 CORREÇÃO CONCLUÍDA!');
    
  } catch (error) {
    console.error('❌ Erro durante a correção:', error);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar correção
fixAffiliateLink();
