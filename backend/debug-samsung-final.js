const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugSamsungFinal() {
  try {
    console.log('🔍 DEBUG SAMSUNG FINAL - ANÁLISE COMPLETA');
    console.log('==================================================');

    // 1. Verificar se o servidor está rodando
    console.log('🔍 VERIFICANDO SERVIDOR...');
    try {
      const axios = require('axios');
      await axios.get('http://localhost:3001/health');
      console.log('✅ Servidor está rodando');
    } catch (error) {
      console.log('❌ Servidor não está rodando ou não responde');
      console.log('   Inicie o servidor com: npm run dev');
      return;
    }

    // 2. Buscar a caixa Samsung
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

    console.log('\n📦 CAIXA SAMSUNG:');
    console.log(`   Nome: ${caixaSamsung.nome}`);
    console.log(`   Preço: R$ ${caixaSamsung.preco.toFixed(2)}`);
    console.log(`   ID: ${caixaSamsung.id}`);

    // 3. Verificar usuários disponíveis
    console.log('\n👥 USUÁRIOS DISPONÍVEIS:');
    const usuarios = await prisma.user.findMany({
      where: { ativo: true },
      select: { id: true, nome: true, email: true, saldo: true, tipo_conta: true },
      take: 5
    });

    usuarios.forEach((u, index) => {
      console.log(`${index + 1}. ${u.nome} (${u.email})`);
      console.log(`   Saldo: R$ ${parseFloat(u.saldo).toFixed(2)}`);
      console.log(`   Tipo: ${u.tipo_conta}`);
      console.log(`   ID: ${u.id}`);
      console.log('');
    });

    // 4. Testar com o primeiro usuário
    const usuarioTeste = usuarios[0];
    if (!usuarioTeste) {
      console.log('❌ Nenhum usuário encontrado');
      return;
    }

    console.log(`\n🧪 TESTANDO COM USUÁRIO: ${usuarioTeste.nome}`);
    console.log(`   Saldo antes: R$ ${parseFloat(usuarioTeste.saldo).toFixed(2)}`);

    // 5. Testar centralizedDrawService
    const centralizedDrawService = require('./src/services/centralizedDrawService');
    
    const resultado = await centralizedDrawService.sortearPremio(caixaSamsung.id, usuarioTeste.id);
    
    console.log('\n📦 RESULTADO DO CENTRALIZEDDRAWSERVICE:');
    console.log(`   Success: ${resultado.success}`);
    console.log(`   UserBalance: R$ ${resultado.userBalance || 'N/A'}`);
    console.log(`   Prize: ${resultado.prize?.nome || 'N/A'}`);
    console.log(`   Prize Value: R$ ${resultado.prize?.valor || 'N/A'}`);
    console.log(`   Message: ${resultado.message || 'N/A'}`);

    // 6. Verificar saldo real após
    const usuarioAtualizado = await prisma.user.findUnique({
      where: { id: usuarioTeste.id },
      select: { saldo: true }
    });
    
    const valorDebitado = parseFloat(usuarioTeste.saldo) - parseFloat(usuarioAtualizado.saldo) + (resultado.prize?.valor || 0);
    
    console.log('\n💰 ANÁLISE DO DÉBITO:');
    console.log(`   Saldo antes: R$ ${parseFloat(usuarioTeste.saldo).toFixed(2)}`);
    console.log(`   Saldo depois: R$ ${parseFloat(usuarioAtualizado.saldo).toFixed(2)}`);
    console.log(`   Valor debitado: R$ ${valorDebitado.toFixed(2)}`);
    console.log(`   Preço esperado: R$ 3.00`);
    
    if (Math.abs(valorDebitado - 3.00) < 0.01) {
      console.log('✅ DÉBITO CORRETO! O backend está funcionando');
    } else {
      console.log('❌ DÉBITO INCORRETO! Há problema no backend');
      console.log(`   Diferença: R$ ${Math.abs(valorDebitado - 3.00).toFixed(2)}`);
    }

    // 7. Verificar se o userBalance retornado está correto
    console.log('\n🔍 VERIFICANDO USERBALANCE:');
    console.log(`   UserBalance retornado: R$ ${resultado.userBalance || 'N/A'}`);
    console.log(`   Saldo real no banco: R$ ${parseFloat(usuarioAtualizado.saldo).toFixed(2)}`);
    
    if (Math.abs((resultado.userBalance || 0) - parseFloat(usuarioAtualizado.saldo)) < 0.01) {
      console.log('✅ USERBALANCE CORRETO!');
    } else {
      console.log('❌ USERBALANCE INCORRETO!');
      console.log(`   Diferença: R$ ${Math.abs((resultado.userBalance || 0) - parseFloat(usuarioAtualizado.saldo)).toFixed(2)}`);
    }

    // 8. Verificar transações criadas
    console.log('\n📊 TRANSAÇÕES CRIADAS:');
    const transacoes = await prisma.transaction.findMany({
      where: {
        case_id: caixaSamsung.id,
        user_id: usuarioTeste.id,
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

    // 9. Conclusão
    console.log('\n📋 CONCLUSÃO:');
    if (Math.abs(valorDebitado - 3.00) < 0.01) {
      console.log('✅ O backend está funcionando corretamente');
      console.log('   O problema deve estar no frontend ou na comunicação');
      console.log('   Verifique se o frontend está fazendo a requisição correta');
    } else {
      console.log('❌ Há problema no backend');
      console.log('   O centralizedDrawService não está debitando corretamente');
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugSamsungFinal();

