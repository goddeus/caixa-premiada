const bcrypt = require('bcryptjs');
const prisma = require('./src/utils/prisma');

async function createAdmin() {
  try {
    console.log('🔧 Criando usuário administrador...');
    
    // Verificar se já existe um admin
    const existingAdmin = await prisma.user.findFirst({
      where: { is_admin: true }
    });
    
    if (existingAdmin) {
      console.log('✅ Já existe um administrador no sistema');
      console.log(`📧 Email: ${existingAdmin.email}`);
      return;
    }
    
    // Criar senha hash
    const senha_hash = await bcrypt.hash('admin123', 12);
    
    // Criar usuário admin
    const admin = await prisma.user.create({
      data: {
        nome: 'Administrador',
        email: 'admin@caixapremiada.com',
        cpf: '00000000000',
        senha_hash,
        saldo: 0,
        is_admin: true,
        ativo: true
      }
    });
    
    // Criar carteira
    await prisma.wallet.create({
      data: {
        user_id: admin.id,
        saldo: 0
      }
    });
    
    console.log('✅ Usuário administrador criado com sucesso!');
    console.log(`📧 Email: ${admin.email}`);
    console.log(`🔑 Senha: admin123`);
    console.log('⚠️  IMPORTANTE: Altere a senha após o primeiro login!');
    
  } catch (error) {
    console.error('❌ Erro ao criar administrador:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
