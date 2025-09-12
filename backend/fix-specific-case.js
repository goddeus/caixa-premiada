const { PrismaClient } = require('@prisma/client');
const prizeUtils = require('./src/utils/prizeUtils');

const prisma = new PrismaClient();

async function fixSpecificCase() {
  console.log('🔧 CORRIGINDO CASO ESPECÍFICO REPORTADO...\n');

  try {
    // Caso específico reportado
    const specificPrizeId = '97b6c851-55e7-40a0-abac-6b1826302c32';
    
    console.log('1️⃣ Buscando prêmio específico...');
    const prize = await prisma.prize.findUnique({
      where: { id: specificPrizeId }
    });

    if (!prize) {
      console.log(`❌ Prêmio ${specificPrizeId} não encontrado`);
      return;
    }

    console.log('📋 Estado atual do prêmio:');
    console.log(`   - ID: ${prize.id}`);
    console.log(`   - Nome: "${prize.nome}"`);
    console.log(`   - Valor: R$ ${prize.valor}`);
    console.log(`   - Tipo: ${prize.tipo || 'não definido'}`);
    console.log(`   - Label: "${prize.label || 'não definido'}"`);
    console.log(`   - Imagem ID: "${prize.imagem_id || 'não definido'}"`);
    console.log(`   - Valor centavos: ${prize.valor_centavos || 'não definido'}`);
    console.log('');

    // Determinar correções necessárias
    console.log('2️⃣ Determinando correções necessárias...');
    
    const valorCentavos = Math.round(prize.valor * 100); // R$ 5,00 = 500 centavos
    const expectedLabel = prizeUtils.formatarBRL(valorCentavos); // "R$ 5,00"
    const expectedImagem = prizeUtils.assetKeyCash(valorCentavos); // "cash/500.png"
    
    console.log(`   - Valor em centavos: ${valorCentavos}`);
    console.log(`   - Label esperado: "${expectedLabel}"`);
    console.log(`   - Imagem esperada: "${expectedImagem}"`);
    console.log('');

    // Aplicar correções usando SQL direto
    console.log('3️⃣ Aplicando correções...');
    
    const updateQuery = `
      UPDATE prizes 
      SET 
        tipo = 'cash',
        valor_centavos = ${valorCentavos},
        label = '${expectedLabel}',
        imagem_id = '${expectedImagem}',
        nome = '${expectedLabel}'
      WHERE id = '${specificPrizeId}'
    `;
    
    console.log('📝 Query SQL:');
    console.log(updateQuery);
    console.log('');
    
    // Executar update usando raw SQL
    const result = await prisma.$executeRaw`
      UPDATE prizes 
      SET 
        tipo = 'cash',
        valor_centavos = ${valorCentavos},
        label = ${expectedLabel},
        imagem_id = ${expectedImagem},
        nome = ${expectedLabel}
      WHERE id = ${specificPrizeId}
    `;
    
    console.log(`✅ Correção aplicada! ${result} linha(s) atualizada(s)`);
    console.log('');

    // Verificar resultado
    console.log('4️⃣ Verificando resultado...');
    const updatedPrize = await prisma.prize.findUnique({
      where: { id: specificPrizeId }
    });

    console.log('📋 Estado após correção:');
    console.log(`   - ID: ${updatedPrize.id}`);
    console.log(`   - Nome: "${updatedPrize.nome}"`);
    console.log(`   - Valor: R$ ${updatedPrize.valor}`);
    console.log(`   - Tipo: ${updatedPrize.tipo}`);
    console.log(`   - Label: "${updatedPrize.label}"`);
    console.log(`   - Imagem ID: "${updatedPrize.imagem_id}"`);
    console.log(`   - Valor centavos: ${updatedPrize.valor_centavos}`);
    console.log('');

    // Testar mapeamento
    console.log('5️⃣ Testando mapeamento...');
    try {
      const mapped = prizeUtils.mapPrizeToDisplay(updatedPrize);
      console.log('✅ Mapeamento bem-sucedido:');
      console.log(`   - Tipo: ${mapped.tipo}`);
      console.log(`   - Label: ${mapped.label}`);
      console.log(`   - Nome: ${mapped.nome}`);
      console.log(`   - Imagem: ${mapped.imagem}`);
      console.log(`   - Sorteável: ${mapped.sorteavel}`);
      console.log(`   - Valor centavos: ${mapped.valorCentavos}`);
    } catch (error) {
      console.error('❌ Erro no mapeamento:', error.message);
    }

    console.log('\n✅ CASO ESPECÍFICO CORRIGIDO COM SUCESSO!');
    console.log('🎯 O prêmio agora está alinhado com as regras do sistema V2');

  } catch (error) {
    console.error('❌ ERRO durante correção:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar correção
fixSpecificCase().then(() => {
  console.log('\n🎉 CORREÇÃO CONCLUÍDA!');
  process.exit(0);
}).catch(error => {
  console.error('❌ ERRO FATAL:', error);
  process.exit(1);
});
