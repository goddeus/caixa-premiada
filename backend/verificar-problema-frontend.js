const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verificarProblemaFrontend() {
  try {
    console.log('🔍 VERIFICANDO POSSÍVEL PROBLEMA NO FRONTEND');
    console.log('==================================================');

    // 1. Verificar se há caixas com nomes similares que podem estar causando confusão
    const caixas = await prisma.case.findMany({
      where: { ativo: true },
      select: {
        id: true,
        nome: true,
        preco: true
      }
    });

    console.log('📦 CAIXAS QUE PODEM ESTAR CAUSANDO CONFUSÃO:');
    console.log('----------------------------------------------');
    
    // Buscar por caixas com nomes similares
    const nomesSimilares = {};
    caixas.forEach(caixa => {
      const nomeNormalizado = caixa.nome.toLowerCase().replace(/\s+/g, '');
      if (!nomesSimilares[nomeNormalizado]) {
        nomesSimilares[nomeNormalizado] = [];
      }
      nomesSimilares[nomeNormalizado].push(caixa);
    });

    Object.entries(nomesSimilares).forEach(([nome, caixasComMesmoNome]) => {
      if (caixasComMesmoNome.length > 1) {
        console.log(`❌ NOMES SIMILARES DETECTADOS: ${nome}`);
        caixasComMesmoNome.forEach(caixa => {
          console.log(`   - ${caixa.nome}: R$ ${parseFloat(caixa.preco).toFixed(2)} (ID: ${caixa.id})`);
        });
        console.log('');
      }
    });

    // 2. Verificar se há caixas com preços próximos que podem estar causando confusão
    console.log('💰 CAIXAS COM PREÇOS PRÓXIMOS:');
    console.log('--------------------------------');
    
    const precos = caixas.map(c => parseFloat(c.preco)).sort((a, b) => a - b);
    const precosProximos = [];
    
    for (let i = 0; i < precos.length - 1; i++) {
      const diferenca = precos[i + 1] - precos[i];
      if (diferenca <= 1.00) { // Diferença de até R$ 1,00
        precosProximos.push([precos[i], precos[i + 1]]);
      }
    }

    if (precosProximos.length > 0) {
      console.log('⚠️ Preços próximos que podem causar confusão:');
      precosProximos.forEach(([preco1, preco2]) => {
        const caixas1 = caixas.filter(c => parseFloat(c.preco) === preco1);
        const caixas2 = caixas.filter(c => parseFloat(c.preco) === preco2);
        
        console.log(`   R$ ${preco1.toFixed(2)} vs R$ ${preco2.toFixed(2)} (diferença: R$ ${(preco2 - preco1).toFixed(2)})`);
        caixas1.forEach(c => console.log(`     - ${c.nome}`));
        caixas2.forEach(c => console.log(`     - ${c.nome}`));
        console.log('');
      });
    } else {
      console.log('✅ Nenhum preço próximo detectado');
    }

    // 3. Verificar se há alguma lógica que pode estar alterando o preço
    console.log('🔍 VERIFICANDO LÓGICA DE ALTERAÇÃO DE PREÇO:');
    console.log('----------------------------------------------');
    
    // Buscar por transações com valores que podem indicar problemas
    const transacoesSuspeitas = await prisma.transaction.findMany({
      where: {
        tipo: 'abertura_caixa',
        criado_em: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Últimas 24 horas
        }
      },
      select: {
        id: true,
        valor: true,
        descricao: true,
        criado_em: true,
        case_id: true
      },
      orderBy: { criado_em: 'desc' },
      take: 100
    });

    // Agrupar por case_id e verificar consistência
    const transacoesPorCaixa = {};
    transacoesSuspeitas.forEach(transacao => {
      if (!transacoesPorCaixa[transacao.case_id]) {
        transacoesPorCaixa[transacao.case_id] = [];
      }
      transacoesPorCaixa[transacao.case_id].push(transacao);
    });

    console.log('📊 ANÁLISE DE CONSISTÊNCIA POR CAIXA:');
    console.log('-------------------------------------');
    
    Object.entries(transacoesPorCaixa).forEach(([caseId, transacoes]) => {
      if (transacoes.length > 0) {
        const valores = transacoes.map(t => Math.abs(parseFloat(t.valor)));
        const valoresUnicos = [...new Set(valores)];
        
        // Buscar nome da caixa
        const caixa = caixas.find(c => c.id === caseId);
        const nomeCaixa = caixa ? caixa.nome : 'N/A';
        
        console.log(`\n📦 ${nomeCaixa} (ID: ${caseId})`);
        console.log(`   Total de transações: ${transacoes.length}`);
        console.log(`   Valores únicos: ${valoresUnicos.map(v => `R$ ${v.toFixed(2)}`).join(', ')}`);
        
        if (valoresUnicos.length > 1) {
          console.log('   ❌ PROBLEMA: Valores inconsistentes detectados!');
          
          // Mostrar detalhes das transações com valores diferentes
          valoresUnicos.forEach(valor => {
            const transacoesComValor = transacoes.filter(t => Math.abs(parseFloat(t.valor)) === valor);
            console.log(`   📊 R$ ${valor.toFixed(2)}: ${transacoesComValor.length} transação(ões)`);
            
            // Mostrar as 3 transações mais recentes com este valor
            transacoesComValor.slice(0, 3).forEach(t => {
              console.log(`      - ${t.descricao} (${t.criado_em.toLocaleString()})`);
            });
          });
        } else {
          console.log('   ✅ Valores consistentes');
        }
      }
    });

    // 4. Verificar se há alguma lógica de desconto ou multiplicação
    console.log('\n🔍 VERIFICANDO LÓGICA DE DESCONTO/MULTIPLICAÇÃO:');
    console.log('------------------------------------------------');
    
    // Buscar por transações que podem indicar múltiplas caixas
    const transacoesMultiplas = await prisma.transaction.findMany({
      where: {
        tipo: 'abertura_caixa',
        valor: {
          lt: -1.50 // Valores menores que -1.50 (que seria o preço da CAIXA FINAL DE SEMANA)
        },
        criado_em: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      },
      select: {
        id: true,
        valor: true,
        descricao: true,
        criado_em: true,
        case_id: true
      },
      orderBy: { criado_em: 'desc' }
    });

    if (transacoesMultiplas.length > 0) {
      console.log('🔍 TRANSAÇÕES COM VALORES MAIORES QUE R$ 1,50:');
      transacoesMultiplas.forEach((transacao, index) => {
        const valorAbsoluto = Math.abs(parseFloat(transacao.valor));
        const caixa = caixas.find(c => c.id === transacao.case_id);
        console.log(`${index + 1}. ${caixa?.nome || 'N/A'}`);
        console.log(`   Valor: R$ ${valorAbsoluto.toFixed(2)}`);
        console.log(`   Caixa ID: ${transacao.case_id}`);
        console.log(`   Data: ${transacao.criado_em.toLocaleString()}`);
        console.log('');
      });
    } else {
      console.log('✅ Nenhuma transação com valores maiores que R$ 1,50 encontrada');
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarProblemaFrontend();
