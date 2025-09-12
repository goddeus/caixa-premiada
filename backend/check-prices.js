const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkPrices() {
  try {
    console.log('🔍 VERIFICANDO PREÇOS DAS CAIXAS\n');
    
    const cases = await prisma.case.findMany({
      where: { ativo: true },
      select: { id: true, nome: true, preco: true }
    });
    
    console.log('📦 Preços atuais das caixas:');
    cases.forEach(c => {
      console.log(`   ${c.nome}: R$ ${c.preco}`);
    });
    
    console.log('\n✅ Verificação concluída!');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPrices();
