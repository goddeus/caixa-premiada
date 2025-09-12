const { PrismaClient } = require('@prisma/client');
const globalDrawService = require('../services/globalDrawService');

const prisma = new PrismaClient();

async function detailedBalanceAnalysis() {
  console.log('🔍 ANÁLISE DETALHADA DE SALDO');
  console.log('==============================\n');

  try {
    // Criar usuário de teste
    const timestamp = Date.now();
    const testUser = await prisma.user.create({
      data: {
        email: `teste.detailed.${timestamp}@teste.com`,
        nome: 'Usuário Teste Detalhado',
        saldo: 10000,
        senha_hash: 'teste123',
        cpf: `1234567890${timestamp}`
      }
    });

    console.log(`👤 Usuário criado: ${testUser.nome} (Saldo: R$ ${testUser.saldo})`);

    // Buscar todas as caixas
    const cases = await prisma.case.findMany({
      include: {
        prizes: true
      }
    });

    console.log(`\n📦 Encontradas ${cases.length} caixas para teste`);

    let totalSpent = 0;
    let totalWon = 0;
    let transactionCount = 0;

    // Testar cada caixa 5 vezes
    for (const caseItem of cases) {
      console.log(`\n🎲 Testando caixa: ${caseItem.nome} (R$ ${caseItem.preco})`);
      
      for (let i = 0; i < 5; i++) {
        try {
          // 1. DEBITAR o preço da caixa
          await prisma.user.update({
            where: { id: testUser.id },
            data: { saldo: { decrement: caseItem.preco } }
          });

          // 2. Criar transação de abertura
          await prisma.transaction.create({
            data: {
              user_id: testUser.id,
              case_id: caseItem.id,
              tipo: 'abertura_caixa',
              valor: caseItem.preco,
              descricao: `Abertura de caixa ${caseItem.nome}`,
              status: 'completed'
            }
          });

          totalSpent += caseItem.preco;
          transactionCount++;

          // 3. Sortear prêmio
          const result = await globalDrawService.sortearPremio(caseItem.id, testUser.id);
          
          if (result.success) {
            totalWon += result.prize.valor;
            transactionCount++;
            console.log(`  ✅ Abertura ${i+1}: Prêmio ${result.prize.nome} (R$ ${result.prize.valor})`);
          } else {
            console.log(`  ❌ Abertura ${i+1}: Erro no sorteio`);
          }

        } catch (error) {
          console.log(`  ❌ Erro na abertura ${i+1}: ${error.message}`);
        }
      }
    }

    // Buscar saldo atual
    const finalUser = await prisma.user.findUnique({
      where: { id: testUser.id }
    });

    // Buscar todas as transações do usuário
    const allTransactions = await prisma.transaction.findMany({
      where: { user_id: testUser.id },
      orderBy: { criado_em: 'asc' }
    });

    console.log(`\n📊 ANÁLISE DETALHADA:`);
    console.log(`💰 Saldo final: R$ ${finalUser.saldo}`);
    console.log(`🎲 Total de transações: ${allTransactions.length}`);
    console.log(`💸 Total gasto em caixas: R$ ${totalSpent.toFixed(2)}`);
    console.log(`🎁 Total recebido em prêmios: R$ ${totalWon.toFixed(2)}`);

    // Analisar transações por tipo
    const transactionTypes = {};
    allTransactions.forEach(tx => {
      if (!transactionTypes[tx.tipo]) {
        transactionTypes[tx.tipo] = { count: 0, total: 0 };
      }
      transactionTypes[tx.tipo].count++;
      transactionTypes[tx.tipo].total += tx.valor;
    });

    console.log(`\n📋 BREAKDOWN POR TIPO DE TRANSAÇÃO:`);
    Object.entries(transactionTypes).forEach(([type, data]) => {
      console.log(`  ${type}: ${data.count} transações, R$ ${data.total.toFixed(2)}`);
    });

    // Calcular saldo esperado
    const expectedBalance = 10000 - totalSpent + totalWon;
    const actualBalance = finalUser.saldo;
    const difference = expectedBalance - actualBalance;

    console.log(`\n🔍 VERIFICAÇÃO DE CONSISTÊNCIA:`);
    console.log(`💰 Saldo esperado: R$ ${expectedBalance.toFixed(2)}`);
    console.log(`💰 Saldo real: R$ ${actualBalance.toFixed(2)}`);
    console.log(`⚠️ Diferença: R$ ${difference.toFixed(2)}`);

    if (Math.abs(difference) < 0.01) {
      console.log(`✅ Consistência: CORRETA`);
    } else {
      console.log(`❌ Consistência: INCORRETA`);
      
      // Investigar transações suspeitas
      console.log(`\n🔍 INVESTIGAÇÃO DE TRANSAÇÕES SUSPEITAS:`);
      const suspiciousTransactions = allTransactions.filter(tx => 
        tx.tipo === 'auditoria_sorteio_global' || 
        tx.valor < 0 || 
        tx.valor > 1000
      );
      
      if (suspiciousTransactions.length > 0) {
        console.log(`Encontradas ${suspiciousTransactions.length} transações suspeitas:`);
        suspiciousTransactions.forEach(tx => {
          console.log(`  - ${tx.tipo}: R$ ${tx.valor} (${tx.descricao})`);
        });
      }
    }

    // Limpar dados de teste
    await prisma.transaction.deleteMany({
      where: { user_id: testUser.id }
    });
    await prisma.user.delete({
      where: { id: testUser.id }
    });

    console.log(`\n🧹 Dados de teste limpos`);

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

detailedBalanceAnalysis();
