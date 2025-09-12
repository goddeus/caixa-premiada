const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUserRTP() {
  try {
    console.log('🔍 VERIFICANDO STATUS RTP DO USUÁRIO');
    console.log('=====================================\n');

    // Buscar usuário mais recente (assumindo que é você)
    const user = await prisma.user.findFirst({
      where: { ativo: true },
      orderBy: { criado_em: 'desc' },
      include: {
        sessions: {
          where: { ativo: true },
          orderBy: { criado_em: 'desc' }
        }
      }
    });

    if (!user) {
      console.log('❌ Nenhum usuário encontrado');
      return;
    }

    console.log(`👤 Usuário: ${user.nome}`);
    console.log(`💰 Saldo atual: R$ ${user.saldo.toFixed(2)}`);
    console.log(`📅 Criado em: ${user.criado_em}\n`);

    if (user.sessions.length === 0) {
      console.log('📊 Nenhuma sessão RTP ativa encontrada');
      return;
    }

    const session = user.sessions[0];
    console.log('📊 SESSÃO RTP ATIVA:');
    console.log(`🆔 ID da Sessão: ${session.id}`);
    console.log(`💰 Depósito inicial: R$ ${session.deposito_inicial.toFixed(2)}`);
    console.log(`🎯 Limite de retorno: R$ ${session.limite_retorno.toFixed(2)}`);
    console.log(`💸 Total gasto: R$ ${session.valor_gasto_caixas.toFixed(2)}`);
    console.log(`🎁 Total ganho: R$ ${session.valor_premios_recebidos.toFixed(2)}`);
    console.log(`📈 RTP atual: ${((session.valor_premios_recebidos / session.valor_gasto_caixas) * 100).toFixed(2)}%`);
    console.log(`🎯 RTP configurado: ${session.rtp_configurado}%`);
    
    const restante = session.limite_retorno - session.valor_premios_recebidos;
    console.log(`💎 Restante disponível: R$ ${restante.toFixed(2)}`);
    
    if (restante <= 0) {
      console.log('\n🚫 STATUS: LIMITE INDIVIDUAL ATINGIDO');
      console.log('✅ Por isso você está recebendo apenas prêmios ilustrativos!');
      console.log('💡 Isso é normal e protege a banca da plataforma.');
    } else {
      console.log('\n✅ STATUS: AINDA PODE RECEBER PRÊMIOS REAIS');
      console.log(`💡 Você ainda pode ganhar até R$ ${restante.toFixed(2)} em prêmios reais.`);
    }

    // Buscar transações recentes
    const recentTransactions = await prisma.transaction.findMany({
      where: { 
        user_id: user.id,
        session_id: session.id
      },
      orderBy: { criado_em: 'desc' },
      take: 10
    });

    console.log('\n📋 ÚLTIMAS 10 TRANSAÇÕES:');
    recentTransactions.forEach((tx, index) => {
      const valor = tx.valor > 0 ? `+R$ ${tx.valor.toFixed(2)}` : `-R$ ${Math.abs(tx.valor).toFixed(2)}`;
      console.log(`${index + 1}. ${tx.tipo} - ${valor} - ${tx.criado_em.toLocaleString()}`);
    });

  } catch (error) {
    console.error('❌ Erro ao verificar RTP:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserRTP();

