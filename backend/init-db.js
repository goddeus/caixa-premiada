const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function initializeDatabase() {
  try {
    console.log('🚀 Inicializando banco de dados...');
    
    // 1. Verificar conexão
    await prisma.$connect();
    console.log('✅ Conexão estabelecida!');
    
    // 2. Verificar se admin já existe
    const existingAdmin = await prisma.user.findFirst({
      where: { email: 'admin@slotbox.shop' }
    });
    
    if (!existingAdmin) {
      console.log('👤 Criando conta admin...');
      const bcrypt = require('bcrypt');
      const adminPassword = await bcrypt.hash('admin123456', 10);
      
      const admin = await prisma.user.create({
        data: {
          nome: 'Administrador',
          email: 'admin@slotbox.shop',
          senha_hash: adminPassword,
          cpf: '00000000000',
          is_admin: true,
          saldo_reais: 10000.00,
          primeiro_deposito_feito: true,
          rollover_liberado: true
        }
      });
      
      // Criar wallet para admin
      await prisma.wallet.create({
        data: {
          user_id: admin.id,
          saldo_reais: 10000.00
        }
      });
      
      console.log('✅ Conta admin criada: admin@slotbox.shop / admin123456');
    } else {
      console.log('ℹ️ Conta admin já existe');
    }
    
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
