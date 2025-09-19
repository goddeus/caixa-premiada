const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixPaulotestAccountType() {
  try {
    console.log('🔧 Corrigindo tipo de conta do usuário paulotest...\n');

    // Buscar usuário paulotest
    const user = await prisma.user.findUnique({
      where: { email: 'paulotest@gmail.com' },
      select: {
        id: true,
        nome: true,
        email: true,
        tipo_conta: true,
        saldo_reais: true,
        saldo_demo: true
      }
    });

    if (!user) {
      console.log('❌ Usuário paulotest não encontrado');
      return;
    }

    console.log('👤 Dados atuais do usuário:');
    console.log(`   Nome: ${user.nome}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Tipo de conta atual: ${user.tipo_conta}`);
    console.log(`   Saldo reais: R$ ${user.saldo_reais}`);
    console.log(`   Saldo demo: R$ ${user.saldo_demo}`);

    // Verificar se precisa corrigir
    if (user.tipo_conta === 'afiliado_demo') {
      console.log('\n⚠️ PROBLEMA DETECTADO: Usuário está configurado como conta DEMO!');
      console.log('   Isso faz com que ele receba prêmios altos em vez dos prêmios controlados.');
      
      // Corrigir para conta normal
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { tipo_conta: 'normal' }
      });

      console.log('\n✅ CORREÇÃO APLICADA:');
      console.log(`   Tipo de conta alterado de '${user.tipo_conta}' para '${updatedUser.tipo_conta}'`);
      console.log('   Agora o usuário receberá os prêmios controlados para contas normais.');
      
    } else if (user.tipo_conta === 'normal') {
      console.log('\n✅ OK: Usuário já está configurado como conta NORMAL');
      console.log('   Ele já recebe os prêmios controlados corretamente.');
      
    } else {
      console.log(`\n⚠️ Tipo de conta inesperado: '${user.tipo_conta}'`);
      console.log('   Corrigindo para conta normal...');
      
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { tipo_conta: 'normal' }
      });

      console.log('\n✅ CORREÇÃO APLICADA:');
      console.log(`   Tipo de conta alterado de '${user.tipo_conta}' para '${updatedUser.tipo_conta}'`);
    }

    // Verificar resultado final
    const finalUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        nome: true,
        email: true,
        tipo_conta: true,
        saldo_reais: true,
        saldo_demo: true
      }
    });

    console.log('\n🎯 RESULTADO FINAL:');
    console.log(`   Nome: ${finalUser.nome}`);
    console.log(`   Email: ${finalUser.email}`);
    console.log(`   Tipo de conta: ${finalUser.tipo_conta}`);
    console.log(`   Saldo reais: R$ ${finalUser.saldo_reais}`);
    console.log(`   Saldo demo: R$ ${finalUser.saldo_demo}`);

    const isDemoAccount = finalUser.tipo_conta === 'afiliado_demo';
    console.log(`\n🎲 Sistema de prêmios: ${isDemoAccount ? 'DEMO (prêmios altos)' : 'NORMAL (prêmios controlados)'}`);

    if (!isDemoAccount) {
      console.log('\n🎉 SUCESSO! Agora o usuário paulotest receberá:');
      console.log('   • Weekend (R$1,50): Apenas R$1,00');
      console.log('   • Nike (R$2,50): R$1,00 e R$2,00');
      console.log('   • Samsung (R$3,00): R$1,00 e R$2,00');
      console.log('   • Console (R$3,50): R$1,00 e R$2,00');
      console.log('   • Apple (R$7,00): Apenas R$5,00');
      console.log('   • Premium Master (R$15,00): R$2,00, R$5,00 e R$10,00');
    }

  } catch (error) {
    console.error('❌ Erro ao corrigir tipo de conta:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixPaulotestAccountType();
