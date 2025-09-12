const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createMissingCases() {
  try {
    console.log('🔄 CRIANDO CAIXAS FALTANTES COM NOMES CORRETOS');
    console.log('==================================================');

    // Caixas que precisam ser criadas
    const casesToCreate = [
      {
        nome: 'CAIXA CONSOLE DOS SONHOS',
        preco: 10.00,
        imagem_url: '/imagens/console.png',
        ativo: true
      },
      {
        nome: 'CAIXA FINAL DE SEMANA',
        preco: 1.50,
        imagem_url: '/imagens/fim de semana.png',
        ativo: true
      },
      {
        nome: 'CAIXA KIT NIKE',
        preco: 5.00,
        imagem_url: '/imagens/nike.png',
        ativo: true
      },
      {
        nome: 'CAIXA PREMIUM MASTER',
        preco: 15.00,
        imagem_url: '/imagens/caixa premium.png',
        ativo: true
      }
    ];

    for (const caseData of casesToCreate) {
      // Verificar se já existe
      const existingCase = await prisma.case.findFirst({
        where: { nome: caseData.nome }
      });

      if (existingCase) {
        console.log(`✅ ${caseData.nome} já existe (ID: ${existingCase.id})`);
        continue;
      }

      // Criar a caixa
      const newCase = await prisma.case.create({
        data: caseData
      });

      console.log(`✅ ${caseData.nome} criada (ID: ${newCase.id})`);
    }

    // Atualizar nomes das caixas existentes se necessário
    const updates = [
      { oldName: 'CAIXA MÉDIA', newName: 'CAIXA CONSOLE DOS SONHOS' },
      { oldName: 'CAIXA WEEKEND', newName: 'CAIXA FINAL DE SEMANA' },
      { oldName: 'CAIXA NIKE', newName: 'CAIXA KIT NIKE' },
      { oldName: 'CAIXA PREMIUM MASTER!', newName: 'CAIXA PREMIUM MASTER' }
    ];

    for (const update of updates) {
      const caseItem = await prisma.case.findFirst({
        where: { nome: update.oldName }
      });

      if (caseItem) {
        await prisma.case.update({
          where: { id: caseItem.id },
          data: { nome: update.newName }
        });
        console.log(`🔄 ${update.oldName} renomeada para ${update.newName}`);
      }
    }

    console.log('\n🎉 CAIXAS CRIADAS E ATUALIZADAS!');
    console.log('==================================================');

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createMissingCases();
