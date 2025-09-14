const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixWeekendCasePrice() {
  try {
    console.log('🔧 Corrigindo preço da CAIXA FINAL DE SEMANA...');
    
    // Buscar a caixa
    const weekendCase = await prisma.case.findFirst({
      where: {
        nome: 'CAIXA FINAL DE SEMANA'
      }
    });
    
    if (!weekendCase) {
      console.log('❌ Caixa FINAL DE SEMANA não encontrada!');
      return;
    }
    
    console.log('✅ Caixa encontrada:');
    console.log(`   Nome: ${weekendCase.nome}`);
    console.log(`   Preço atual: R$ ${weekendCase.preco}`);
    console.log(`   ID: ${weekendCase.id}`);
    
    // Atualizar o preço
    const updatedCase = await prisma.case.update({
      where: {
        id: weekendCase.id
      },
      data: {
        preco: 1.50
      }
    });
    
    console.log('✅ Preço atualizado com sucesso!');
    console.log(`   Novo preço: R$ ${updatedCase.preco}`);
    
  } catch (error) {
    console.error('❌ Erro ao corrigir preço:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixWeekendCasePrice();
