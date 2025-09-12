const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createPrizesForCases() {
  try {
    console.log('🎁 CRIANDO PRÊMIOS PARA AS CAIXAS');
    console.log('=' .repeat(40));

    // Buscar todas as caixas ativas
    const cases = await prisma.case.findMany({
      where: { ativo: true },
      select: { id: true, nome: true, preco: true }
    });

    console.log(`📦 Encontradas ${cases.length} caixas ativas`);

    for (const caseItem of cases) {
      console.log(`\n🎯 Criando prêmios para: ${caseItem.nome}`);
      
      // Verificar se já tem prêmios
      const existingPrizes = await prisma.prize.findMany({
        where: { case_id: caseItem.id }
      });

      if (existingPrizes.length > 0) {
        console.log(`⚠️ ${caseItem.nome} já tem ${existingPrizes.length} prêmios`);
        continue;
      }

      // Criar prêmios baseados no preço da caixa
      const prizes = generatePrizesForCase(caseItem.nome, caseItem.preco);
      
      for (const prizeData of prizes) {
        await prisma.prize.create({
          data: {
            ...prizeData,
            case_id: caseItem.id
          }
        });
      }

      console.log(`✅ Criados ${prizes.length} prêmios para ${caseItem.nome}`);
    }

    // Verificar resultado final
    console.log('\n📊 RESUMO FINAL:');
    console.log('-'.repeat(30));
    
    for (const caseItem of cases) {
      const prizes = await prisma.prize.findMany({
        where: { case_id: caseItem.id, ativo: true, sorteavel: true }
      });
      console.log(`${caseItem.nome}: ${prizes.length} prêmios ativos`);
    }

  } catch (error) {
    console.error('❌ Erro ao criar prêmios:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function generatePrizesForCase(caseName, price) {
  const prizes = [];

  // Prêmios baseados no preço da caixa
  if (caseName === 'CAIXA NIKE') {
    prizes.push(
      { nome: 'AIR FORCE 1', valor: 700.00, probabilidade: 0.001, tipo: 'produto', ativo: true, sorteavel: true },
      { nome: 'NIKE DUNK LOW', valor: 1000.00, probabilidade: 0.001, tipo: 'produto', ativo: true, sorteavel: true },
      { nome: 'JORDAN 4', valor: 1500.00, probabilidade: 0.001, tipo: 'produto', ativo: true, sorteavel: true },
      { nome: 'CAMISA NIKE DRYFIT', valor: 100.00, probabilidade: 0.02, tipo: 'produto', ativo: true, sorteavel: true },
      { nome: 'TÊNIS NIKE AIR MAX', valor: 300.00, probabilidade: 0.01, tipo: 'produto', ativo: true, sorteavel: true },
      { nome: 'MOCHILA NIKE', valor: 150.00, probabilidade: 0.05, tipo: 'produto', ativo: true, sorteavel: true },
      { nome: 'BONÉ NIKE', valor: 80.00, probabilidade: 0.1, tipo: 'produto', ativo: true, sorteavel: true },
      { nome: 'MEIA NIKE', valor: 25.00, probabilidade: 0.2, tipo: 'produto', ativo: true, sorteavel: true },
      { nome: 'Sem prêmio', valor: 0.00, probabilidade: 0.6, tipo: 'ilustrativo', ativo: true, sorteavel: true }
    );
  } else if (caseName === 'CAIXA MÉDIA') {
    prizes.push(
      { nome: 'PLAYSTATION 5', valor: 4000.00, probabilidade: 0.001, tipo: 'produto', ativo: true, sorteavel: true },
      { nome: 'XBOX SERIES X', valor: 3500.00, probabilidade: 0.001, tipo: 'produto', ativo: true, sorteavel: true },
      { nome: 'NINTENDO SWITCH', valor: 2000.00, probabilidade: 0.005, tipo: 'produto', ativo: true, sorteavel: true },
      { nome: 'CONTROLE PS5', valor: 300.00, probabilidade: 0.02, tipo: 'produto', ativo: true, sorteavel: true },
      { nome: 'JOGO DIGITAL', valor: 200.00, probabilidade: 0.05, tipo: 'produto', ativo: true, sorteavel: true },
      { nome: 'FONE GAMER', valor: 150.00, probabilidade: 0.1, tipo: 'produto', ativo: true, sorteavel: true },
      { nome: 'MOUSE GAMER', valor: 80.00, probabilidade: 0.15, tipo: 'produto', ativo: true, sorteavel: true },
      { nome: 'TECLADO GAMER', valor: 120.00, probabilidade: 0.1, tipo: 'produto', ativo: true, sorteavel: true },
      { nome: 'Sem prêmio', valor: 0.00, probabilidade: 0.5, tipo: 'ilustrativo', ativo: true, sorteavel: true }
    );
  } else if (caseName === 'CAIXA PREMIUM MASTER!') {
    prizes.push(
      { nome: 'IPHONE 15 PRO MAX', valor: 8000.00, probabilidade: 0.001, tipo: 'produto', ativo: true, sorteavel: true },
      { nome: 'MACBOOK PRO M3', valor: 15000.00, probabilidade: 0.0005, tipo: 'produto', ativo: true, sorteavel: true },
      { nome: 'AIRPODS PRO', valor: 800.00, probabilidade: 0.01, tipo: 'produto', ativo: true, sorteavel: true },
      { nome: 'APPLE WATCH', valor: 2000.00, probabilidade: 0.005, tipo: 'produto', ativo: true, sorteavel: true },
      { nome: 'IPAD PRO', valor: 5000.00, probabilidade: 0.002, tipo: 'produto', ativo: true, sorteavel: true },
      { nome: 'CARREGADOR MAGSAFE', valor: 200.00, probabilidade: 0.05, tipo: 'produto', ativo: true, sorteavel: true },
      { nome: 'CABO LIGHTNING', valor: 50.00, probabilidade: 0.1, tipo: 'produto', ativo: true, sorteavel: true },
      { nome: 'CASE IPHONE', valor: 100.00, probabilidade: 0.15, tipo: 'produto', ativo: true, sorteavel: true },
      { nome: 'Sem prêmio', valor: 0.00, probabilidade: 0.6, tipo: 'ilustrativo', ativo: true, sorteavel: true }
    );
  } else if (caseName === 'CAIXA APPLE') {
    prizes.push(
      { nome: 'IPHONE 14', valor: 5000.00, probabilidade: 0.002, tipo: 'produto', ativo: true, sorteavel: true },
      { nome: 'AIRPODS', valor: 400.00, probabilidade: 0.01, tipo: 'produto', ativo: true, sorteavel: true },
      { nome: 'APPLE WATCH SE', valor: 1200.00, probabilidade: 0.005, tipo: 'produto', ativo: true, sorteavel: true },
      { nome: 'IPAD AIR', valor: 3000.00, probabilidade: 0.003, tipo: 'produto', ativo: true, sorteavel: true },
      { nome: 'CARREGADOR WIRELESS', valor: 150.00, probabilidade: 0.05, tipo: 'produto', ativo: true, sorteavel: true },
      { nome: 'CABO USB-C', valor: 80.00, probabilidade: 0.1, tipo: 'produto', ativo: true, sorteavel: true },
      { nome: 'CASE SILICONE', valor: 60.00, probabilidade: 0.15, tipo: 'produto', ativo: true, sorteavel: true },
      { nome: 'PELÍCULA VIDRO', valor: 30.00, probabilidade: 0.2, tipo: 'produto', ativo: true, sorteavel: true },
      { nome: 'Sem prêmio', valor: 0.00, probabilidade: 0.4, tipo: 'ilustrativo', ativo: true, sorteavel: true }
    );
  } else if (caseName === 'CAIXA SAMSUNG') {
    prizes.push(
      { nome: 'GALAXY S24 ULTRA', valor: 6000.00, probabilidade: 0.001, tipo: 'produto', ativo: true, sorteavel: true },
      { nome: 'GALAXY BUDS PRO', valor: 300.00, probabilidade: 0.01, tipo: 'produto', ativo: true, sorteavel: true },
      { nome: 'GALAXY WATCH', valor: 800.00, probabilidade: 0.005, tipo: 'produto', ativo: true, sorteavel: true },
      { nome: 'TABLET SAMSUNG', valor: 1500.00, probabilidade: 0.003, tipo: 'produto', ativo: true, sorteavel: true },
      { nome: 'CARREGADOR RÁPIDO', valor: 100.00, probabilidade: 0.05, tipo: 'produto', ativo: true, sorteavel: true },
      { nome: 'CABO USB-C', valor: 40.00, probabilidade: 0.1, tipo: 'produto', ativo: true, sorteavel: true },
      { nome: 'CASE TRANSPARENTE', valor: 50.00, probabilidade: 0.15, tipo: 'produto', ativo: true, sorteavel: true },
      { nome: 'PELÍCULA PROTETORA', valor: 25.00, probabilidade: 0.2, tipo: 'produto', ativo: true, sorteavel: true },
      { nome: 'Sem prêmio', valor: 0.00, probabilidade: 0.4, tipo: 'ilustrativo', ativo: true, sorteavel: true }
    );
  } else if (caseName === 'CAIXA WEEKEND') {
    prizes.push(
      { nome: 'CASH R$ 50', valor: 50.00, probabilidade: 0.1, tipo: 'cash', ativo: true, sorteavel: true },
      { nome: 'CASH R$ 25', valor: 25.00, probabilidade: 0.2, tipo: 'cash', ativo: true, sorteavel: true },
      { nome: 'CASH R$ 10', valor: 10.00, probabilidade: 0.3, tipo: 'cash', ativo: true, sorteavel: true },
      { nome: 'CASH R$ 5', valor: 5.00, probabilidade: 0.4, tipo: 'cash', ativo: true, sorteavel: true },
      { nome: 'Sem prêmio', valor: 0.00, probabilidade: 0.0, tipo: 'ilustrativo', ativo: true, sorteavel: true }
    );
  } else {
    // Caixa genérica (CAIXA TESTE)
    prizes.push(
      { nome: 'Prêmio R$ 10', valor: 10.00, probabilidade: 0.1, tipo: 'cash', ativo: true, sorteavel: true },
      { nome: 'Prêmio R$ 5', valor: 5.00, probabilidade: 0.2, tipo: 'cash', ativo: true, sorteavel: true },
      { nome: 'Sem prêmio', valor: 0.00, probabilidade: 0.7, tipo: 'ilustrativo', ativo: true, sorteavel: true }
    );
  }

  return prizes;
}

createPrizesForCases();
