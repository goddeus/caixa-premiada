const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function corrigirTodosSaldos() {
  try {
    console.log('🔧 CORRIGINDO TODOS OS SALDOS INCONSISTENTES');
    console.log('==================================================');

    // 1. Buscar todos os usuários
    const todosUsuarios = await prisma.user.findMany({
      select: { id: true, nome: true, email: true, saldo: true }
    });

    console.log(`👥 Total de usuários encontrados: ${todosUsuarios.length}\n`);

    let usuariosCorrigidos = 0;
    let totalProblemas = 0;

    // 2. Verificar e corrigir cada usuário
    for (const usuario of todosUsuarios) {
      console.log(`🔍 Verificando ${usuario.nome} (${usuario.email})...`);

      // Buscar todas as transações do usuário
      const transacoes = await prisma.transaction.findMany({
        where: { user_id: usuario.id },
        orderBy: { criado_em: 'asc' }
      });

      // Calcular saldo correto
      let saldoCalculado = 0;
      transacoes.forEach(transacao => {
        saldoCalculado += parseFloat(transacao.valor);
      });

      const saldoAtual = parseFloat(usuario.saldo);
      const diferenca = Math.abs(saldoCalculado - saldoAtual);

      console.log(`   Saldo atual: R$ ${saldoAtual.toFixed(2)}`);
      console.log(`   Saldo calculado: R$ ${saldoCalculado.toFixed(2)}`);
      console.log(`   Diferença: R$ ${diferenca.toFixed(2)}`);

      if (diferenca > 0.01) {
        console.log(`   ❌ PROBLEMA DETECTADO - Corrigindo...`);
        
        // Corrigir saldo na tabela user
        await prisma.user.update({
          where: { id: usuario.id },
          data: { saldo: saldoCalculado }
        });

        // Sincronizar com wallet (criar se não existir)
        await prisma.wallet.upsert({
          where: { user_id: usuario.id },
          update: { saldo: saldoCalculado },
          create: { 
            user_id: usuario.id, 
            saldo: saldoCalculado 
          }
        });

        console.log(`   ✅ Saldo corrigido para R$ ${saldoCalculado.toFixed(2)}`);
        usuariosCorrigidos++;
        totalProblemas += diferenca;
      } else {
        console.log(`   ✅ Saldo já está correto`);
      }
      console.log('');
    }

    // 3. Verificar transações duplicadas
    console.log('🔍 VERIFICANDO TRANSAÇÕES DUPLICADAS:');
    console.log('=====================================');

    const transacoesAbertura = await prisma.transaction.findMany({
      where: {
        tipo: 'abertura_caixa',
        criado_em: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      },
      orderBy: { criado_em: 'asc' }
    });

    // Agrupar por data e usuário
    const transacoesPorDataUsuario = {};
    transacoesAbertura.forEach(transacao => {
      const chave = `${transacao.user_id}_${transacao.criado_em.toISOString().substring(0, 19)}`;
      if (!transacoesPorDataUsuario[chave]) {
        transacoesPorDataUsuario[chave] = [];
      }
      transacoesPorDataUsuario[chave].push(transacao);
    });

    let duplicatasEncontradas = 0;
    Object.entries(transacoesPorDataUsuario).forEach(([chave, transacoes]) => {
      if (transacoes.length > 1) {
        duplicatasEncontradas += transacoes.length - 1;
        console.log(`⚠️ ${transacoes.length} transações duplicadas: ${chave}`);
      }
    });

    if (duplicatasEncontradas > 0) {
      console.log(`\n🚨 Total de transações duplicadas: ${duplicatasEncontradas}`);
      console.log('💡 Essas duplicatas foram causadas pelo débito duplo que já foi corrigido');
    } else {
      console.log('✅ Nenhuma transação duplicada encontrada');
    }

    // 4. Resumo final
    console.log('\n📋 RESUMO DA CORREÇÃO:');
    console.log('======================');
    console.log(`👥 Usuários verificados: ${todosUsuarios.length}`);
    console.log(`🔧 Usuários corrigidos: ${usuariosCorrigidos}`);
    console.log(`💰 Total de problemas corrigidos: R$ ${totalProblemas.toFixed(2)}`);
    console.log(`🔄 Transações duplicadas: ${duplicatasEncontradas}`);

    if (usuariosCorrigidos > 0) {
      console.log('\n✅ CORREÇÃO CONCLUÍDA COM SUCESSO!');
      console.log('💡 Todos os saldos foram sincronizados com as transações reais');
    } else {
      console.log('\n✅ Nenhuma correção necessária - todos os saldos já estavam corretos');
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

corrigirTodosSaldos();
