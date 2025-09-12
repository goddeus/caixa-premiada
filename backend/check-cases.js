const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkCases() {
  try {
    console.log('📦 VERIFICANDO CAIXAS NO BANCO DE DADOS');
    console.log('=' .repeat(50));

    // Verificar todas as caixas
    const allCases = await prisma.case.findMany({
      select: {
        id: true,
        nome: true,
        preco: true,
        ativo: true,
        criado_em: true
      }
    });

    console.log(`📊 Total de caixas no banco: ${allCases.length}`);

    if (allCases.length === 0) {
      console.log('❌ Nenhuma caixa encontrada no banco de dados');
      console.log('💡 Execute o seed para criar caixas: node prisma/seed.js');
      return;
    }

    // Separar ativas e inativas
    const activeCases = allCases.filter(c => c.ativo);
    const inactiveCases = allCases.filter(c => !c.ativo);

    console.log(`✅ Caixas ativas: ${activeCases.length}`);
    console.log(`❌ Caixas inativas: ${inactiveCases.length}`);

    if (activeCases.length > 0) {
      console.log('\n🎯 CAIXAS ATIVAS:');
      console.log('-'.repeat(30));
      activeCases.forEach((caseItem, index) => {
        console.log(`${index + 1}. ${caseItem.nome}`);
        console.log(`   Preço: R$ ${caseItem.preco.toFixed(2)}`);
        console.log(`   ID: ${caseItem.id}`);
        console.log(`   Criada em: ${caseItem.criado_em.toLocaleDateString('pt-BR')}`);
        console.log('');
      });
    }

    if (inactiveCases.length > 0) {
      console.log('\n🚫 CAIXAS INATIVAS:');
      console.log('-'.repeat(30));
      inactiveCases.forEach((caseItem, index) => {
        console.log(`${index + 1}. ${caseItem.nome}`);
        console.log(`   Preço: R$ ${caseItem.preco.toFixed(2)}`);
        console.log(`   ID: ${caseItem.id}`);
        console.log('');
      });
    }

    // Verificar prêmios
    console.log('\n🎁 VERIFICANDO PRÊMIOS:');
    console.log('-'.repeat(30));
    
    for (const caseItem of activeCases) {
      const prizes = await prisma.prize.findMany({
        where: { case_id: caseItem.id },
        select: { id: true, nome: true, valor: true, ativo: true, sorteavel: true }
      });

      const activePrizes = prizes.filter(p => p.ativo && p.sorteavel);
      console.log(`${caseItem.nome}: ${activePrizes.length} prêmios ativos`);
    }

  } catch (error) {
    console.error('❌ Erro ao verificar caixas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCases();