const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkCases() {
  try {
    console.log('🔍 Verificando todas as caixas no banco de dados...\n');
    
    const cases = await prisma.case.findMany({
      select: {
        id: true,
        nome: true,
        preco: true,
        ativo: true
      },
      orderBy: { nome: 'asc' }
    });

    console.log(`📦 Total de caixas encontradas: ${cases.length}\n`);
    
    cases.forEach((caseItem, index) => {
      console.log(`${index + 1}. ID: ${caseItem.id}`);
      console.log(`   Nome: "${caseItem.nome}"`);
      console.log(`   Preço: R$ ${caseItem.preco}`);
      console.log(`   Ativo: ${caseItem.ativo ? 'Sim' : 'Não'}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Erro ao verificar caixas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCases();

