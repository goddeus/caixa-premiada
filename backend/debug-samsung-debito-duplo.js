const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugSamsungDebitoDuplo() {
  try {
    console.log('🔍 DEBUG CAIXA SAMSUNG - VERIFICANDO DÉBITO DUPLO');
    console.log('==================================================');

    // 1. Buscar a caixa Samsung
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
    console.log(`   Preço: R$ ${caixaSamsung.preco.toFixed(2)}`);
    console.log('');

    // 2. Verificar transações recentes (últimos 5 minutos)
    const agora = new Date();
    const cincoMinutosAtras = new Date(agora.getTime() - 5 * 60 * 1000);

    const transacoesRecentes = await prisma.transaction.findMany({
      where: {
        case_id: caixaSamsung.id,
        criado_em: {
          gte: cincoMinutosAtras
        }
      },
      orderBy: { criado_em: 'desc' }
    });

    console.log('📊 TRANSAÇÕES RECENTES (últimos 5 minutos):');
    console.log('--------------------------------------------');
    
    if (transacoesRecentes.length === 0) {
      console.log('   Nenhuma transação recente encontrada');
    } else {
      // Agrupar por segundo para detectar duplicatas
      const transacoesPorSegundo = {};
      
      transacoesRecentes.forEach(t => {
        const segundo = t.criado_em.toISOString().substring(0, 19);
        if (!transacoesPorSegundo[segundo]) {
          transacoesPorSegundo[segundo] = [];
        }
        transacoesPorSegundo[segundo].push(t);
      });

      // Verificar duplicatas
      let duplicatasEncontradas = 0;
      Object.entries(transacoesPorSegundo).forEach(([segundo, transacoes]) => {
        if (transacoes.length > 1) {
          console.log(`⚠️  ${transacoes.length} transações no mesmo segundo: ${segundo}`);
          duplicatasEncontradas += transacoes.length - 1;
        }
      });

      if (duplicatasEncontradas > 0) {
        console.log(`🚨 ${duplicatasEncontradas} transações duplicadas encontradas!`);
      } else {
        console.log('✅ Nenhuma duplicata detectada');
      }

      // Mostrar detalhes das transações
      transacoesRecentes.forEach((t, index) => {
        const valorAbsoluto = Math.abs(parseFloat(t.valor));
        console.log(`\n${index + 1}. ${t.tipo.toUpperCase()}`);
        console.log(`   Valor: R$ ${valorAbsoluto.toFixed(2)}`);
        console.log(`   Descrição: ${t.descricao}`);
        console.log(`   Data: ${t.criado_em.toLocaleString()}`);
        console.log(`   User ID: ${t.user_id}`);
      });
    }

    // 3. Verificar se há problema no centralizedDrawService
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
      console.log(`   Diferença: R$ ${Math.abs(valorDebitado - 3.00).toFixed(2)}`);
    }

    // 4. Verificar se há problema no casesController
    console.log('\n🔍 VERIFICANDO CASESCONTROLLER:');
    console.log('--------------------------------');
    
    const casesController = require('./src/controllers/casesController');
    
    // Simular uma compra via API
    const req = {
      params: { id: caixaSamsung.id },
      user: { id: userId }
    };
    
    const res = {
      status: (code) => ({
        json: (data) => {
          console.log(`📡 Resposta da API (status ${code}):`);
          console.log(`   Success: ${data.success}`);
          console.log(`   UserBalance: R$ ${data.userBalance || 'N/A'}`);
          console.log(`   Prize: ${data.wonPrize?.nome || 'N/A'}`);
          console.log(`   Message: ${data.message || 'N/A'}`);
        }
      })
    };
    
    try {
      await casesController.buyCase(req, res);
    } catch (error) {
      console.log('❌ Erro ao chamar casesController.buyCase:', error.message);
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugSamsungDebitoDuplo();

