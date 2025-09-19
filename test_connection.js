const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔌 Testando conexão com o banco de dados...');
    
    // Teste simples de conexão
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Conexão com banco de dados: OK');
    console.log('📊 Resultado do teste:', result);
    
    // Teste de busca de usuário
    console.log('\n🔍 Testando busca de usuário...');
    const user = await prisma.user.findFirst({
      select: {
        id: true,
        nome: true,
        email: true,
        tipo_conta: true
      }
    });
    
    if (user) {
      console.log('✅ Busca de usuário: OK');
      console.log('👤 Usuário encontrado:', user);
    } else {
      console.log('⚠️ Nenhum usuário encontrado no banco');
    }
    
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
    console.error('📋 Detalhes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
