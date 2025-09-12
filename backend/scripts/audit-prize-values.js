const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function auditPrizeValues() {
  console.log('🔍 AUDITORIA DE VALORES DE PRÊMIOS');
  console.log('=====================================');
  
  try {
    // Buscar todos os prêmios
    const prizes = await prisma.prize.findMany({
      include: {
        case: {
          select: {
            nome: true
          }
        }
      }
    });

    console.log(`\n📊 Total de prêmios encontrados: ${prizes.length}`);
    
    // Análise de campos de valor
    console.log('\n🔍 ANÁLISE DE CAMPOS DE VALOR:');
    console.log('--------------------------------');
    
    const valorAnalysis = {
      hasValor: 0,
      hasValorCentavos: 0,
      hasBoth: 0,
      valorZero: 0,
      valorCentavosZero: 0,
      inconsistentValues: []
    };

    prizes.forEach(prize => {
      if (prize.valor !== null && prize.valor !== undefined) {
        valorAnalysis.hasValor++;
        if (prize.valor === 0) valorAnalysis.valorZero++;
      }
      
      if (prize.valor_centavos !== null && prize.valor_centavos !== undefined) {
        valorAnalysis.hasValorCentavos++;
        if (prize.valor_centavos === 0) valorAnalysis.valorCentavosZero++;
      }
      
      if (prize.valor !== null && prize.valor_centavos !== null) {
        valorAnalysis.hasBoth++;
        
        // Verificar consistência entre valor e valor_centavos
        const expectedCentavos = Math.round(prize.valor * 100);
        if (prize.valor_centavos !== expectedCentavos) {
          valorAnalysis.inconsistentValues.push({
            id: prize.id,
            nome: prize.nome,
            valor: prize.valor,
            valor_centavos: prize.valor_centavos,
            expected_centavos: expectedCentavos,
            case: prize.case.nome
          });
        }
      }
    });

    console.log(`- Prêmios com campo 'valor': ${valorAnalysis.hasValor}`);
    console.log(`- Prêmios com campo 'valor_centavos': ${valorAnalysis.hasValorCentavos}`);
    console.log(`- Prêmios com ambos os campos: ${valorAnalysis.hasBoth}`);
    console.log(`- Prêmios com valor = 0: ${valorAnalysis.valorZero}`);
    console.log(`- Prêmios com valor_centavos = 0: ${valorAnalysis.valorCentavosZero}`);
    console.log(`- Inconsistências encontradas: ${valorAnalysis.inconsistentValues.length}`);

    if (valorAnalysis.inconsistentValues.length > 0) {
      console.log('\n❌ INCONSISTÊNCIAS DETECTADAS:');
      valorAnalysis.inconsistentValues.forEach(inc => {
        console.log(`- ${inc.nome} (${inc.case}): valor=${inc.valor}, valor_centavos=${inc.valor_centavos}, esperado=${inc.expected_centavos}`);
      });
    }

    // Análise de tipos de prêmios
    console.log('\n🏷️ ANÁLISE DE TIPOS:');
    console.log('---------------------');
    
    const typeAnalysis = {
      cash: 0,
      produto: 0,
      ilustrativo: 0,
      empty: 0,
      highValue: 0
    };

    prizes.forEach(prize => {
      if (!prize.tipo || prize.tipo === '') {
        typeAnalysis.empty++;
      } else {
        typeAnalysis[prize.tipo] = (typeAnalysis[prize.tipo] || 0) + 1;
      }
      
      if (prize.valor > 1000) {
        typeAnalysis.highValue++;
      }
    });

    console.log(`- Tipo 'cash': ${typeAnalysis.cash}`);
    console.log(`- Tipo 'produto': ${typeAnalysis.produto}`);
    console.log(`- Tipo 'ilustrativo': ${typeAnalysis.ilustrativo}`);
    console.log(`- Tipo vazio: ${typeAnalysis.empty}`);
    console.log(`- Prêmios > R$ 1000: ${typeAnalysis.highValue}`);

    // Análise de flags
    console.log('\n🚩 ANÁLISE DE FLAGS:');
    console.log('---------------------');
    
    const flagAnalysis = {
      ativo: 0,
      inativo: 0,
      ilustrativo: 0,
      naoIlustrativo: 0,
      semImagem: 0,
      comImagem: 0
    };

    prizes.forEach(prize => {
      if (prize.ativo) {
        flagAnalysis.ativo++;
      } else {
        flagAnalysis.inativo++;
      }
      
      if (prize.ilustrativo) {
        flagAnalysis.ilustrativo++;
      } else {
        flagAnalysis.naoIlustrativo++;
      }
      
      if (!prize.imagem_url || prize.imagem_url === '') {
        flagAnalysis.semImagem++;
      } else {
        flagAnalysis.comImagem++;
      }
    });

    console.log(`- Ativos: ${flagAnalysis.ativo}`);
    console.log(`- Inativos: ${flagAnalysis.inativo}`);
    console.log(`- Ilustrativos: ${flagAnalysis.ilustrativo}`);
    console.log(`- Não ilustrativos: ${flagAnalysis.naoIlustrativo}`);
    console.log(`- Sem imagem: ${flagAnalysis.semImagem}`);
    console.log(`- Com imagem: ${flagAnalysis.comImagem}`);

    // Análise de valores por caixa
    console.log('\n📦 ANÁLISE POR CAIXA:');
    console.log('---------------------');
    
    const caseAnalysis = {};
    prizes.forEach(prize => {
      const caseName = prize.case.nome;
      if (!caseAnalysis[caseName]) {
        caseAnalysis[caseName] = {
          total: 0,
          cash: 0,
          produto: 0,
          ilustrativo: 0,
          ativo: 0,
          inativo: 0,
          valorMin: Infinity,
          valorMax: -Infinity,
          valorTotal: 0
        };
      }
      
      const analysis = caseAnalysis[caseName];
      analysis.total++;
      
      if (prize.tipo === 'cash') analysis.cash++;
      else if (prize.tipo === 'produto') analysis.produto++;
      else if (prize.tipo === 'ilustrativo') analysis.ilustrativo++;
      
      if (prize.ativo) analysis.ativo++;
      else analysis.inativo++;
      
      if (prize.valor > 0) {
        analysis.valorMin = Math.min(analysis.valorMin, prize.valor);
        analysis.valorMax = Math.max(analysis.valorMax, prize.valor);
        analysis.valorTotal += prize.valor;
      }
    });

    Object.entries(caseAnalysis).forEach(([caseName, analysis]) => {
      console.log(`\n${caseName}:`);
      console.log(`  Total: ${analysis.total}`);
      console.log(`  Cash: ${analysis.cash}, Produto: ${analysis.produto}, Ilustrativo: ${analysis.ilustrativo}`);
      console.log(`  Ativos: ${analysis.ativo}, Inativos: ${analysis.inativo}`);
      console.log(`  Valor: R$ ${analysis.valorMin.toFixed(2)} - R$ ${analysis.valorMax.toFixed(2)}`);
      console.log(`  Valor total: R$ ${analysis.valorTotal.toFixed(2)}`);
    });

    // Recomendações
    console.log('\n💡 RECOMENDAÇÕES:');
    console.log('------------------');
    
    if (valorAnalysis.inconsistentValues.length > 0) {
      console.log('❌ CORREÇÃO NECESSÁRIA: Inconsistências entre valor e valor_centavos');
    }
    
    if (typeAnalysis.empty > 0) {
      console.log('❌ CORREÇÃO NECESSÁRIA: Prêmios sem tipo definido');
    }
    
    if (flagAnalysis.semImagem > 0) {
      console.log('⚠️ ATENÇÃO: Prêmios sem imagem definida');
    }
    
    if (typeAnalysis.highValue > 0 && typeAnalysis.ilustrativo < typeAnalysis.highValue) {
      console.log('❌ CORREÇÃO NECESSÁRIA: Prêmios > R$ 1000 devem ser marcados como ilustrativos');
    }

    console.log('\n✅ Auditoria concluída!');

  } catch (error) {
    console.error('❌ Erro na auditoria:', error);
  } finally {
    await prisma.$disconnect();
  }
}

auditPrizeValues();
