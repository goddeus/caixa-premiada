const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugApiResponse() {
  try {
    console.log('🔍 DEBUG API RESPONSE - VERIFICANDO SALDO RETORNADO');
    console.log('==================================================');

    const userId = 'cd325b64-eca7-4adf-bc77-7022473126b2'; // junior@admin.com
    
    // 1. Verificar saldo atual no banco
    const usuario = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        nome: true, 
        email: true, 
        saldo: true,
        tipo_conta: true
      }
    });

    console.log('👤 USUÁRIO NO BANCO:');
    console.log(`   Nome: ${usuario.nome}`);
    console.log(`   Email: ${usuario.email}`);
    console.log(`   Saldo: R$ ${parseFloat(usuario.saldo).toFixed(2)}`);
    console.log(`   Tipo: ${usuario.tipo_conta}`);
    console.log('');

    // 2. Verificar saldo na tabela wallet
    const wallet = await prisma.wallet.findUnique({
      where: { user_id: userId },
      select: { saldo: true }
    });

    if (wallet) {
      console.log('💰 WALLET:');
      console.log(`   Saldo: R$ ${parseFloat(wallet.saldo).toFixed(2)}`);
    } else {
      console.log('❌ Wallet não encontrado');
    }
    console.log('');

    // 3. Verificar transações recentes
    const transacoesRecentes = await prisma.transaction.findMany({
      where: {
        user_id: userId,
        criado_em: {
          gte: new Date(Date.now() - 10 * 60 * 1000) // Últimos 10 minutos
        }
      },
      orderBy: { criado_em: 'desc' },
      take: 5
    });

    console.log('📊 TRANSAÇÕES RECENTES:');
    console.log('------------------------');
    
    if (transacoesRecentes.length === 0) {
      console.log('   Nenhuma transação encontrada');
    } else {
      transacoesRecentes.forEach((t, index) => {
        const valorAbsoluto = Math.abs(parseFloat(t.valor));
        console.log(`${index + 1}. ${t.tipo.toUpperCase()}`);
        console.log(`   Valor: R$ ${valorAbsoluto.toFixed(2)}`);
        console.log(`   Descrição: ${t.descricao}`);
        console.log(`   Data: ${t.criado_em.toLocaleString()}`);
        console.log('');
      });
    }

    // 4. Calcular saldo baseado nas transações
    const todasTransacoes = await prisma.transaction.findMany({
      where: { user_id: userId },
      orderBy: { criado_em: 'asc' }
    });

    let saldoCalculado = 0;
    todasTransacoes.forEach(transacao => {
      saldoCalculado += parseFloat(transacao.valor);
    });

    console.log('🧮 CÁLCULO MANUAL:');
    console.log('------------------');
    console.log(`   Saldo calculado: R$ ${saldoCalculado.toFixed(2)}`);
    console.log(`   Saldo no banco: R$ ${parseFloat(usuario.saldo).toFixed(2)}`);
    console.log(`   Diferença: R$ ${Math.abs(saldoCalculado - parseFloat(usuario.saldo)).toFixed(2)}`);
    console.log('');

    // 5. Verificar se há problema no centralizedDrawService
    console.log('🔍 VERIFICANDO CENTRALIZEDDRAWSERVICE:');
    console.log('--------------------------------------');
    
    const centralizedDrawService = require('./src/services/centralizedDrawService');
    
    // Buscar CAIXA FINAL DE SEMANA
    const caixaWeekend = await prisma.case.findFirst({
      where: { 
        nome: 'CAIXA FINAL DE SEMANA',
        ativo: true 
      },
      select: { id: true, nome: true, preco: true }
    });

    if (caixaWeekend) {
      console.log(`📦 Testando com: ${caixaWeekend.nome} (R$ ${caixaWeekend.preco})`);
      
      const saldoAntes = parseFloat(usuario.saldo);
      console.log(`💰 Saldo antes do teste: R$ ${saldoAntes.toFixed(2)}`);
      
      const resultado = await centralizedDrawService.sortearPremio(caixaWeekend.id, userId);
      
      console.log('📦 Resultado do centralizedDrawService:');
      console.log(`   Success: ${resultado.success}`);
      console.log(`   UserBalance retornado: R$ ${resultado.userBalance || 'N/A'}`);
      console.log(`   Prize: ${resultado.prize?.nome || 'N/A'}`);
      
      // Verificar saldo real após
      const usuarioDepois = await prisma.user.findUnique({
        where: { id: userId },
        select: { saldo: true }
      });
      
      const saldoDepois = parseFloat(usuarioDepois.saldo);
      console.log(`💰 Saldo real após: R$ ${saldoDepois.toFixed(2)}`);
      
      if (resultado.userBalance && Math.abs(resultado.userBalance - saldoDepois) > 0.01) {
        console.log('❌ PROBLEMA: UserBalance retornado não confere com saldo real!');
        console.log(`   UserBalance: R$ ${resultado.userBalance.toFixed(2)}`);
        console.log(`   Saldo real: R$ ${saldoDepois.toFixed(2)}`);
        console.log(`   Diferença: R$ ${Math.abs(resultado.userBalance - saldoDepois).toFixed(2)}`);
      } else {
        console.log('✅ UserBalance retornado confere com saldo real');
      }
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugApiResponse();
