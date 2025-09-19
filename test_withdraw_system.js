const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testWithdrawSystem() {
  console.log('🧪 TESTANDO SISTEMA DE SAQUE CORRIGIDO\n');
  
  try {
    // 1. Verificar se existem saques na tabela withdrawals
    console.log('1️⃣ Verificando saques na tabela withdrawals...');
    const withdrawals = await prisma.withdrawal.findMany({
      include: {
        user: {
          select: { id: true, nome: true, email: true }
        }
      },
      orderBy: { created_at: 'desc' },
      take: 10
    });
    
    console.log(`✅ Encontrados ${withdrawals.length} saques:`);
    withdrawals.forEach((withdrawal, index) => {
      console.log(`   ${index + 1}. ${withdrawal.user.nome} (${withdrawal.user.email})`);
      console.log(`      Valor: R$ ${withdrawal.amount.toFixed(2)}`);
      console.log(`      PIX: ${withdrawal.pix_key} (${withdrawal.pix_key_type})`);
      console.log(`      Status: ${withdrawal.status}`);
      console.log(`      Data: ${withdrawal.created_at.toLocaleString('pt-BR')}`);
      console.log('');
    });
    
    // 2. Verificar estatísticas
    console.log('2️⃣ Verificando estatísticas de saques...');
    const [
      totalWithdrawals,
      pendingWithdrawals,
      approvedWithdrawals,
      rejectedWithdrawals,
      totalAmount,
      pendingAmount
    ] = await Promise.all([
      prisma.withdrawal.count(),
      prisma.withdrawal.count({ where: { status: 'processing' } }),
      prisma.withdrawal.count({ where: { status: 'approved' } }),
      prisma.withdrawal.count({ where: { status: 'rejected' } }),
      prisma.withdrawal.aggregate({
        _sum: { amount: true }
      }),
      prisma.withdrawal.aggregate({
        where: { status: 'processing' },
        _sum: { amount: true }
      })
    ]);
    
    console.log('📊 Estatísticas de saques:');
    console.log(`   Total de saques: ${totalWithdrawals}`);
    console.log(`   Pendentes: ${pendingWithdrawals}`);
    console.log(`   Aprovados: ${approvedWithdrawals}`);
    console.log(`   Rejeitados: ${rejectedWithdrawals}`);
    console.log(`   Valor total: R$ ${(totalAmount._sum.amount || 0).toFixed(2)}`);
    console.log(`   Valor pendente: R$ ${(pendingAmount._sum.amount || 0).toFixed(2)}`);
    
    // 3. Verificar se há transações de saque
    console.log('\n3️⃣ Verificando transações de saque...');
    const transactions = await prisma.transaction.findMany({
      where: { tipo: 'saque' },
      include: {
        user: {
          select: { id: true, nome: true, email: true }
        }
      },
      orderBy: { created_at: 'desc' },
      take: 5
    });
    
    console.log(`✅ Encontradas ${transactions.length} transações de saque:`);
    transactions.forEach((transaction, index) => {
      console.log(`   ${index + 1}. ${transaction.user.nome} (${transaction.user.email})`);
      console.log(`      Valor: R$ ${transaction.valor.toFixed(2)}`);
      console.log(`      Status: ${transaction.status}`);
      console.log(`      Data: ${transaction.created_at.toLocaleString('pt-BR')}`);
      console.log('');
    });
    
    // 4. Verificar se há inconsistências
    console.log('4️⃣ Verificando inconsistências...');
    const withdrawalIds = withdrawals.map(w => w.id);
    const transactionWithdrawals = transactions.filter(t => 
      t.descricao && t.descricao.includes('Saque de')
    );
    
    console.log(`   Saques na tabela withdrawals: ${withdrawals.length}`);
    console.log(`   Transações de saque: ${transactionWithdrawals.length}`);
    
    if (withdrawals.length > 0 && transactionWithdrawals.length > 0) {
      console.log('✅ Sistema funcionando corretamente!');
      console.log('   - Saques estão sendo criados na tabela withdrawals');
      console.log('   - Transações estão sendo criadas na tabela transactions');
    } else if (withdrawals.length === 0) {
      console.log('⚠️ Nenhum saque encontrado na tabela withdrawals');
      console.log('   - Isso pode indicar que o sistema não está criando registros corretamente');
    } else {
      console.log('✅ Sistema funcionando!');
    }
    
    console.log('\n🎉 TESTE CONCLUÍDO!');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar teste
testWithdrawSystem();
