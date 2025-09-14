const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addPrizesToCases() {
  console.log('🎁 Adicionando prêmios às caixas...');

  try {
    // Buscar todas as caixas
    const cases = await prisma.case.findMany({
      where: { ativo: true }
    });

    console.log(`📦 Encontradas ${cases.length} caixas:`);
    cases.forEach(c => {
      console.log(`  - ${c.nome} (ID: ${c.id})`);
    });

    // Definir prêmios para cada caixa
    const prizesByCase = {
      'CAIXA CONSOLE DOS SONHOS': [
        { nome: 'R$ 1,00', valor: 1.00, probabilidade: 0.40, tipo: 'cash', sorteavel: true },
        { nome: 'R$ 2,00', valor: 2.00, probabilidade: 0.25, tipo: 'cash', sorteavel: true },
        { nome: 'R$ 5,00', valor: 5.00, probabilidade: 0.20, tipo: 'cash', sorteavel: true },
        { nome: 'R$ 10,00', valor: 10.00, probabilidade: 0.10, tipo: 'cash', sorteavel: true },
        { nome: 'R$ 100,00', valor: 100.00, probabilidade: 0.04, tipo: 'cash', sorteavel: true },
        { nome: 'STEAM DECK', valor: 3000.00, probabilidade: 0.005, tipo: 'ilustrativo', sorteavel: false },
        { nome: 'PLAYSTATION 5', valor: 4000.00, probabilidade: 0.003, tipo: 'ilustrativo', sorteavel: false },
        { nome: 'XBOX SERIES X', valor: 4000.00, probabilidade: 0.002, tipo: 'ilustrativo', sorteavel: false }
      ],
      'CAIXA PREMIUM MASTER': [
        { nome: 'R$ 5,00', valor: 5.00, probabilidade: 0.35, tipo: 'cash', sorteavel: true },
        { nome: 'R$ 10,00', valor: 10.00, probabilidade: 0.25, tipo: 'cash', sorteavel: true },
        { nome: 'R$ 50,00', valor: 50.00, probabilidade: 0.20, tipo: 'cash', sorteavel: true },
        { nome: 'R$ 100,00', valor: 100.00, probabilidade: 0.15, tipo: 'cash', sorteavel: true },
        { nome: 'R$ 500,00', valor: 500.00, probabilidade: 0.04, tipo: 'cash', sorteavel: true },
        { nome: 'R$ 1000,00', valor: 1000.00, probabilidade: 0.008, tipo: 'cash', sorteavel: true },
        { nome: 'IPHONE 15 PRO', valor: 8000.00, probabilidade: 0.001, tipo: 'ilustrativo', sorteavel: false },
        { nome: 'MACBOOK PRO', valor: 15000.00, probabilidade: 0.001, tipo: 'ilustrativo', sorteavel: false }
      ],
      'CAIXA SAMSUNG': [
        { nome: 'R$ 2,00', valor: 2.00, probabilidade: 0.40, tipo: 'cash', sorteavel: true },
        { nome: 'R$ 5,00', valor: 5.00, probabilidade: 0.30, tipo: 'cash', sorteavel: true },
        { nome: 'R$ 10,00', valor: 10.00, probabilidade: 0.20, tipo: 'cash', sorteavel: true },
        { nome: 'R$ 50,00', valor: 50.00, probabilidade: 0.08, tipo: 'cash', sorteavel: true },
        { nome: 'R$ 200,00', valor: 200.00, probabilidade: 0.015, tipo: 'cash', sorteavel: true },
        { nome: 'GALAXY S24', valor: 5000.00, probabilidade: 0.004, tipo: 'ilustrativo', sorteavel: false },
        { nome: 'GALAXY TAB', valor: 3000.00, probabilidade: 0.001, tipo: 'ilustrativo', sorteavel: false }
      ],
      'CAIXA APPLE': [
        { nome: 'R$ 5,00', valor: 5.00, probabilidade: 0.35, tipo: 'cash', sorteavel: true },
        { nome: 'R$ 10,00', valor: 10.00, probabilidade: 0.25, tipo: 'cash', sorteavel: true },
        { nome: 'R$ 50,00', valor: 50.00, probabilidade: 0.20, tipo: 'cash', sorteavel: true },
        { nome: 'R$ 100,00', valor: 100.00, probabilidade: 0.15, tipo: 'cash', sorteavel: true },
        { nome: 'R$ 500,00', valor: 500.00, probabilidade: 0.04, tipo: 'cash', sorteavel: true },
        { nome: 'IPHONE 15', valor: 6000.00, probabilidade: 0.005, tipo: 'ilustrativo', sorteavel: false },
        { nome: 'MACBOOK AIR', valor: 12000.00, probabilidade: 0.003, tipo: 'ilustrativo', sorteavel: false },
        { nome: 'AIRPODS PRO', valor: 2500.00, probabilidade: 0.002, tipo: 'ilustrativo', sorteavel: false }
      ],
      'CAIXA KIT NIKE': [
        { nome: 'R$ 1,00', valor: 1.00, probabilidade: 0.45, tipo: 'cash', sorteavel: true },
        { nome: 'R$ 2,00', valor: 2.00, probabilidade: 0.30, tipo: 'cash', sorteavel: true },
        { nome: 'R$ 5,00', valor: 5.00, probabilidade: 0.15, tipo: 'cash', sorteavel: true },
        { nome: 'R$ 10,00', valor: 10.00, probabilidade: 0.08, tipo: 'cash', sorteavel: true },
        { nome: 'R$ 50,00', valor: 50.00, probabilidade: 0.015, tipo: 'cash', sorteavel: true },
        { nome: 'AIR FORCE 1', valor: 700.00, probabilidade: 0.004, tipo: 'ilustrativo', sorteavel: false },
        { nome: 'NIKE DUNK', valor: 1000.00, probabilidade: 0.001, tipo: 'ilustrativo', sorteavel: false }
      ],
      'CAIXA FINAL DE SEMANA': [
        { nome: 'R$ 1,00', valor: 1.00, probabilidade: 0.50, tipo: 'cash', sorteavel: true },
        { nome: 'R$ 2,00', valor: 2.00, probabilidade: 0.30, tipo: 'cash', sorteavel: true },
        { nome: 'R$ 5,00', valor: 5.00, probabilidade: 0.15, tipo: 'cash', sorteavel: true },
        { nome: 'R$ 10,00', valor: 10.00, probabilidade: 0.04, tipo: 'cash', sorteavel: true },
        { nome: 'R$ 50,00', valor: 50.00, probabilidade: 0.008, tipo: 'cash', sorteavel: true },
        { nome: 'R$ 200,00', valor: 200.00, probabilidade: 0.002, tipo: 'cash', sorteavel: true }
      ]
    };

    // Adicionar prêmios para cada caixa
    for (const caseItem of cases) {
      const caseName = caseItem.nome;
      const prizes = prizesByCase[caseName];

      if (!prizes) {
        console.log(`⚠️ Nenhum prêmio definido para: ${caseName}`);
        continue;
      }

      console.log(`\n🎁 Adicionando prêmios para: ${caseName}`);

      // Limpar prêmios existentes
      await prisma.prize.deleteMany({
        where: { case_id: caseItem.id }
      });

      // Adicionar novos prêmios
      for (const prize of prizes) {
        await prisma.prize.create({
          data: {
            case_id: caseItem.id,
            nome: prize.nome,
            valor: prize.valor,
            probabilidade: prize.probabilidade,
            tipo: prize.tipo,
            sorteavel: prize.sorteavel,
            ativo: true,
            imagem_url: '',
            label: prize.nome
          }
        });
        console.log(`  ✅ ${prize.nome} - R$ ${prize.valor} (${(prize.probabilidade * 100).toFixed(2)}%)`);
      }
    }

    console.log('\n✅ Prêmios adicionados com sucesso!');

    // Verificar resultado
    console.log('\n📊 VERIFICAÇÃO FINAL:');
    for (const caseItem of cases) {
      const prizeCount = await prisma.prize.count({
        where: { case_id: caseItem.id }
      });
      console.log(`  ${caseItem.nome}: ${prizeCount} prêmios`);
    }

  } catch (error) {
    console.error('❌ Erro ao adicionar prêmios:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  addPrizesToCases();
}

module.exports = addPrizesToCases;
