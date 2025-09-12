const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugPrecos() {
  try {
    console.log('🔍 DEBUGANDO PREÇOS DAS CAIXAS');
    console.log('==================================================');

    // Buscar todas as caixas ativas
    const caixas = await prisma.case.findMany({
      where: { ativo: true },
      select: {
        id: true,
        nome: true,
        preco: true,
        criado_em: true
      }
    });

    console.log(`📦 Total de caixas ativas: ${caixas.length}`);
    console.log('\n🎯 PREÇOS DAS CAIXAS:');
    console.log('------------------------------');

    caixas.forEach((caixa, index) => {
      console.log(`${index + 1}. ${caixa.nome}`);
      console.log(`   ID: ${caixa.id}`);
      console.log(`   Preço: R$ ${parseFloat(caixa.preco).toFixed(2)}`);
      console.log(`   Criado em: ${caixa.criado_em.toLocaleString()}`);
      console.log('');
    });

    // Verificar se há caixas duplicadas por nome
    const nomesDuplicados = caixas.reduce((acc, caixa) => {
      if (!acc[caixa.nome]) {
        acc[caixa.nome] = [];
      }
      acc[caixa.nome].push(caixa);
      return acc;
    }, {});

    console.log('🔍 VERIFICAÇÃO DE DUPLICATAS:');
    console.log('------------------------------');
    
    Object.entries(nomesDuplicados).forEach(([nome, caixasComMesmoNome]) => {
      if (caixasComMesmoNome.length > 1) {
        console.log(`❌ DUPLICATA DETECTADA: ${nome}`);
        caixasComMesmoNome.forEach(caixa => {
          console.log(`   - ID: ${caixa.id}, Preço: R$ ${parseFloat(caixa.preco).toFixed(2)}`);
        });
        console.log('');
      }
    });

    // Verificar transações recentes para encontrar inconsistências
    console.log('📊 TRANSAÇÕES RECENTES:');
    console.log('------------------------------');
    
    const transacoesRecentes = await prisma.transaction.findMany({
      where: {
        tipo: 'abertura_caixa',
        criado_em: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Últimas 24h
        }
      },
      select: {
        id: true,
        valor: true,
        descricao: true,
        criado_em: true,
        case_id: true
      },
      orderBy: { criado_em: 'desc' },
      take: 20
    });

    console.log(`📋 Últimas ${transacoesRecentes.length} transações de abertura:`);
    transacoesRecentes.forEach((transacao, index) => {
      const valorAbsoluto = Math.abs(parseFloat(transacao.valor));
      console.log(`${index + 1}. ${transacao.descricao}`);
      console.log(`   Valor debitado: R$ ${valorAbsoluto.toFixed(2)}`);
      console.log(`   Caixa ID: ${transacao.case_id}`);
      console.log(`   Data: ${transacao.criado_em.toLocaleString()}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugPrecos();
