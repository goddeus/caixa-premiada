const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function testImagesFinal() {
  console.log('🧪 TESTE FINAL DAS IMAGENS...\n');

  try {
    // 1. Buscar todos os prêmios
    const prizes = await prisma.prize.findMany({
      orderBy: { case_id: 'asc' },
      include: { case: true }
    });

    console.log(`📋 Testando ${prizes.length} prêmios...\n`);

    let workingImages = 0;
    let brokenImages = 0;
    const brokenPrizes = [];

    for (const prize of prizes) {
      console.log(`🎁 Testando: ${prize.nome} (${prize.case.nome})`);
      
      if (!prize.imagem_url) {
        console.log(`   ❌ Sem imagem definida`);
        brokenImages++;
        brokenPrizes.push(prize);
        continue;
      }

      const fullPath = path.join(__dirname, '..', 'frontend', 'public', prize.imagem_url);
      
      if (fs.existsSync(fullPath)) {
        console.log(`   ✅ Imagem funcionando: ${prize.imagem_url}`);
        workingImages++;
      } else {
        console.log(`   ❌ Imagem quebrada: ${prize.imagem_url}`);
        brokenImages++;
        brokenPrizes.push(prize);
      }
      
      console.log('');
    }

    // 2. Estatísticas finais
    console.log('📊 ESTATÍSTICAS FINAIS:');
    console.log('-'.repeat(50));
    console.log(`✅ Imagens funcionando: ${workingImages}`);
    console.log(`❌ Imagens quebradas: ${brokenImages}`);
    console.log(`📊 Taxa de sucesso: ${((workingImages / prizes.length) * 100).toFixed(1)}%`);

    if (brokenImages > 0) {
      console.log('\n❌ PRÊMIOS COM IMAGENS QUEBRADAS:');
      console.log('-'.repeat(50));
      for (const prize of brokenPrizes) {
        console.log(`🎁 ${prize.nome} (${prize.case.nome}): ${prize.imagem_url || 'N/A'}`);
      }
    } else {
      console.log('\n🎉 TODAS AS IMAGENS ESTÃO FUNCIONANDO!');
    }

    // 3. Verificar por caixa
    console.log('\n📦 VERIFICAÇÃO POR CAIXA:');
    console.log('-'.repeat(50));

    const cases = await prisma.case.findMany({
      orderBy: { nome: 'asc' }
    });

    for (const caseItem of cases) {
      const casePrizes = prizes.filter(p => p.case_id === caseItem.id);
      const workingInCase = casePrizes.filter(p => {
        if (!p.imagem_url) return false;
        const fullPath = path.join(__dirname, '..', 'frontend', 'public', p.imagem_url);
        return fs.existsSync(fullPath);
      }).length;
      
      const percentage = ((workingInCase / casePrizes.length) * 100).toFixed(1);
      console.log(`🎁 ${caseItem.nome}: ${workingInCase}/${casePrizes.length} (${percentage}%)`);
    }

  } catch (error) {
    console.error('❌ Erro durante teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar teste
testImagesFinal().then(() => {
  console.log('\n✅ TESTE FINALIZADO!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
