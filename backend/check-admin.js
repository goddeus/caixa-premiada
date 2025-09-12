const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAdmin() {
  try {
    console.log('🔍 Verificando usuários admin...\n');
    
    const admins = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: 'admin' } },
          { tipo_conta: 'admin' }
        ]
      },
      select: {
        id: true,
        nome: true,
        email: true,
        tipo_conta: true,
        criado_em: true
      }
    });
    
    console.log('👥 Usuários admin encontrados:');
    admins.forEach(admin => {
      console.log(`   - ${admin.nome} (${admin.email}) - ${admin.tipo_conta}`);
    });
    
    if (admins.length === 0) {
      console.log('\n❌ Nenhum usuário admin encontrado!');
      console.log('💡 Criando usuário admin...');
      
      const newAdmin = await prisma.user.create({
        data: {
          nome: 'Administrador',
          email: 'admin@caixapremiada.com',
          senha: '$2b$10$rQZ8K9vL2nM3pO4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV',
          cpf: '11144477735',
          tipo_conta: 'admin',
          saldo: 1000.00,
          primeiro_deposito_feito: true
        }
      });
      
      // Criar carteira
      await prisma.wallet.create({
        data: {
          user_id: newAdmin.id,
          saldo: 1000.00
        }
      });
      
      console.log('✅ Usuário admin criado:', newAdmin.email);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmin();
