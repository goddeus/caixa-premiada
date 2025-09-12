const { PrismaClient } = require('@prisma/client');
const prizeUtils = require('./src/utils/prizeUtils');

const prisma = new PrismaClient();

async function testFinalSystem() {
  console.log('🧪 TESTANDO SISTEMA FINAL ATUALIZADO...\n');

  try {
    // 1. Buscar todas as caixas
    const cases = await prisma.case.findMany({
      orderBy: { nome: 'asc' }
    });

    console.log(`📦 Testando ${cases.length} caixas...\n`);

    for (const caseItem of cases) {
      console.log(`🎁 CAIXA: ${caseItem.nome} (R$ ${caseItem.preco})`);
      console.log('-'.repeat(60));

      // Buscar prêmios da caixa
      const prizes = await prisma.prize.findMany({
        where: { case_id: caseItem.id },
        orderBy: { valor_centavos: 'asc' }
      });

      console.log(`📋 Total de prêmios: ${prizes.length}`);

      // Testar cada prêmio
      let sorteaveis = 0;
      let naoSorteaveis = 0;

      for (const prize of prizes) {
        try {
          const mapped = prizeUtils.mapPrizeToDisplay(prize);
          const valorFormatado = `R$ ${(mapped.valorCentavos / 100).toFixed(2).replace('.', ',')}`;
          
          // Verificar se é sorteável
          const isHighValue = mapped.valorCentavos > 100000; // R$ 1.000,00
          const shouldBeSorteavel = mapped.tipo !== 'ilustrativo' && mapped.ativo && !isHighValue;
          
          const status = mapped.sorteavel ? '✅ SORTEÁVEL' : '❌ NÃO SORTEÁVEL';
          const reason = !mapped.ativo ? '(INATIVO)' : 
                        mapped.tipo === 'ilustrativo' ? '(ILUSTRATIVO)' :
                        isHighValue ? '(VALOR ALTO)' : '(OK)';
          
          console.log(`   ${status} ${mapped.nome} → ${valorFormatado} ${reason}`);
          
          if (mapped.sorteavel) {
            sorteaveis++;
          } else {
            naoSorteaveis++;
          }

          // Verificar consistência
          if (mapped.sorteavel !== shouldBeSorteavel) {
            console.log(`   ⚠️ INCONSISTÊNCIA: Esperado ${shouldBeSorteavel}, obtido ${mapped.sorteavel}`);
          }

        } catch (error) {
          console.log(`   ❌ ERRO: ${prize.nome} - ${error.message}`);
        }
      }

      console.log(`📊 Resumo: ${sorteaveis} sorteáveis, ${naoSorteaveis} não sorteáveis`);
      console.log('');
    }

    // 2. Teste de regras específicas
    console.log('🔍 TESTANDO REGRAS ESPECÍFICAS:');
    console.log('-'.repeat(40));

    // Buscar prêmios de exemplo
    const testPrizes = await prisma.prize.findMany({
      where: {
        OR: [
          { nome: 'R$ 1,00' },
          { nome: 'IPHONE' },
          { nome: 'BONÉ NIKE' },
          { nome: 'AIR JORDAN' },
          { nome: 'NIKE DUNK' }
        ]
      }
    });

    for (const prize of testPrizes) {
      const mapped = prizeUtils.mapPrizeToDisplay(prize);
      const valorFormatado = `R$ ${(mapped.valorCentavos / 100).toFixed(2).replace('.', ',')}`;
      
      console.log(`🎯 ${mapped.nome} (${mapped.tipo}):`);
      console.log(`   - Valor: ${valorFormatado}`);
      console.log(`   - Sorteável: ${mapped.sorteavel ? 'SIM' : 'NÃO'}`);
      console.log(`   - Ativo: ${mapped.ativo ? 'SIM' : 'NÃO'}`);
      console.log(`   - Imagem: ${mapped.imagem}`);
      console.log('');
    }

    // 3. Estatísticas finais
    console.log('📈 ESTATÍSTICAS FINAIS:');
    console.log('-'.repeat(40));

    const allPrizes = await prisma.prize.findMany();
    const totalPrizes = allPrizes.length;
    const totalSorteaveis = allPrizes.filter(p => {
      const mapped = prizeUtils.mapPrizeToDisplay(p);
      return mapped.sorteavel;
    }).length;
    const totalNaoSorteaveis = totalPrizes - totalSorteaveis;

    console.log(`📦 Total de caixas: ${cases.length}`);
    console.log(`🎁 Total de prêmios: ${totalPrizes}`);
    console.log(`✅ Prêmios sorteáveis: ${totalSorteaveis}`);
    console.log(`❌ Prêmios não sorteáveis: ${totalNaoSorteaveis}`);
    console.log(`📊 Percentual sorteáveis: ${((totalSorteaveis / totalPrizes) * 100).toFixed(1)}%`);

    // 4. Verificar prêmios acima de R$ 1.000
    const highValuePrizes = allPrizes.filter(p => p.valor_centavos > 100000);
    console.log(`\n💰 Prêmios acima de R$ 1.000,00: ${highValuePrizes.length}`);
    
    highValuePrizes.forEach(prize => {
      const mapped = prizeUtils.mapPrizeToDisplay(prize);
      const valorFormatado = `R$ ${(mapped.valorCentavos / 100).toFixed(2).replace('.', ',')}`;
      console.log(`   - ${mapped.nome}: ${valorFormatado} (${mapped.sorteavel ? 'SORTEÁVEL' : 'NÃO SORTEÁVEL'})`);
    });

    console.log('\n🎉 TESTE CONCLUÍDO COM SUCESSO!');

  } catch (error) {
    console.error('❌ Erro durante teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar teste
testFinalSystem().then(() => {
  console.log('\n✅ SCRIPT FINALIZADO!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
