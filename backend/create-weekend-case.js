const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createWeekendCase() {
  try {
    console.log('🎁 Criando caixa Weekend...');
    
    // Verificar se já existe
    const existingCase = await prisma.case.findFirst({
      where: { nome: { contains: 'Weekend' } }
    });
    
    if (existingCase) {
      console.log('✅ Caixa Weekend já existe:', existingCase.nome);
      return;
    }
    
    // Criar caixa Weekend
    const caixaWeekend = await prisma.case.create({
      data: {
        nome: 'CAIXA WEEKEND',
        preco: 15.00,
        imagem_url: '/images/weekend-case.png',
        ativo: true
      }
    });
    
    console.log('✅ Caixa Weekend criada:', caixaWeekend.nome, '(ID:', caixaWeekend.id, ')');
    
    // Criar prêmios para a caixa Weekend
    const premios = [
      {
        nome: 'iPhone 15 Pro Max',
        valor: 8000.00,
        probabilidade: 0.5,
        tipo: 'premio',
        label: 'iPhone 15 Pro Max',
        imagem_url: '/images/iphone-15-pro-max.png',
        ativo: true,
        sorteavel: true
      },
      {
        nome: 'MacBook Pro M3',
        valor: 12000.00,
        probabilidade: 0.3,
        tipo: 'premio',
        label: 'MacBook Pro M3',
        imagem_url: '/images/macbook-pro-m3.png',
        ativo: true,
        sorteavel: true
      },
      {
        nome: 'AirPods Pro 2',
        valor: 2000.00,
        probabilidade: 1.0,
        tipo: 'premio',
        label: 'AirPods Pro 2',
        imagem_url: '/images/airpods-pro-2.png',
        ativo: true,
        sorteavel: true
      },
      {
        nome: 'Apple Watch Series 9',
        valor: 3000.00,
        probabilidade: 0.8,
        tipo: 'premio',
        label: 'Apple Watch Series 9',
        imagem_url: '/images/apple-watch-series-9.png',
        ativo: true,
        sorteavel: true
      },
      {
        nome: 'iPad Pro 12.9"',
        valor: 6000.00,
        probabilidade: 0.4,
        tipo: 'premio',
        label: 'iPad Pro 12.9"',
        imagem_url: '/images/ipad-pro-12-9.png',
        ativo: true,
        sorteavel: true
      },
      {
        nome: 'R$ 50,00',
        valor: 50.00,
        probabilidade: 2.0,
        tipo: 'cash',
        label: 'R$ 50,00',
        imagem_url: '/images/cash-50.png',
        ativo: true,
        sorteavel: true
      },
      {
        nome: 'R$ 100,00',
        valor: 100.00,
        probabilidade: 1.5,
        tipo: 'cash',
        label: 'R$ 100,00',
        imagem_url: '/images/cash-100.png',
        ativo: true,
        sorteavel: true
      }
    ];
    
    for (const premio of premios) {
      await prisma.prize.create({
        data: {
          ...premio,
          case_id: caixaWeekend.id
        }
      });
    }
    
    console.log('✅ Prêmios criados para caixa Weekend');
    
    // Verificar se foi criada
    const createdCase = await prisma.case.findUnique({
      where: { id: caixaWeekend.id },
      include: {
        prizes: {
          where: { ativo: true }
        }
      }
    });
    
    console.log('📦 Caixa Weekend criada com sucesso:');
    console.log(`- Nome: ${createdCase.nome}`);
    console.log(`- Preço: R$ ${createdCase.preco}`);
    console.log(`- Prêmios: ${createdCase.prizes.length}`);
    console.log(`- Ativa: ${createdCase.ativo}`);
    
  } catch (error) {
    console.error('❌ Erro ao criar caixa Weekend:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createWeekendCase();
