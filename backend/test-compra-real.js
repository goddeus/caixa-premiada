const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const prisma = new PrismaClient();

async function testarCompraReal() {
  try {
    console.log('🧪 TESTANDO COMPRA REAL DE CAIXA');
    console.log('==================================================');

    // 1. Buscar um usuário de teste
    const user = await prisma.user.findFirst({
      where: { 
        tipo_conta: { not: 'afiliado_demo' },
        saldo: { gt: 0 }
      },
      select: { id: true, email: true, saldo: true }
    });

    if (!user) {
      console.log('❌ Nenhum usuário encontrado para teste');
      return;
    }

    console.log(`👤 Usuário de teste: ${user.email}`);
    console.log(`💰 Saldo atual: R$ ${parseFloat(user.saldo).toFixed(2)}`);

    // 2. Buscar a CAIXA FINAL DE SEMANA
    const weekendCase = await prisma.case.findFirst({
      where: { nome: 'CAIXA FINAL DE SEMANA' },
      select: { id: true, nome: true, preco: true }
    });

    if (!weekendCase) {
      console.log('❌ CAIXA FINAL DE SEMANA não encontrada');
      return;
    }

    console.log(`📦 Caixa: ${weekendCase.nome}`);
    console.log(`💰 Preço: R$ ${parseFloat(weekendCase.preco).toFixed(2)}`);

    // 3. Simular compra usando o sistema de sorteio diretamente
    console.log('\n🎲 Testando sistema de sorteio...');
    const centralizedDrawService = require('./src/services/centralizedDrawService');
    
    const saldoAntes = parseFloat(user.saldo);
    console.log(`💰 Saldo antes: R$ ${saldoAntes.toFixed(2)}`);

    const drawResult = await centralizedDrawService.sortearPremio(weekendCase.id, user.id);
    
    console.log('📊 Resultado do sorteio:');
    console.log(`   Sucesso: ${drawResult.success}`);
    console.log(`   Prêmio: ${drawResult.prize?.nome}`);
    console.log(`   Valor: R$ ${parseFloat(drawResult.prize?.valor || 0).toFixed(2)}`);
    console.log(`   Saldo após: R$ ${parseFloat(drawResult.userBalance || 0).toFixed(2)}`);

    // 4. Verificar transações criadas
    const transacoes = await prisma.transaction.findMany({
      where: {
        user_id: user.id,
        case_id: weekendCase.id,
        criado_em: {
          gte: new Date(Date.now() - 60000) // Último minuto
        }
      },
      orderBy: { criado_em: 'desc' },
      take: 5
    });

    console.log('\n📋 Transações criadas:');
    transacoes.forEach((transacao, index) => {
      const valorAbsoluto = Math.abs(parseFloat(transacao.valor));
      console.log(`${index + 1}. ${transacao.tipo}: R$ ${valorAbsoluto.toFixed(2)}`);
      console.log(`   Descrição: ${transacao.descricao}`);
      console.log(`   Data: ${transacao.criado_em.toLocaleString()}`);
      console.log('');
    });

    // 5. Verificar se o valor debitado está correto
    const transacaoAbertura = transacoes.find(t => t.tipo === 'abertura_caixa');
    if (transacaoAbertura) {
      const valorDebitado = Math.abs(parseFloat(transacaoAbertura.valor));
      const precoEsperado = parseFloat(weekendCase.preco);
      
      console.log('🔍 VERIFICAÇÃO DE PREÇO:');
      console.log(`   Preço esperado: R$ ${precoEsperado.toFixed(2)}`);
      console.log(`   Valor debitado: R$ ${valorDebitado.toFixed(2)}`);
      console.log(`   Diferença: R$ ${Math.abs(valorDebitado - precoEsperado).toFixed(2)}`);
      
      if (Math.abs(valorDebitado - precoEsperado) > 0.01) {
        console.log('❌ PROBLEMA DETECTADO: Valor debitado não confere com preço da caixa!');
      } else {
        console.log('✅ Valor debitado está correto');
      }
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testarCompraReal();
