const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log('🔧 Criando usuário de teste para PIX...\n');
    
    // Verificar se já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: 'teste-pix@example.com' }
    });
    
    if (existingUser) {
      console.log('ℹ️ Usuário já existe, deletando...');
      await prisma.user.delete({
        where: { id: existingUser.id }
      });
    }
    
    // Criar novo usuário
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    const user = await prisma.user.create({
      data: {
        nome: 'Teste PIX',
        email: 'teste-pix@example.com',
        senha_hash: hashedPassword,
        cpf: '11144477735',
        tipo_conta: 'normal',
        saldo: 100.00,
        primeiro_deposito_feito: true
      }
    });
    
    // Criar carteira
    await prisma.wallet.create({
      data: {
        user_id: user.id,
        saldo: 100.00
      }
    });
    
    console.log('✅ Usuário criado com sucesso:');
    console.log(`   - Nome: ${user.nome}`);
    console.log(`   - Email: ${user.email}`);
    console.log(`   - Senha: 123456`);
    console.log(`   - Saldo: R$ ${user.saldo}`);
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
