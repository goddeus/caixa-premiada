const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * POST /api/seed/seed-demo-users
 * Criar contas DEMO e ADMIN automaticamente
 */
router.post('/seed-demo-users', async (req, res) => {
  try {
    console.log('🌱 Iniciando criação de contas DEMO e ADMIN...');

    const createdUsers = {
      demos: [],
      admins: [],
      skipped: []
    };

    // 1. CRIAR CONTAS ADMIN
    console.log('👑 Criando contas ADMIN...');
    
    const adminPassword = await bcrypt.hash('paineladm@', 12);
    
    const adminAccounts = [
      { nome: 'Eduarda', email: 'eduarda@admin.com', username: 'eduarda' },
      { nome: 'Junior', email: 'junior@admin.com', username: 'junior' }
    ];

    for (const adminData of adminAccounts) {
      try {
        // Verificar se já existe
        const existingUser = await prisma.user.findUnique({
          where: { email: adminData.email }
        });

        if (existingUser) {
          // Atualizar senha da conta existente
          await prisma.user.update({
            where: { email: adminData.email },
            data: {
              senha_hash: adminPassword,
              is_admin: true,
              tipo_conta: 'admin',
              saldo_reais: 100.00,
              saldo_demo: 100.00,
              ativo: true,
              primeiro_deposito_feito: true,
              rollover_liberado: true
            }
          });

          // Atualizar wallet
          await prisma.wallet.upsert({
            where: { user_id: existingUser.id },
            update: {
              saldo_reais: 100.00,
              saldo_demo: 100.00,
              primeiro_deposito_feito: true,
              rollover_liberado: true
            },
            create: {
              user_id: existingUser.id,
              saldo_reais: 100.00,
              saldo_demo: 100.00,
              primeiro_deposito_feito: true,
              rollover_liberado: true
            }
          });

          createdUsers.admins.push(adminData.email);
          console.log(`🔄 Admin atualizado: ${adminData.email}`);
          continue;
        }

        // Criar conta admin
        const admin = await prisma.user.create({
          data: {
            nome: adminData.nome,
            email: adminData.email,
            senha_hash: adminPassword,
            cpf: `0000000000${adminAccounts.indexOf(adminData) + 1}`,
            is_admin: true,
            tipo_conta: 'admin',
            saldo_reais: 100.00,
            saldo_demo: 100.00,
            ativo: true,
            primeiro_deposito_feito: true,
            rollover_liberado: true
          }
        });

        // Criar wallet para o admin
        await prisma.wallet.create({
          data: {
            user_id: admin.id,
            saldo_reais: 100.00,
            saldo_demo: 100.00,
            primeiro_deposito_feito: true,
            rollover_liberado: true
          }
        });

        createdUsers.admins.push(admin.email);
        console.log(`✅ Admin criado: ${adminData.email}`);
      } catch (error) {
        console.log(`❌ Erro ao criar admin ${adminData.email}:`, error.message);
        createdUsers.skipped.push({
          email: adminData.email,
          reason: `Erro: ${error.message}`
        });
      }
    }

    // 2. CRIAR CONTAS DEMO
    console.log('\n🎭 Criando contas DEMO...');
    
    const demoPassword = await bcrypt.hash('Afiliado@123', 12);
    
    const demoAccounts = [
      { nome: 'João Ferreira', email: 'joao.ferreira@test.com', username: 'joao_f' },
      { nome: 'Lucas Almeida', email: 'lucas.almeida@test.com', username: 'lucasal' },
      { nome: 'Pedro Henrique', email: 'pedro.henrique@test.com', username: 'pedroh' },
      { nome: 'Rafael Costa', email: 'rafael.costa@test.com', username: 'rafa_c' },
      { nome: 'Bruno Martins', email: 'bruno.martins@test.com', username: 'brunom' },
      { nome: 'Diego Oliveira', email: 'diego.oliveira@test.com', username: 'diegoo' },
      { nome: 'Matheus Rocha', email: 'matheus.rocha@test.com', username: 'matheusr' },
      { nome: 'Thiago Mendes', email: 'thiago.mendes@test.com', username: 'thiagom' },
      { nome: 'Felipe Carvalho', email: 'felipe.carvalho@test.com', username: 'felipec' },
      { nome: 'Gustavo Lima', email: 'gustavo.lima@test.com', username: 'gustavol' },
      { nome: 'André Pereira', email: 'andre.pereira@test.com', username: 'andrep' },
      { nome: 'Rodrigo Santos', email: 'rodrigo.santos@test.com', username: 'rodrigos' },
      { nome: 'Marcelo Nunes', email: 'marcelo.nunes@test.com', username: 'marcelon' },
      { nome: 'Vinícius Araújo', email: 'vinicius.araujo@test.com', username: 'viniciusa' },
      { nome: 'Eduardo Ramos', email: 'eduardo.ramos@test.com', username: 'eduardor' }
    ];

    for (const demoData of demoAccounts) {
      try {
        // Verificar se já existe
        const existingUser = await prisma.user.findUnique({
          where: { email: demoData.email }
        });

        if (existingUser) {
          // Atualizar senha da conta existente
          await prisma.user.update({
            where: { email: demoData.email },
            data: {
              senha_hash: demoPassword,
              is_admin: false,
              tipo_conta: 'demo',
              saldo_reais: 0.00,
              saldo_demo: 100.00,
              ativo: true,
              primeiro_deposito_feito: false,
              rollover_liberado: false
            }
          });

          // Atualizar wallet
          await prisma.wallet.upsert({
            where: { user_id: existingUser.id },
            update: {
              saldo_reais: 0.00,
              saldo_demo: 100.00,
              primeiro_deposito_feito: false,
              rollover_liberado: false
            },
            create: {
              user_id: existingUser.id,
              saldo_reais: 0.00,
              saldo_demo: 100.00,
              primeiro_deposito_feito: false,
              rollover_liberado: false
            }
          });

          createdUsers.demos.push(demoData.email);
          console.log(`🔄 Demo atualizado: ${demoData.email}`);
          continue;
        }

        // Criar conta demo
        const demo = await prisma.user.create({
          data: {
            nome: demoData.nome,
            email: demoData.email,
            senha_hash: demoPassword,
            cpf: `1111111111${String(demoAccounts.indexOf(demoData) + 1).padStart(2, '0')}`,
            is_admin: false,
            tipo_conta: 'demo',
            saldo_reais: 0.00,
            saldo_demo: 100.00,
            ativo: true,
            primeiro_deposito_feito: false,
            rollover_liberado: false
          }
        });

        // Criar wallet para o demo
        await prisma.wallet.create({
          data: {
            user_id: demo.id,
            saldo_reais: 0.00,
            saldo_demo: 100.00,
            primeiro_deposito_feito: false,
            rollover_liberado: false
          }
        });

        createdUsers.demos.push(demo.email);
        console.log(`✅ Demo criado: ${demoData.email}`);
      } catch (error) {
        console.log(`❌ Erro ao criar demo ${demoData.email}:`, error.message);
        createdUsers.skipped.push({
          email: demoData.email,
          reason: `Erro: ${error.message}`
        });
      }
    }

    await prisma.$disconnect();

    // Preparar resposta
    const totalCreated = createdUsers.demos.length + createdUsers.admins.length;
    const totalSkipped = createdUsers.skipped.length;

    let message;
    if (totalCreated > 0) {
      message = `Criadas ${totalCreated} contas (${createdUsers.demos.length} DEMO + ${createdUsers.admins.length} ADMIN). ${totalSkipped} contas já existiam.`;
    } else {
      message = 'Nenhuma nova conta foi criada. Todas as contas já existem.';
    }

    console.log(`\n📊 Resumo: ${message}`);

    res.json({
      success: true,
      message: message,
      data: {
        created: {
          demos: createdUsers.demos,
          admins: createdUsers.admins,
          total: totalCreated
        },
        skipped: createdUsers.skipped,
        credentials: {
          admins: [
            { email: 'eduarda@admin.com', senha: 'paineladm@' },
            { email: 'junior@admin.com', senha: 'paineladm@' }
          ],
          demos: [
            { email: 'joao.ferreira@test.com', senha: 'Afiliado@123' },
            { email: 'lucas.almeida@test.com', senha: 'Afiliado@123' },
            { email: 'pedro.henrique@test.com', senha: 'Afiliado@123' }
          ]
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao criar contas de seed:', error);
    
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error('Erro ao desconectar Prisma:', disconnectError);
    }

    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao criar contas',
      error: error.message
    });
  }
});

module.exports = router;
