const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setRTP10() {
  try {
    console.log('⚙️ Alterando RTP para 10%...');
    
    const result = await prisma.rTPConfig.updateMany({
      data: {
        rtp_target: 10.0
      }
    });
    
    console.log(`✅ RTP alterado para 10% (${result.count} registros atualizados)`);
    
    // Verificar a configuração atual
    const config = await prisma.rTPConfig.findFirst();
    console.log(`📊 RTP atual no banco: ${config.rtp_target}%`);
    
  } catch (error) {
    console.error('❌ Erro ao alterar RTP:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setRTP10();

