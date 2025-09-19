console.log('🧪 TESTE SIMPLES DO SISTEMA DE SAQUE');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    console.log('1. Verificando saques...');
    const withdrawals = await prisma.withdrawal.findMany({
      take: 5,
      orderBy: { created_at: 'desc' }
    });
    
    console.log(`Encontrados ${withdrawals.length} saques`);
    
    if (withdrawals.length > 0) {
      console.log('Último saque:');
      console.log(`- ID: ${withdrawals[0].id}`);
      console.log(`- Valor: R$ ${withdrawals[0].amount}`);
      console.log(`- Status: ${withdrawals[0].status}`);
      console.log(`- Data: ${withdrawals[0].created_at}`);
    }
    
    console.log('2. Verificando transações de saque...');
    const transactions = await prisma.transaction.findMany({
      where: { tipo: 'saque' },
      take: 5,
      orderBy: { created_at: 'desc' }
    });
    
    console.log(`Encontradas ${transactions.length} transações de saque`);
    
    console.log('✅ Teste concluído!');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
