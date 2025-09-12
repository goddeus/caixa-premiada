const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createAdminAndDemoAccounts() {
  try {
    // 1. Criar contas ADMIN
    console.log('👑 Criando contas ADMIN...');
    const bcrypt = require('bcrypt');
    const adminPassword = await bcrypt.hash('paineladm@', 12);
    
    const adminAccounts = [
      { nome: 'Eduarda', email: 'eduarda@admin.com', username: 'eduarda' },
      { nome: 'Junior', email: 'junior@admin.com', username: 'junior' }
    ];

    for (const adminData of adminAccounts) {
      const existingAdmin = await prisma.user.findUnique({
        where: { email: adminData.email }
      });

      if (!existingAdmin) {
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

        console.log(`✅ Admin criado: ${adminData.email} / paineladm@`);
      } else {
        console.log(`ℹ️ Admin já existe: ${adminData.email}`);
      }
    }

    // 2. Criar contas DEMO
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
      const existingDemo = await prisma.user.findUnique({
        where: { email: demoData.email }
      });

      if (!existingDemo) {
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

        console.log(`✅ Demo criado: ${demoData.email} / Afiliado@123`);
      } else {
        console.log(`ℹ️ Demo já existe: ${demoData.email}`);
      }
    }

    console.log('🎯 Contas admin e demo criadas com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao criar contas admin e demo:', error);
  }
}

async function initializeDatabase() {
  try {
    console.log('🚀 Inicializando banco de dados...');
    
    // 1. Verificar conexão
    await prisma.$connect();
    console.log('✅ Conexão estabelecida!');
    
    // 2. Criar contas admin e demo
    await createAdminAndDemoAccounts();
    
    // 3. Verificar se caixas existem
    const cases = await prisma.case.findMany();
    if (cases.length === 0) {
      console.log('📦 Criando caixas padrão...');
      
      // Criar caixas básicas
      const caixas = [
        {
          nome: 'CAIXA FINAL DE SEMANA',
          descricao: 'Caixa especial do final de semana',
          preco: 2.00,
          imagem: '/imagens/caixa premium.png',
          ativo: true
        },
        {
          nome: 'CAIXA KIT NIKE',
          descricao: 'Caixa com produtos Nike',
          preco: 5.00,
          imagem: '/imagens/nike.png',
          ativo: true
        },
        {
          nome: 'CAIXA SAMSUNG',
          descricao: 'Caixa com produtos Samsung',
          preco: 10.00,
          imagem: '/imagens/caixa samsung.png',
          ativo: true
        },
        {
          nome: 'CAIXA APPLE',
          descricao: 'Caixa com produtos Apple',
          preco: 20.00,
          imagem: '/imagens/caixa apple.png',
          ativo: true
        },
        {
          nome: 'CAIXA CONSOLE DOS SONHOS',
          descricao: 'Caixa com consoles de videogame',
          preco: 50.00,
          imagem: '/imagens/console.png',
          ativo: true
        },
        {
          nome: 'CAIXA PREMIUM MASTER',
          descricao: 'Caixa premium com os melhores prêmios',
          preco: 100.00,
          imagem: '/imagens/caixa premium.png',
          ativo: true
        }
      ];
      
      for (const caixa of caixas) {
        await prisma.case.create({ data: caixa });
      }
      
      console.log('✅ Caixas criadas!');
    } else {
      console.log(`ℹ️ ${cases.length} caixas já existem`);
    }
    
    console.log('🎉 Banco de dados inicializado com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao inicializar banco:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar automaticamente
initializeDatabase();
