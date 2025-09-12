const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDatabase() {
  try {
    console.log('🔍 Testando conexão com banco...');
    
    // Testar conexão
    await prisma.$connect();
    console.log('✅ Conexão estabelecida');
    
    // Contar usuários
    const totalUsers = await prisma.user.count();
    console.log(`📊 Total de usuários: ${totalUsers}`);
    
    // Contar contas demo
    const demoUsers = await prisma.user.findMany({
      where: { tipo_conta: 'afiliado_demo' },
      select: { nome: true, email: true, saldo: true }
    });
    
    console.log(`🎭 Contas demo: ${demoUsers.length}`);
    demoUsers.forEach(user => {
      console.log(`  - ${user.nome} (${user.email}) - R$ ${user.saldo}`);
    });
    
    // Contar contas normais
    const normalUsers = await prisma.user.findMany({
      where: { tipo_conta: 'normal' },
      select: { nome: true, email: true, saldo: true }
    });
    
    console.log(`👤 Contas normais: ${normalUsers.length}`);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
