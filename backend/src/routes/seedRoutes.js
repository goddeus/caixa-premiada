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
              tipo_conta: 'afiliado_demo',
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
            tipo_conta: 'afiliado_demo',
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

/**
 * POST /api/seed/initialize-prizes
 * Inicializar prêmios para todas as caixas baseado nas imagens disponíveis
 */
router.post('/initialize-prizes', async (req, res) => {
  try {
    console.log('🎁 Iniciando inicialização de prêmios das caixas...');

    // Buscar todas as caixas
    const cases = await prisma.case.findMany({
      where: { ativo: true }
    });

    console.log(`📦 Encontradas ${cases.length} caixas:`);
    cases.forEach(c => {
      console.log(`  - ${c.nome} (ID: ${c.id})`);
    });

    // Definir prêmios baseados nas imagens reais de cada pasta
    const prizesByCase = {
      'CAIXA CONSOLE DOS SONHOS': [
        // Prêmios reais (com imagens)
        { nome: 'R$ 1,00', valor: 1.00, probabilidade: 0.40, tipo: 'cash', sorteavel: true, imagem: '1real.png' },
        { nome: 'R$ 2,00', valor: 2.00, probabilidade: 0.25, tipo: 'cash', sorteavel: true, imagem: '2reais.png' },
        { nome: 'R$ 5,00', valor: 5.00, probabilidade: 0.20, tipo: 'cash', sorteavel: true, imagem: '5reais.png' },
        { nome: 'R$ 10,00', valor: 10.00, probabilidade: 0.10, tipo: 'cash', sorteavel: true, imagem: '10reais.png' },
        { nome: 'R$ 100,00', valor: 100.00, probabilidade: 0.04, tipo: 'cash', sorteavel: true, imagem: '100reais.png' },
        // Prêmios ilustrativos (com imagens)
        { nome: 'STEAM DECK', valor: 3000.00, probabilidade: 0.005, tipo: 'ilustrativo', sorteavel: false, imagem: 'steamdeck.png' },
        { nome: 'PLAYSTATION 5', valor: 4000.00, probabilidade: 0.003, tipo: 'ilustrativo', sorteavel: false, imagem: 'ps5.png' },
        { nome: 'XBOX ONE X', valor: 4000.00, probabilidade: 0.002, tipo: 'ilustrativo', sorteavel: false, imagem: 'xboxone.webp' }
      ],
      'CAIXA PREMIUM MASTER': [
        // Prêmios reais (com imagens)
        { nome: 'R$ 2,00', valor: 2.00, probabilidade: 0.35, tipo: 'cash', sorteavel: true, imagem: '2.png' },
        { nome: 'R$ 5,00', valor: 5.00, probabilidade: 0.25, tipo: 'cash', sorteavel: true, imagem: '5.png' },
        { nome: 'R$ 10,00', valor: 10.00, probabilidade: 0.20, tipo: 'cash', sorteavel: true, imagem: '10.png' },
        { nome: 'R$ 20,00', valor: 20.00, probabilidade: 0.15, tipo: 'cash', sorteavel: true, imagem: '20.png' },
        { nome: 'R$ 500,00', valor: 500.00, probabilidade: 0.04, tipo: 'cash', sorteavel: true, imagem: '500.webp' },
        // Prêmios ilustrativos (com imagens)
        { nome: 'AIRPODS', valor: 2500.00, probabilidade: 0.005, tipo: 'ilustrativo', sorteavel: false, imagem: 'airpods.png' },
        { nome: 'HONDA CG FAN', valor: 8000.00, probabilidade: 0.003, tipo: 'ilustrativo', sorteavel: false, imagem: 'honda cg fan.webp' },
        { nome: 'IPAD', valor: 5000.00, probabilidade: 0.002, tipo: 'ilustrativo', sorteavel: false, imagem: 'ipad.png' },
        { nome: 'IPHONE 16 PRO MAX', valor: 10000.00, probabilidade: 0.001, tipo: 'ilustrativo', sorteavel: false, imagem: 'iphone 16 pro max.png' },
        { nome: 'MACBOOK', valor: 15000.00, probabilidade: 0.001, tipo: 'ilustrativo', sorteavel: false, imagem: 'macbook.png' },
        { nome: 'SAMSUNG S25', valor: 6000.00, probabilidade: 0.001, tipo: 'ilustrativo', sorteavel: false, imagem: 'samsung s25.png' }
      ],
      'CAIXA SAMSUNG': [
        // Prêmios reais (com imagens)
        { nome: 'R$ 1,00', valor: 1.00, probabilidade: 0.40, tipo: 'cash', sorteavel: true, imagem: '1.png' },
        { nome: 'R$ 2,00', valor: 2.00, probabilidade: 0.25, tipo: 'cash', sorteavel: true, imagem: '2.png' },
        { nome: 'R$ 5,00', valor: 5.00, probabilidade: 0.20, tipo: 'cash', sorteavel: true, imagem: '5.png' },
        { nome: 'R$ 10,00', valor: 10.00, probabilidade: 0.10, tipo: 'cash', sorteavel: true, imagem: '10.png' },
        { nome: 'R$ 100,00', valor: 100.00, probabilidade: 0.04, tipo: 'cash', sorteavel: true, imagem: '100.png' },
        { nome: 'R$ 500,00', valor: 500.00, probabilidade: 0.008, tipo: 'cash', sorteavel: true, imagem: '500.webp' },
        // Prêmios ilustrativos (com imagens)
        { nome: 'FONE SAMSUNG', valor: 800.00, probabilidade: 0.005, tipo: 'ilustrativo', sorteavel: false, imagem: 'fone samsung.png' },
        { nome: 'NOTEBOOK SAMSUNG', valor: 4000.00, probabilidade: 0.002, tipo: 'ilustrativo', sorteavel: false, imagem: 'notebook samsung.png' },
        { nome: 'SAMSUNG S25', valor: 6000.00, probabilidade: 0.001, tipo: 'ilustrativo', sorteavel: false, imagem: 's25.png' }
      ],
      'CAIXA APPLE': [
        // Prêmios reais (com imagens)
        { nome: 'R$ 1,00', valor: 1.00, probabilidade: 0.35, tipo: 'cash', sorteavel: true, imagem: '1.png' },
        { nome: 'R$ 2,00', valor: 2.00, probabilidade: 0.25, tipo: 'cash', sorteavel: true, imagem: '2.png' },
        { nome: 'R$ 5,00', valor: 5.00, probabilidade: 0.20, tipo: 'cash', sorteavel: true, imagem: '5.png' },
        { nome: 'R$ 10,00', valor: 10.00, probabilidade: 0.15, tipo: 'cash', sorteavel: true, imagem: '10.png' },
        { nome: 'R$ 500,00', valor: 500.00, probabilidade: 0.04, tipo: 'cash', sorteavel: true, imagem: '500.webp' },
        // Prêmios ilustrativos (com imagens)
        { nome: 'AIR PODS', valor: 2500.00, probabilidade: 0.005, tipo: 'ilustrativo', sorteavel: false, imagem: 'air pods.png' },
        { nome: 'IPHONE 16 PRO MAX', valor: 10000.00, probabilidade: 0.003, tipo: 'ilustrativo', sorteavel: false, imagem: 'iphone 16 pro max.png' },
        { nome: 'MACBOOK', valor: 15000.00, probabilidade: 0.001, tipo: 'ilustrativo', sorteavel: false, imagem: 'macbook.png' }
      ],
      'CAIXA KIT NIKE': [
        // Prêmios reais (com imagens)
        { nome: 'R$ 1,00', valor: 1.00, probabilidade: 0.40, tipo: 'cash', sorteavel: true, imagem: '1.png' },
        { nome: 'R$ 2,00', valor: 2.00, probabilidade: 0.25, tipo: 'cash', sorteavel: true, imagem: '2.png' },
        { nome: 'R$ 5,00', valor: 5.00, probabilidade: 0.20, tipo: 'cash', sorteavel: true, imagem: '5.png' },
        { nome: 'R$ 10,00', valor: 10.00, probabilidade: 0.10, tipo: 'cash', sorteavel: true, imagem: '10.png' },
        // Prêmios ilustrativos (com imagens)
        { nome: 'AIR FORCE 1', valor: 700.00, probabilidade: 0.02, tipo: 'ilustrativo', sorteavel: false, imagem: 'airforce.webp' },
        { nome: 'BONÉ NIKE', valor: 150.00, probabilidade: 0.015, tipo: 'ilustrativo', sorteavel: false, imagem: 'boné nike.png' },
        { nome: 'CAMISA NIKE', valor: 200.00, probabilidade: 0.01, tipo: 'ilustrativo', sorteavel: false, imagem: 'camisa nike.webp' },
        { nome: 'JORDAN', valor: 1200.00, probabilidade: 0.005, tipo: 'ilustrativo', sorteavel: false, imagem: 'jordan.png' },
        { nome: 'NIKE DUNK', valor: 1000.00, probabilidade: 0.005, tipo: 'ilustrativo', sorteavel: false, imagem: 'nike dunk.webp' }
      ],
      'CAIXA FINAL DE SEMANA': [
        // Prêmios reais (com imagens)
        { nome: 'R$ 1,00', valor: 1.00, probabilidade: 0.45, tipo: 'cash', sorteavel: true, imagem: '1.png' },
        { nome: 'R$ 2,00', valor: 2.00, probabilidade: 0.30, tipo: 'cash', sorteavel: true, imagem: '2.png' },
        { nome: 'R$ 5,00', valor: 5.00, probabilidade: 0.15, tipo: 'cash', sorteavel: true, imagem: '5.png' },
        { nome: 'R$ 10,00', valor: 10.00, probabilidade: 0.07, tipo: 'cash', sorteavel: true, imagem: '10.png' },
        { nome: 'R$ 100,00', valor: 100.00, probabilidade: 0.025, tipo: 'cash', sorteavel: true, imagem: '100.png' },
        { nome: 'R$ 500,00', valor: 500.00, probabilidade: 0.005, tipo: 'cash', sorteavel: true, imagem: '500.webp' }
      ]
    };

    const results = {
      processed: [],
      errors: [],
      summary: {
        total_cases: cases.length,
        processed: 0,
        errors: 0,
        total_prizes: 0
      }
    };

    // Adicionar prêmios para cada caixa
    for (const caseItem of cases) {
      const caseName = caseItem.nome;
      const prizes = prizesByCase[caseName];

      if (!prizes) {
        console.log(`⚠️ Nenhum prêmio definido para: ${caseName}`);
        results.errors.push({
          case: caseName,
          error: 'Nenhum prêmio definido'
        });
        results.summary.errors++;
        continue;
      }

      console.log(`\n🎁 Processando: ${caseName}`);

      try {
        // Limpar prêmios existentes
        await prisma.prize.deleteMany({
          where: { case_id: caseItem.id }
        });

        // Adicionar novos prêmios
        const createdPrizes = [];
        for (const prize of prizes) {
          const createdPrize = await prisma.prize.create({
            data: {
              case_id: caseItem.id,
              nome: prize.nome,
              valor: prize.valor,
              probabilidade: prize.probabilidade,
              ativo: true,
              imagem: `/imagens/${caseName}/${prize.imagem}`
            }
          });
          createdPrizes.push(createdPrize);
          console.log(`  ✅ ${prize.nome} - R$ ${prize.valor} (${(prize.probabilidade * 100).toFixed(2)}%)`);
        }

        results.processed.push({
          case: caseName,
          case_id: caseItem.id,
          prizes_count: createdPrizes.length,
          prizes: createdPrizes.map(p => ({
            nome: p.nome,
            valor: p.valor,
            sorteavel: p.sorteavel
          }))
        });

        results.summary.processed++;
        results.summary.total_prizes += createdPrizes.length;

      } catch (error) {
        console.error(`❌ Erro ao processar ${caseName}:`, error.message);
        results.errors.push({
          case: caseName,
          error: error.message
        });
        results.summary.errors++;
      }
    }

    console.log('\n✅ Inicialização de prêmios concluída!');
    console.log(`📊 Resumo: ${results.summary.processed}/${results.summary.total_cases} caixas processadas`);
    console.log(`🎁 Total de prêmios criados: ${results.summary.total_prizes}`);

    const message = results.summary.errors === 0 
      ? `✅ ${results.summary.processed} caixas processadas com sucesso! ${results.summary.total_prizes} prêmios criados.`
      : `⚠️ ${results.summary.processed} caixas processadas, ${results.summary.errors} erros encontrados.`;

    res.status(200).json({
      success: true,
      message: message,
      data: results
    });

  } catch (error) {
    console.error('❌ Erro geral na inicialização de prêmios:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

module.exports = router;