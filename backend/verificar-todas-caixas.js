const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verificarTodasCaixas() {
  try {
    console.log('🔍 VERIFICANDO TODAS AS CAIXAS PARA PROBLEMAS DE DÉBITO DUPLO');
    console.log('==================================================');

    // 1. Listar todas as caixas ativas
    const caixasAtivas = await prisma.case.findMany({
      where: { ativo: true },
      select: { id: true, nome: true, preco: true },
      orderBy: { nome: 'asc' }
    });

    console.log(`📦 Total de caixas ativas: ${caixasAtivas.length}\n`);

    // 2. Verificar transações de abertura de caixa das últimas 24h
    const transacoesAbertura = await prisma.transaction.findMany({
      where: {
        tipo: 'abertura_caixa',
        criado_em: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      },
      orderBy: { criado_em: 'desc' },
      include: {
        user: {
          select: { nome: true, email: true }
        }
      }
    });

    console.log(`📊 Total de transações de abertura (24h): ${transacoesAbertura.length}\n`);

    // 3. Agrupar transações por caixa
    const transacoesPorCaixa = {};
    caixasAtivas.forEach(caixa => {
      transacoesPorCaixa[caixa.id] = {
        caixa: caixa,
        transacoes: []
      };
    });

    transacoesAbertura.forEach(transacao => {
      if (transacoesPorCaixa[transacao.case_id]) {
        transacoesPorCaixa[transacao.case_id].transacoes.push(transacao);
      }
    });

    // 4. Analisar cada caixa
    console.log('🔍 ANÁLISE POR CAIXA:');
    console.log('=====================');

    let totalProblemas = 0;
    let totalTransacoes = 0;

    Object.entries(transacoesPorCaixa).forEach(([caseId, dados]) => {
      const { caixa, transacoes } = dados;
      
      if (transacoes.length === 0) {
        console.log(`\n📦 ${caixa.nome} (R$ ${caixa.preco.toFixed(2)})`);
        console.log('   ✅ Nenhuma transação nas últimas 24h');
        return;
      }

      console.log(`\n📦 ${caixa.nome} (R$ ${caixa.preco.toFixed(2)})`);
      console.log(`   📊 Transações: ${transacoes.length}`);

      // Verificar se há transações duplicadas (mesmo segundo)
      const transacoesPorData = {};
      transacoes.forEach(transacao => {
        const data = transacao.criado_em.toISOString().substring(0, 19);
        if (!transacoesPorData[data]) {
          transacoesPorData[data] = [];
        }
        transacoesPorData[data].push(transacao);
      });

      let duplicatasEncontradas = 0;
      let valoresIncorretos = 0;

      Object.entries(transacoesPorData).forEach(([data, transacoesMesmaData]) => {
        if (transacoesMesmaData.length > 1) {
          console.log(`   ⚠️ ${transacoesMesmaData.length} transações no mesmo segundo: ${data}`);
          duplicatasEncontradas += transacoesMesmaData.length - 1;
        }

        // Verificar se os valores estão corretos
        transacoesMesmaData.forEach(transacao => {
          const valorDebitado = Math.abs(parseFloat(transacao.valor));
          const precoEsperado = parseFloat(caixa.preco);
          const diferenca = Math.abs(valorDebitado - precoEsperado);

          if (diferenca > 0.01) {
            console.log(`   ❌ Valor incorreto: R$ ${valorDebitado.toFixed(2)} (esperado: R$ ${precoEsperado.toFixed(2)})`);
            valoresIncorretos++;
          }
        });
      });

      if (duplicatasEncontradas > 0) {
        console.log(`   🚨 ${duplicatasEncontradas} transações duplicadas encontradas`);
        totalProblemas += duplicatasEncontradas;
      }

      if (valoresIncorretos > 0) {
        console.log(`   🚨 ${valoresIncorretos} transações com valores incorretos`);
        totalProblemas += valoresIncorretos;
      }

      if (duplicatasEncontradas === 0 && valoresIncorretos === 0) {
        console.log('   ✅ Nenhum problema detectado');
      }

      totalTransacoes += transacoes.length;
    });

    // 5. Resumo geral
    console.log('\n📋 RESUMO GERAL:');
    console.log('================');
    console.log(`📦 Caixas analisadas: ${caixasAtivas.length}`);
    console.log(`📊 Total de transações: ${totalTransacoes}`);
    console.log(`🚨 Total de problemas: ${totalProblemas}`);

    if (totalProblemas > 0) {
      console.log('\n⚠️ ATENÇÃO: Problemas detectados!');
      console.log('💡 Recomendação: Verificar se o débito duplo foi corrigido em todas as caixas');
    } else {
      console.log('\n✅ Nenhum problema detectado em nenhuma caixa');
    }

    // 6. Verificar se há usuários com saldos inconsistentes
    console.log('\n🔍 VERIFICANDO SALDOS INCONSISTENTES:');
    console.log('=====================================');

    const usuariosComTransacoes = await prisma.user.findMany({
      where: {
        transactions: {
          some: {
            criado_em: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
            }
          }
        }
      },
      select: { id: true, nome: true, email: true, saldo: true }
    });

    let usuariosComProblemas = 0;

    for (const usuario of usuariosComTransacoes) {
      const transacoesUsuario = await prisma.transaction.findMany({
        where: { user_id: usuario.id },
        orderBy: { criado_em: 'asc' }
      });

      let saldoCalculado = 0;
      transacoesUsuario.forEach(transacao => {
        saldoCalculado += parseFloat(transacao.valor);
      });

      const diferenca = Math.abs(saldoCalculado - parseFloat(usuario.saldo));
      
      if (diferenca > 0.01) {
        console.log(`❌ ${usuario.nome} (${usuario.email})`);
        console.log(`   Saldo no banco: R$ ${parseFloat(usuario.saldo).toFixed(2)}`);
        console.log(`   Saldo calculado: R$ ${saldoCalculado.toFixed(2)}`);
        console.log(`   Diferença: R$ ${diferenca.toFixed(2)}`);
        usuariosComProblemas++;
      }
    }

    if (usuariosComProblemas === 0) {
      console.log('✅ Todos os usuários com saldos consistentes');
    } else {
      console.log(`\n🚨 ${usuariosComProblemas} usuários com saldos inconsistentes`);
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarTodasCaixas();
