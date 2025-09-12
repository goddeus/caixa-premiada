const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function simpleSeed() {
  try {
    console.log('🌱 Iniciando seed simples...');

    // Limpar dados existentes
    await prisma.prize.deleteMany({});
    await prisma.case.deleteMany({});

    // Criar caixas básicas
    const caixaNike = await prisma.case.create({
      data: {
        nome: 'CAIXA KIT NIKE',
        preco: 2.50,
        imagem_url: '/imagens/nike.png',
        ativo: true
      }
    });

    const caixaConsole = await prisma.case.create({
      data: {
        nome: 'CAIXA CONSOLE DO SONHOS!',
        preco: 3.50,
        imagem_url: '/imagens/console.png',
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

    // Criar prêmios para Nike
    await prisma.prize.createMany({
      data: [
        {
          case_id: caixaNike.id,
          nome: 'AIR FORCE 1',
          valor: 700.00,
          probabilidade: 0.001,
          imagem_url: '/imagens/airforce.webp',
          tipo: 'produto',
          label: 'AIR FORCE 1',
          imagem_id: '/imagens/airforce.webp',
          ativo: true,
          sorteavel: true
        },
        {
          case_id: caixaNike.id,
          nome: 'R$10,00',
          valor: 10.00,
          probabilidade: 0.15,
          tipo: 'cash',
          label: 'R$ 10,00',
          imagem_id: 'cash/1000.png',
          ativo: true,
          sorteavel: true
        },
        {
          case_id: caixaNike.id,
          nome: 'R$5,00',
          valor: 5.00,
          probabilidade: 0.25,
          tipo: 'cash',
          label: 'R$ 5,00',
          imagem_id: 'cash/500.png',
          ativo: true,
          sorteavel: true
        },
        {
          case_id: caixaNike.id,
          nome: 'R$2,00',
          valor: 2.00,
          probabilidade: 0.30,
          tipo: 'cash',
          label: 'R$ 2,00',
          imagem_id: 'cash/200.png',
          ativo: true,
          sorteavel: true
        },
        {
          case_id: caixaNike.id,
          nome: 'R$1,00',
          valor: 1.00,
          probabilidade: 0.25,
          tipo: 'cash',
          label: 'R$ 1,00',
          imagem_id: 'cash/100.png',
          ativo: true,
          sorteavel: true
        }
      ]
    });

    // Criar prêmios para Console
    await prisma.prize.createMany({
      data: [
        {
          case_id: caixaConsole.id,
          nome: 'PS5 1TB',
          valor: 5000.00,
          probabilidade: 0.001,
          tipo: 'produto',
          label: 'PS5 1TB',
          imagem_id: '/imagens/ps5.png',
          ativo: true,
          sorteavel: true
        },
        {
          case_id: caixaConsole.id,
          nome: 'R$100,00',
          valor: 100.00,
          probabilidade: 0.04,
          tipo: 'cash',
          label: 'R$ 100,00',
          imagem_id: 'cash/10000.png',
          ativo: true,
          sorteavel: true
        },
        {
          case_id: caixaConsole.id,
          nome: 'R$10,00',
          valor: 10.00,
          probabilidade: 0.10,
          tipo: 'cash',
          label: 'R$ 10,00',
          imagem_id: 'cash/1000.png',
          ativo: true,
          sorteavel: true
        },
        {
          case_id: caixaConsole.id,
          nome: 'R$5,00',
          valor: 5.00,
          probabilidade: 0.20,
          tipo: 'cash',
          label: 'R$ 5,00',
          imagem_id: 'cash/500.png',
          ativo: true,
          sorteavel: true
        },
        {
          case_id: caixaConsole.id,
          nome: 'R$2,00',
          valor: 2.00,
          probabilidade: 0.30,
          tipo: 'cash',
          label: 'R$ 2,00',
          imagem_id: 'cash/200.png',
          ativo: true,
          sorteavel: true
        },
        {
          case_id: caixaConsole.id,
          nome: 'R$1,00',
          valor: 1.00,
          probabilidade: 0.15,
          tipo: 'cash',
          label: 'R$ 1,00',
          imagem_id: 'cash/100.png',
          ativo: true,
          sorteavel: true
        }
      ]
    });

    // Criar prêmios para Apple
    await prisma.prize.createMany({
      data: [
        {
          case_id: caixaApple.id,
          nome: 'IPHONE 16 PRO MAX',
          valor: 10000.00,
          probabilidade: 0.0,
          tipo: 'ilustrativo',
          label: 'IPHONE 16 PRO MAX',
          imagem_id: '/imagens/iphone.png',
          ativo: true,
          sorteavel: false
        },
        {
          case_id: caixaApple.id,
          nome: 'R$500,00',
          valor: 500.00,
          probabilidade: 0.03,
          tipo: 'cash',
          label: 'R$ 500,00',
          imagem_id: 'cash/50000.png',
          ativo: true,
          sorteavel: true
        },
        {
          case_id: caixaApple.id,
          nome: 'R$100,00',
          valor: 100.00,
          probabilidade: 0.04,
          tipo: 'cash',
          label: 'R$ 100,00',
          imagem_id: 'cash/10000.png',
          ativo: true,
          sorteavel: true
        },
        {
          case_id: caixaApple.id,
          nome: 'R$50,00',
          valor: 50.00,
          probabilidade: 0.05,
          tipo: 'cash',
          label: 'R$ 50,00',
          imagem_id: 'cash/5000.png',
          ativo: true,
          sorteavel: true
        },
        {
          case_id: caixaApple.id,
          nome: 'R$20,00',
          valor: 20.00,
          probabilidade: 0.15,
          tipo: 'cash',
          label: 'R$ 20,00',
          imagem_id: 'cash/2000.png',
          ativo: true,
          sorteavel: true
        },
        {
          case_id: caixaApple.id,
          nome: 'R$10,00',
          valor: 10.00,
          probabilidade: 0.20,
          tipo: 'cash',
          label: 'R$ 10,00',
          imagem_id: 'cash/1000.png',
          ativo: true,
          sorteavel: true
        },
        {
          case_id: caixaApple.id,
          nome: 'R$5,00',
          valor: 5.00,
          probabilidade: 0.25,
          tipo: 'cash',
          label: 'R$ 5,00',
          imagem_id: 'cash/500.png',
          ativo: true,
          sorteavel: true
        },
        {
          case_id: caixaApple.id,
          nome: 'R$2,00',
          valor: 2.00,
          probabilidade: 0.30,
          tipo: 'cash',
          label: 'R$ 2,00',
          imagem_id: 'cash/200.png',
          ativo: true,
          sorteavel: true
        }
      ]
    });

    console.log('✅ Seed simples concluído!');
    console.log('📦 Caixas criadas:');
    console.log('  - CAIXA KIT NIKE (R$ 2,50)');
    console.log('  - CAIXA CONSOLE DO SONHOS! (R$ 3,50)');
    console.log('  - CAIXA APPLE (R$ 7,00)');

  } catch (error) {
    console.error('❌ Erro no seed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

simpleSeed();
