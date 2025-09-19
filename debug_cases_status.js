const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugCasesStatus() {
  try {
    console.log('🔍 Verificando status das caixas no banco de dados...\n');

    // Buscar todas as caixas
    const cases = await prisma.case.findMany({
      include: {
        prizes: {
          where: { ativo: true },
          select: {
            id: true,
            nome: true,
            valor: true,
            probabilidade: true,
            imagem: true
          }
        }
      },
      orderBy: { preco: 'asc' }
    });

    console.log(`📦 Total de caixas encontradas: ${cases.length}\n`);

    cases.forEach((caseItem, index) => {
      console.log(`${index + 1}. ${caseItem.nome}`);
      console.log(`   ID: ${caseItem.id}`);
      console.log(`   Preço: R$ ${caseItem.preco}`);
      console.log(`   Ativo: ${caseItem.ativo ? 'SIM' : 'NÃO'}`);
      console.log(`   Prêmios: ${caseItem.prizes.length}`);
      
      if (caseItem.prizes.length > 0) {
        console.log('   Prêmios disponíveis:');
        caseItem.prizes.forEach((prize, prizeIndex) => {
          console.log(`     ${prizeIndex + 1}. ${prize.nome} - R$ ${prize.valor} (${(prize.probabilidade * 100).toFixed(2)}%)`);
        });
      }
      console.log('');
    });

    // Verificar se as caixas específicas existem
    const specificCases = [
      'CAIXA CONSOLE DOS SONHOS',
      'CAIXA APPLE', 
      'CAIXA PREMIUM MASTER!',
      'CAIXA FINAL DE SEMANA',
      'CAIXA KIT NIKE',
      'CAIXA SAMSUNG'
    ];

    console.log('🎯 Verificando caixas específicas...\n');
    
    for (const caseName of specificCases) {
      const foundCase = cases.find(c => c.nome === caseName);
      if (foundCase) {
        console.log(`✅ ${caseName}: ENCONTRADA (ID: ${foundCase.id})`);
      } else {
        console.log(`❌ ${caseName}: NÃO ENCONTRADA`);
      }
    }

    // Verificar IDs específicos
    const specificIds = [
      'fb0c0175-b478-4fd5-9750-d673c0f374fd', // Console
      '61a19df9-d011-429e-a9b5-d2c837551150', // Apple
      'db95bb2b-9b3e-444b-964f-547330010a59', // Premium Master
      '1abd77cf-472b-473d-9af0-6cd47f9f1452', // Weekend
      '0b5e9b8a-9d56-4769-a45a-55a3025640f4', // Nike
      '3f2a9f7a-cb4d-47e7-991a-0e72c0e0f415'  // Samsung
    ];

    console.log('\n🔑 Verificando IDs específicos...\n');
    
    for (const id of specificIds) {
      const foundCase = cases.find(c => c.id === id);
      if (foundCase) {
        console.log(`✅ ID ${id}: ENCONTRADO (${foundCase.nome})`);
      } else {
        console.log(`❌ ID ${id}: NÃO ENCONTRADO`);
      }
    }

  } catch (error) {
    console.error('❌ Erro ao verificar status das caixas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugCasesStatus();
