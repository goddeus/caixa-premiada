const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugUserAccountType() {
  try {
    console.log('🔍 Verificando tipo de conta do usuário paulotest...\n');

    // Buscar usuário paulotest
    const user = await prisma.user.findUnique({
      where: { email: 'paulotest@gmail.com' },
      select: {
        id: true,
        nome: true,
        email: true,
        tipo_conta: true,
        saldo_reais: true,
        saldo_demo: true,
        total_giros: true,
        rollover_liberado: true,
        rollover_minimo: true
      }
    });

    if (!user) {
      console.log('❌ Usuário paulotest não encontrado');
      return;
    }

    console.log('👤 Dados do usuário:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Nome: ${user.nome}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Tipo de conta: ${user.tipo_conta}`);
    console.log(`   Saldo reais: R$ ${user.saldo_reais}`);
    console.log(`   Saldo demo: R$ ${user.saldo_demo}`);
    console.log(`   Total giros: R$ ${user.total_giros}`);
    console.log(`   Rollover liberado: ${user.rollover_liberado ? 'SIM' : 'NÃO'}`);
    console.log(`   Rollover mínimo: R$ ${user.rollover_minimo}`);

    // Verificar se é detectado como conta demo
    const isDemoAccount = user.tipo_conta === 'afiliado_demo';
    console.log(`\n🎯 Detecção de conta demo: ${isDemoAccount ? 'SIM (DEMO)' : 'NÃO (NORMAL)'}`);

    if (isDemoAccount) {
      console.log('⚠️ PROBLEMA: Usuário está sendo detectado como conta DEMO!');
      console.log('   Isso significa que ele receberá prêmios altos (acima de R$50,00)');
      console.log('   em vez dos prêmios controlados para contas normais.');
    } else {
      console.log('✅ OK: Usuário está sendo detectado como conta NORMAL');
      console.log('   Ele receberá os prêmios controlados conforme especificado.');
    }

    // Verificar todas as contas para ver se há outras com problema
    console.log('\n🔍 Verificando todos os usuários...\n');
    
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        tipo_conta: true,
        saldo_reais: true,
        saldo_demo: true
      }
    });

    console.log(`📊 Total de usuários: ${allUsers.length}\n`);

    allUsers.forEach((user, index) => {
      const isDemo = user.tipo_conta === 'afiliado_demo';
      console.log(`${index + 1}. ${user.nome} (${user.email})`);
      console.log(`   Tipo: ${user.tipo_conta} ${isDemo ? '🔴 DEMO' : '🟢 NORMAL'}`);
      console.log(`   Saldo reais: R$ ${user.saldo_reais}`);
      console.log(`   Saldo demo: R$ ${user.saldo_demo}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Erro ao verificar tipo de conta:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugUserAccountType();
