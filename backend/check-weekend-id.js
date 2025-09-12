const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkWeekendId() {
  try {
    const caseItem = await prisma.case.findFirst({
      where: { nome: 'CAIXA WEEKEND' },
      select: { id: true, nome: true }
    });

    console.log('CAIXA WEEKEND ID:', caseItem.id);
    console.log('Nome:', caseItem.nome);

  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkWeekendId();
