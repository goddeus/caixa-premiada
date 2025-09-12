const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('🔍 Verificando usuários...\n');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        tipo_conta: true,
        criado_em: true
      },
      take: 5
    });
    
    console.log('👥 Usuários encontrados:');
    users.forEach(user => {
      console.log(`   - ${user.nome} (${user.email}) - ${user.tipo_conta}`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
