/**
 * CORREÇÃO SIMPLES E DIRETA
 * 
 * Este script executa todas as correções necessárias
 * de forma simples e direta
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function simpleFix() {
  const userId = '6f73f55f-f9d6-4108-8838-ab76407d7e63';
  const amount = 20.00;
  const identifier = 'deposit_6f73f55f-f9d6-4108-8838-ab76407d7e63_1758208348757';
  
  console.log('🔧 INICIANDO CORREÇÃO SIMPLES...\n');
  
  try {
    // 1. Verificar usuário
    console.log('1️⃣ Verificando usuário...');
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
    console.log(`   Afiliado: ${user.affiliate_id ? 'SIM' : 'NÃO'}`);
    console.log(`   Código usado: ${user.codigo_indicacao_usado || 'NENHUM'}`);
    
    // 2. Buscar transação
    console.log('\n2️⃣ Buscando transação...');
    let transaction = await prisma.transaction.findFirst({
      where: {
        identifier: identifier,
        tipo: 'deposito'
      }
    });
    
    if (!transaction) {
      console.log('⚠️ Transação não encontrada. Criando...');
      transaction = await prisma.transaction.create({
        data: {
          user_id: userId,
          tipo: 'deposito',
          valor: amount,
          status: 'pendente',
          identifier: identifier,
          descricao: 'Depósito PIX (correção simples)'
        }
      });
      console.log(`✅ Transação criada: ${transaction.id}`);
    } else {
      console.log(`✅ Transação encontrada: ${transaction.id} (${transaction.status})`);
    }
    
    // 3. Processar depósito se necessário
    if (transaction.status !== 'concluido') {
      console.log('\n3️⃣ Processando depósito...');
      
      await prisma.$transaction(async (tx) => {
        // Atualizar transação
        await tx.transaction.update({
          where: { id: transaction.id },
          data: {
            status: 'concluido',
            processado_em: new Date(),
            saldo_antes: user.saldo_reais,
            saldo_depois: user.saldo_reais + amount,
            descricao: 'Depósito PIX confirmado (correção simples)'
          }
        });
        
        // Creditar usuário
        await tx.user.update({
          where: { id: userId },
          data: {
            saldo_reais: { increment: amount },
            primeiro_deposito_feito: true
          }
        });
        
        // Sincronizar carteira
        await tx.wallet.update({
          where: { user_id: userId },
          data: { saldo_reais: { increment: amount } }
        });
      });
      
      console.log(`✅ Depósito de R$ ${amount} processado!`);
    } else {
      console.log('ℹ️ Depósito já foi processado');
    }
    
    // 4. Verificar afiliado
    console.log('\n4️⃣ Verificando afiliado...');
    
    if (user.affiliate_id) {
      console.log(`✅ Usuário tem afiliado: ${user.affiliate_id}`);
      
      // Verificar se já tem comissão
      const existingCommission = await prisma.affiliateCommission.findFirst({
        where: {
          user_id: userId,
          status: 'creditado'
        }
      });
      
      if (!existingCommission) {
        console.log('💰 Processando comissão de R$ 10,00...');
        
        await prisma.$transaction(async (tx) => {
          // Criar comissão
          await tx.affiliateCommission.create({
            data: {
              user_id: userId,
              affiliate_id: user.affiliate_id,
              valor: 10.00,
              status: 'creditado',
              descricao: 'Comissão primeiro depósito (correção simples)'
            }
          });
          
          // Creditar afiliado
          await tx.user.update({
            where: { id: user.affiliate_id },
            data: { saldo_reais: { increment: 10.00 } }
          });
          
          // Sincronizar carteira do afiliado
          await tx.wallet.update({
            where: { user_id: user.affiliate_id },
            data: { saldo_reais: { increment: 10.00 } }
          });
        });
        
        console.log('✅ Comissão de R$ 10,00 processada!');
      } else {
        console.log('ℹ️ Comissão já foi processada');
      }
    } else {
      console.log('❌ Usuário não tem afiliado vinculado');
      
      // Tentar corrigir se tem código
      if (user.codigo_indicacao_usado) {
        console.log(`🔍 Tentando corrigir com código: ${user.codigo_indicacao_usado}`);
        
        const affiliate = await prisma.affiliate.findUnique({
          where: { codigo_indicacao: user.codigo_indicacao_usado },
          include: { user: true }
        });
        
        if (affiliate) {
          console.log(`✅ Código válido! Afiliado: ${affiliate.user.email}`);
          
          // Corrigir vinculação
          await prisma.user.update({
            where: { id: userId },
            data: { affiliate_id: affiliate.user_id }
          });
          
          console.log('✅ Vinculação corrigida!');
          
          // Processar comissão
          await prisma.$transaction(async (tx) => {
            await tx.affiliateCommission.create({
              data: {
                user_id: userId,
                affiliate_id: affiliate.user_id,
                valor: 10.00,
                status: 'creditado',
                descricao: 'Comissão primeiro depósito (correção vinculação)'
              }
            });
            
            await tx.user.update({
              where: { id: affiliate.user_id },
              data: { saldo_reais: { increment: 10.00 } }
            });
            
            await tx.wallet.update({
              where: { user_id: affiliate.user_id },
              data: { saldo_reais: { increment: 10.00 } }
            });
          });
          
          console.log('✅ Comissão processada após correção!');
        } else {
          console.log('❌ Código de indicação não existe');
        }
      }
    }
    
    // 5. Verificação final
    console.log('\n5️⃣ Verificação final...');
    
    const finalUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { wallet: true }
    });
    
    const finalTransaction = await prisma.transaction.findFirst({
      where: { identifier: identifier }
    });
    
    const finalCommission = await prisma.affiliateCommission.findFirst({
      where: { user_id: userId }
    });
    
    console.log('\n📊 RESULTADO FINAL:');
    console.log(`   Usuário: ${finalUser.email}`);
    console.log(`   Saldo: R$ ${finalUser.saldo_reais}`);
    console.log(`   Depósito: ${finalTransaction.status} (R$ ${finalTransaction.valor})`);
    console.log(`   Afiliado: ${finalUser.affiliate_id ? 'SIM' : 'NÃO'}`);
    console.log(`   Comissão: ${finalCommission ? 'PROCESSADA' : 'NÃO PROCESSADA'}`);
    
    console.log('\n🎉 CORREÇÃO CONCLUÍDA COM SUCESSO!');
    
  } catch (error) {
    console.error('❌ Erro na correção:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  simpleFix();
}

module.exports = { simpleFix };
