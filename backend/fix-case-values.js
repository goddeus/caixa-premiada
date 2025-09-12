const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixCaseValues() {
  try {
    console.log('🔧 CORRIGINDO VALORES DAS CAIXAS');
    console.log('=' .repeat(40));

    // Valores corretos das caixas
    const correctValues = {
      'CAIXA KIT NIKE': 2.50,
      'CAIXA CONSOLE DO SONHOS!': 3.50,
      'CAIXA PREMIUM MASTER!': 15.00,
      'CAIXA APPLE': 7.00,
      'CAIXA SAMSUNG': 3.00,
      'CAIXA WEEKEND': 1.50
    };

    // Buscar todas as caixas
    const cases = await prisma.case.findMany();

    console.log('📊 Verificando valores atuais:');
    for (const caseData of cases) {
      const currentValue = parseFloat(caseData.preco);
      const correctValue = correctValues[caseData.nome];
      
      console.log(`${caseData.nome}:`);
      console.log(`  Atual: R$ ${currentValue.toFixed(2)}`);
      console.log(`  Correto: R$ ${correctValue.toFixed(2)}`);
      
      if (Math.abs(currentValue - correctValue) > 0.01) {
        console.log(`  🔧 Corrigindo...`);
        
        await prisma.case.update({
          where: { id: caseData.id },
          data: { preco: correctValue }
        });
        
        console.log(`  ✅ Corrigido para R$ ${correctValue.toFixed(2)}`);
      } else {
        console.log(`  ✅ Valor já está correto`);
      }
      console.log('');
    }

    // Verificação final
    const finalCases = await prisma.case.findMany({
      where: { ativo: true },
      orderBy: { preco: 'asc' }
    });

    console.log('📊 VALORES FINAIS CORRETOS:');
    finalCases.forEach((c, index) => {
      console.log(`${index + 1}. ${c.nome} - R$ ${parseFloat(c.preco).toFixed(2)}`);
    });

    console.log('\n🎉 Valores das caixas corrigidos com sucesso!');

  } catch (error) {
    console.error('❌ Erro ao corrigir valores:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixCaseValues();



