const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  
  try {
    // Verificar caixas atuais
    const cases = await prisma.case.findMany();
    console.log('Caixas encontradas:', cases.length);
    
    // Corrigir valores específicos
    await prisma.case.updateMany({
      where: { nome: 'CAIXA WEEKEND' },
      data: { preco: 1.50 }
    });
    
    await prisma.case.updateMany({
      where: { nome: 'CAIXA SAMSUNG' },
      data: { preco: 3.00 }
    });
    
    // Ativar todas as caixas
    await prisma.case.updateMany({
      data: { ativo: true }
    });
    
    // Verificar resultado final
    const finalCases = await prisma.case.findMany({
      where: { ativo: true },
      orderBy: { preco: 'asc' }
    });
    
    console.log('\nCaixas ativas (6):');
    finalCases.forEach((c, i) => {
      console.log(`${i+1}. ${c.nome} - R$ ${c.preco}`);
    });
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();



