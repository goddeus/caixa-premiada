const { PrismaClient } = require('@prisma/client');
const prizeUtils = require('./src/utils/prizeUtils');

const prisma = new PrismaClient();

async function fixCashPrizesImages() {
  console.log('💰 CORRIGINDO IMAGENS DOS PRÊMIOS EM REAIS...\n');

  try {
    // 1. Verificar imagens disponíveis na pasta
    console.log('1️⃣ Verificando imagens disponíveis na pasta...');
    
    const fs = require('fs');
    const path = require('path');
    
    const frontendImagesPath = path.join(__dirname, '../frontend/public/imagens');
    const imageFiles = fs.readdirSync(frontendImagesPath);
    
    console.log(`📁 Encontrados ${imageFiles.length} arquivos na pasta imagens`);
    
    // Filtrar imagens de dinheiro
    const cashImages = imageFiles.filter(file => 
      file.includes('reais') || 
      file.includes('real') ||
      file.includes('100reais') ||
      file.includes('10reais') ||
      file.includes('1real') ||
      file.includes('2reais') ||
      file.includes('5reais') ||
      file.includes('50reais') ||
      file.includes('20reais')
    );
    
    console.log(`💰 Imagens de dinheiro encontradas:`);
    cashImages.forEach(img => console.log(`   - ${img}`));
    console.log('');
    
    // 2. Mapear valores para imagens
    const cashImageMap = {
      200: '2reais.png',      // R$ 2,00
      500: '5reais.png',      // R$ 5,00
      1000: '10reais.png',    // R$ 10,00
      2000: '20reais.png',    // R$ 20,00
      5000: '50reais.png',    // R$ 50,00
      10000: '100reais.png',  // R$ 100,00
      50000: '500reais.webp'  // R$ 500,00
    };
    
    // 3. Buscar todos os prêmios cash
    console.log('2️⃣ Buscando prêmios cash...');
    
    const cashPrizes = await prisma.prize.findMany({
      where: { tipo: 'cash' }
    });
    
    console.log(`💰 Encontrados ${cashPrizes.length} prêmios cash:`);
    cashPrizes.forEach(prize => {
      console.log(`   - "${prize.nome}" (${prize.valor_centavos} centavos)`);
    });
    console.log('');
    
    // 4. Atualizar prêmios cash com imagens correspondentes
    console.log('3️⃣ Atualizando prêmios cash com imagens...');
    
    for (const prize of cashPrizes) {
      const valorCentavos = prize.valor_centavos || Math.round(prize.valor * 100);
      const imageFile = cashImageMap[valorCentavos];
      
      if (imageFile && imageFiles.includes(imageFile)) {
        console.log(`💰 Atualizando "${prize.nome}" (${valorCentavos} centavos) com "${imageFile}"`);
        
        await prisma.prize.update({
          where: { id: prize.id },
          data: {
            imagem_url: `/imagens/${imageFile}`,
            imagem_id: `/imagens/${imageFile}`
          }
        });
        
        console.log(`   ✅ Atualizado com sucesso`);
      } else {
        console.log(`💰 "${prize.nome}" (${valorCentavos} centavos) - imagem "${imageFile || 'não encontrada'}"`);
      }
    }
    
    // 5. Verificar resultado final
    console.log('\n4️⃣ Verificando resultado final...');
    
    const finalCashPrizes = await prisma.prize.findMany({
      where: { tipo: 'cash' }
    });
    
    console.log(`📋 Prêmios cash após correção:`);
    finalCashPrizes.forEach(prize => {
      try {
        const mapped = prizeUtils.mapPrizeToDisplay(prize);
        const status = getValidationStatus(mapped);
        const statusIcon = status === 'ok' ? '✅' : status === 'warning' ? '⚠️' : '❌';
        console.log(`   ${statusIcon} "${prize.nome}": ${status.toUpperCase()}`);
        console.log(`     Imagem: "${mapped.imagem}"`);
        console.log(`     Valor: ${prize.valor_centavos} centavos`);
      } catch (error) {
        console.log(`   ❌ "${prize.nome}": ERRO - ${error.message}`);
      }
    });
    
    // 6. Contar status
    const statusCount = { ok: 0, warning: 0, error: 0 };
    finalCashPrizes.forEach(prize => {
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
    
    // 7. Verificar especificamente a caixa Apple
    console.log('\n5️⃣ Verificando caixa Apple especificamente...');
    
    const appleCase = await prisma.case.findFirst({
      where: { nome: { contains: 'Apple' } }
    });
    
    if (appleCase) {
      const appleCashPrizes = await prisma.prize.findMany({
        where: { 
          AND: [
            { case_id: appleCase.id },
            { tipo: 'cash' }
          ]
        }
      });
      
      console.log(`🍎 Prêmios cash da caixa Apple:`);
      appleCashPrizes.forEach(prize => {
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
    }

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
fixCashPrizesImages().then(() => {
  console.log('\n🎉 CORREÇÃO DE IMAGENS DOS PRÊMIOS CASH CONCLUÍDA!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
