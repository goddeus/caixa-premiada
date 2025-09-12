const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugSamsungPreco() {
  try {
    console.log('🔍 DEBUG CAIXA SAMSUNG - VERIFICANDO PREÇO');
    console.log('==================================================');

    // 1. Verificar preço atual da CAIXA SAMSUNG
    const caixaSamsung = await prisma.case.findFirst({
      where: { 
        nome: { contains: 'SAMSUNG' },
        ativo: true 
      },
      select: { id: true, nome: true, preco: true }
    });

    if (!caixaSamsung) {
      console.log('❌ CAIXA SAMSUNG não encontrada');
      return;
    }

    console.log('📦 CAIXA SAMSUNG:');
    console.log(`   Nome: ${caixaSamsung.nome}`);
    console.log(`   Preço atual: R$ ${caixaSamsung.preco.toFixed(2)}`);
    console.log(`   Preço esperado: R$ 3.00`);
    console.log('');

    // 2. Verificar se há transações recentes com valor incorreto
    const transacoesSamsung = await prisma.transaction.findMany({
      where: {
        case_id: caixaSamsung.id,
        criado_em: {
          gte: new Date(Date.now() - 10 * 60 * 1000) // Últimos 10 minutos
        }
      },
      orderBy: { criado_em: 'desc' },
      take: 5
    });

    console.log('📊 TRANSAÇÕES RECENTES DA CAIXA SAMSUNG:');
    console.log('----------------------------------------');
    
    if (transacoesSamsung.length === 0) {
      console.log('   Nenhuma transação recente encontrada');
    } else {
      transacoesSamsung.forEach((t, index) => {
        const valorAbsoluto = Math.abs(parseFloat(t.valor));
        console.log(`${index + 1}. ${t.tipo.toUpperCase()}`);
        console.log(`   Valor: R$ ${valorAbsoluto.toFixed(2)}`);
        console.log(`   Descrição: ${t.descricao}`);
        console.log(`   Data: ${t.criado_em.toLocaleString()}`);
        console.log('');
      });
    }

    // 3. Verificar se o preço está correto
    const precoAtual = parseFloat(caixaSamsung.preco);
    const precoEsperado = 3.00;
    const diferenca = Math.abs(precoAtual - precoEsperado);

    if (diferenca > 0.01) {
      console.log('❌ PROBLEMA: Preço incorreto!');
      console.log(`   Preço atual: R$ ${precoAtual.toFixed(2)}`);
      console.log(`   Preço esperado: R$ ${precoEsperado.toFixed(2)}`);
      console.log(`   Diferença: R$ ${diferenca.toFixed(2)}`);
      
      // Corrigir preço
      await prisma.case.update({
        where: { id: caixaSamsung.id },
        data: { preco: precoEsperado }
      });
      
      console.log('✅ Preço corrigido para R$ 3.00');
    } else {
      console.log('✅ Preço já está correto');
    }

    // 4. Verificar se há problema no centralizedDrawService
    console.log('\n🧪 TESTANDO CENTRALIZEDDRAWSERVICE:');
    console.log('-----------------------------------');
    
    const centralizedDrawService = require('./src/services/centralizedDrawService');
    
    const userId = 'cd325b64-eca7-4adf-bc77-7022473126b2'; // junior@admin.com
    
    const saldoAntes = await prisma.user.findUnique({
      where: { id: userId },
      select: { saldo: true }
    });

    console.log(`💰 Saldo antes do teste: R$ ${parseFloat(saldoAntes.saldo).toFixed(2)}`);
    
    const resultado = await centralizedDrawService.sortearPremio(caixaSamsung.id, userId);
    
    console.log('📦 Resultado do centralizedDrawService:');
    console.log(`   Success: ${resultado.success}`);
    console.log(`   UserBalance: R$ ${resultado.userBalance || 'N/A'}`);
    console.log(`   Prize: ${resultado.prize?.nome || 'N/A'}`);
    
    // Verificar saldo real após
    const saldoDepois = await prisma.user.findUnique({
      where: { id: userId },
      select: { saldo: true }
    });
    
    const valorDebitado = parseFloat(saldoAntes.saldo) - parseFloat(saldoDepois.saldo) + (resultado.prize?.valor || 0);
    
    console.log('\n💰 ANÁLISE DO DÉBITO:');
    console.log(`   Saldo antes: R$ ${parseFloat(saldoAntes.saldo).toFixed(2)}`);
    console.log(`   Saldo depois: R$ ${parseFloat(saldoDepois.saldo).toFixed(2)}`);
    console.log(`   Valor debitado: R$ ${valorDebitado.toFixed(2)}`);
    console.log(`   Preço esperado: R$ 3.00`);
    
    if (Math.abs(valorDebitado - 3.00) < 0.01) {
      console.log('✅ DÉBITO CORRETO! A CAIXA SAMSUNG está funcionando');
    } else {
      console.log('❌ DÉBITO INCORRETO! Há problema com a CAIXA SAMSUNG');
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugSamsungPreco();
