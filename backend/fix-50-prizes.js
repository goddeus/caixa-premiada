const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fix50Prizes() {
  console.log('🔧 CORRIGINDO PRÊMIOS DE R$ 50,00...\n');

  try {
    // 1. Buscar prêmios "R$ 50,00" que não deveriam existir
    const prizes50 = await prisma.prize.findMany({
      where: { nome: 'R$ 50,00' },
      include: { case: true }
    });

    console.log(`📋 Encontrados ${prizes50.length} prêmios "R$ 50,00" para corrigir...\n`);

    for (const prize of prizes50) {
      console.log(`🎁 Corrigindo: ${prize.nome} (${prize.case.nome})`);
      
      // Verificar se existe BONÉ NIKE na mesma caixa
      const bonéNike = await prisma.prize.findFirst({
        where: { 
          nome: 'BONÉ NIKE',
          case_id: prize.case_id
        }
      });

      if (bonéNike) {
        console.log(`   ✅ BONÉ NIKE já existe na caixa ${prize.case.nome}`);
        console.log(`   🗑️ Removendo prêmio duplicado "R$ 50,00"`);
        
        // Remover o prêmio "R$ 50,00" duplicado
        await prisma.prize.delete({
          where: { id: prize.id }
        });
        
        console.log(`   ✅ Prêmio "R$ 50,00" removido`);
      } else {
        console.log(`   🔄 Convertendo "R$ 50,00" para "BONÉ NIKE"`);
        
        // Converter para BONÉ NIKE
        await prisma.prize.update({
          where: { id: prize.id },
          data: {
            nome: 'BONÉ NIKE',
            tipo: 'produto',
            label: 'BONÉ NIKE',
            imagem_url: '/imagens/CAIXA KIT NIKE/boné nike.png',
            imagem_id: '/imagens/CAIXA KIT NIKE/boné nike.png'
          }
        });
        
        console.log(`   ✅ Convertido para BONÉ NIKE`);
      }
      
      console.log('');
    }

    // 2. Verificar se BONÉ NIKE existe em todas as caixas que deveriam ter
    const casesWithBoné = ['CAIXA KIT NIKE'];
    
    for (const caseName of casesWithBoné) {
      const caseItem = await prisma.case.findFirst({
        where: { nome: caseName }
      });

      if (!caseItem) {
        console.log(`❌ Caixa não encontrada: ${caseName}`);
        continue;
      }

      const bonéNike = await prisma.prize.findFirst({
        where: { 
          nome: 'BONÉ NIKE',
          case_id: caseItem.id
        }
      });

      if (!bonéNike) {
        console.log(`🔧 Criando BONÉ NIKE para ${caseName}`);
        
        await prisma.prize.create({
          data: {
            id: require('crypto').randomUUID(),
            case_id: caseItem.id,
            nome: 'BONÉ NIKE',
            valor: 50,
            valor_centavos: 5000,
            tipo: 'produto',
            label: 'BONÉ NIKE',
            ativo: true,
            probabilidade: 0.1,
            imagem_url: '/imagens/CAIXA KIT NIKE/boné nike.png',
            imagem_id: '/imagens/CAIXA KIT NIKE/boné nike.png'
          }
        });
        
        console.log(`   ✅ BONÉ NIKE criado`);
      } else {
        console.log(`   ✅ BONÉ NIKE já existe em ${caseName}`);
      }
    }

    // 3. Relatório final
    console.log('\n📊 RELATÓRIO FINAL:');
    console.log('-'.repeat(50));

    const allPrizes = await prisma.prize.findMany({
      orderBy: { case_id: 'asc' },
      include: { case: true }
    });

    const cases = await prisma.case.findMany({
      orderBy: { nome: 'asc' }
    });

    for (const caseItem of cases) {
      const casePrizes = allPrizes.filter(p => p.case_id === caseItem.id);
      const bonéPrizes = casePrizes.filter(p => p.nome.includes('BONÉ'));
      const moneyPrizes = casePrizes.filter(p => p.nome.includes('R$ 50,00'));
      
      console.log(`🎁 ${caseItem.nome}:`);
      console.log(`   - Total de prêmios: ${casePrizes.length}`);
      console.log(`   - BONÉ NIKE: ${bonéPrizes.length}`);
      console.log(`   - R$ 50,00: ${moneyPrizes.length}`);
    }

    console.log('\n✅ CORREÇÃO FINALIZADA!');

  } catch (error) {
    console.error('❌ Erro durante correção:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar correção
fix50Prizes().then(() => {
  console.log('\n✅ SCRIPT FINALIZADO!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
