const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function initRTPConfig() {
  try {
    console.log('🎯 Inicializando configuração de RTP...');

    // Verificar se já existe configuração
    const existingConfig = await prisma.rTPConfig.findFirst();
    
    if (existingConfig) {
      console.log('✅ Configuração de RTP já existe:', existingConfig);
      return existingConfig;
    }

    // Criar configuração inicial
    const rtpConfig = await prisma.rTPConfig.create({
      data: {
        rtp_target: 50.0, // RTP inicial de 50%
        rtp_recommended: null,
        updated_by: null
      }
    });

    console.log('✅ Configuração de RTP criada:', rtpConfig);
    return rtpConfig;

  } catch (error) {
    console.error('❌ Erro ao inicializar configuração de RTP:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  initRTPConfig()
    .then(() => {
      console.log('🎉 Inicialização concluída!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Falha na inicialização:', error);
      process.exit(1);
    });
}

module.exports = initRTPConfig;
