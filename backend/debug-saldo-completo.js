const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugSaldoCompleto() {
  try {
    console.log('🔍 DEBUG COMPLETO DO SALDO');
    console.log('==================================================');

    const userId = 'cd325b64-eca7-4adf-bc77-7022473126b2';
    
    // 1. Verificar saldo atual
    const usuario = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        saldo: true, 
        nome: true, 
        email: true,
        criado_em: true
      }
    });

    console.log('👤 USUÁRIO:');
    console.log(`   Nome: ${usuario.nome}`);
    console.log(`   Email: ${usuario.email}`);
    console.log(`   Saldo atual: R$ ${parseFloat(usuario.saldo).toFixed(2)}`);
    console.log(`   Criado em: ${usuario.criado_em.toLocaleString()}`);
    console.log('');

    // 2. Verificar todas as transações do usuário (últimas 24h)
    const todasTransacoes = await prisma.transaction.findMany({
      where: {
        user_id: userId,
        criado_em: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Últimas 24 horas
        }
      },
      orderBy: { criado_em: 'desc' }
    });

    console.log(`📊 TOTAL DE TRANSAÇÕES (24h): ${todasTransacoes.length}`);
    console.log('');

    // 3. Calcular saldo manualmente baseado nas transações
    let saldoCalculado = 0;
    const transacoesPorTipo = {};

    todasTransacoes.forEach(transacao => {
      const valor = parseFloat(transacao.valor);
      saldoCalculado += valor;
      
      if (!transacoesPorTipo[transacao.tipo]) {
        transacoesPorTipo[transacao.tipo] = { count: 0, total: 0 };
      }
      transacoesPorTipo[transacao.tipo].count++;
      transacoesPorTipo[transacao.tipo].total += valor;
    });

    console.log('💰 CÁLCULO MANUAL DO SALDO:');
    console.log('----------------------------');
    console.log(`   Saldo calculado: R$ ${saldoCalculado.toFixed(2)}`);
    console.log(`   Saldo no banco: R$ ${parseFloat(usuario.saldo).toFixed(2)}`);
    console.log(`   Diferença: R$ ${Math.abs(saldoCalculado - parseFloat(usuario.saldo)).toFixed(2)}`);
    console.log('');

    // 4. Mostrar resumo por tipo de transação
    console.log('📋 RESUMO POR TIPO DE TRANSAÇÃO:');
    console.log('---------------------------------');
    Object.entries(transacoesPorTipo).forEach(([tipo, dados]) => {
      console.log(`${tipo.toUpperCase()}:`);
      console.log(`   Quantidade: ${dados.count}`);
      console.log(`   Total: R$ ${dados.total.toFixed(2)}`);
      console.log('');
    });

    // 5. Verificar transações de abertura de caixa especificamente
    const transacoesAbertura = todasTransacoes.filter(t => t.tipo === 'abertura_caixa');
    
    if (transacoesAbertura.length > 0) {
      console.log('🎲 TRANSAÇÕES DE ABERTURA DE CAIXA:');
      console.log('-----------------------------------');
      
      // Buscar informações das caixas
      const caseIds = [...new Set(transacoesAbertura.map(t => t.case_id).filter(id => id))];
      const caixas = await prisma.case.findMany({
        where: { id: { in: caseIds } },
        select: { id: true, nome: true, preco: true }
      });
      
      const caixasMap = {};
      caixas.forEach(caixa => {
        caixasMap[caixa.id] = caixa;
      });
      
      let totalDebitado = 0;
      transacoesAbertura.forEach((transacao, index) => {
        const valorDebitado = Math.abs(parseFloat(transacao.valor));
        const caixa = caixasMap[transacao.case_id];
        totalDebitado += valorDebitado;
        
        console.log(`${index + 1}. ${caixa?.nome || 'N/A'}`);
        console.log(`   Valor: R$ ${valorDebitado.toFixed(2)}`);
        console.log(`   Data: ${transacao.criado_em.toLocaleString()}`);
        console.log(`   Descrição: ${transacao.descricao}`);
        console.log('');
      });
      
      console.log(`💰 TOTAL DEBITADO EM CAIXAS: R$ ${totalDebitado.toFixed(2)}`);
    }

    // 6. Verificar se há transações com valores suspeitos (3.00, 2.00)
    const transacoesSuspeitas = todasTransacoes.filter(t => 
      Math.abs(parseFloat(t.valor)) === 3.00 || 
      Math.abs(parseFloat(t.valor)) === 2.00
    );

    if (transacoesSuspeitas.length > 0) {
      console.log('🚨 TRANSAÇÕES COM VALORES SUSPEITOS (R$ 2,00 ou R$ 3,00):');
      console.log('----------------------------------------------------------');
      transacoesSuspeitas.forEach((transacao, index) => {
        const valorAbsoluto = Math.abs(parseFloat(transacao.valor));
        console.log(`${index + 1}. ${transacao.tipo.toUpperCase()}`);
        console.log(`   Valor: R$ ${valorAbsoluto.toFixed(2)}`);
        console.log(`   Data: ${transacao.criado_em.toLocaleString()}`);
        console.log(`   Descrição: ${transacao.descricao}`);
        console.log(`   Caixa ID: ${transacao.case_id || 'N/A'}`);
        console.log('');
      });
    } else {
      console.log('✅ Nenhuma transação com valores suspeitos encontrada');
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugSaldoCompleto();
