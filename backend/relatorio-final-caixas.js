const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function generateFinalReport() {
  console.log('📊 RELATÓRIO FINAL DAS CAIXAS E PRÊMIOS');
  console.log('=' * 80);
  console.log('');

  try {
    // 1. Buscar todas as caixas
    const cases = await prisma.case.findMany({
      orderBy: { nome: 'asc' }
    });

    console.log(`📦 Total de caixas: ${cases.length}`);
    console.log('');

    // 2. Para cada caixa, listar prêmios
    for (const caseItem of cases) {
      console.log(`🎁 CAIXA: ${caseItem.nome}`);
      console.log(`💰 Preço: R$ ${caseItem.preco}`);
      console.log(`🖼️ Imagem: ${caseItem.imagem_url || 'N/A'}`);
      console.log('-'.repeat(60));

      // Buscar prêmios da caixa
      const prizes = await prisma.prize.findMany({
        where: { case_id: caseItem.id },
        orderBy: { valor_centavos: 'asc' }
      });

      console.log(`📋 Total de prêmios: ${prizes.length}`);
      console.log('');

      // Agrupar por tipo
      const cashPrizes = prizes.filter(p => p.tipo === 'cash');
      const productPrizes = prizes.filter(p => p.tipo === 'produto');
      const illustrativePrizes = prizes.filter(p => p.tipo === 'ilustrativo');

      // Prêmios em dinheiro
      if (cashPrizes.length > 0) {
        console.log('💰 PRÊMIOS EM DINHEIRO:');
        cashPrizes.forEach((prize, index) => {
          const valorFormatado = `R$ ${(prize.valor_centavos / 100).toFixed(2).replace('.', ',')}`;
          console.log(`   ${index + 1}. ${prize.nome} → ${valorFormatado}`);
        });
        console.log('');
      }

      // Prêmios produtos
      if (productPrizes.length > 0) {
        console.log('🎁 PRÊMIOS PRODUTOS:');
        productPrizes.forEach((prize, index) => {
          const valorFormatado = `R$ ${(prize.valor_centavos / 100).toFixed(2).replace('.', ',')}`;
          console.log(`   ${index + 1}. ${prize.nome} → ${valorFormatado}`);
        });
        console.log('');
      }

      // Prêmios ilustrativos
      if (illustrativePrizes.length > 0) {
        console.log('🖼️ PRÊMIOS ILUSTRATIVOS (não sorteáveis):');
        illustrativePrizes.forEach((prize, index) => {
          const valorFormatado = `R$ ${(prize.valor_centavos / 100).toFixed(2).replace('.', ',')}`;
          console.log(`   ${index + 1}. ${prize.nome} → ${valorFormatado}`);
        });
        console.log('');
      }

      // Estatísticas da caixa
      const totalValor = prizes.reduce((sum, prize) => sum + prize.valor_centavos, 0);
      const valorMedio = prizes.length > 0 ? totalValor / prizes.length : 0;
      const valorMaximo = Math.max(...prizes.map(p => p.valor_centavos));
      const valorMinimo = Math.min(...prizes.map(p => p.valor_centavos));

      console.log('📊 ESTATÍSTICAS:');
      console.log(`   💰 Valor total: R$ ${(totalValor / 100).toFixed(2).replace('.', ',')}`);
      console.log(`   📈 Valor médio: R$ ${(valorMedio / 100).toFixed(2).replace('.', ',')}`);
      console.log(`   🔝 Valor máximo: R$ ${(valorMaximo / 100).toFixed(2).replace('.', ',')}`);
      console.log(`   🔻 Valor mínimo: R$ ${(valorMinimo / 100).toFixed(2).replace('.', ',')}`);
      console.log(`   🎯 Prêmios ativos: ${prizes.filter(p => p.ativo).length}/${prizes.length}`);
      console.log('');

      console.log('=' * 80);
      console.log('');
    }

    // 3. Resumo geral
    console.log('📈 RESUMO GERAL:');
    console.log('-'.repeat(40));
    
    const allPrizes = await prisma.prize.findMany();
    const totalPrizes = allPrizes.length;
    const totalCashPrizes = allPrizes.filter(p => p.tipo === 'cash').length;
    const totalProductPrizes = allPrizes.filter(p => p.tipo === 'produto').length;
    const totalIllustrativePrizes = allPrizes.filter(p => p.tipo === 'ilustrativo').length;
    const activePrizes = allPrizes.filter(p => p.ativo).length;

    console.log(`📦 Total de caixas: ${cases.length}`);
    console.log(`🎁 Total de prêmios: ${totalPrizes}`);
    console.log(`💰 Prêmios em dinheiro: ${totalCashPrizes}`);
    console.log(`🎁 Prêmios produtos: ${totalProductPrizes}`);
    console.log(`🖼️ Prêmios ilustrativos: ${totalIllustrativePrizes}`);
    console.log(`✅ Prêmios ativos: ${activePrizes}`);
    console.log(`❌ Prêmios inativos: ${totalPrizes - activePrizes}`);

    // 4. Valores por faixa
    console.log('');
    console.log('💰 DISTRIBUIÇÃO POR FAIXA DE VALOR:');
    console.log('-'.repeat(40));
    
    const valueRanges = [
      { min: 0, max: 1000, label: 'R$ 0,01 - R$ 10,00' },
      { min: 1001, max: 10000, label: 'R$ 10,01 - R$ 100,00' },
      { min: 10001, max: 100000, label: 'R$ 100,01 - R$ 1.000,00' },
      { min: 100001, max: 1000000, label: 'R$ 1.000,01 - R$ 10.000,00' },
      { min: 1000001, max: Infinity, label: 'Acima de R$ 10.000,00' }
    ];

    valueRanges.forEach(range => {
      const count = allPrizes.filter(p => p.valor_centavos >= range.min && p.valor_centavos <= range.max).length;
      const percentage = totalPrizes > 0 ? ((count / totalPrizes) * 100).toFixed(1) : 0;
      console.log(`   ${range.label}: ${count} prêmios (${percentage}%)`);
    });

  } catch (error) {
    console.error('❌ Erro durante geração do relatório:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar relatório
generateFinalReport().then(() => {
  console.log('\n🎉 RELATÓRIO FINALIZADO!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
