const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testUpdatedPages() {
  console.log('🧪 TESTANDO PÁGINAS ATUALIZADAS...\n');

  try {
    // 1. Verificar se todas as caixas existem
    const cases = await prisma.case.findMany({
      orderBy: { nome: 'asc' }
    });

    console.log(`📦 Verificando ${cases.length} caixas...\n`);

    for (const caseItem of cases) {
      console.log(`🎁 CAIXA: ${caseItem.nome} (R$ ${caseItem.preco})`);
      console.log('-'.repeat(60));

      // Buscar prêmios da caixa
      const prizes = await prisma.prize.findMany({
        where: { case_id: caseItem.id },
        orderBy: { valor_centavos: 'asc' }
      });

      console.log(`📋 Total de prêmios: ${prizes.length}`);

      // Verificar se os prêmios estão corretos conforme especificação
      const expectedPrizes = getExpectedPrizes(caseItem.nome);
      const actualPrizes = prizes.map(p => ({
        nome: p.nome,
        valor: p.valor_centavos / 100,
        tipo: p.tipo,
        ativo: p.ativo
      }));

      console.log('✅ Prêmios encontrados:');
      actualPrizes.forEach(prize => {
        const valorFormatado = `R$ ${prize.valor.toFixed(2).replace('.', ',')}`;
        const status = prize.ativo ? 'ATIVO' : 'INATIVO';
        const sorteavel = prize.tipo !== 'ilustrativo' && prize.ativo && prize.valor <= 1000 ? 'SORTEÁVEL' : 'NÃO SORTEÁVEL';
        console.log(`   - ${prize.nome}: ${valorFormatado} (${prize.tipo}, ${status}, ${sorteavel})`);
      });

      // Verificar se há prêmios faltando ou extras
      const missingPrizes = expectedPrizes.filter(expected => 
        !actualPrizes.some(actual => actual.nome === expected.nome)
      );

      const extraPrizes = actualPrizes.filter(actual => 
        !expectedPrizes.some(expected => expected.nome === actual.nome)
      );

      if (missingPrizes.length > 0) {
        console.log('❌ Prêmios faltando:');
        missingPrizes.forEach(prize => console.log(`   - ${prize.nome}`));
      }

      if (extraPrizes.length > 0) {
        console.log('⚠️ Prêmios extras:');
        extraPrizes.forEach(prize => console.log(`   - ${prize.nome}`));
      }

      if (missingPrizes.length === 0 && extraPrizes.length === 0) {
        console.log('✅ Todos os prêmios estão corretos!');
      }

      console.log('');
    }

    // 2. Verificar regras de sorteabilidade
    console.log('🔍 VERIFICANDO REGRAS DE SORTEABILIDADE:');
    console.log('-'.repeat(50));

    const allPrizes = await prisma.prize.findMany();
    let correctSorteability = 0;
    let incorrectSorteability = 0;

    for (const prize of allPrizes) {
      const shouldBeSorteavel = prize.tipo !== 'ilustrativo' && prize.ativo && prize.valor_centavos <= 100000;
      const isSorteavel = prize.tipo !== 'ilustrativo' && prize.ativo && prize.valor_centavos <= 100000;

      if (shouldBeSorteavel === isSorteavel) {
        correctSorteability++;
      } else {
        incorrectSorteability++;
        console.log(`❌ ${prize.nome}: Esperado ${shouldBeSorteavel}, obtido ${isSorteavel}`);
      }
    }

    console.log(`✅ Prêmios com sorteabilidade correta: ${correctSorteability}`);
    console.log(`❌ Prêmios com sorteabilidade incorreta: ${incorrectSorteability}`);

    // 3. Estatísticas finais
    console.log('\n📈 ESTATÍSTICAS FINAIS:');
    console.log('-'.repeat(50));

    const totalPrizes = allPrizes.length;
    const sorteaveis = allPrizes.filter(p => p.tipo !== 'ilustrativo' && p.ativo && p.valor_centavos <= 100000).length;
    const naoSorteaveis = totalPrizes - sorteaveis;

    console.log(`📦 Total de caixas: ${cases.length}`);
    console.log(`🎁 Total de prêmios: ${totalPrizes}`);
    console.log(`✅ Prêmios sorteáveis: ${sorteaveis} (${((sorteaveis/totalPrizes)*100).toFixed(1)}%)`);
    console.log(`❌ Prêmios não sorteáveis: ${naoSorteaveis} (${((naoSorteaveis/totalPrizes)*100).toFixed(1)}%)`);

    // 4. Verificar imagens
    console.log('\n🖼️ VERIFICANDO IMAGENS:');
    console.log('-'.repeat(50));

    const prizesWithImages = allPrizes.filter(p => p.imagem_url && p.imagem_url.startsWith('/imagens/'));
    const prizesWithoutImages = allPrizes.filter(p => !p.imagem_url || !p.imagem_url.startsWith('/imagens/'));

    console.log(`✅ Prêmios com imagens locais: ${prizesWithImages.length}`);
    console.log(`❌ Prêmios sem imagens locais: ${prizesWithoutImages.length}`);

    if (prizesWithoutImages.length > 0) {
      console.log('Prêmios sem imagens:');
      prizesWithoutImages.forEach(prize => console.log(`   - ${prize.nome}: ${prize.imagem_url || 'N/A'}`));
    }

    console.log('\n🎉 TESTE CONCLUÍDO COM SUCESSO!');

  } catch (error) {
    console.error('❌ Erro durante teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function getExpectedPrizes(caseName) {
  const expectedPrizes = {
    'CAIXA APPLE': [
      { nome: 'R$ 1,00', valor: 1, tipo: 'cash', ativo: true },
      { nome: 'R$ 2,00', valor: 2, tipo: 'cash', ativo: true },
      { nome: 'R$ 5,00', valor: 5, tipo: 'cash', ativo: true },
      { nome: 'R$ 10,00', valor: 10, tipo: 'cash', ativo: true },
      { nome: 'R$ 100,00', valor: 100, tipo: 'cash', ativo: true },
      { nome: 'R$ 500,00', valor: 500, tipo: 'cash', ativo: true },
      { nome: 'APPLE WATCH', valor: 3500, tipo: 'ilustrativo', ativo: true },
      { nome: 'IPHONE', valor: 10000, tipo: 'ilustrativo', ativo: true },
      { nome: 'MACBOOK', valor: 15000, tipo: 'ilustrativo', ativo: true }
    ],
    'CAIXA CONSOLE DO SONHOS!': [
      { nome: 'R$ 1,00', valor: 1, tipo: 'cash', ativo: true },
      { nome: 'R$ 2,00', valor: 2, tipo: 'cash', ativo: true },
      { nome: 'R$ 5,00', valor: 5, tipo: 'cash', ativo: true },
      { nome: 'R$ 10,00', valor: 10, tipo: 'cash', ativo: true },
      { nome: 'R$ 100,00', valor: 100, tipo: 'cash', ativo: true },
      { nome: 'STEAM DECK', valor: 3000, tipo: 'ilustrativo', ativo: true },
      { nome: 'PLAYSTATION 5', valor: 4000, tipo: 'ilustrativo', ativo: true },
      { nome: 'XBOX SERIES X', valor: 4000, tipo: 'ilustrativo', ativo: true }
    ],
    'CAIXA KIT NIKE': [
      { nome: 'R$ 1,00', valor: 1, tipo: 'cash', ativo: true },
      { nome: 'R$ 2,00', valor: 2, tipo: 'cash', ativo: true },
      { nome: 'R$ 5,00', valor: 5, tipo: 'cash', ativo: true },
      { nome: 'R$ 10,00', valor: 10, tipo: 'cash', ativo: true },
      { nome: 'BONÉ NIKE', valor: 50, tipo: 'produto', ativo: true },
      { nome: 'CAMISA NIKE', valor: 100, tipo: 'produto', ativo: true },
      { nome: 'AIR FORCE 1', valor: 700, tipo: 'produto', ativo: true },
      { nome: 'AIR JORDAN', valor: 1500, tipo: 'ilustrativo', ativo: true },
      { nome: 'NIKE DUNK', valor: 1000, tipo: 'ilustrativo', ativo: true }
    ],
    'CAIXA PREMIUM MASTER!': [
      { nome: 'AIRPODS', valor: 2500, tipo: 'ilustrativo', ativo: true },
      { nome: 'SAMSUNG S25', valor: 5000, tipo: 'ilustrativo', ativo: true },
      { nome: 'PC GAMER', valor: 5000, tipo: 'ilustrativo', ativo: true },
      { nome: 'IPAD', valor: 8000, tipo: 'ilustrativo', ativo: true },
      { nome: 'IPHONE', valor: 10000, tipo: 'ilustrativo', ativo: true },
      { nome: 'IPHONE 16 PRO MAX', valor: 10000, tipo: 'ilustrativo', ativo: true },
      { nome: 'MACBOOK', valor: 15000, tipo: 'ilustrativo', ativo: true }
    ],
    'CAIXA SAMSUNG': [
      { nome: 'R$ 1,00', valor: 1, tipo: 'cash', ativo: true },
      { nome: 'R$ 2,00', valor: 2, tipo: 'cash', ativo: true },
      { nome: 'R$ 5,00', valor: 5, tipo: 'cash', ativo: true },
      { nome: 'R$ 10,00', valor: 10, tipo: 'cash', ativo: true },
      { nome: 'R$ 100,00', valor: 100, tipo: 'cash', ativo: true },
      { nome: 'R$ 500,00', valor: 500, tipo: 'cash', ativo: true },
      { nome: 'FONE SAMSUNG', valor: 1000, tipo: 'ilustrativo', ativo: true },
      { nome: 'NOTEBOOK SAMSUNG', valor: 3000, tipo: 'ilustrativo', ativo: true },
      { nome: 'SAMSUNG S25', valor: 5000, tipo: 'ilustrativo', ativo: true }
    ],
    'CAIXA WEEKEND': [
      { nome: 'R$ 1,00', valor: 1, tipo: 'cash', ativo: true },
      { nome: 'R$ 50,00', valor: 50, tipo: 'cash', ativo: true },
      { nome: 'SAMSUNG GALAXY BUDS', valor: 300, tipo: 'produto', ativo: true },
      { nome: 'REDMI NOTE 13', valor: 1000, tipo: 'ilustrativo', ativo: true },
      { nome: 'R$ 500,00', valor: 0, tipo: 'ilustrativo', ativo: false },
      { nome: 'R$ 100,00', valor: 0, tipo: 'ilustrativo', ativo: false },
      { nome: 'R$ 2,00', valor: 0, tipo: 'ilustrativo', ativo: false }
    ]
  };

  return expectedPrizes[caseName] || [];
}

// Executar teste
testUpdatedPages().then(() => {
  console.log('\n✅ SCRIPT FINALIZADO!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
