const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugPrecoInconsistente() {
  try {
    console.log('🔍 DEBUGANDO PREÇO INCONSISTENTE DA MESMA CAIXA');
    console.log('==================================================');

    // 1. Verificar se há caixas duplicadas com nomes similares
    const caixas = await prisma.case.findMany({
      where: { ativo: true },
      select: {
        id: true,
        nome: true,
        preco: true,
        criado_em: true
      }
    });

    console.log('📦 TODAS AS CAIXAS ATIVAS:');
    console.log('------------------------------');
    caixas.forEach((caixa, index) => {
      console.log(`${index + 1}. ${caixa.nome}`);
      console.log(`   ID: ${caixa.id}`);
      console.log(`   Preço: R$ ${parseFloat(caixa.preco).toFixed(2)}`);
      console.log(`   Criado em: ${caixa.criado_em.toLocaleString()}`);
      console.log('');
    });

    // 2. Verificar transações recentes para encontrar inconsistências
    console.log('📊 TRANSAÇÕES RECENTES (ÚLTIMAS 2 HORAS):');
    console.log('--------------------------------------------');
    
    const transacoesRecentes = await prisma.transaction.findMany({
      where: {
        tipo: 'abertura_caixa',
        criado_em: {
          gte: new Date(Date.now() - 2 * 60 * 60 * 1000) // Últimas 2 horas
        }
      },
      select: {
        id: true,
        valor: true,
        descricao: true,
        criado_em: true,
        case_id: true,
        user_id: true
      },
      orderBy: { criado_em: 'desc' },
      take: 50
    });

    // Agrupar por case_id para ver se há valores diferentes para a mesma caixa
    const transacoesPorCaixa = {};
    transacoesRecentes.forEach(transacao => {
      if (!transacoesPorCaixa[transacao.case_id]) {
        transacoesPorCaixa[transacao.case_id] = [];
      }
      transacoesPorCaixa[transacao.case_id].push(transacao);
    });

    console.log('🔍 ANÁLISE POR CAIXA:');
    console.log('---------------------');
    
    Object.entries(transacoesPorCaixa).forEach(([caseId, transacoes]) => {
      if (transacoes.length > 0) {
        const valores = transacoes.map(t => Math.abs(parseFloat(t.valor)));
        const valoresUnicos = [...new Set(valores)];
        
        console.log(`\n📦 Caixa ID: ${caseId}`);
        console.log(`   Total de transações: ${transacoes.length}`);
        console.log(`   Valores únicos encontrados: ${valoresUnicos.map(v => `R$ ${v.toFixed(2)}`).join(', ')}`);
        
        if (valoresUnicos.length > 1) {
          console.log('   ❌ PROBLEMA DETECTADO: Valores diferentes para a mesma caixa!');
          
          // Mostrar detalhes das transações com valores diferentes
          valoresUnicos.forEach(valor => {
            const transacoesComValor = transacoes.filter(t => Math.abs(parseFloat(t.valor)) === valor);
            console.log(`   📊 R$ ${valor.toFixed(2)}: ${transacoesComValor.length} transação(ões)`);
            transacoesComValor.forEach(t => {
              console.log(`      - ${t.descricao} (${t.criado_em.toLocaleString()})`);
            });
          });
        } else {
          console.log('   ✅ Valores consistentes');
        }
      }
    });

    // 3. Verificar se há alguma lógica que está alterando o preço
    console.log('\n🔍 VERIFICANDO LÓGICA DE ALTERAÇÃO DE PREÇO:');
    console.log('----------------------------------------------');
    
    // Buscar por transações com valores suspeitos (2.00, 3.00)
    const transacoesSuspeitas = await prisma.transaction.findMany({
      where: {
        tipo: 'abertura_caixa',
        valor: {
          in: [-2.00, -3.00, 2.00, 3.00]
        },
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
      orderBy: { criado_em: 'desc' }
    });

    if (transacoesSuspeitas.length > 0) {
      console.log('🚨 TRANSAÇÕES COM VALORES SUSPEITOS (R$ 2,00 ou R$ 3,00):');
      transacoesSuspeitas.forEach((transacao, index) => {
        const valorAbsoluto = Math.abs(parseFloat(transacao.valor));
        console.log(`${index + 1}. ${transacao.descricao}`);
        console.log(`   Valor: R$ ${valorAbsoluto.toFixed(2)}`);
        console.log(`   Caixa ID: ${transacao.case_id}`);
        console.log(`   Data: ${transacao.criado_em.toLocaleString()}`);
        console.log('');
      });
    } else {
      console.log('✅ Nenhuma transação com valores suspeitos encontrada');
    }

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
        console.log(`${index + 1}. ${transacao.descricao}`);
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

debugPrecoInconsistente();
