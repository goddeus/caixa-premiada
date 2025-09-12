const { PrismaClient } = require('@prisma/client');
const prizeUtils = require('./src/utils/prizeUtils');

const prisma = new PrismaClient();

async function fixAppleImages() {
  console.log('🍎 CORRIGINDO IMAGENS DA CAIXA APPLE...\n');

  try {
    // 1. Buscar a caixa Apple
    console.log('1️⃣ Buscando caixa Apple...');
    
    const appleCase = await prisma.case.findFirst({
      where: {
        OR: [
          { nome: { contains: 'Apple' } },
          { nome: { contains: 'apple' } },
          { nome: { contains: 'APPLE' } }
        ]
      }
    });

    if (!appleCase) {
      console.log('❌ Caixa Apple não encontrada');
      return;
    }

    console.log(`📋 Caixa Apple encontrada: "${appleCase.nome}" (ID: ${appleCase.id})`);
    
    // 2. Buscar prêmios da caixa Apple
    const applePrizes = await prisma.prize.findMany({
      where: { case_id: appleCase.id }
    });

    console.log(`📦 Encontrados ${applePrizes.length} prêmios na caixa Apple`);
    
    // 3. Mapear produtos para imagens disponíveis
    const productImageMap = {
      'MACBOOK': 'macbook.png',
      'IPAD': 'ipad.png', 
      'AIRPODS': 'airpods.png',
      'APPLE WATCH': 'apple watch.jpg'
    };
    
    // 4. Atualizar prêmios com imagens correspondentes
    console.log('\n2️⃣ Atualizando prêmios com imagens correspondentes...');
    
    for (const prize of applePrizes) {
      const prizeName = prize.nome?.toUpperCase();
      let imageToUse = null;
      
      // Verificar se há imagem correspondente
      for (const [productName, imageFile] of Object.entries(productImageMap)) {
        if (prizeName?.includes(productName)) {
          imageToUse = imageFile;
          break;
        }
      }
      
      // Se encontrou imagem correspondente e o prêmio não tem imagem
      if (imageToUse && (!prize.imagem_id || !prize.imagem_url)) {
        console.log(`📦 Atualizando "${prize.nome}" com imagem "${imageToUse}"`);
        
        await prisma.prize.update({
          where: { id: prize.id },
          data: {
            imagem_url: `/imagens/${imageToUse}`,
            imagem_id: `/imagens/${imageToUse}`
          }
        });
        
        console.log(`   ✅ Atualizado com sucesso`);
      } else if (imageToUse) {
        console.log(`📦 "${prize.nome}" já tem imagem: "${prize.imagem_url || prize.imagem_id}"`);
      } else {
        console.log(`📦 "${prize.nome}" não tem imagem correspondente na pasta`);
      }
    }
    
    // 5. Verificar resultado final
    console.log('\n3️⃣ Verificando resultado final...');
    
    const finalPrizes = await prisma.prize.findMany({
      where: { case_id: appleCase.id }
    });
    
    console.log(`📋 Prêmios da caixa Apple após correção:`);
    finalPrizes.forEach(prize => {
      try {
        const mapped = prizeUtils.mapPrizeToDisplay(prize);
        const status = getValidationStatus(mapped);
        const statusIcon = status === 'ok' ? '✅' : status === 'warning' ? '⚠️' : '❌';
        console.log(`   ${statusIcon} "${prize.nome}": ${status.toUpperCase()}`);
        console.log(`     Imagem: "${mapped.imagem}"`);
      } catch (error) {
        console.log(`   ❌ "${prize.nome}": ERRO - ${error.message}`);
      }
    });
    
    // 6. Contar status
    const statusCount = { ok: 0, warning: 0, error: 0 };
    finalPrizes.forEach(prize => {
      try {
        const mapped = prizeUtils.mapPrizeToDisplay(prize);
        const status = getValidationStatus(mapped);
        statusCount[status]++;
      } catch (error) {
        statusCount.error++;
      }
    });
    
    console.log(`\n📊 Resumo final:`);
    console.log(`   ✅ OK: ${statusCount.ok}`);
    console.log(`   ⚠️ WARNING: ${statusCount.warning}`);
    console.log(`   ❌ ERROR: ${statusCount.error}`);

  } catch (error) {
    console.error('❌ Erro durante correção:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Função de validação simulada
function getValidationStatus(prize) {
  if (prize.tipo === 'cash') {
    const expectedLabel = `R$ ${(prize.valorCentavos / 100).toFixed(2).replace('.', ',')}`;
    
    if (prize.nome !== expectedLabel && prize.label !== expectedLabel) {
      return 'warning';
    }
    
    if (!prize.imagem || prize.imagem === 'produto/default.png') {
      return 'warning';
    }
    
    return 'ok';
  }
  
  if (!prize.imagem || prize.imagem === 'produto/default.png') {
    return 'warning';
  }
  
  if (prize.imagem && (
    prize.imagem.startsWith('/uploads/') || 
    prize.imagem.startsWith('/imagens/') || 
    prize.imagem.startsWith('cash/') ||
    prize.imagem.startsWith('produto/')
  )) {
    return 'ok';
  }
  
  return 'warning';
}

// Executar correção
fixAppleImages().then(() => {
  console.log('\n🎉 CORREÇÃO DE IMAGENS DA CAIXA APPLE CONCLUÍDA!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
