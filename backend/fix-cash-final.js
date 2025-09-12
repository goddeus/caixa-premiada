const { PrismaClient } = require('@prisma/client');
const prizeUtils = require('./src/utils/prizeUtils');

const prisma = new PrismaClient();

async function fixCashFinal() {
  console.log('💰 CORREÇÃO FINAL DOS PRÊMIOS CASH...\n');

  try {
    // 1. Atualizar valores usando SQL direto
    console.log('1️⃣ Atualizando valores em centavos via SQL...');
    
    const updates = [
      { nome: 'R$ 500,00', valor_centavos: 50000 },
      { nome: 'R$ 100,00', valor_centavos: 10000 },
      { nome: 'R$ 50,00', valor_centavos: 5000 },
      { nome: 'R$ 20,00', valor_centavos: 2000 },
      { nome: 'R$ 10,00', valor_centavos: 1000 },
      { nome: 'R$ 5,00', valor_centavos: 500 },
      { nome: 'R$ 2,00', valor_centavos: 200 },
      { nome: 'R$ 1,00', valor_centavos: 100 }
    ];
    
    for (const update of updates) {
      const result = await prisma.$executeRaw`
        UPDATE prizes 
        SET valor_centavos = ${update.valor_centavos}, valor = ${update.valor_centavos / 100}
        WHERE nome = ${update.nome} AND tipo = 'cash' AND valor_centavos = 0
      `;
      
      if (result > 0) {
        console.log(`✅ Atualizado "${update.nome}": ${update.valor_centavos} centavos (${result} registros)`);
      }
    }
    
    // 2. Verificar resultado final
    console.log('\n2️⃣ Verificando resultado final...');
    
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
    
    // 3. Contar status
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
    
    // 4. Verificar especificamente a caixa Apple
    console.log('\n3️⃣ Verificando caixa Apple especificamente...');
    
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
    // Para cash, se tem imagem válida, está OK
    if (prize.imagem && (
      prize.imagem.startsWith('/uploads/') || 
      prize.imagem.startsWith('/imagens/') || 
      prize.imagem.startsWith('cash/')
    )) {
      return 'ok';
    }
    
    // Se não tem imagem válida, warning
    return 'warning';
  }
  
  // Para produto/ilustrativo
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
fixCashFinal().then(() => {
  console.log('\n🎉 CORREÇÃO FINAL DOS PRÊMIOS CASH CONCLUÍDA!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
