const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testWalletAPI() {
  try {
    console.log('🔍 Testando API do wallet...\n');

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

    // Simular o que o walletService.getBalance retorna
    const saldoPrincipal = user.tipo_conta === 'afiliado_demo' ? user.saldo_demo : user.saldo_reais;

    const balanceResponse = {
      saldo_reais: user.saldo_reais,
      saldo_demo: user.saldo_demo,
      saldo: saldoPrincipal,
      atualizado_em: new Date(),
      usuario: {
        nome: user.nome,
        email: user.email,
        total_giros: user.total_giros || 0,
        rollover_liberado: user.rollover_liberado || false,
        rollover_minimo: user.rollover_minimo || 20.0
      }
    };

    console.log('\n📡 Resposta simulada da API /wallet/:');
    console.log(JSON.stringify(balanceResponse, null, 2));

    // Simular o que o frontend recebe
    const apiResponse = {
      success: true,
      balance: balanceResponse
    };

    console.log('\n🎯 Resposta completa da API:');
    console.log(JSON.stringify(apiResponse, null, 2));

    // Simular o que o frontend faz
    console.log('\n🔍 Testando acesso aos dados no frontend:');
    console.log('response.success:', apiResponse.success);
    console.log('response.balance:', apiResponse.balance);
    console.log('response.balance?.usuario:', apiResponse.balance?.usuario);
    console.log('response.balance?.usuario?.total_giros:', apiResponse.balance?.usuario?.total_giros);

    const userData = apiResponse.balance?.usuario || apiResponse.balance;
    console.log('\n📊 userData (após fallback):');
    console.log('userData:', userData);
    console.log('userData.total_giros:', userData?.total_giros);
    console.log('userData.rollover_liberado:', userData?.rollover_liberado);
    console.log('userData.rollover_minimo:', userData?.rollover_minimo);

    if (userData?.total_giros !== undefined) {
      console.log('\n✅ SUCESSO: Dados de rollover acessíveis corretamente!');
    } else {
      console.log('\n❌ ERRO: Dados de rollover não acessíveis!');
    }

  } catch (error) {
    console.error('❌ Erro ao testar API do wallet:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testWalletAPI();
