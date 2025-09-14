const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addPrizesToCases() {
  console.log('🎁 Adicionando prêmios às caixas baseado nas imagens disponíveis...');

  try {
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
            imagem_url: `/imagens/${caseName}/${prize.imagem}`,
            label: prize.nome
          }
        });
        console.log(`  ✅ ${prize.nome} - R$ ${prize.valor} (${(prize.probabilidade * 100).toFixed(2)}%) - ${prize.imagem}`);
      }
    }

    console.log('\n✅ Prêmios adicionados com sucesso!');

    // Verificar resultado
    console.log('\n📊 VERIFICAÇÃO FINAL:');
    for (const caseItem of cases) {
      const prizeCount = await prisma.prize.count({
        where: { case_id: caseItem.id }
      });
      const prizes = await prisma.prize.findMany({
        where: { case_id: caseItem.id },
        select: { nome: true, valor: true, sorteavel: true }
      });
      
      console.log(`\n  📦 ${caseItem.nome}: ${prizeCount} prêmios`);
      prizes.forEach(p => {
        const tipo = p.sorteavel ? 'REAL' : 'ILUSTRATIVO';
        console.log(`    - ${p.nome} (R$ ${p.valor}) [${tipo}]`);
      });
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
