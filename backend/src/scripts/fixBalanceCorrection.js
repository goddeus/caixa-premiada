/**
 * CORREÇÃO DE SALDO - REMOVER COMISSÃO DO USUÁRIO
 * 
 * Este script corrige o saldo do usuário removendo a comissão
 * que foi creditada incorretamente
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixBalanceCorrection() {
  const userId = '6f73f55f-f9d6-4108-8838-ab76407d7e63';
  const correctBalance = 20.00; // Apenas o valor do depósito
  
  console.log('🔧 CORRIGINDO SALDO DO USUÁRIO...\n');
  
  try {
    // 1. Verificar dados atuais
    console.log('1️⃣ Verificando dados atuais...');
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { wallet: true }
    });
    
    if (!user) {
      console.error('❌ Usuário não encontrado!');
      return;
    }
    
    console.log(`✅ Usuário: ${user.email}`);
    console.log(`   Saldo atual: R$ ${user.saldo_reais}`);
    console.log(`   Saldo correto: R$ ${correctBalance}`);
    console.log(`   Diferença: R$ ${user.saldo_reais - correctBalance}`);
    
    // 2. Verificar transações
    console.log('\n2️⃣ Verificando transações...');
    const deposits = await prisma.transaction.findMany({
      where: {
        user_id: userId,
        tipo: 'deposito',
        status: 'concluido'
      }
    });
    
    const totalDeposits = deposits.reduce((sum, t) => sum + t.valor, 0);
    console.log(`   Total de depósitos: R$ ${totalDeposits}`);
    
    // 3. Verificar comissões
    console.log('\n3️⃣ Verificando comissões...');
    const commissions = await prisma.affiliateCommission.findMany({
      where: {
        user_id: userId,
        status: 'creditado'
      }
    });
    
    const totalCommissions = commissions.reduce((sum, c) => sum + c.valor, 0);
    console.log(`   Total de comissões: R$ ${totalCommissions}`);
    
    // 4. Corrigir saldo
    console.log('\n4️⃣ Corrigindo saldo...');
    
    await prisma.$transaction(async (tx) => {
      // Atualizar saldo do usuário para apenas o valor do depósito
      await tx.user.update({
        where: { id: userId },
        data: { saldo_reais: correctBalance }
      });
      
      // Sincronizar carteira
      await tx.wallet.upsert({
        where: { user_id: userId },
        update: { saldo_reais: correctBalance },
        create: {
          user_id: userId,
          saldo_reais: correctBalance,
          saldo_demo: 0
        }
      });
      
      console.log(`✅ Saldo corrigido para R$ ${correctBalance}`);
    });
    
    // 5. Verificar afiliado
    if (user.affiliate_id) {
      console.log('\n5️⃣ Verificando afiliado...');
      
      const affiliate = await prisma.user.findUnique({
        where: { id: user.affiliate_id },
        include: { wallet: true }
      });
      
      if (affiliate) {
        console.log(`   Afiliado: ${affiliate.email}`);
        console.log(`   Saldo atual: R$ ${affiliate.saldo_reais}`);
        
        // Verificar se o afiliado tem a comissão
        const affiliateCommissions = await prisma.affiliateCommission.findMany({
          where: {
            affiliate_id: user.affiliate_id,
            status: 'creditado'
          }
        });
        
        const totalAffiliateCommissions = affiliateCommissions.reduce((sum, c) => sum + c.valor, 0);
        console.log(`   Total de comissões recebidas: R$ ${totalAffiliateCommissions}`);
        
        // Se o afiliado não tem a comissão, creditar
        if (totalAffiliateCommissions === 0) {
          console.log('💰 Creditando comissão para o afiliado...');
          
          await prisma.$transaction(async (tx) => {
            // Criar comissão
            await tx.affiliateCommission.create({
              data: {
                user_id: userId,
                affiliate_id: user.affiliate_id,
                valor: 10.00,
                status: 'creditado',
                descricao: 'Comissão primeiro depósito (correção)'
              }
            });
            
            // Creditar afiliado
            await tx.user.update({
              where: { id: user.affiliate_id },
              data: { saldo_reais: { increment: 10.00 } }
            });
            
            // Sincronizar carteira do afiliado
            await tx.wallet.upsert({
              where: { user_id: user.affiliate_id },
              update: { saldo_reais: { increment: 10.00 } },
              create: {
                user_id: user.affiliate_id,
                saldo_reais: 10.00,
                saldo_demo: 0
              }
            });
          });
          
          console.log('✅ Comissão de R$ 10,00 creditada para o afiliado!');
        } else {
          console.log('ℹ️ Afiliado já tem comissões creditadas');
        }
      }
    }
    
    // 6. Verificação final
    console.log('\n6️⃣ Verificação final...');
    
    const finalUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { wallet: true }
    });
    
    const finalAffiliate = user.affiliate_id ? await prisma.user.findUnique({
      where: { id: user.affiliate_id },
      include: { wallet: true }
    }) : null;
    
    console.log('\n📊 RESULTADO FINAL:');
    console.log(`   Usuário: ${finalUser.email}`);
    console.log(`   Saldo: R$ ${finalUser.saldo_reais} (correto: R$ ${correctBalance})`);
    console.log(`   Wallet: R$ ${finalUser.wallet?.saldo_reais || 0}`);
    
    if (finalAffiliate) {
      console.log(`   Afiliado: ${finalAffiliate.email}`);
      console.log(`   Saldo afiliado: R$ ${finalAffiliate.saldo_reais}`);
      console.log(`   Wallet afiliado: R$ ${finalAffiliate.wallet?.saldo_reais || 0}`);
    }
    
    console.log('\n🎉 CORREÇÃO CONCLUÍDA!');
    console.log('💡 Agora o usuário tem R$ 20,00 e o afiliado tem R$ 10,00!');
    
  } catch (error) {
    console.error('❌ Erro na correção:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  fixBalanceCorrection();
}

module.exports = { fixBalanceCorrection };
