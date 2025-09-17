const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log('👤 Criando usuário de teste para o sistema manipulativo...');
    
    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: 'teste@manipulative.com' }
    });
    
    if (existingUser) {
      console.log('⚠️ Usuário de teste já existe. Atualizando saldo...');
      
      // Atualizar saldo para R$ 100
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          saldo_reais: 100.00,
          saldo_demo: 100.00
        }
      });
      
      console.log('✅ Saldo do usuário de teste atualizado para R$ 100,00');
      return existingUser;
    }
    
    // Criar novo usuário de teste
    const hashedPassword = await bcrypt.hash('Teste123!', 10);
    
    const testUser = await prisma.user.create({
      data: {
        email: 'teste@manipulative.com',
        nome: 'Usuário Teste Manipulativo',
        senha_hash: hashedPassword,
        saldo_reais: 100.00,
        saldo_demo: 100.00,
        tipo_conta: 'normal',
        ativo: true,
        cpf: '12345678901'
      }
    });
    
    console.log('✅ Usuário de teste criado com sucesso!');
    console.log(`   - Email: teste@manipulative.com`);
    console.log(`   - Senha: Teste123!`);
    console.log(`   - Saldo: R$ 100,00`);
    console.log(`   - ID: ${testUser.id}`);
    
    return testUser;
    
  } catch (error) {
    console.error('❌ Erro ao criar usuário de teste:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
