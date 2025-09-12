const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkRecentActivity() {
  try {
    console.log('🔍 VERIFICANDO ATIVIDADE RECENTE');
    console.log('================================\n');

    // Buscar transações recentes
    const transactions = await prisma.transaction.findMany({
      orderBy: { criado_em: 'desc' },
      take: 10,
      include: {
        user: {
          select: { nome: true, email: true }
        }
      }
    });

    console.log('📋 ÚLTIMAS 10 TRANSAÇÕES:');
    transactions.forEach((tx, index) => {
      const valor = tx.valor > 0 ? `+R$ ${tx.valor.toFixed(2)}` : `-R$ ${Math.abs(tx.valor).toFixed(2)}`;
      console.log(`${index + 1}. ${tx.user.nome} - ${tx.tipo} - ${valor} - ${tx.criado_em.toLocaleString()}`);
    });

    // Buscar usuários com saldo
    const users = await prisma.user.findMany({
      where: { saldo: { gt: 0 } },
      orderBy: { criado_em: 'desc' },
      take: 5
    });

    console.log('\n👥 USUÁRIOS COM SALDO:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.nome} - R$ ${user.saldo.toFixed(2)} - ${user.email}`);
    });

    // Buscar sessões ativas
    const sessions = await prisma.userSession.findMany({
      where: { ativo: true },
      include: {
        user: {
          select: { nome: true, email: true }
        }
      },
      orderBy: { criado_em: 'desc' }
    });

    console.log('\n📊 SESSÕES RTP ATIVAS:');
    if (sessions.length === 0) {
      console.log('Nenhuma sessão RTP ativa encontrada');
    } else {
      sessions.forEach((session, index) => {
        const rtpAtual = session.valor_gasto_caixas > 0 
          ? ((session.valor_premios_recebidos / session.valor_gasto_caixas) * 100).toFixed(2)
          : '0.00';
        
        console.log(`${index + 1}. ${session.user.nome}`);
        console.log(`   💰 Gasto: R$ ${session.valor_gasto_caixas.toFixed(2)}`);
        console.log(`   🎁 Ganho: R$ ${session.valor_premios_recebidos.toFixed(2)}`);
        console.log(`   📈 RTP: ${rtpAtual}%`);
        console.log(`   🎯 Limite: R$ ${session.limite_retorno.toFixed(2)}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRecentActivity();

