const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAdmins() {
  try {
    console.log('👑 VERIFICANDO CONTAS ADMIN');
    console.log('=' .repeat(40));

    const admins = await prisma.user.findMany({
      where: { is_admin: true },
      select: { 
        nome: true, 
        email: true, 
        is_admin: true, 
        ativo: true,
        criado_em: true
      }
    });

    if (admins.length === 0) {
      console.log('❌ Nenhuma conta admin encontrada');
      console.log('💡 Criando conta admin padrão...');
      
      const bcrypt = require('bcrypt');
      const adminPassword = await bcrypt.hash('admin123', 10);
      
      const admin = await prisma.user.create({
        data: {
          nome: 'Administrador',
          email: 'admin@caixapremiada.com',
          senha_hash: adminPassword,
          cpf: '00000000000',
          saldo: 0.00,
          is_admin: true,
          ativo: true
        }
      });

      // Criar carteira para o admin
      await prisma.wallet.create({
        data: {
          user_id: admin.id,
          saldo: 0.00
        }
      });

      console.log('✅ Conta admin criada:');
      console.log(`   Email: admin@caixapremiada.com`);
      console.log(`   Senha: admin123`);
    } else {
      console.log(`✅ Encontradas ${admins.length} contas admin:`);
      admins.forEach((admin, index) => {
        console.log(`${index + 1}. ${admin.nome}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Status: ${admin.ativo ? '✅ Ativo' : '❌ Inativo'}`);
        console.log(`   Criado em: ${admin.criado_em.toLocaleDateString('pt-BR')}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Erro ao verificar admins:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmins();
