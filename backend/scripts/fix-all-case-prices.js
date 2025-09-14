const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixAllCasePrices() {
  try {
    console.log('🔧 Corrigindo preços de todas as caixas...');
    
    const correctPrices = {
      'CAIXA FINAL DE SEMANA': 1.50,
      'CAIXA KIT NIKE': 2.50,
      'CAIXA SAMSUNG': 3.00,
      'CAIXA APPLE': 7.00,
      'CAIXA CONSOLE DOS SONHOS': 3.50,
      'CAIXA PREMIUM MASTER': 15.00
    };
    
    // Buscar todas as caixas
    const cases = await prisma.case.findMany({
      where: {
        ativo: true
      }
    });
    
    console.log('📦 Caixas encontradas:');
    cases.forEach(c => {
      console.log(`   ${c.nome}: R$ ${c.preco}`);
    });
    
    console.log('\n🔧 Corrigindo preços...');
    
    for (const caseItem of cases) {
      const correctPrice = correctPrices[caseItem.nome];
      
      if (correctPrice && parseFloat(caseItem.preco) !== correctPrice) {
        console.log(`\n📝 Corrigindo: ${caseItem.nome}`);
        console.log(`   Preço atual: R$ ${caseItem.preco}`);
        console.log(`   Preço correto: R$ ${correctPrice}`);
        
        const updatedCase = await prisma.case.update({
          where: {
            id: caseItem.id
          },
          data: {
            preco: correctPrice
          }
        });
        
        console.log(`   ✅ Atualizado para: R$ ${updatedCase.preco}`);
      } else if (correctPrice) {
        console.log(`\n✅ ${caseItem.nome}: R$ ${caseItem.preco} (já está correto)`);
      } else {
        console.log(`\n⚠️ ${caseItem.nome}: Preço não definido nos valores corretos`);
      }
    }
    
    console.log('\n🎉 Correção de preços concluída!');
    
    // Verificar se as correções foram aplicadas
    console.log('\n📋 Verificando preços finais:');
    const finalCases = await prisma.case.findMany({
      where: {
        ativo: true
      },
      orderBy: {
        preco: 'asc'
      }
    });
    
    finalCases.forEach(c => {
      console.log(`   ${c.nome}: R$ ${c.preco}`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao corrigir preços:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAllCasePrices();
