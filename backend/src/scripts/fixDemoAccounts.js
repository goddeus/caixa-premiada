const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixDemoAccounts() {
  try {
    console.log('🔧 Iniciando correção das contas demo...');

    // 1. Atualizar tipo_conta das contas demo existentes
    const demoAccounts = await prisma.user.findMany({
      where: {
        tipo_conta: 'demo'
      },
      select: {
        id: true,
        email: true,
        nome: true,
        saldo_demo: true
      }
    });

    console.log(`📊 Encontradas ${demoAccounts.length} contas demo para corrigir`);

    for (const account of demoAccounts) {
      // Atualizar tipo_conta para 'afiliado_demo'
      await prisma.user.update({
        where: { id: account.id },
        data: {
          tipo_conta: 'afiliado_demo',
          saldo_demo: account.saldo_demo || 100.00 // Garantir que tenha saldo demo
        }
      });

      // Atualizar wallet correspondente
      await prisma.wallet.upsert({
        where: { user_id: account.id },
        update: {
          saldo_demo: account.saldo_demo || 100.00
        },
        create: {
          user_id: account.id,
          saldo_reais: 0.00,
          saldo_demo: account.saldo_demo || 100.00
        }
      });

      console.log(`✅ Conta demo corrigida: ${account.email} - Saldo: R$ ${account.saldo_demo || 100.00}`);
    }

    // 2. Criar contas demo se não existirem
    const existingDemoCount = await prisma.user.count({
      where: { tipo_conta: 'afiliado_demo' }
    });

    if (existingDemoCount === 0) {
      console.log('🎭 Criando contas demo...');
      
      const demoAccounts = [
        { nome: 'Demo 1', email: 'demo1@test.com' },
        { nome: 'Demo 2', email: 'demo2@test.com' },
        { nome: 'Demo 3', email: 'demo3@test.com' }
      ];

      for (const demoData of demoAccounts) {
        const demo = await prisma.user.create({
          data: {
            nome: demoData.nome,
            email: demoData.email,
            senha_hash: '$2a$10$demo.hash.for.testing.purposes.only',
            cpf: `1111111111${demoAccounts.indexOf(demoData) + 1}`,
            is_admin: false,
            tipo_conta: 'afiliado_demo',
            saldo_reais: 0.00,
            saldo_demo: 100.00,
            ativo: true,
            primeiro_deposito_feito: false,
            rollover_liberado: false
          }
        });

        await prisma.wallet.create({
          data: {
            user_id: demo.id,
            saldo_reais: 0.00,
            saldo_demo: 100.00
          }
        });

        console.log(`✅ Demo criado: ${demoData.email} - Saldo: R$ 100.00`);
      }
    }

    // 3. Verificar contas admin
    const adminAccounts = await prisma.user.findMany({
      where: { is_admin: true },
      select: {
        id: true,
        email: true,
        nome: true,
        saldo_reais: true,
        saldo_demo: true
      }
    });

    console.log(`\n👑 Verificando ${adminAccounts.length} contas admin...`);

    for (const admin of adminAccounts) {
      // Garantir que admin tenha saldo adequado
      if (admin.saldo_reais < 100) {
        await prisma.user.update({
          where: { id: admin.id },
          data: {
            saldo_reais: 10000.00
          }
        });

        await prisma.wallet.upsert({
          where: { user_id: admin.id },
          update: {
            saldo_reais: 10000.00
          },
          create: {
            user_id: admin.id,
            saldo_reais: 10000.00,
            saldo_demo: 0.00
          }
        });

        console.log(`✅ Admin atualizado: ${admin.email} - Saldo: R$ 10000.00`);
      }
    }

    console.log('\n🎉 Correção das contas concluída com sucesso!');
    console.log('\n📋 Resumo:');
    console.log(`🎭 Contas demo: ${await prisma.user.count({ where: { tipo_conta: 'afiliado_demo' } })}`);
    console.log(`👑 Contas admin: ${await prisma.user.count({ where: { is_admin: true } })}`);

  } catch (error) {
    console.error('❌ Erro ao corrigir contas demo:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  fixDemoAccounts();
}

module.exports = fixDemoAccounts;
