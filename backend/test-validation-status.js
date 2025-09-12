const { PrismaClient } = require('@prisma/client');
const prizeUtils = require('./src/utils/prizeUtils');

const prisma = new PrismaClient();

async function testValidationStatus() {
  console.log('🧪 TESTANDO STATUS DE VALIDAÇÃO...\n');

  try {
    // 1. Buscar alguns prêmios para teste
    console.log('1️⃣ Buscando prêmios para teste...');
    
    const prizes = await prisma.prize.findMany({
      take: 10
    });

    console.log(`📋 Encontrados ${prizes.length} prêmios:`);
    console.log('');

    // 2. Testar mapeamento de cada prêmio
    prizes.forEach((prize, index) => {
      console.log(`${index + 1}. Prêmio: "${prize.nome}"`);
      console.log(`   - ID: ${prize.id}`);
      console.log(`   - Valor: R$ ${prize.valor}`);
      console.log(`   - Valor centavos: ${prize.valor_centavos}`);
      console.log(`   - Tipo: ${prize.tipo || 'não definido'}`);
      console.log(`   - Imagem ID: "${prize.imagem_id || 'null'}"`);
      console.log(`   - Imagem URL: "${prize.imagem_url || 'null'}"`);
      console.log(`   - Label: "${prize.label || 'null'}"`);
      console.log(`   - Ativo: ${prize.ativo}`);
      
      try {
        const mapped = prizeUtils.mapPrizeToDisplay(prize);
        console.log(`   📊 Mapeado:`);
        console.log(`      - Nome: "${mapped.nome}"`);
        console.log(`      - Label: "${mapped.label}"`);
        console.log(`      - Imagem: "${mapped.imagem}"`);
        console.log(`      - Tipo: ${mapped.tipo}`);
        console.log(`      - Valor centavos: ${mapped.valorCentavos}`);
        console.log(`      - Sorteável: ${mapped.sorteavel}`);
        
        // Simular validação do frontend
        const status = getValidationStatus(mapped);
        console.log(`      - Status: ${status.toUpperCase()}`);
        
      } catch (error) {
        console.log(`   ❌ Erro no mapeamento: ${error.message}`);
      }
      
      console.log('');
    });

    // 3. Testar casos específicos
    console.log('3️⃣ Testando casos específicos...');
    
    // Caso 1: Prêmio cash com valor correto
    const cashPrize = await prisma.prize.findFirst({
      where: { tipo: 'cash' }
    });
    
    if (cashPrize) {
      console.log('💰 Prêmio cash encontrado:');
      const mapped = prizeUtils.mapPrizeToDisplay(cashPrize);
      const status = getValidationStatus(mapped);
      console.log(`   - Nome: "${mapped.nome}"`);
      console.log(`   - Label: "${mapped.label}"`);
      console.log(`   - Imagem: "${mapped.imagem}"`);
      console.log(`   - Status: ${status.toUpperCase()}`);
      console.log('');
    }
    
    // Caso 2: Prêmio produto com imagem
    const productPrize = await prisma.prize.findFirst({
      where: { tipo: 'produto' }
    });
    
    if (productPrize) {
      console.log('📦 Prêmio produto encontrado:');
      const mapped = prizeUtils.mapPrizeToDisplay(productPrize);
      const status = getValidationStatus(mapped);
      console.log(`   - Nome: "${mapped.nome}"`);
      console.log(`   - Label: "${mapped.label}"`);
      console.log(`   - Imagem: "${mapped.imagem}"`);
      console.log(`   - Status: ${status.toUpperCase()}`);
      console.log('');
    }

  } catch (error) {
    console.error('❌ Erro durante teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Função de validação simulada (mesma do frontend)
function getValidationStatus(prize) {
  // Para prêmios cash, verificar consistência básica
  if (prize.tipo === 'cash') {
    const expectedLabel = `R$ ${(prize.valorCentavos / 100).toFixed(2).replace('.', ',')}`;
    
    // Verificar se o nome/label está correto para cash
    if (prize.nome !== expectedLabel && prize.label !== expectedLabel) {
      return 'warning'; // Apenas warning, não erro
    }
    
    // Para cash, imagem pode ser padrão ou customizada
    if (!prize.imagem || prize.imagem === 'produto/default.png') {
      return 'warning';
    }
    
    return 'ok';
  }
  
  // Para produto/ilustrativo, verificar se tem imagem válida
  if (!prize.imagem || prize.imagem === 'produto/default.png') {
    return 'warning';
  }
  
  // Verificar se a imagem realmente existe (não quebrada)
  if (prize.imagem && !prize.imagem.startsWith('/uploads/') && !prize.imagem.startsWith('/imagens/')) {
    return 'warning';
  }
  
  return 'ok';
}

// Executar teste
testValidationStatus().then(() => {
  console.log('\n🎉 TESTE DE VALIDAÇÃO CONCLUÍDO!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
