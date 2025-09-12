const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAccounts() {
  try {
    console.log('🔧 Criando contas admin e de teste...\n');

    // Contas admin
    const adminAccounts = [
      {
        nome: 'eduarda',
        email: 'eduarda@admin.com',
        username: 'eduarda',
        senha: 'paineladm@',
        is_admin: true
      },
      {
        nome: 'junior',
        email: 'junior@admin.com',
        username: 'junior',
        senha: 'paineladm@',
        is_admin: true
      }
    ];

    // Conta de teste
    const testAccount = {
      nome: 'contateste',
      email: 'contatest@test.com',
      username: 'contateste',
      senha: '1234567',
      is_admin: false
    };

    // Criar contas admin
    console.log('👑 Criando contas admin...');
    for (const admin of adminAccounts) {
      try {
        const senha_hash = await bcrypt.hash(admin.senha, 10);
        
        const user = await prisma.user.create({
          data: {
            nome: admin.nome,
            email: admin.email,
            senha_hash: senha_hash,
            cpf: `0000000000${Math.random().toString().substr(2, 1)}`, // CPF único
            is_admin: admin.is_admin,
            saldo: 1000.00, // Saldo inicial para admins
            ativo: true
          }
        });

        // Criar wallet para o usuário
        await prisma.wallet.create({
          data: {
            user_id: user.id,
            saldo: 1000.00
          }
        });

        console.log(`✅ Admin criado: ${admin.nome} (${admin.email})`);
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`⚠️  Admin já existe: ${admin.nome} (${admin.email})`);
        } else {
          console.error(`❌ Erro ao criar admin ${admin.nome}:`, error.message);
        }
      }
    }

    // Criar conta de teste
    console.log('\n🧪 Criando conta de teste...');
    try {
      const senha_hash = await bcrypt.hash(testAccount.senha, 10);
      
      const user = await prisma.user.create({
        data: {
          nome: testAccount.nome,
          email: testAccount.email,
          senha_hash: senha_hash,
          cpf: `0000000000${Math.random().toString().substr(2, 1)}`, // CPF único
          is_admin: testAccount.is_admin,
          saldo: 500.00, // Saldo inicial para teste
          ativo: true
        }
      });

      // Criar wallet para o usuário
      await prisma.wallet.create({
        data: {
          user_id: user.id,
          saldo: 500.00
        }
      });

      console.log(`✅ Conta de teste criada: ${testAccount.nome} (${testAccount.email})`);
    } catch (error) {
      if (error.code === 'P2002') {
        console.log(`⚠️  Conta de teste já existe: ${testAccount.nome} (${testAccount.email})`);
      } else {
        console.error(`❌ Erro ao criar conta de teste:`, error.message);
      }
    }

    // Listar todas as contas criadas
    console.log('\n📋 Resumo das contas:');
    const allUsers = await prisma.user.findMany({
      where: {
        OR: [
          { email: { in: ['eduarda@admin.com', 'junior@admin.com', 'contatest@test.com'] } },
          { is_admin: true }
        ]
      },
      select: {
        nome: true,
        email: true,
        is_admin: true,
        saldo: true,
        ativo: true
      }
    });

    allUsers.forEach(user => {
      const tipo = user.is_admin ? '👑 ADMIN' : '🧪 TESTE';
      console.log(`${tipo} | ${user.nome} | ${user.email} | R$ ${user.saldo} | ${user.ativo ? 'Ativo' : 'Inativo'}`);
    });

    console.log('\n✅ Processo concluído!');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAccounts();
