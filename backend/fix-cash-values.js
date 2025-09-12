const { PrismaClient } = require('@prisma/client');
const prizeUtils = require('./src/utils/prizeUtils');

const prisma = new PrismaClient();

async function fixCashValues() {
  console.log('💰 CORRIGINDO VALORES DOS PRÊMIOS CASH...\n');

  try {
    // 1. Buscar todos os prêmios cash
    console.log('1️⃣ Buscando prêmios cash...');
    
    const cashPrizes = await prisma.prize.findMany({
      where: { tipo: 'cash' }
    });
    
    console.log(`💰 Encontrados ${cashPrizes.length} prêmios cash:`);
    
    // 2. Corrigir valores em centavos baseado no nome
    console.log('\n2️⃣ Corrigindo valores em centavos...');
    
    for (const prize of cashPrizes) {
      const nome = prize.nome;
      let valorCentavos = prize.valor_centavos;
      
      // Se valor_centavos é 0, calcular baseado no nome
      if (valorCentavos === 0) {
        if (nome.includes('R$ 500,00')) {
          valorCentavos = 50000;
        } else if (nome.includes('R$ 100,00')) {
          valorCentavos = 10000;
        } else if (nome.includes('R$ 50,00')) {
          valorCentavos = 5000;
        } else if (nome.includes('R$ 20,00')) {
          valorCentavos = 2000;
        } else if (nome.includes('R$ 10,00')) {
          valorCentavos = 1000;
        } else if (nome.includes('R$ 5,00')) {
          valorCentavos = 500;
        } else if (nome.includes('R$ 2,00')) {
          valorCentavos = 200;
        } else if (nome.includes('R$ 1,00')) {
          valorCentavos = 100;
        }
      }
      
      // Forçar atualização se valor_centavos é 0
      if (valorCentavos === 0) {
        console.log(`💰 Forçando correção para "${nome}"`);
        if (nome.includes('R$ 500,00')) {
          valorCentavos = 50000;
        } else if (nome.includes('R$ 100,00')) {
          valorCentavos = 10000;
        } else if (nome.includes('R$ 50,00')) {
          valorCentavos = 5000;
        } else if (nome.includes('R$ 20,00')) {
          valorCentavos = 2000;
        } else if (nome.includes('R$ 10,00')) {
          valorCentavos = 1000;
        } else if (nome.includes('R$ 5,00')) {
          valorCentavos = 500;
        } else if (nome.includes('R$ 2,00')) {
          valorCentavos = 200;
        } else if (nome.includes('R$ 1,00')) {
          valorCentavos = 100;
        }
      }
      
      // Atualizar se necessário
      if (valorCentavos !== prize.valor_centavos) {
        console.log(`💰 Corrigindo "${nome}": ${prize.valor_centavos} → ${valorCentavos} centavos`);
        
        await prisma.prize.update({
          where: { id: prize.id },
          data: {
            valor_centavos: valorCentavos,
            valor: valorCentavos / 100 // Manter compatibilidade
          }
        });
        
        console.log(`   ✅ Atualizado com sucesso`);
      } else {
        console.log(`💰 "${nome}": ${valorCentavos} centavos (já correto)`);
      }
    }
    
    // 3. Verificar resultado final
    console.log('\n3️⃣ Verificando resultado final...');
    
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
        console.log(`     Label: "${mapped.label}"`);
      } catch (error) {
        console.log(`   ❌ "${prize.nome}": ERRO - ${error.message}`);
      }
    });
    
    // 4. Contar status
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
    
    // 5. Verificar especificamente a caixa Apple
    console.log('\n4️⃣ Verificando caixa Apple especificamente...');
    
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
          console.log(`     Valor: ${prize.valor_centavos} centavos`);
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
fixCashValues().then(() => {
  console.log('\n🎉 CORREÇÃO DE VALORES DOS PRÊMIOS CASH CONCLUÍDA!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
