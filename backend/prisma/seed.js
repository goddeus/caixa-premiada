const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar usuário admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@caixaspremiadas.com' },
    update: {},
    create: {
      nome: 'Administrador',
      email: 'admin@caixaspremiadas.com',
      senha_hash: adminPassword,
      cpf: '12345678901',
      is_admin: true,
      tipo_conta: 'normal'
    }
  });

  // Criar carteira para o admin
  await prisma.wallet.upsert({
    where: { user_id: admin.id },
    update: {},
    create: {
      user_id: admin.id,
      saldo: 1000.00
    }
  });

  // Criar usuário de teste
  const userPassword = await bcrypt.hash('user123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'user@test.com' },
    update: {},
    create: {
      nome: 'Usuário Teste',
      email: 'user@test.com',
      senha_hash: userPassword,
      cpf: '98765432100',
      tipo_conta: 'normal',
      total_giros: 0,
      rollover_liberado: false,
      rollover_minimo: 20.00
    }
  });

  // Criar carteira para o usuário
  await prisma.wallet.upsert({
    where: { user_id: user.id },
    update: {},
    create: {
      user_id: user.id,
      saldo: 500.00
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
      nome: 'CAIXA CONSOLE DO SONHOS!',
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
      nome: 'AIR FORCE 1',
      valor: 700.00,
      probabilidade: 0.001, // 0.1%
      imagem_url: '/imagens/airforce.webp',
      tipo: 'produto',
      label: 'AIR FORCE 1',
      imagem_id: '/imagens/airforce.webp',
      ativo: true,
      sorteavel: true
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaBasica.id,
      nome: 'NIKE DUNK LOW',
      valor: 1000.00,
      probabilidade: 0.001, // 0.1%
      imagem_url: '/imagens/nike dunk.webp'
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaBasica.id,
      nome: 'JORDAN 4',
      valor: 1500.00,
      probabilidade: 0.001, // 0.1%
      imagem_url: '/imagens/jordan.png'
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaBasica.id,
      nome: 'CAMISA NIKE DRYFIT',
      valor: 100.00,
      probabilidade: 0.02, // 2%
      imagem_url: '/imagens/camiseta nike.webp'
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaBasica.id,
      nome: 'BONÉ NIKE',
      valor: 50.00,
      probabilidade: 0.03, // 3%
      imagem_url: '/imagens/boné nike.png'
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
      nome: 'R$5,00',
      valor: 5.00,
      probabilidade: 0.25 // 25%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaBasica.id,
      nome: 'R$2,00',
      valor: 2.00,
      probabilidade: 0.30 // 30%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaBasica.id,
      nome: 'R$1,00',
      valor: 1.00,
      probabilidade: 0.25 // 25%
    }
  });

  // Criar prêmios para Caixa Console - RTP 100%
  await prisma.prize.create({
    data: {
      case_id: caixaMedia.id,
      nome: 'PS5 1TB',
      valor: 5000.00,
      probabilidade: 0.001 // 0.1%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaMedia.id,
      nome: 'XBOX ONE X 1TB',
      valor: 3500.00,
      probabilidade: 0.001 // 0.1%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaMedia.id,
      nome: 'STEAMDECK',
      valor: 2500.00,
      probabilidade: 0.001 // 0.1%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaMedia.id,
      nome: 'XIAMO NOTE 12',
      valor: 1000.00,
      probabilidade: 0.02 // 2%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaMedia.id,
      nome: 'CONTROLE PS5',
      valor: 500.00,
      probabilidade: 0.03 // 3%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaMedia.id,
      nome: 'R$100,00',
      valor: 100.00,
      probabilidade: 0.04 // 4%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaMedia.id,
      nome: 'R$10,00',
      valor: 10.00,
      probabilidade: 0.10 // 10%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaMedia.id,
      nome: 'R$5,00',
      valor: 5.00,
      probabilidade: 0.20 // 20%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaMedia.id,
      nome: 'R$2,00',
      valor: 2.00,
      probabilidade: 0.30 // 30%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaMedia.id,
      nome: 'R$1,00',
      valor: 1.00,
      probabilidade: 0.15 // 15%
    }
  });

  // Criar prêmios para Caixa Premium - RTP 100%
  await prisma.prize.create({
    data: {
      case_id: caixaPremium.id,
      nome: 'HONDA CG FAN 160',
      valor: 25000.00,
      probabilidade: 0.0 // 0%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaPremium.id,
      nome: 'MACBOOK',
      valor: 15000.00,
      probabilidade: 0.0 // 0%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaPremium.id,
      nome: 'IPHONE 16 PRO MAX',
      valor: 10000.00,
      probabilidade: 0.0 // 0%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaPremium.id,
      nome: 'S25 ULTRA',
      valor: 5000.00,
      probabilidade: 0.0 // 0%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaPremium.id,
      nome: 'PC GAMER',
      valor: 5000.00,
      probabilidade: 0.0 // 0%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaPremium.id,
      nome: 'IPAD',
      valor: 8000.00,
      probabilidade: 0.0 // 0%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaPremium.id,
      nome: 'AIRPODS',
      valor: 2500.00,
      probabilidade: 0.0 // 0%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaPremium.id,
      nome: 'R$500,00',
      valor: 500.00,
      probabilidade: 0.04 // 4%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaPremium.id,
      nome: 'R$100,00',
      valor: 100.00,
      probabilidade: 0.04 // 4%
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
      nome: 'R$10,00',
      valor: 10.00,
      probabilidade: 0.30 // 30%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaPremium.id,
      nome: 'R$5,00',
      valor: 5.00,
      probabilidade: 0.30 // 30%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaPremium.id,
      nome: 'R$2,00',
      valor: 2.00,
      probabilidade: 0.30 // 30%
    }
  });


  // Criar prêmios para Caixa Apple - RTP 100%
  await prisma.prize.create({
    data: {
      case_id: caixaApple.id,
      nome: 'IPHONE 16 PRO MAX',
      valor: 10000.00,
      probabilidade: 0.0 // 0%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaApple.id,
      nome: 'MACBOOK PRO',
      valor: 15000.00,
      probabilidade: 0.0 // 0%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaApple.id,
      nome: 'IPAD PRO',
      valor: 8000.00,
      probabilidade: 0.0 // 0%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaApple.id,
      nome: 'AIRPODS PRO',
      valor: 2500.00,
      probabilidade: 0.0 // 0%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaApple.id,
      nome: 'APPLE WATCH',
      valor: 3500.00,
      probabilidade: 0.0, // 0%
      imagem_url: '/imagens/apple watch.jpg'
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaApple.id,
      nome: 'R$500,00',
      valor: 500.00,
      probabilidade: 0.03 // 3%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaApple.id,
      nome: 'R$100,00',
      valor: 100.00,
      probabilidade: 0.04 // 4%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaApple.id,
      nome: 'R$50,00',
      valor: 50.00,
      probabilidade: 0.05 // 5%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaApple.id,
      nome: 'R$20,00',
      valor: 20.00,
      probabilidade: 0.15 // 15%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaApple.id,
      nome: 'R$10,00',
      valor: 10.00,
      probabilidade: 0.20 // 20%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaApple.id,
      nome: 'R$5,00',
      valor: 5.00,
      probabilidade: 0.25 // 25%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaApple.id,
      nome: 'R$2,00',
      valor: 2.00,
      probabilidade: 0.30 // 30%
    }
  });

  // Criar prêmios para Caixa Samsung - RTP 100%
  await prisma.prize.create({
    data: {
      case_id: caixaSamsung.id,
      nome: 'S25 ULTRA',
      valor: 5000.00,
      probabilidade: 0.0 // 0%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaSamsung.id,
      nome: 'FONE SAMSUNG',
      valor: 1000.00,
      probabilidade: 0.0, // 0%
      imagem_url: '/imagens/fone samsung.webp'
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaSamsung.id,
      nome: 'NOTEBOOK',
      valor: 3000.00,
      probabilidade: 0.0, // 0%
      imagem_url: '/imagens/notebook samsung.png'
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
      nome: 'R$100,00',
      valor: 100.00,
      probabilidade: 0.04 // 4%
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
      nome: 'R$5,00',
      valor: 5.00,
      probabilidade: 0.25 // 25%
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
      nome: 'R$1,00',
      valor: 1.00,
      probabilidade: 0.32 // 32%
    }
  });

  // Criar prêmios para Caixa Weekend - RTP 100%
  await prisma.prize.create({
    data: {
      case_id: caixaWeekend.id,
      nome: 'GALAXY BUDS',
      valor: 300.00,
      probabilidade: 0.001 // 0.1%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaWeekend.id,
      nome: 'REDMI NOTE 13',
      valor: 1000.00,
      probabilidade: 0.0 // 0%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaWeekend.id,
      nome: 'R$500,00',
      valor: 500.00,
      probabilidade: 0.001 // 0.1%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaWeekend.id,
      nome: 'R$100,00',
      valor: 100.00,
      probabilidade: 0.02 // 2%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaWeekend.id,
      nome: 'POWER BANK',
      valor: 50.00,
      probabilidade: 0.05 // 5%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaWeekend.id,
      nome: 'R$2,00',
      valor: 2.00,
      probabilidade: 0.20 // 20%
    }
  });

  await prisma.prize.create({
    data: {
      case_id: caixaWeekend.id,
      nome: 'R$1,00',
      valor: 1.00,
      probabilidade: 0.73 // 73%
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
