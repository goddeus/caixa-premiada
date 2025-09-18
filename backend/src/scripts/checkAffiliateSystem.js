/**
 * SCRIPT PARA VERIFICAR E CORRIGIR O SISTEMA DE AFILIADOS
 * 
 * Este script verifica:
 * 1. Se o usuário paulotest@gmail.com tem afiliado vinculado
 * 2. Se a comissão foi processada corretamente
 * 3. Se os dados do afiliado estão corretos
 */

const { PrismaClient } = require('@prisma/client');
const AffiliateService = require('../services/affiliateService');

const prisma = new PrismaClient();

async function checkAffiliateSystem() {
  try {
    console.log('🔍 VERIFICANDO SISTEMA DE AFILIADOS...\n');
    
    const userId = '6f73f55f-f9d6-4108-8838-ab76407d7e63';
    const userEmail = 'paulotest@gmail.com';
    
    // 1. Buscar dados do usuário
    console.log('👤 Buscando dados do usuário...');
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { wallet: true }
    });
    
    if (!user) {
      console.error('❌ Usuário não encontrado!');
      return;
    }
    
    console.log(`✅ Usuário encontrado: ${user.email}`);
    console.log(`   Nome: ${user.nome}`);
    console.log(`   Tipo de conta: ${user.tipo_conta}`);
    console.log(`   Affiliate ID: ${user.affiliate_id || 'Nenhum'}`);
    console.log(`   Código usado: ${user.codigo_indicacao_usado || 'Nenhum'}`);
    console.log(`   Saldo atual: R$ ${user.saldo_reais}`);
    
    // 2. Verificar se tem afiliado vinculado
    if (user.affiliate_id) {
      console.log('\n🎯 Usuário tem afiliado vinculado!');
      
      // Buscar dados do afiliado
      const affiliate = await prisma.affiliate.findUnique({
        where: { user_id: user.affiliate_id },
        include: { user: true }
      });
      
      if (affiliate) {
        console.log(`✅ Afiliado encontrado:`);
        console.log(`   Nome: ${affiliate.user.nome}`);
        console.log(`   Email: ${affiliate.user.email}`);
        console.log(`   Código: ${affiliate.codigo_indicacao}`);
        console.log(`   Ganhos: R$ ${affiliate.ganhos}`);
        console.log(`   Saldo disponível: R$ ${affiliate.saldo_disponivel}`);
        
        // 3. Verificar se já existe comissão processada
        console.log('\n💰 Verificando comissões...');
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
          console.log('❌ Comissão NÃO foi processada!');
          console.log('🔄 Processando comissão agora...');
          
          try {
            await AffiliateService.processAffiliateCommission({
              userId: userId,
              depositAmount: 20.00,
              depositStatus: 'concluido'
            });
            
            console.log('✅ Comissão processada com sucesso!');
            
            // Verificar dados atualizados do afiliado
            const updatedAffiliate = await prisma.affiliate.findUnique({
              where: { user_id: user.affiliate_id },
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
        
        // 4. Verificar histórico de afiliados
        console.log('\n📋 Verificando histórico de afiliados...');
        const affiliateHistory = await prisma.affiliateHistory.findFirst({
          where: {
            affiliate_id: affiliate.id,
            indicado_id: userId
          }
        });
        
        if (affiliateHistory) {
          console.log(`✅ Histórico encontrado:`);
          console.log(`   Depósito válido: ${affiliateHistory.deposito_valido}`);
          console.log(`   Valor do depósito: R$ ${affiliateHistory.valor_deposito}`);
          console.log(`   Comissão: R$ ${affiliateHistory.comissao}`);
          console.log(`   Status: ${affiliateHistory.status}`);
        } else {
          console.log('❌ Histórico de afiliado não encontrado!');
        }
        
      } else {
        console.log('❌ Afiliado não encontrado no banco!');
      }
      
    } else {
      console.log('\n❌ Usuário NÃO tem afiliado vinculado!');
      console.log('💡 Isso significa que:');
      console.log('   - O usuário não usou código de indicação no registro');
      console.log('   - Ou o código usado era inválido');
      console.log('   - Ou houve erro no processo de vinculação');
      
      // Verificar se existe código de indicação usado
      if (user.codigo_indicacao_usado) {
        console.log(`\n🔍 Código usado: ${user.codigo_indicacao_usado}`);
        
        // Verificar se o código existe
        const affiliateByCode = await prisma.affiliate.findUnique({
          where: { codigo_indicacao: user.codigo_indicacao_usado },
          include: { user: true }
        });
        
        if (affiliateByCode) {
          console.log('✅ Código existe! Vinculando usuário ao afiliado...');
          
          // Vincular usuário ao afiliado
          await prisma.user.update({
            where: { id: userId },
            data: { affiliate_id: affiliateByCode.user_id }
          });
          
          console.log('✅ Usuário vinculado ao afiliado!');
          console.log(`   Afiliado: ${affiliateByCode.user.nome} (${affiliateByCode.user.email})`);
          
          // Processar comissão
          console.log('🔄 Processando comissão...');
          await AffiliateService.processAffiliateCommission({
            userId: userId,
            depositAmount: 20.00,
            depositStatus: 'concluido'
          });
          
          console.log('✅ Comissão processada!');
          
        } else {
          console.log('❌ Código de indicação não existe no banco!');
        }
      }
    }
    
    // 5. Resumo final
    console.log('\n📊 RESUMO FINAL:');
    console.log('================');
    
    const finalUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { wallet: true }
    });
    
    console.log(`👤 Usuário: ${finalUser.email}`);
    console.log(`💰 Saldo: R$ ${finalUser.saldo_reais}`);
    console.log(`🎯 Afiliado: ${finalUser.affiliate_id ? 'Vinculado' : 'Não vinculado'}`);
    
    if (finalUser.affiliate_id) {
      const finalAffiliate = await prisma.affiliate.findUnique({
        where: { user_id: finalUser.affiliate_id },
        include: { user: true }
      });
      
      console.log(`📈 Afiliado: ${finalAffiliate.user.nome}`);
      console.log(`💵 Ganhos do afiliado: R$ ${finalAffiliate.ganhos}`);
      console.log(`💳 Saldo do afiliado: R$ ${finalAffiliate.user.saldo_reais}`);
    }
    
  } catch (error) {
    console.error('❌ Erro durante verificação:', error);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar verificação
checkAffiliateSystem();
