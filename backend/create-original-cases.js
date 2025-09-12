const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createOriginalCases() {
  try {
    console.log('📦 CRIANDO CAIXAS ORIGINAIS');
    console.log('=' .repeat(40));

    // Verificar se as caixas já existem
    const existingCases = await prisma.case.findMany({
      where: {
        nome: {
          in: [
            'CAIXA NIKE',
            'CAIXA MÉDIA',
            'CAIXA PREMIUM MASTER!',
            'CAIXA APPLE',
            'CAIXA SAMSUNG',
            'CAIXA WEEKEND'
          ]
        }
      }
    });

    if (existingCases.length > 0) {
      console.log('⚠️ Algumas caixas já existem. Ativando todas...');
      
      // Ativar todas as caixas existentes
      await prisma.case.updateMany({
        where: {
          nome: {
            in: [
              'CAIXA NIKE',
              'CAIXA MÉDIA', 
              'CAIXA PREMIUM MASTER!',
              'CAIXA APPLE',
              'CAIXA SAMSUNG',
              'CAIXA WEEKEND'
            ]
          }
        },
        data: { ativo: true }
      });

      console.log('✅ Caixas existentes ativadas');
    }

    // Criar caixas que não existem
    const casesToCreate = [
      {
        nome: 'CAIXA NIKE',
        preco: 5.00,
        imagem_url: '/imagens/nike.png',
        ativo: true
      },
      {
        nome: 'CAIXA MÉDIA',
        preco: 10.00,
        imagem_url: '/imagens/console.png',
        ativo: true
      },
      {
        nome: 'CAIXA PREMIUM MASTER!',
        preco: 15.00,
        imagem_url: '/imagens/caixa premium.png',
        ativo: true
      },
      {
        nome: 'CAIXA APPLE',
        preco: 7.00,
        imagem_url: '/imagens/apple.png',
        ativo: true
      },
      {
        nome: 'CAIXA SAMSUNG',
        preco: 3.00,
        imagem_url: '/imagens/samsung.png',
        ativo: true
      },
      {
        nome: 'CAIXA WEEKEND',
        preco: 1.50,
        imagem_url: '/imagens/weekend.png',
        ativo: true
      }
    ];

    for (const caseData of casesToCreate) {
      const existingCase = await prisma.case.findFirst({
        where: { nome: caseData.nome }
      });

      if (!existingCase) {
        const newCase = await prisma.case.create({
          data: caseData
        });
        console.log(`✅ Criada: ${newCase.nome} - R$ ${newCase.preco.toFixed(2)}`);
      } else {
        console.log(`⚠️ Já existe: ${caseData.nome}`);
      }
    }

    // Verificar resultado final
    const allActiveCases = await prisma.case.findMany({
      where: { ativo: true },
      select: { id: true, nome: true, preco: true, ativo: true }
    });

    console.log('\n📋 CAIXAS ATIVAS FINAIS:');
    console.log('-'.repeat(30));
    allActiveCases.forEach((caseItem, index) => {
      console.log(`${index + 1}. ${caseItem.nome} - R$ ${caseItem.preco.toFixed(2)}`);
    });

    console.log(`\n✅ Total de caixas ativas: ${allActiveCases.length}`);

  } catch (error) {
    console.error('❌ Erro ao criar caixas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createOriginalCases();
