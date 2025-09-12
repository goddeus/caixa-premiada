const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const cases = await prisma.case.findMany();
    console.log('Total de caixas:', cases.length);
    cases.forEach(c => console.log(c.nome, '- R$', c.preco, '- Ativo:', c.ativo));
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

check();



