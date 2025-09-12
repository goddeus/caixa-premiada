const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkRTPConfig() {
  try {
    const config = await prisma.rTPConfig.findFirst();
    console.log('🎯 RTP CONFIGURADO:', config.rtp_target + '%');
    
    if (config.rtp_target < 10) {
      console.log('⚠️ RTP muito baixo! Isso explica os prêmios ilustrativos.');
      console.log('💡 Para teste normal, configure RTP entre 50-80%');
    }
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRTPConfig();

