const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createUsers() {
  try {
    console.log('🚀 Criando usuários...');

    // Criar conta admin 1 - Eduarda
    const eduarda = await prisma.user.create({
      data: {
        nome: 'eduarda',
        email: 'eduarda@admin.com',
        senha_hash: await bcrypt.hash('paineladm@', 10),
        saldo_reais: 10000.00,
        saldo_demo: 0,
        is_admin: true,
        ativo: true,
        cpf: '00000000001'
      }
    });
    console.log('✅ Admin Eduarda criada:', eduarda.email);

    // Criar conta admin 2 - Junior
    const junior = await prisma.user.create({
      data: {
        nome: 'junior',
        email: 'junior@admin.com',
        senha_hash: await bcrypt.hash('paineladm@', 10),
        saldo_reais: 10000.00,
        saldo_demo: 0,
        is_admin: true,
        ativo: true,
        cpf: '00000000002'
      }
    });
    console.log('✅ Admin Junior criado:', junior.email);

    // Criar conta de teste
    const contateste = await prisma.user.create({
      data: {
        nome: 'contateste',
        email: 'contatest@test.com',
        senha_hash: await bcrypt.hash('1234567', 10),
        saldo_reais: 1000.00,
        saldo_demo: 0,
        is_admin: false,
        ativo: true,
        cpf: '00000000003'
      }
    });
    console.log('✅ Conta de teste criada:', contateste.email);

    console.log('\n🎉 Todas as contas foram criadas com sucesso!');
    console.log('\n📋 Resumo das contas:');
    console.log('👑 Admin Eduarda: eduarda@admin.com / paineladm@');
    console.log('👑 Admin Junior: junior@admin.com / paineladm@');
    console.log('👤 Teste: contatest@test.com / 1234567');

  } catch (error) {
    console.error('❌ Erro ao criar usuários:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createUsers();
