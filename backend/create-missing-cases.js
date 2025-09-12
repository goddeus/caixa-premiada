const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createMissingCases() {
  try {
    console.log('🔧 CRIANDO CAIXAS FALTANTES');
    console.log('=' .repeat(40));

    // Verificar caixas existentes
    const existingCases = await prisma.case.findMany();
    console.log(`📊 Caixas existentes: ${existingCases.length}`);

    // Lista de caixas que devem existir
    const requiredCases = [
      { nome: 'CAIXA KIT NIKE', preco: 2.50, imagem_url: '/imagens/nike.png' },
      { nome: 'CAIXA CONSOLE DO SONHOS!', preco: 3.50, imagem_url: '/imagens/console.png' },
      { nome: 'CAIXA PREMIUM MASTER!', preco: 15.00, imagem_url: '/imagens/caixa premium.png' },
      { nome: 'CAIXA APPLE', preco: 7.00, imagem_url: '/imagens/apple.png' },
      { nome: 'CAIXA SAMSUNG', preco: 3.00, imagem_url: '/imagens/samsung.png' },
      { nome: 'CAIXA WEEKEND', preco: 1.50, imagem_url: '/imagens/weekend.png' }
    ];

    // Verificar quais caixas estão faltando
    const existingNames = existingCases.map(c => c.nome);
    const missingCases = requiredCases.filter(c => !existingNames.includes(c.nome));

    console.log(`📋 Caixas faltando: ${missingCases.length}`);

    if (missingCases.length > 0) {
      console.log('\n🔧 Criando caixas faltantes...');
      
      for (const caseData of missingCases) {
        const newCase = await prisma.case.create({
          data: {
            nome: caseData.nome,
            preco: caseData.preco,
            imagem_url: caseData.imagem_url,
            ativo: true
          }
        });
        console.log(`✅ Criada: ${newCase.nome} - R$ ${newCase.preco}`);
      }
    } else {
      console.log('✅ Todas as caixas já existem');
    }

    // Verificar se todas as caixas estão ativas
    const allCases = await prisma.case.findMany();
    const inactiveCases = allCases.filter(c => !c.ativo);

    if (inactiveCases.length > 0) {
      console.log('\n🔧 Ativando caixas inativas...');
      
      for (const caseData of inactiveCases) {
        await prisma.case.update({
          where: { id: caseData.id },
          data: { ativo: true }
        });
        console.log(`✅ Ativada: ${caseData.nome}`);
      }
    }

    // Verificação final
    const finalCases = await prisma.case.findMany({
      where: { ativo: true },
      orderBy: { preco: 'asc' }
    });

    console.log('\n📊 VERIFICAÇÃO FINAL:');
    console.log(`✅ Total de caixas ativas: ${finalCases.length}`);
    
    finalCases.forEach((c, index) => {
      console.log(`${index + 1}. ${c.nome} - R$ ${parseFloat(c.preco).toFixed(2)}`);
    });

    if (finalCases.length === 6) {
      console.log('\n🎉 Todas as 6 caixas estão ativas e funcionando!');
    } else {
      console.log(`\n⚠️ Ainda faltam ${6 - finalCases.length} caixas`);
    }

  } catch (error) {
    console.error('❌ Erro ao criar caixas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createMissingCases();



