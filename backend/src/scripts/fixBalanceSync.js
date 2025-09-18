/**
 * CORREÇÃO DE SINCRONIZAÇÃO DE SALDO
 * 
 * Este script corrige a sincronização entre as tabelas user e wallet
 * e credita a comissão do afiliado no saldo
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixBalanceSync() {
  const userId = '6f73f55f-f9d6-4108-8838-ab76407d7e63';
  
  console.log('🔧 CORRIGINDO SINCRONIZAÇÃO DE SALDO...\n');
  
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
    console.log(`   Saldo user.saldo_reais: R$ ${user.saldo_reais}`);
    console.log(`   Saldo wallet.saldo_reais: R$ ${user.wallet?.saldo_reais || 0}`);
    console.log(`   Afiliado: ${user.affiliate_id ? 'SIM' : 'NÃO'}`);
    
    // 2. Verificar transações
    console.log('\n2️⃣ Verificando transações...');
    const transactions = await prisma.transaction.findMany({
      where: {
        user_id: userId,
        tipo: 'deposito',
        status: 'concluido'
      },
      orderBy: { criado_em: 'desc' }
    });
    
    const totalDeposits = transactions.reduce((sum, t) => sum + t.valor, 0);
    console.log(`   Total de depósitos: R$ ${totalDeposits}`);
    console.log(`   Transações encontradas: ${transactions.length}`);
    
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
    console.log(`   Comissões encontradas: ${commissions.length}`);
    
    // 4. Calcular saldo correto
    const correctBalance = totalDeposits + totalCommissions;
    console.log(`\n4️⃣ Saldo correto calculado: R$ ${correctBalance}`);
    
    // 5. Corrigir sincronização
    console.log('\n5️⃣ Corrigindo sincronização...');
    
    await prisma.$transaction(async (tx) => {
      // Atualizar saldo do usuário
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
      
      console.log(`✅ Saldo atualizado para R$ ${correctBalance}`);
    });
    
    // 6. Verificar afiliado e comissão
    if (user.affiliate_id) {
      console.log('\n6️⃣ Verificando afiliado...');
      
      const affiliate = await prisma.user.findUnique({
        where: { id: user.affiliate_id },
        include: { wallet: true }
      });
      
      if (affiliate) {
        console.log(`   Afiliado: ${affiliate.email}`);
        console.log(`   Saldo atual: R$ ${affiliate.saldo_reais}`);
        console.log(`   Wallet atual: R$ ${affiliate.wallet?.saldo_reais || 0}`);
        
        // Verificar se precisa creditar comissão
        const affiliateCommissions = await prisma.affiliateCommission.findMany({
          where: {
            affiliate_id: user.affiliate_id,
            status: 'creditado'
          }
        });
        
        const totalAffiliateCommissions = affiliateCommissions.reduce((sum, c) => sum + c.valor, 0);
        console.log(`   Total de comissões recebidas: R$ ${totalAffiliateCommissions}`);
        
        // Calcular saldo correto do afiliado
        const affiliateDeposits = await prisma.transaction.findMany({
          where: {
            user_id: user.affiliate_id,
            tipo: 'deposito',
            status: 'concluido'
          }
        });
        
        const totalAffiliateDeposits = affiliateDeposits.reduce((sum, t) => sum + t.valor, 0);
        const correctAffiliateBalance = totalAffiliateDeposits + totalAffiliateCommissions;
        
        console.log(`   Saldo correto do afiliado: R$ ${correctAffiliateBalance}`);
        
        // Corrigir saldo do afiliado se necessário
        if (affiliate.saldo_reais !== correctAffiliateBalance) {
          await prisma.$transaction(async (tx) => {
            await tx.user.update({
              where: { id: user.affiliate_id },
              data: { saldo_reais: correctAffiliateBalance }
            });
            
            await tx.wallet.upsert({
              where: { user_id: user.affiliate_id },
              update: { saldo_reais: correctAffiliateBalance },
              create: {
                user_id: user.affiliate_id,
                saldo_reais: correctAffiliateBalance,
                saldo_demo: 0
              }
            });
          });
          
          console.log(`✅ Saldo do afiliado corrigido para R$ ${correctAffiliateBalance}`);
        } else {
          console.log('ℹ️ Saldo do afiliado já está correto');
        }
      }
    }
    
    // 7. Verificação final
    console.log('\n7️⃣ Verificação final...');
    
    const finalUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { wallet: true }
    });
    
    console.log('\n📊 RESULTADO FINAL:');
    console.log(`   Usuário: ${finalUser.email}`);
    console.log(`   Saldo user: R$ ${finalUser.saldo_reais}`);
    console.log(`   Saldo wallet: R$ ${finalUser.wallet?.saldo_reais || 0}`);
    console.log(`   Sincronizado: ${finalUser.saldo_reais === finalUser.wallet?.saldo_reais ? 'SIM' : 'NÃO'}`);
    
    if (user.affiliate_id) {
      const finalAffiliate = await prisma.user.findUnique({
        where: { id: user.affiliate_id },
        include: { wallet: true }
      });
      
      console.log(`   Afiliado: ${finalAffiliate.email}`);
      console.log(`   Saldo afiliado: R$ ${finalAffiliate.saldo_reais}`);
      console.log(`   Wallet afiliado: R$ ${finalAffiliate.wallet?.saldo_reais || 0}`);
    }
    
    console.log('\n🎉 SINCRONIZAÇÃO CORRIGIDA!');
    
  } catch (error) {
    console.error('❌ Erro na correção:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  fixBalanceSync();
}

module.exports = { fixBalanceSync };
