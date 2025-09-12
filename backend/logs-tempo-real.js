const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function logsTempoReal() {
  try {
    console.log('🔍 SISTEMA DE LOGS EM TEMPO REAL');
    console.log('==================================================');
    console.log('Agora abra a caixa no frontend e veja os logs aqui');
    console.log('Pressione Ctrl+C para parar');
    console.log('');

    let ultimaTransacao = null;
    let contador = 0;

    while (true) {
      // Buscar a última transação de abertura de caixa
      const ultimaTransacaoAtual = await prisma.transaction.findFirst({
        where: {
          tipo: 'abertura_caixa',
          criado_em: {
            gte: new Date(Date.now() - 30000) // Últimos 30 segundos
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
        contador++;
        const valorDebitado = Math.abs(parseFloat(ultimaTransacaoAtual.valor));
        const precoEsperado = ultimaTransacaoAtual.case ? parseFloat(ultimaTransacaoAtual.case.preco) : 0;
        
        console.log(`\n🕐 ${new Date().toLocaleTimeString()} - TRANSAÇÃO #${contador}`);
        console.log(`📦 Caixa: ${ultimaTransacaoAtual.case?.nome || 'N/A'}`);
        console.log(`💰 Preço esperado: R$ ${precoEsperado.toFixed(2)}`);
        console.log(`💸 Valor debitado: R$ ${valorDebitado.toFixed(2)}`);
        console.log(`📝 Descrição: ${ultimaTransacaoAtual.descricao}`);
        console.log(`🆔 ID da transação: ${ultimaTransacaoAtual.id}`);
        console.log(`🆔 ID da caixa: ${ultimaTransacaoAtual.case_id}`);
        
        if (Math.abs(valorDebitado - precoEsperado) > 0.01) {
          console.log(`❌ PROBLEMA DETECTADO: Diferença de R$ ${Math.abs(valorDebitado - precoEsperado).toFixed(2)}`);
        } else {
          console.log(`✅ Valores consistentes`);
        }
        
        console.log('----------------------------------------');
        
        ultimaTransacao = ultimaTransacaoAtual;
      }

      // Aguardar 500ms antes da próxima verificação
      await new Promise(resolve => setTimeout(resolve, 500));
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

logsTempoReal();
