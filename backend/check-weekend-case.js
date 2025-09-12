const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkWeekendCase() {
  try {
    console.log('🔍 Verificando caixas Weekend...');
    
    const cases = await prisma.case.findMany({
      where: {
        nome: {
          contains: 'Weekend'
        }
      },
      include: {
        prizes: {
          where: { ativo: true }
        }
      }
    });
    
    console.log('📦 Caixas Weekend encontradas:', cases.length);
    cases.forEach(caixa => {
      console.log(`- ${caixa.nome} (ID: ${caixa.id}) - ${caixa.prizes.length} prêmios ativos`);
    });
    
    // Verificar todas as caixas
    const allCases = await prisma.case.findMany({
      select: { id: true, nome: true, ativo: true }
    });
    
    console.log('\n📦 Todas as caixas no banco:');
    allCases.forEach(caixa => {
      console.log(`- ${caixa.nome} (ID: ${caixa.id}) - Ativo: ${caixa.ativo}`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkWeekendCase();
