const { PrismaClient } = require('@prisma/client');
const prizeUtils = require('./src/utils/prizeUtils');

const prisma = new PrismaClient();

async function testAppleCaseSpecific() {
  console.log('🍎 TESTANDO CAIXA APPLE ESPECIFICAMENTE...\n');

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

    console.log('📋 Caixa Apple encontrada:');
    console.log(`   - ID: ${appleCase.id}`);
    console.log(`   - Nome: "${appleCase.nome}"`);
    console.log(`   - Preço: R$ ${appleCase.preco}`);
    console.log(`   - Imagem: "${appleCase.imagem_url || 'null'}"`);
    console.log('');

    // 2. Buscar todos os prêmios da caixa Apple
    console.log('2️⃣ Buscando prêmios da caixa Apple...');
    
    const applePrizes = await prisma.prize.findMany({
      where: { case_id: appleCase.id }
    });

    console.log(`📦 Encontrados ${applePrizes.length} prêmios na caixa Apple:`);
    console.log('');

    // 3. Analisar cada prêmio da Apple
    applePrizes.forEach((prize, index) => {
      console.log(`${index + 1}. Prêmio Apple: "${prize.nome}"`);
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
        
        // Verificar se a imagem existe fisicamente
        const fs = require('fs');
        const path = require('path');
        
        if (mapped.imagem && mapped.imagem.startsWith('/imagens/')) {
          const imagePath = path.join(__dirname, '../frontend/public', mapped.imagem);
          const exists = fs.existsSync(imagePath);
          console.log(`      - Imagem existe fisicamente: ${exists ? '✅' : '❌'} (${imagePath})`);
        }
        
      } catch (error) {
        console.log(`   ❌ Erro no mapeamento: ${error.message}`);
      }
      
      console.log('');
    });

    // 4. Comparar com outras caixas
    console.log('4️⃣ Comparando com outras caixas...');
    
    const otherCases = await prisma.case.findMany({
      where: {
        AND: [
          { id: { not: appleCase.id } },
          { nome: { not: appleCase.nome } }
        ]
      },
      take: 3
    });

    console.log(`📋 Encontradas ${otherCases.length} outras caixas para comparação:`);
    
    for (const otherCase of otherCases) {
      console.log(`\n📦 Caixa: "${otherCase.nome}"`);
      
      const otherPrizes = await prisma.prize.findMany({
        where: { case_id: otherCase.id },
        take: 3
      });
      
      otherPrizes.forEach((prize, index) => {
        console.log(`   ${index + 1}. "${prize.nome}"`);
        console.log(`      - Imagem ID: "${prize.imagem_id || 'null'}"`);
        console.log(`      - Imagem URL: "${prize.imagem_url || 'null'}"`);
        
        try {
          const mapped = prizeUtils.mapPrizeToDisplay(prize);
          const status = getValidationStatus(mapped);
          console.log(`      - Imagem mapeada: "${mapped.imagem}"`);
          console.log(`      - Status: ${status.toUpperCase()}`);
        } catch (error) {
          console.log(`      - Erro: ${error.message}`);
        }
      });
    }

    // 5. Verificar se há prêmios duplicados entre caixas
    console.log('\n5️⃣ Verificando prêmios duplicados...');
    
    const allPrizes = await prisma.prize.findMany();
    const prizeNames = {};
    
    allPrizes.forEach(prize => {
      const name = prize.nome?.toLowerCase();
      if (name) {
        if (!prizeNames[name]) {
          prizeNames[name] = [];
        }
        prizeNames[name].push({
          id: prize.id,
          case_id: prize.case_id,
          imagem_id: prize.imagem_id,
          imagem_url: prize.imagem_url
        });
      }
    });
    
    const duplicates = Object.entries(prizeNames).filter(([name, prizes]) => prizes.length > 1);
    
    if (duplicates.length > 0) {
      console.log(`📋 Encontrados ${duplicates.length} prêmios duplicados:`);
      duplicates.forEach(([name, prizes]) => {
        console.log(`   - "${name}": ${prizes.length} ocorrências`);
        prizes.forEach(prize => {
          console.log(`     * ID: ${prize.id}, Case: ${prize.case_id}`);
          console.log(`       Imagem ID: "${prize.imagem_id || 'null'}"`);
          console.log(`       Imagem URL: "${prize.imagem_url || 'null'}"`);
        });
      });
    } else {
      console.log('✅ Nenhum prêmio duplicado encontrado');
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
    if (!prize.imagemUrl || prize.imagemUrl === 'produto/default.png') {
      return 'warning';
    }
    
    return 'ok';
  }
  
  // Para produto/ilustrativo, verificar se tem imagem válida
  if (!prize.imagemUrl || prize.imagemUrl === 'produto/default.png') {
    return 'warning';
  }
  
  // Se tem imagem válida (uploads, imagens locais, ou cash), está OK
  if (prize.imagemUrl && (
    prize.imagemUrl.startsWith('/uploads/') || 
    prize.imagemUrl.startsWith('/imagens/') || 
    prize.imagemUrl.startsWith('cash/') ||
    prize.imagemUrl.startsWith('produto/')
  )) {
    return 'ok';
  }
  
  // Se chegou até aqui, pode ser uma imagem quebrada
  return 'warning';
}

// Executar teste
testAppleCaseSpecific().then(() => {
  console.log('\n🎉 TESTE DA CAIXA APPLE CONCLUÍDO!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
