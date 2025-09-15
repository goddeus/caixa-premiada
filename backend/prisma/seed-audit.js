/**
 * Seed para Auditoria - Contas Demo e Admin
 * Cria contas de teste e administrador para auditoria
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedAuditAccounts() {
  console.log('🌱 Iniciando seed de contas de auditoria...');

  try {
    // 1. Criar conta administrador
    console.log('👑 Criando conta administrador...');
    
    const adminPassword = await bcrypt.hash('admin123!', 10);
    
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@slotbox.shop' },
      update: {},
      create: {
        nome: 'Administrador SlotBox',
        email: 'admin@slotbox.shop',
        senha_hash: adminPassword,
        cpf: '00000000000',
        saldo_reais: 0,
        saldo_demo: 0,
        tipo_conta: 'normal',
        is_admin: true,
        ativo: true,
        rollover_liberado: true,
        primeiro_deposito_feito: true
      }
    });

    // Criar wallet para admin
    await prisma.wallet.upsert({
      where: { user_id: adminUser.id },
      update: {},
      create: {
        user_id: adminUser.id,
        saldo_reais: 0,
        saldo_demo: 0
      }
    });

    console.log(`✅ Conta administrador criada: ${adminUser.id}`);

    // 2. Criar contas demo
    console.log('🎭 Criando contas demo...');
    
    const demoAccounts = [
      {
        nome: 'Usuário Demo 1',
        email: 'demo1@slotbox.shop',
        cpf: '11111111111',
        saldo_demo: 1000.00
      },
      {
        nome: 'Usuário Demo 2',
        email: 'demo2@slotbox.shop',
        cpf: '22222222222',
        saldo_demo: 500.00
      },
      {
        nome: 'Usuário Demo 3',
        email: 'demo3@slotbox.shop',
        cpf: '33333333333',
        saldo_demo: 2000.00
      }
    ];

    const demoPassword = await bcrypt.hash('demo123!', 10);

    for (const demoData of demoAccounts) {
      const demoUser = await prisma.user.upsert({
        where: { email: demoData.email },
        update: {},
        create: {
          nome: demoData.nome,
          email: demoData.email,
          senha_hash: demoPassword,
          cpf: demoData.cpf,
          saldo_reais: 0,
          saldo_demo: demoData.saldo_demo,
          tipo_conta: 'afiliado_demo',
          is_admin: false,
          ativo: true,
          rollover_liberado: true,
          primeiro_deposito_feito: true
        }
      });

      // Criar wallet para demo
      await prisma.wallet.upsert({
        where: { user_id: demoUser.id },
        update: {},
        create: {
          user_id: demoUser.id,
          saldo_reais: 0,
          saldo_demo: demoData.saldo_demo
        }
      });

      console.log(`✅ Conta demo criada: ${demoUser.nome} (${demoUser.id})`);
    }

    // 3. Criar configuração de RTP padrão
    console.log('🎯 Criando configuração de RTP...');
    
    const rtpConfig = await prisma.rTPConfig.upsert({
      where: { id: 'default' },
      update: {},
      create: {
        id: 'default',
        rtp_target: 10.0,
        ativo: true
      }
    });

    console.log(`✅ Configuração de RTP criada: ${rtpConfig.id}`);

    // 4. Criar caixas de teste se não existirem
    console.log('📦 Verificando caixas de teste...');
    
    const testCases = [
      {
        nome: 'CAIXA TESTE AUDITORIA',
        descricao: 'Caixa para testes de auditoria',
        preco: 10.00,
        ativo: true
      },
      {
        nome: 'CAIXA DEMO',
        descricao: 'Caixa para contas demo',
        preco: 5.00,
        ativo: true
      }
    ];

    for (const caseData of testCases) {
      const testCase = await prisma.case.upsert({
        where: { nome: caseData.nome },
        update: {},
        create: caseData
      });

      console.log(`✅ Caixa de teste criada: ${testCase.nome} (${testCase.id})`);

      // Criar prêmios de teste para a caixa
      const testPrizes = [
        {
          nome: 'Prêmio Pequeno',
          valor: 5.00,
          probabilidade: 0.4,
          ativo: true,
          sorteavel: true
        },
        {
          nome: 'Prêmio Médio',
          valor: 15.00,
          probabilidade: 0.3,
          ativo: true,
          sorteavel: true
        },
        {
          nome: 'Prêmio Grande',
          valor: 50.00,
          probabilidade: 0.2,
          ativo: true,
          sorteavel: true
        },
        {
          nome: 'Prêmio Ilustrativo',
          valor: 0.00,
          probabilidade: 0.1,
          ativo: true,
          sorteavel: false
        }
      ];

      for (const prizeData of testPrizes) {
        await prisma.prize.upsert({
          where: {
            case_id_nome: {
              case_id: testCase.id,
              nome: prizeData.nome
            }
          },
          update: {},
          create: {
            case_id: testCase.id,
            ...prizeData
          }
        });
      }

      console.log(`✅ Prêmios de teste criados para: ${testCase.nome}`);
    }

    // 5. Criar logs de auditoria iniciais
    console.log('📋 Criando logs de auditoria iniciais...');
    
    const auditLogs = [
      {
        user_id: adminUser.id,
        action: 'seed_audit_accounts',
        details: {
          message: 'Seed de contas de auditoria executado',
          accounts_created: {
            admin: 1,
            demo: demoAccounts.length
          }
        }
      }
    ];

    for (const logData of auditLogs) {
      await prisma.adminLog.create({
        data: {
          ...logData,
          ip_address: '127.0.0.1',
          user_agent: 'seed-script'
        }
      });
    }

    console.log('✅ Logs de auditoria criados');

    // 6. Relatório final
    console.log('\n📊 RELATÓRIO DO SEED DE AUDITORIA:');
    console.log('=' .repeat(50));
    console.log(`👑 Conta administrador: admin@slotbox.shop (senha: admin123!)`);
    console.log(`🎭 Contas demo criadas: ${demoAccounts.length}`);
    demoAccounts.forEach((demo, index) => {
      console.log(`   ${index + 1}. ${demo.email} (senha: demo123!) - R$ ${demo.saldo_demo}`);
    });
    console.log(`🎯 Configuração de RTP: ${rtpConfig.rtp_target}%`);
    console.log(`📦 Caixas de teste: ${testCases.length}`);
    console.log(`📋 Logs de auditoria: ${auditLogs.length}`);
    
    console.log('\n✅ Seed de auditoria concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante seed de auditoria:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar seed se chamado diretamente
if (require.main === module) {
  seedAuditAccounts()
    .then(() => {
      console.log('🎉 Seed executado com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erro no seed:', error);
      process.exit(1);
    });
}

module.exports = { seedAuditAccounts };
