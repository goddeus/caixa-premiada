const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanDuplicateCases() {
  try {
    console.log('🧹 LIMPANDO CAIXAS DUPLICADAS');
    console.log('==================================================');

    // IDs das caixas corretas (as que têm prêmios)
    const correctCaseIds = [
      '5e7c06cb-48bc-45c9-909f-0032afe56074', // CAIXA KIT NIKE
      '97ce71b6-5d8c-43f0-98b9-f5044d647dc6', // CAIXA CONSOLE DOS SONHOS
      '2b520ca1-769c-4234-bbff-7a298c736774', // CAIXA PREMIUM MASTER
      '97c286db-7c43-4582-9884-40eda0dd8ab7', // CAIXA APPLE
      'a3ff986c-4b08-42f6-b514-40052001e466', // CAIXA SAMSUNG
      'e82eccc3-36c0-46cd-bd71-2c1c0013c7e4'  // CAIXA FINAL DE SEMANA
    ];

    // Buscar todas as caixas
    const allCases = await prisma.case.findMany({
      select: { id: true, nome: true }
    });

    console.log(`📊 Total de caixas encontradas: ${allCases.length}`);

    // Remover caixas duplicadas
    for (const caseItem of allCases) {
      if (!correctCaseIds.includes(caseItem.id)) {
        // Remover prêmios primeiro
        await prisma.prize.deleteMany({
          where: { case_id: caseItem.id }
        });

        // Remover a caixa
        await prisma.case.delete({
          where: { id: caseItem.id }
        });

        console.log(`🗑️ Removida: ${caseItem.nome} (${caseItem.id})`);
      }
    }

    console.log('\n✅ LIMPEZA CONCLUÍDA!');
    console.log('==================================================');

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanDuplicateCases();
