const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function monitorarPrecoTempoReal() {
  try {
    console.log('🔍 MONITORANDO PREÇOS EM TEMPO REAL');
    console.log('==================================================');
    console.log('Pressione Ctrl+C para parar o monitoramento');
    console.log('');

    let ultimaTransacao = null;

    while (true) {
      // Buscar a última transação de abertura de caixa
      const ultimaTransacaoAtual = await prisma.transaction.findFirst({
        where: {
          tipo: 'abertura_caixa',
          criado_em: {
            gte: new Date(Date.now() - 60000) // Último minuto
          }
        },
        orderBy: { criado_em: 'desc' },
        include: {
          case: {
            select: {
              nome: true,
              preco: true
            }
          }
        }
      });

      // Se há uma nova transação
      if (ultimaTransacaoAtual && (!ultimaTransacao || ultimaTransacaoAtual.id !== ultimaTransacao.id)) {
        const valorDebitado = Math.abs(parseFloat(ultimaTransacaoAtual.valor));
        const precoEsperado = ultimaTransacaoAtual.case ? parseFloat(ultimaTransacaoAtual.case.preco) : 0;
        
        console.log(`🕐 ${new Date().toLocaleTimeString()}`);
        console.log(`📦 Caixa: ${ultimaTransacaoAtual.case?.nome || 'N/A'}`);
        console.log(`💰 Preço esperado: R$ ${precoEsperado.toFixed(2)}`);
        console.log(`💸 Valor debitado: R$ ${valorDebitado.toFixed(2)}`);
        console.log(`📝 Descrição: ${ultimaTransacaoAtual.descricao}`);
        
        if (Math.abs(valorDebitado - precoEsperado) > 0.01) {
          console.log(`❌ PROBLEMA: Diferença de R$ ${Math.abs(valorDebitado - precoEsperado).toFixed(2)}`);
        } else {
          console.log(`✅ Valores consistentes`);
        }
        
        console.log('----------------------------------------');
        
        ultimaTransacao = ultimaTransacaoAtual;
      }

      // Aguardar 1 segundo antes da próxima verificação
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

  } catch (error) {
    console.error('❌ Erro no monitoramento:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Capturar Ctrl+C para parar o monitoramento
process.on('SIGINT', async () => {
  console.log('\n\n🛑 Monitoramento interrompido pelo usuário');
  await prisma.$disconnect();
  process.exit(0);
});

monitorarPrecoTempoReal();
