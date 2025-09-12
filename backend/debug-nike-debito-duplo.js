const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugNikeDebitoDuplo() {
  try {
    console.log('🔍 DEBUG CAIXA NIKE - VERIFICANDO DÉBITO DUPLO');
    console.log('==================================================');

    const userId = 'cd325b64-eca7-4adf-bc77-7022473126b2'; // junior@admin.com
    
    // 1. Verificar saldo atual
    const usuario = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        nome: true, 
        email: true, 
        saldo: true,
        tipo_conta: true
      }
    });

    console.log('👤 USUÁRIO ATUAL:');
    console.log(`   Nome: ${usuario.nome}`);
    console.log(`   Email: ${usuario.email}`);
    console.log(`   Saldo: R$ ${parseFloat(usuario.saldo).toFixed(2)}`);
    console.log(`   Tipo: ${usuario.tipo_conta}`);
    console.log('');

    // 2. Verificar transações recentes da CAIXA NIKE
    const transacoesNike = await prisma.transaction.findMany({
      where: {
        user_id: userId,
        case_id: {
          in: await prisma.case.findMany({
            where: { nome: { contains: 'NIKE' } },
            select: { id: true }
          }).then(cases => cases.map(c => c.id))
        },
        criado_em: {
          gte: new Date(Date.now() - 30 * 60 * 1000) // Últimos 30 minutos
        }
      },
      orderBy: { criado_em: 'desc' }
    });

    console.log('📊 TRANSAÇÕES RECENTES DA CAIXA NIKE:');
    console.log('--------------------------------------');
    
    if (transacoesNike.length === 0) {
      console.log('   Nenhuma transação da CAIXA NIKE encontrada');
    } else {
      transacoesNike.forEach((t, index) => {
        const valorAbsoluto = Math.abs(parseFloat(t.valor));
        console.log(`${index + 1}. ${t.tipo.toUpperCase()}`);
        console.log(`   Valor: R$ ${valorAbsoluto.toFixed(2)}`);
        console.log(`   Descrição: ${t.descricao}`);
        console.log(`   Data: ${t.criado_em.toLocaleString()}`);
        console.log('');
      });
    }

    // 3. Verificar se há transações duplicadas
    const transacoesAbertura = transacoesNike.filter(t => t.tipo === 'abertura_caixa');
    
    if (transacoesAbertura.length > 0) {
      console.log('🎲 TRANSAÇÕES DE ABERTURA DA CAIXA NIKE:');
      console.log('----------------------------------------');
      
      // Agrupar por data
      const transacoesPorData = {};
      transacoesAbertura.forEach(transacao => {
        const data = transacao.criado_em.toISOString().substring(0, 19);
        if (!transacoesPorData[data]) {
          transacoesPorData[data] = [];
        }
        transacoesPorData[data].push(transacao);
      });

      let duplicatasEncontradas = 0;
      Object.entries(transacoesPorData).forEach(([data, transacoes]) => {
        if (transacoes.length > 1) {
          console.log(`⚠️ ${transacoes.length} transações no mesmo segundo: ${data}`);
          transacoes.forEach((t, index) => {
            console.log(`   ${index + 1}. ${t.descricao} - R$ ${Math.abs(parseFloat(t.valor)).toFixed(2)}`);
          });
          duplicatasEncontradas += transacoes.length - 1;
        }
      });

      if (duplicatasEncontradas > 0) {
        console.log(`\n🚨 Total de transações duplicadas: ${duplicatasEncontradas}`);
        console.log('💡 Isso confirma o débito duplo na CAIXA NIKE');
      } else {
        console.log('✅ Nenhuma transação duplicada encontrada');
      }
    }

    // 4. Testar compra da CAIXA NIKE
    console.log('\n🧪 TESTANDO COMPRA DA CAIXA NIKE:');
    console.log('----------------------------------');
    
    const centralizedDrawService = require('./src/services/centralizedDrawService');
    
    // Buscar CAIXA NIKE
    const caixaNike = await prisma.case.findFirst({
      where: { 
        nome: { contains: 'NIKE' },
        ativo: true 
      },
      select: { id: true, nome: true, preco: true }
    });

    if (caixaNike) {
      console.log(`📦 Testando com: ${caixaNike.nome} (R$ ${caixaNike.preco})`);
      
      const saldoAntes = parseFloat(usuario.saldo);
      console.log(`💰 Saldo antes do teste: R$ ${saldoAntes.toFixed(2)}`);
      
      const resultado = await centralizedDrawService.sortearPremio(caixaNike.id, userId);
      
      console.log('📦 Resultado do centralizedDrawService:');
      console.log(`   Success: ${resultado.success}`);
      console.log(`   Is Demo: ${resultado.is_demo || false}`);
      console.log(`   UserBalance: R$ ${resultado.userBalance || 'N/A'}`);
      console.log(`   Prize: ${resultado.prize?.nome || 'N/A'}`);
      
      // Verificar saldo real após
      const usuarioDepois = await prisma.user.findUnique({
        where: { id: userId },
        select: { saldo: true }
      });
      
      const saldoDepois = parseFloat(usuarioDepois.saldo);
      const valorDebitado = saldoAntes - saldoDepois + (resultado.prize?.valor || 0);
      const precoEsperado = parseFloat(caixaNike.preco);
      
      console.log('\n💰 ANÁLISE DO DÉBITO:');
      console.log(`   Saldo antes: R$ ${saldoAntes.toFixed(2)}`);
      console.log(`   Saldo depois: R$ ${saldoDepois.toFixed(2)}`);
      console.log(`   Valor debitado: R$ ${valorDebitado.toFixed(2)}`);
      console.log(`   Preço esperado: R$ ${precoEsperado.toFixed(2)}`);
      
      if (Math.abs(valorDebitado - precoEsperado) < 0.01) {
        console.log('✅ DÉBITO CORRETO! A CAIXA NIKE está funcionando');
      } else {
        console.log('❌ DÉBITO INCORRETO! Há problema com a CAIXA NIKE');
        console.log(`   Diferença: R$ ${Math.abs(valorDebitado - precoEsperado).toFixed(2)}`);
      }
    } else {
      console.log('❌ CAIXA NIKE não encontrada');
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugNikeDebitoDuplo();
