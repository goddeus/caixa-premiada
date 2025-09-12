const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function corrigirSaldoUsuario() {
  try {
    console.log('🔧 CORRIGINDO SALDO DO USUÁRIO AFETADO PELO DÉBITO DUPLO');
    console.log('==================================================');

    const userId = 'cd325b64-eca7-4adf-bc77-7022473126b2';
    
    // 1. Calcular saldo correto baseado nas transações
    const todasTransacoes = await prisma.transaction.findMany({
      where: {
        user_id: userId
      },
      orderBy: { criado_em: 'asc' }
    });

    console.log(`📊 Total de transações encontradas: ${todasTransacoes.length}`);

    // 2. Calcular saldo correto
    let saldoCorreto = 0;
    todasTransacoes.forEach(transacao => {
      saldoCorreto += parseFloat(transacao.valor);
    });

    console.log(`💰 Saldo calculado pelas transações: R$ ${saldoCorreto.toFixed(2)}`);

    // 3. Verificar saldo atual
    const usuario = await prisma.user.findUnique({
      where: { id: userId },
      select: { saldo: true, nome: true, email: true }
    });

    console.log(`💰 Saldo atual no banco: R$ ${parseFloat(usuario.saldo).toFixed(2)}`);
    console.log(`📊 Diferença: R$ ${Math.abs(saldoCorreto - parseFloat(usuario.saldo)).toFixed(2)}`);

    // 4. Corrigir saldo
    if (Math.abs(saldoCorreto - parseFloat(usuario.saldo)) > 0.01) {
      console.log('\n🔧 Corrigindo saldo...');
      
      await prisma.user.update({
        where: { id: userId },
        data: { saldo: saldoCorreto }
      });

      // Sincronizar com wallet
      await prisma.wallet.update({
        where: { user_id: userId },
        data: { saldo: saldoCorreto }
      });

      console.log('✅ Saldo corrigido com sucesso!');
      console.log(`💰 Novo saldo: R$ ${saldoCorreto.toFixed(2)}`);
    } else {
      console.log('✅ Saldo já está correto');
    }

    // 5. Verificar se há transações duplicadas
    console.log('\n🔍 VERIFICANDO TRANSAÇÕES DUPLICADAS:');
    console.log('-------------------------------------');
    
    const transacoesAbertura = todasTransacoes.filter(t => t.tipo === 'abertura_caixa');
    const transacoesPorData = {};
    
    transacoesAbertura.forEach(transacao => {
      const data = transacao.criado_em.toISOString().substring(0, 19); // YYYY-MM-DDTHH:mm:ss
      if (!transacoesPorData[data]) {
        transacoesPorData[data] = [];
      }
      transacoesPorData[data].push(transacao);
    });

    let duplicatasEncontradas = 0;
    Object.entries(transacoesPorData).forEach(([data, transacoes]) => {
      if (transacoes.length > 1) {
        console.log(`⚠️ ${transacoes.length} transações na mesma data: ${data}`);
        transacoes.forEach((t, index) => {
          console.log(`   ${index + 1}. ${t.descricao} - R$ ${Math.abs(parseFloat(t.valor)).toFixed(2)}`);
        });
        duplicatasEncontradas += transacoes.length - 1;
      }
    });

    if (duplicatasEncontradas > 0) {
      console.log(`\n🚨 Total de transações duplicadas encontradas: ${duplicatasEncontradas}`);
      console.log('💡 Isso explica o débito duplo que estava acontecendo');
    } else {
      console.log('✅ Nenhuma transação duplicada encontrada');
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

corrigirSaldoUsuario();
