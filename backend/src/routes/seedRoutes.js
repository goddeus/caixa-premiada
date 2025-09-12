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
          // Manter saldo atual se já existe, apenas atualizar senha e permissões
          const currentSaldoReais = existingUser.saldo_reais || 0;
          const currentSaldoDemo = existingUser.saldo_demo || 0;
          
          await prisma.user.update({
            where: { email: adminData.email },
            data: {
              senha_hash: adminPassword,
              is_admin: true,
              tipo_conta: 'admin',
              ativo: true,
              primeiro_deposito_feito: true,
              rollover_liberado: true
            }
          });

          // Atualizar wallet mantendo saldo atual
          await prisma.wallet.upsert({
            where: { user_id: existingUser.id },
            update: {
              primeiro_deposito_feito: true,
              rollover_liberado: true
            },
            create: {
              user_id: existingUser.id,
              saldo_reais: currentSaldoReais,
              saldo_demo: currentSaldoDemo,
              primeiro_deposito_feito: true,
              rollover_liberado: true
            }
          });

          createdUsers.admins.push({
            email: adminData.email,
            status: 'Atualizado (saldo mantido)',
            saldo_reais: currentSaldoReais,
            saldo_demo: currentSaldoDemo
          });
          console.log(`✅ Admin atualizado: ${adminData.email} (saldo mantido)`);
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

        // Criar wallet para admin
        await prisma.wallet.create({
          data: {
            user_id: admin.id,
            saldo_reais: 100.00,
            saldo_demo: 100.00,
            primeiro_deposito_feito: true,
            rollover_liberado: true
          }
        });

        createdUsers.admins.push({
          email: adminData.email,
          status: 'Criado',
          saldo_reais: 100.00,
          saldo_demo: 100.00
        });
        console.log(`✅ Admin criado: ${adminData.email}`);

      } catch (error) {
        console.error(`❌ Erro ao criar admin ${adminData.email}:`, error.message);
        createdUsers.skipped.push({
          email: adminData.email,
          reason: error.message
        });
      }
    }

    // 2. CRIAR CONTAS DEMO
    console.log('🎭 Criando contas DEMO...');
    
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
          // Manter saldo atual se já existe, apenas atualizar senha
          const currentSaldoDemo = existingUser.saldo_demo || 0;
          
          await prisma.user.update({
            where: { email: demoData.email },
            data: {
              senha_hash: demoPassword,
              is_admin: false,
              tipo_conta: 'demo',
              ativo: true,
              primeiro_deposito_feito: false,
              rollover_liberado: false
            }
          });

          // Atualizar wallet mantendo saldo atual
          await prisma.wallet.upsert({
            where: { user_id: existingUser.id },
            update: {
              primeiro_deposito_feito: false,
              rollover_liberado: false
            },
            create: {
              user_id: existingUser.id,
              saldo_reais: 0.00,
              saldo_demo: currentSaldoDemo,
              primeiro_deposito_feito: false,
              rollover_liberado: false
            }
          });

          createdUsers.demos.push({
            email: demoData.email,
            status: 'Atualizado (saldo mantido)',
            saldo_demo: currentSaldoDemo
          });
          console.log(`✅ Demo atualizado: ${demoData.email} (saldo mantido)`);
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

        // Criar wallet para demo
        await prisma.wallet.create({
          data: {
            user_id: demo.id,
            saldo_reais: 0.00,
            saldo_demo: 100.00,
            primeiro_deposito_feito: false,
            rollover_liberado: false
          }
        });

        createdUsers.demos.push({
          email: demoData.email,
          status: 'Criado',
          saldo_demo: 100.00
        });
        console.log(`✅ Demo criado: ${demoData.email}`);

      } catch (error) {
        console.error(`❌ Erro ao criar demo ${demoData.email}:`, error.message);
        createdUsers.skipped.push({
          email: demoData.email,
          reason: error.message
        });
      }
    }

    // 3. RESUMO FINAL
    const totalAdmins = createdUsers.admins.length;
    const totalDemos = createdUsers.demos.length;
    const totalSkipped = createdUsers.skipped.length;
    
    console.log(`\n📊 Resumo:`);
    console.log(`👑 Admins: ${totalAdmins} contas`);
    console.log(`🎭 Demos: ${totalDemos} contas`);
    console.log(`⏭️ Ignorados: ${totalSkipped} contas`);

    const message = totalAdmins > 0 || totalDemos > 0 
      ? `✅ ${totalAdmins} contas ADMIN e ${totalDemos} contas DEMO processadas com sucesso!`
      : 'ℹ️ Nenhuma nova conta foi criada. Todas as contas já existem.';

    res.status(200).json({
      success: true,
      message: message,
      data: {
        created: createdUsers,
        summary: {
          total_admins: totalAdmins,
          total_demos: totalDemos,
          total_skipped: totalSkipped
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro geral no seed:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

/**
 * POST /api/seed/update-all-affiliates
 * Atualizar todas as contas para terem contas de afiliados
 */
router.post('/update-all-affiliates', async (req, res) => {
  try {
    console.log('🔄 Iniciando atualização de todas as contas para afiliados...');
    
    // Buscar todos os usuários que não são afiliados
    const users = await prisma.user.findMany({
      where: {
        affiliate: null // Usuários sem conta de afiliado
      },
      select: {
        id: true,
        nome: true,
        email: true
      }
    });
    
    console.log(`📊 Encontrados ${users.length} usuários sem conta de afiliado`);
    
    const results = {
      created: [],
      errors: [],
      summary: {
        total: users.length,
        created: 0,
        errors: 0
      }
    };
    
    for (const user of users) {
      try {
        console.log(`🔄 Criando afiliado para: ${user.email}`);
        
        const affiliate = await AffiliateService.createAffiliate(user.id);
        
        results.created.push({
          email: user.email,
          codigo: affiliate.codigo_indicacao,
          link: affiliate.link
        });
        
        results.summary.created++;
        console.log(`✅ Afiliado criado: ${user.email} - Código: ${affiliate.codigo_indicacao}`);
        
      } catch (error) {
        results.errors.push({
          email: user.email,
          error: error.message
        });
        
        results.summary.errors++;
        console.error(`❌ Erro ao criar afiliado para ${user.email}:`, error.message);
      }
    }
    
    console.log('\n📊 Resumo:');
    console.log(`✅ Afiliados criados: ${results.summary.created}`);
    console.log(`❌ Erros: ${results.summary.errors}`);
    console.log(`📈 Total processados: ${results.summary.total}`);
    
    res.status(200).json({
      success: true,
      message: `✅ ${results.summary.created} contas de afiliados criadas com sucesso!`,
      data: results
    });
    
  } catch (error) {
    console.error('❌ Erro geral na atualização de afiliados:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

module.exports = router;