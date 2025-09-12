const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testeContaNormal() {
  try {
    console.log('🧪 TESTE CONTA NORMAL - CAIXA SAMSUNG');
    console.log('==================================================');

    // 1. Buscar uma conta normal
    const usuarioNormal = await prisma.user.findFirst({
      where: { 
        tipo_conta: 'normal',
        ativo: true 
      },
      select: { id: true, nome: true, email: true, saldo: true, tipo_conta: true }
    });

    if (!usuarioNormal) {
      console.log('❌ Nenhuma conta normal encontrada');
      return;
    }

    console.log('👤 USUÁRIO NORMAL:');
    console.log(`   Nome: ${usuarioNormal.nome}`);
    console.log(`   Email: ${usuarioNormal.email}`);
    console.log(`   Saldo: R$ ${parseFloat(usuarioNormal.saldo).toFixed(2)}`);
    console.log(`   Tipo: ${usuarioNormal.tipo_conta}`);
    console.log(`   ID: ${usuarioNormal.id}`);
    console.log('');

    // 2. Buscar a caixa Samsung
    const caixaSamsung = await prisma.case.findFirst({
      where: { 
        nome: { contains: 'SAMSUNG' },
        ativo: true 
      },
      select: { id: true, nome: true, preco: true }
    });

    console.log('📦 CAIXA SAMSUNG:');
    console.log(`   Nome: ${caixaSamsung.nome}`);
    console.log(`   Preço: R$ ${caixaSamsung.preco.toFixed(2)}`);
    console.log(`   ID: ${caixaSamsung.id}`);
    console.log('');

    // 3. Testar centralizedDrawService
    console.log('🧪 TESTANDO CENTRALIZEDDRAWSERVICE...');
    const centralizedDrawService = require('./src/services/centralizedDrawService');
    
    const resultado = await centralizedDrawService.sortearPremio(caixaSamsung.id, usuarioNormal.id);
    
    console.log('\n📦 RESULTADO DO CENTRALIZEDDRAWSERVICE:');
    console.log(`   Success: ${resultado.success}`);
    console.log(`   UserBalance: R$ ${resultado.userBalance || 'N/A'}`);
    console.log(`   Prize: ${resultado.prize?.nome || 'N/A'}`);
    console.log(`   Prize Value: R$ ${resultado.prize?.valor || 'N/A'}`);
    console.log(`   Message: ${resultado.message || 'N/A'}`);

    // 4. Verificar saldo real após
    const usuarioAtualizado = await prisma.user.findUnique({
      where: { id: usuarioNormal.id },
      select: { saldo: true }
    });
    
    const valorDebitado = parseFloat(usuarioNormal.saldo) - parseFloat(usuarioAtualizado.saldo) + (resultado.prize?.valor || 0);
    
    console.log('\n💰 ANÁLISE DO DÉBITO:');
    console.log(`   Saldo antes: R$ ${parseFloat(usuarioNormal.saldo).toFixed(2)}`);
    console.log(`   Saldo depois: R$ ${parseFloat(usuarioAtualizado.saldo).toFixed(2)}`);
    console.log(`   Valor debitado: R$ ${valorDebitado.toFixed(2)}`);
    console.log(`   Preço esperado: R$ 3.00`);
    
    if (Math.abs(valorDebitado - 3.00) < 0.01) {
      console.log('✅ DÉBITO CORRETO! O backend está funcionando');
    } else {
      console.log('❌ DÉBITO INCORRETO! Há problema no backend');
      console.log(`   Diferença: R$ ${Math.abs(valorDebitado - 3.00).toFixed(2)}`);
    }

    // 5. Verificar se o userBalance retornado está correto
    console.log('\n🔍 VERIFICANDO USERBALANCE:');
    console.log(`   UserBalance retornado: R$ ${resultado.userBalance || 'N/A'}`);
    console.log(`   Saldo real no banco: R$ ${parseFloat(usuarioAtualizado.saldo).toFixed(2)}`);
    
    if (Math.abs((resultado.userBalance || 0) - parseFloat(usuarioAtualizado.saldo)) < 0.01) {
      console.log('✅ USERBALANCE CORRETO!');
    } else {
      console.log('❌ USERBALANCE INCORRETO!');
      console.log(`   Diferença: R$ ${Math.abs((resultado.userBalance || 0) - parseFloat(usuarioAtualizado.saldo)).toFixed(2)}`);
    }

    // 6. Verificar transações criadas
    console.log('\n📊 TRANSAÇÕES CRIADAS:');
    const transacoes = await prisma.transaction.findMany({
      where: {
        case_id: caixaSamsung.id,
        user_id: usuarioNormal.id,
        criado_em: {
          gte: new Date(Date.now() - 2 * 60 * 1000) // Últimos 2 minutos
        }
      },
      orderBy: { criado_em: 'desc' }
    });

    if (transacoes.length === 0) {
      console.log('   Nenhuma transação recente encontrada');
    } else {
      transacoes.forEach((t, index) => {
        const valorAbsoluto = Math.abs(parseFloat(t.valor));
        console.log(`${index + 1}. ${t.tipo.toUpperCase()}`);
        console.log(`   Valor: R$ ${valorAbsoluto.toFixed(2)}`);
        console.log(`   Descrição: ${t.descricao}`);
        console.log(`   Data: ${t.criado_em.toLocaleString()}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testeContaNormal();

