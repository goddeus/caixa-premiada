const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verificarContaDemo() {
  try {
    console.log('🔍 VERIFICANDO CONTA DEMO');
    console.log('==================================================');

    // 1. Buscar usuário junior
    const usuario = await prisma.user.findUnique({
      where: { email: 'junior@admin.com' },
      select: { 
        id: true,
        nome: true, 
        email: true, 
        saldo: true,
        saldo_demo: true,
        tipo_conta: true
      }
    });

    if (!usuario) {
      console.log('❌ Usuário não encontrado');
      return;
    }

    console.log('👤 USUÁRIO JUNIOR:');
    console.log(`   Nome: ${usuario.nome}`);
    console.log(`   Email: ${usuario.email}`);
    console.log(`   Saldo real: R$ ${parseFloat(usuario.saldo).toFixed(2)}`);
    console.log(`   Saldo demo: R$ ${parseFloat(usuario.saldo_demo).toFixed(2)}`);
    console.log(`   Tipo de conta: ${usuario.tipo_conta}`);
    console.log('');

    // 2. Verificar transações recentes
    const transacoesRecentes = await prisma.transaction.findMany({
      where: {
        user_id: usuario.id,
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

    // 3. Verificar se há transações demo
    const transacoesDemo = transacoesRecentes.filter(t => t.tipo.includes('demo'));
    
    if (transacoesDemo.length > 0) {
      console.log('🎭 TRANSAÇÕES DEMO ENCONTRADAS:');
      console.log('-------------------------------');
      transacoesDemo.forEach((t, index) => {
        const valorAbsoluto = Math.abs(parseFloat(t.valor));
        console.log(`${index + 1}. ${t.tipo.toUpperCase()}`);
        console.log(`   Valor: R$ ${valorAbsoluto.toFixed(2)}`);
        console.log(`   Descrição: ${t.descricao}`);
        console.log(`   Data: ${t.criado_em.toLocaleString()}`);
        console.log('');
      });
    }

    // 4. Verificar se o usuário está sendo tratado como demo
    if (usuario.tipo_conta === 'afiliado_demo') {
      console.log('❌ PROBLEMA: Usuário está configurado como conta demo!');
      console.log('💡 Solução: Alterar tipo_conta para "normal"');
      
      // Corrigir tipo de conta
      await prisma.user.update({
        where: { id: usuario.id },
        data: { tipo_conta: 'normal' }
      });
      
      console.log('✅ Tipo de conta alterado para "normal"');
    } else {
      console.log('✅ Usuário já está configurado como conta normal');
    }

    // 5. Verificar se há problema no centralizedDrawService
    console.log('\n🔍 TESTANDO CENTRALIZEDDRAWSERVICE:');
    console.log('-----------------------------------');
    
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
      
      const resultado = await centralizedDrawService.sortearPremio(caixaWeekend.id, usuario.id);
      
      console.log('📦 Resultado do centralizedDrawService:');
      console.log(`   Success: ${resultado.success}`);
      console.log(`   Is Demo: ${resultado.is_demo || false}`);
      console.log(`   UserBalance: R$ ${resultado.userBalance || 'N/A'}`);
      console.log(`   Prize: ${resultado.prize?.nome || 'N/A'}`);
      
      // Verificar saldo real após
      const usuarioDepois = await prisma.user.findUnique({
        where: { id: usuario.id },
        select: { saldo: true, saldo_demo: true }
      });
      
      const saldoDepois = parseFloat(usuarioDepois.saldo);
      const saldoDemoDepois = parseFloat(usuarioDepois.saldo_demo);
      
      console.log(`💰 Saldo real após: R$ ${saldoDepois.toFixed(2)}`);
      console.log(`💰 Saldo demo após: R$ ${saldoDemoDepois.toFixed(2)}`);
      
      if (resultado.is_demo) {
        console.log('❌ PROBLEMA: Sistema está tratando como conta demo!');
      } else {
        console.log('✅ Sistema está tratando como conta normal');
      }
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarContaDemo();
