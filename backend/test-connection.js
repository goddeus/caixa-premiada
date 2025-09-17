const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔍 Testando conexão com o banco...');
    await prisma.$connect();
    console.log('✅ Conectado ao banco com sucesso!');
    
    // Testar uma query simples
    const userCount = await prisma.user.count();
    console.log(`👥 Total de usuários: ${userCount}`);
    
    const caseCount = await prisma.case.count();
    console.log(`📦 Total de caixas: ${caseCount}`);
    
    const prizeCount = await prisma.prize.count();
    console.log(`🎁 Total de prêmios: ${prizeCount}`);
    
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
  } finally {
    await prisma.$disconnect();
    console.log('✅ Desconectado do banco');
  }
}

testConnection();
