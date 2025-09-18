const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar usuário admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@caixaspremiadas.com' },
    update: {
      saldo_reais: 100.00,
      saldo_demo: 100.00
    },
    create: {
      nome: 'Administrador',
      email: 'admin@caixaspremiadas.com',
      senha_hash: adminPassword,
      cpf: '12345678901',
      is_admin: true,
      tipo_conta: 'normal',
      saldo_reais: 100.00,
      saldo_demo: 100.00
    }
  });

  // Criar carteira para o admin
  await prisma.wallet.upsert({
    where: { user_id: admin.id },
    update: {
      saldo_reais: 100.00,
      saldo_demo: 100.00
    },
    create: {
      user_id: admin.id,
      saldo_reais: 100.00,
      saldo_demo: 100.00
    }
  });

  // Criar usuário de teste
  const userPassword = await bcrypt.hash('user123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'user@test.com' },
    update: {
      saldo_reais: 100.00,
      saldo_demo: 100.00
    },
    create: {
      nome: 'Usuário Teste',
      email: 'user@test.com',
      senha_hash: userPassword,
      cpf: '98765432100',
      tipo_conta: 'normal',
      total_giros: 0,
      rollover_liberado: false,
      rollover_minimo: 20.00,
      saldo_reais: 100.00,
      saldo_demo: 100.00
    }
  });

  // Criar carteira para o usuário
  await prisma.wallet.upsert({
    where: { user_id: user.id },
    update: {
      saldo_reais: 100.00,
      saldo_demo: 100.00
    },
    create: {
      user_id: user.id,
      saldo_reais: 100.00,
      saldo_demo: 100.00
    }
  });

  // Limpar caixas existentes
  await prisma.prize.deleteMany({});
  await prisma.case.deleteMany({});

  // Criar caixas
  const caixaBasica = await prisma.case.create({
    data: {
      nome: 'CAIXA KIT NIKE',
      preco: 2.50,
      imagem_url: '/imagens/nike.png',
      ativo: true
    }
  });

  const caixaMedia = await prisma.case.create({
    data: {
      nome: 'CAIXA CONSOLE DOS SONHOS',
      preco: 3.50,
      imagem_url: '/imagens/console.png',
      ativo: true
    }
  });

  const caixaPremium = await prisma.case.create({
    data: {
      nome: 'CAIXA PREMIUM MASTER!',
      preco: 15.00,
      imagem_url: '/imagens/caixa premium.png',
      ativo: true
    }
  });

  const caixaApple = await prisma.case.create({
    data: {
      nome: 'CAIXA APPLE',
      preco: 7.00,
      imagem_url: '/imagens/apple.png',
      ativo: true
    }
  });

  const caixaSamsung = await prisma.case.create({
    data: {
      nome: 'CAIXA SAMSUNG',
      preco: 3.00,
      imagem_url: '/imagens/samsung.png',
      ativo: true
    }
  });

  const caixaWeekend = await prisma.case.create({
    data: {
      nome: 'CAIXA WEEKEND',
      preco: 1.50,
      imagem_url: '/imagens/weekend.png',
      ativo: true
    }
  });

  // Criar prêmios para Caixa Nike - RTP 100%
  console.log('🎁 Criando prêmios para Caixa Nike...');
  console.log('📦 ID da caixa Nike:', caixaBasica.id);
  
  await prisma.prize.create({
    data: {
      case_id: caixaBasica.id,
      nome: 'R$1,00',
      valor: 1.00,
      probabilidade: 0.30 // 30%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaBasica.id,
      nome: 'R$2,00',
      valor: 2.00,
      probabilidade: 0.25 // 25%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaBasica.id,
      nome: 'R$5,00',
      valor: 5.00,
      probabilidade: 0.20 // 20%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaBasica.id,
      nome: 'R$10,00',
      valor: 10.00,
      probabilidade: 0.15 // 15%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaBasica.id,
      nome: 'Boné Nike',
      valor: 50.00,
      probabilidade: 0.05 // 5%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaBasica.id,
      nome: 'Camisa Nike Dry Fit',
      valor: 100.00,
      probabilidade: 0.03 // 3%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaBasica.id,
      nome: 'Air Force 1',
      valor: 700.00,
      probabilidade: 0.01 // 1%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaBasica.id,
      nome: 'Nike Dunk Low',
      valor: 1000.00,
      probabilidade: 0.0 // 0%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaBasica.id,
      nome: 'Air Jordan 4',
      valor: 1500.00,
      probabilidade: 0.0 // 0%
    }
  });

  // Criar prêmios para Caixa Console - RTP 100%
  await prisma.prize.create({
    data: {
      case_id: caixaMedia.id,
      nome: 'R$1,00',
      valor: 1.00,
      probabilidade: 0.25 // 25%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaMedia.id,
      nome: 'R$2,00',
      valor: 2.00,
      probabilidade: 0.20 // 20%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaMedia.id,
      nome: 'R$5,00',
      valor: 5.00,
      probabilidade: 0.15 // 15%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaMedia.id,
      nome: 'R$10,00',
      valor: 10.00,
      probabilidade: 0.12 // 12%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaMedia.id,
      nome: 'R$100,00',
      valor: 100.00,
      probabilidade: 0.08 // 8%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaMedia.id,
      nome: 'Steam Deck',
      valor: 300.00,
      probabilidade: 0.05 // 5%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaMedia.id,
      nome: 'Air Force 1',
      valor: 700.00,
      probabilidade: 0.03 // 3%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaMedia.id,
      nome: 'Xbox One',
      valor: 4000.00,
      probabilidade: 0.0 // 0%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaMedia.id,
      nome: 'PS5',
      valor: 5000.00,
      probabilidade: 0.0 // 0%
    }
  });


  // Criar prêmios para Caixa Premium - 11 prêmios corretos
  await prisma.prize.create({
    data: {
      case_id: caixaPremium.id,
      nome: 'R$2,00',
      valor: 2.00,
      probabilidade: 0.25 // 25%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaPremium.id,
      nome: 'R$5,00',
      valor: 5.00,
      probabilidade: 0.20 // 20%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaPremium.id,
      nome: 'R$10,00',
      valor: 10.00,
      probabilidade: 0.15 // 15%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaPremium.id,
      nome: 'R$20,00',
      valor: 20.00,
      probabilidade: 0.10 // 10%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaPremium.id,
      nome: 'R$500,00',
      valor: 500.00,
      probabilidade: 0.05 // 5%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaPremium.id,
      nome: 'Air Pods',
      valor: 2500.00,
      probabilidade: 0.03 // 3%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaPremium.id,
      nome: 'Ipad',
      valor: 8000.00,
      probabilidade: 0.0 // 0%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaPremium.id,
      nome: 'S25 ULTRA',
      valor: 6000.00,
      probabilidade: 0.0 // 0%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaPremium.id,
      nome: 'Iphone 16 Pro Max',
      valor: 10000.00,
      probabilidade: 0.0 // 0%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaPremium.id,
      nome: 'Macbook',
      valor: 15000.00,
      probabilidade: 0.0 // 0%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaPremium.id,
      nome: 'Honda CG Fan 160',
      valor: 19500.00,
      probabilidade: 0.0 // 0%
    }
  });


  // Criar prêmios para Caixa Apple - RTP 100%
  await prisma.prize.create({
    data: {
      case_id: caixaApple.id,
      nome: 'R$1,00',
      valor: 1.00,
      probabilidade: 0.30 // 30%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaApple.id,
      nome: 'R$2,00',
      valor: 2.00,
      probabilidade: 0.25 // 25%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaApple.id,
      nome: 'R$5,00',
      valor: 5.00,
      probabilidade: 0.20 // 20%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaApple.id,
      nome: 'R$10,00',
      valor: 10.00,
      probabilidade: 0.15 // 15%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaApple.id,
      nome: 'R$500,00',
      valor: 500.00,
      probabilidade: 0.05 // 5%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaApple.id,
      nome: 'Air Pods',
      valor: 2500.00,
      probabilidade: 0.03 // 3%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaApple.id,
      nome: 'Iphone 16 Pro Max',
      valor: 10000.00,
      probabilidade: 0.0 // 0%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaApple.id,
      nome: 'Macbook',
      valor: 15000.00,
      probabilidade: 0.0 // 0%
    }
  });





  // Criar prêmios para Caixa Samsung - 9 prêmios corretos
  await prisma.prize.create({
    data: {
      case_id: caixaSamsung.id,
      nome: 'R$1,00',
      valor: 1.00,
      probabilidade: 0.32 // 32%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaSamsung.id,
      nome: 'R$2,00',
      valor: 2.00,
      probabilidade: 0.30 // 30%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaSamsung.id,
      nome: 'R$5,00',
      valor: 5.00,
      probabilidade: 0.25 // 25%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaSamsung.id,
      nome: 'R$10,00',
      valor: 10.00,
      probabilidade: 0.20 // 20%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaSamsung.id,
      nome: 'Fone Samsung',
      valor: 50.00,
      probabilidade: 0.05 // 5%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaSamsung.id,
      nome: 'R$100,00',
      valor: 100.00,
      probabilidade: 0.04 // 4%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaSamsung.id,
      nome: 'R$500,00',
      valor: 500.00,
      probabilidade: 0.01 // 1%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaSamsung.id,
      nome: 'S25',
      valor: 1000.00,
      probabilidade: 0.0 // 0%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaSamsung.id,
      nome: 'Notebook Samsung',
      valor: 5000.00,
      probabilidade: 0.0 // 0%
    }
  });

  // Criar prêmios para Caixa Weekend - 6 prêmios corretos
  await prisma.prize.create({
    data: {
      case_id: caixaWeekend.id,
      nome: 'R$1,00',
      valor: 1.00,
      probabilidade: 0.40 // 40%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaWeekend.id,
      nome: 'R$2,00',
      valor: 2.00,
      probabilidade: 0.30 // 30%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaWeekend.id,
      nome: 'R$5,00',
      valor: 5.00,
      probabilidade: 0.15 // 15%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaWeekend.id,
      nome: 'R$10,00',
      valor: 10.00,
      probabilidade: 0.10 // 10%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaWeekend.id,
      nome: 'R$100,00',
      valor: 100.00,
      probabilidade: 0.04 // 4%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaWeekend.id,
      nome: 'R$500,00',
      valor: 500.00,
      probabilidade: 0.01 // 1%
    }
  });

  console.log('✅ Seed concluído com sucesso!');
  console.log('👤 Admin criado:', admin.email);
  console.log('👤 Usuário criado:', user.email);
  console.log('🎁 Caixas criadas:', [caixaBasica.nome, caixaMedia.nome, caixaPremium.nome, caixaApple.nome, caixaSamsung.nome, caixaWeekend.nome]);
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
