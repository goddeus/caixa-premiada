const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function removeTestCase() {
  try {
    // Remover prêmios da CAIXA TESTE primeiro
    const testCase = await prisma.case.findFirst({
      where: { nome: 'CAIXA TESTE' }
    });

    if (testCase) {
      await prisma.prize.deleteMany({
        where: { case_id: testCase.id }
      });
      console.log('Prêmios da CAIXA TESTE removidos');

      await prisma.case.delete({
        where: { id: testCase.id }
      });
      console.log('CAIXA TESTE removida');
    } else {
      console.log('CAIXA TESTE não encontrada');
    }

  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

removeTestCase();
