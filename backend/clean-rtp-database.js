const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanRTPDatabase() {
  try {
    console.log('🧹 Iniciando limpeza do sistema RTP do banco de dados...');

    // 1. Remover dados de comportamento do usuário
    console.log('📊 Removendo dados de comportamento do usuário...');
    try {
      const userBehaviorCount = await prisma.userBehavior.count();
      if (userBehaviorCount > 0) {
        await prisma.userBehavior.deleteMany();
        console.log(`✅ Removidos ${userBehaviorCount} registros de comportamento do usuário`);
      } else {
        console.log('✅ Nenhum registro de comportamento encontrado');
      }
    } catch (error) {
      console.log('⚠️ Tabela userBehavior não encontrada ou erro:', error.message);
    }

    // 2. Remover sessões RTP do usuário
    console.log('🎯 Removendo sessões RTP do usuário...');
    try {
      const rtpSessionsCount = await prisma.userRTPSession.count();
      if (rtpSessionsCount > 0) {
        await prisma.userRTPSession.deleteMany();
        console.log(`✅ Removidas ${rtpSessionsCount} sessões RTP`);
      } else {
        console.log('✅ Nenhuma sessão RTP encontrada');
      }
    } catch (error) {
      console.log('⚠️ Tabela userRTPSession não encontrada ou erro:', error.message);
    }

    // 3. Remover configurações de RTP
    console.log('⚙️ Removendo configurações de RTP...');
    try {
      const rtpConfigCount = await prisma.rTPConfig.count();
      if (rtpConfigCount > 0) {
        await prisma.rTPConfig.deleteMany();
        console.log(`✅ Removidas ${rtpConfigCount} configurações de RTP`);
      } else {
        console.log('✅ Nenhuma configuração RTP encontrada');
      }
    } catch (error) {
      console.log('⚠️ Tabela rTPConfig não encontrada ou erro:', error.message);
    }

    // 4. Remover logs de sorteio detalhados
    console.log('🎲 Removendo logs de sorteio detalhados...');
    try {
      const drawLogsCount = await prisma.drawDetailedLog.count();
      if (drawLogsCount > 0) {
        await prisma.drawDetailedLog.deleteMany();
        console.log(`✅ Removidos ${drawLogsCount} logs de sorteio detalhados`);
      } else {
        console.log('✅ Nenhum log de sorteio detalhado encontrado');
      }
    } catch (error) {
      console.log('⚠️ Tabela drawDetailedLog não encontrada ou erro:', error.message);
    }

    // 5. Remover transações relacionadas ao RTP
    console.log('💳 Removendo transações relacionadas ao RTP...');
    try {
      const rtpTransactionsCount = await prisma.transaction.count({
        where: {
          OR: [
            { descricao: { contains: 'RTP' } },
            { descricao: { contains: 'rtp' } },
            { descricao: { contains: 'manipulative' } },
            { descricao: { contains: 'addictive' } },
            { descricao: { contains: 'global_draw' } },
            { tipo: 'violacao_seguranca' }
          ]
        }
      });

      if (rtpTransactionsCount > 0) {
        await prisma.transaction.deleteMany({
          where: {
            OR: [
              { descricao: { contains: 'RTP' } },
              { descricao: { contains: 'rtp' } },
              { descricao: { contains: 'manipulative' } },
              { descricao: { contains: 'addictive' } },
              { descricao: { contains: 'global_draw' } },
              { tipo: 'violacao_seguranca' }
            ]
          }
        });
        console.log(`✅ Removidas ${rtpTransactionsCount} transações relacionadas ao RTP`);
      } else {
        console.log('✅ Nenhuma transação RTP encontrada');
      }
    } catch (error) {
      console.log('⚠️ Erro ao remover transações RTP:', error.message);
    }

    console.log('🎉 Limpeza do sistema RTP concluída com sucesso!');
    console.log('📋 Sistema RTP completamente removido do banco de dados.');

  } catch (error) {
    console.error('❌ Erro durante a limpeza do banco de dados:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  cleanRTPDatabase()
    .then(() => {
      console.log('✅ Script de limpeza executado com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro ao executar script de limpeza:', error);
      process.exit(1);
    });
}

module.exports = cleanRTPDatabase;
