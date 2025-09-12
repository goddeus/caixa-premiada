const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verificarUsuario() {
  try {
    console.log('🔍 VERIFICANDO USUÁRIO EDUARDA');
    console.log('==================================================');

    const usuario = await prisma.user.findUnique({
      where: { email: 'eduarda@admin.com' },
      select: { 
        id: true, 
        nome: true, 
        email: true, 
        saldo: true,
        tipo_conta: true
      }
    });

    if (usuario) {
      console.log('👤 Usuário encontrado:');
      console.log(`   Nome: ${usuario.nome}`);
      console.log(`   Email: ${usuario.email}`);
      console.log(`   Saldo: R$ ${parseFloat(usuario.saldo).toFixed(2)}`);
      console.log(`   Tipo: ${usuario.tipo_conta}`);
    } else {
      console.log('❌ Usuário não encontrado');
    }

    // Listar todos os usuários admin
    console.log('\n👥 TODOS OS USUÁRIOS ADMIN:');
    console.log('----------------------------');
    
    const admins = await prisma.user.findMany({
      where: { is_admin: true },
      select: { 
        id: true, 
        nome: true, 
        email: true, 
        saldo: true 
      }
    });

    admins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.nome} (${admin.email}) - R$ ${parseFloat(admin.saldo).toFixed(2)}`);
    });

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarUsuario();
