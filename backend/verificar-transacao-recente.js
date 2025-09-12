const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verificarTransacaoRecente() {
  try {
    console.log('🔍 VERIFICANDO TRANSAÇÃO RECENTE');
    console.log('==================================================');

    // Buscar a última transação do usuário específico
    const userId = 'cd325b64-eca7-4adf-bc77-7022473126b2';
    
    const transacoesRecentes = await prisma.transaction.findMany({
      where: {
        user_id: userId,
        criado_em: {
          gte: new Date(Date.now() - 10 * 60 * 1000) // Últimos 10 minutos
        }
      },
      orderBy: { criado_em: 'desc' }
    });

    console.log(`📊 TRANSAÇÕES RECENTES DO USUÁRIO ${userId}:`);
    console.log('--------------------------------------------');
    
    transacoesRecentes.forEach((transacao, index) => {
      const valorAbsoluto = Math.abs(parseFloat(transacao.valor));
      console.log(`${index + 1}. ${transacao.tipo.toUpperCase()}`);
      console.log(`   Valor: R$ ${valorAbsoluto.toFixed(2)}`);
      console.log(`   Descrição: ${transacao.descricao}`);
      console.log(`   Caixa ID: ${transacao.case_id || 'N/A'}`);
      console.log(`   Data: ${transacao.criado_em.toLocaleString()}`);
      console.log(`   ID da transação: ${transacao.id}`);
      console.log('');
    });

    // Verificar se há transações de abertura de caixa com valores incorretos
    const transacoesAbertura = transacoesRecentes.filter(t => t.tipo === 'abertura_caixa');
    
    if (transacoesAbertura.length > 0) {
      console.log('🔍 ANÁLISE DAS TRANSAÇÕES DE ABERTURA:');
      console.log('--------------------------------------');
      
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
      
      transacoesAbertura.forEach((transacao, index) => {
        const valorDebitado = Math.abs(parseFloat(transacao.valor));
        const caixa = caixasMap[transacao.case_id];
        const precoEsperado = caixa ? parseFloat(caixa.preco) : 0;
        const diferenca = Math.abs(valorDebitado - precoEsperado);
        
        console.log(`Transação ${index + 1}:`);
        console.log(`   Caixa: ${caixa?.nome || 'N/A'}`);
        console.log(`   Preço esperado: R$ ${precoEsperado.toFixed(2)}`);
        console.log(`   Valor debitado: R$ ${valorDebitado.toFixed(2)}`);
        console.log(`   Diferença: R$ ${diferenca.toFixed(2)}`);
        
        if (diferenca > 0.01) {
          console.log(`   ❌ PROBLEMA: Valor debitado não confere!`);
        } else {
          console.log(`   ✅ Valores consistentes`);
        }
        console.log('');
      });
    }

    // Verificar saldo atual do usuário
    const usuario = await prisma.user.findUnique({
      where: { id: userId },
      select: { saldo: true, nome: true, email: true }
    });

    if (usuario) {
      console.log('👤 SALDO ATUAL DO USUÁRIO:');
      console.log('---------------------------');
      console.log(`Nome: ${usuario.nome}`);
      console.log(`Email: ${usuario.email}`);
      console.log(`Saldo: R$ ${parseFloat(usuario.saldo).toFixed(2)}`);
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarTransacaoRecente();
