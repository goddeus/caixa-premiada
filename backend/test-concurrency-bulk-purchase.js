const { PrismaClient } = require('@prisma/client');
const bulkPurchaseService = require('./src/services/bulkPurchaseService');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

/**
 * Script de Teste de Concorrência para Compras Múltiplas
 * 
 * Este script simula múltiplos usuários comprando caixas simultaneamente
 * para testar race conditions e consistência de dados.
 */
async function runConcurrencyTests() {
  console.log('🏃‍♂️ INICIANDO TESTES DE CONCORRÊNCIA');
  console.log('=' .repeat(60));

  const NUM_USERS = 10;
  const PURCHASES_PER_USER = 5;
  const users = [];
  let totalTestsPassed = 0;
  let totalTestsFailed = 0;

  try {
    // 1. Criar usuários de teste
    console.log(`\n1️⃣ Criando ${NUM_USERS} usuários de teste...`);
    for (let i = 0; i < NUM_USERS; i++) {
      const user = await prisma.user.create({
        data: {
          nome: `Teste Concorrência ${i + 1}`,
          email: `concorrencia.${i}.${Date.now()}@example.com`,
          senha_hash: 'hash_teste',
          cpf: `${Date.now() + i}`,
          saldo: 500.00, // Saldo inicial para cada usuário
          tipo_conta: 'normal'
        }
      });
      users.push(user);
    }
    console.log(`✅ ${users.length} usuários criados`);

    // 2. Buscar caixas disponíveis
    console.log('\n2️⃣ Buscando caixas disponíveis...');
    const cases = await prisma.case.findMany({
      where: { ativo: true },
      take: 3
    });

    if (cases.length < 2) {
      throw new Error('Necessário pelo menos 2 caixas ativas para teste');
    }
    console.log(`✅ Encontradas ${cases.length} caixas`);

    // 3. Preparar compras para cada usuário
    const userPurchases = [];
    for (let i = 0; i < NUM_USERS; i++) {
      for (let j = 0; j < PURCHASES_PER_USER; j++) {
        userPurchases.push({
          userId: users[i].id,
          userName: users[i].nome,
          caixaItems: [
            { caixaId: cases[0].id, quantidade: Math.floor(Math.random() * 3) + 1 },
            { caixaId: cases[1].id, quantidade: Math.floor(Math.random() * 2) + 1 }
          ],
          purchaseId: uuidv4()
        });
      }
    }

    console.log(`✅ ${userPurchases.length} compras preparadas`);

    // 4. Executar compras simultaneamente
    console.log('\n3️⃣ Executando compras simultaneamente...');
    const startTime = Date.now();

    const purchasePromises = userPurchases.map(async (purchase, index) => {
      try {
        console.log(`🛒 Usuário ${purchase.userName} iniciando compra ${index + 1}...`);
        
        const result = await bulkPurchaseService.processBulkPurchase(
          purchase.userId,
          null,
          purchase.caixaItems,
          purchase.purchaseId
        );

        return {
          success: result.success,
          userId: purchase.userId,
          userName: purchase.userName,
          purchaseId: purchase.purchaseId,
          totalDebitado: result.totalDebitado || 0,
          somaPremios: result.somaPremios || 0,
          error: result.error
        };
      } catch (error) {
        return {
          success: false,
          userId: purchase.userId,
          userName: purchase.userName,
          purchaseId: purchase.purchaseId,
          error: error.message
        };
      }
    });

    const results = await Promise.all(purchasePromises);
    const endTime = Date.now();

    console.log(`✅ Compras concluídas em ${endTime - startTime}ms`);

    // 5. Analisar resultados
    console.log('\n4️⃣ Analisando resultados...');
    const successfulPurchases = results.filter(r => r.success);
    const failedPurchases = results.filter(r => !r.success);

    console.log(`✅ Compras bem-sucedidas: ${successfulPurchases.length}`);
    console.log(`❌ Compras falharam: ${failedPurchases.length}`);

    // 6. Verificar consistência de dados
    console.log('\n5️⃣ Verificando consistência de dados...');

    for (const user of users) {
      try {
        // Buscar usuário atualizado
        const updatedUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { saldo: true }
        });

        // Buscar todas as compras do usuário
        const userPurchases = results.filter(r => r.userId === user.id);
        const successfulUserPurchases = userPurchases.filter(r => r.success);

        // Calcular saldo esperado
        let expectedBalance = 500.00; // Saldo inicial
        for (const purchase of successfulUserPurchases) {
          expectedBalance -= purchase.totalDebitado;
          expectedBalance += purchase.somaPremios;
        }

        // Verificar consistência
        const balanceDifference = Math.abs(updatedUser.saldo - expectedBalance);
        if (balanceDifference < 0.01) {
          console.log(`✅ Usuário ${user.nome}: saldo consistente (R$ ${updatedUser.saldo.toFixed(2)})`);
          totalTestsPassed++;
        } else {
          console.log(`❌ Usuário ${user.nome}: saldo inconsistente (esperado: R$ ${expectedBalance.toFixed(2)}, atual: R$ ${updatedUser.saldo.toFixed(2)})`);
          totalTestsFailed++;
        }

      } catch (error) {
        console.log(`❌ Erro ao verificar usuário ${user.nome}:`, error.message);
        totalTestsFailed++;
      }
    }

    // 7. Verificar transações duplicadas
    console.log('\n6️⃣ Verificando transações duplicadas...');
    const allTransactions = await prisma.transaction.findMany({
      where: {
        user_id: {
          in: users.map(u => u.id)
        },
        tipo: 'abertura_caixa_multipla'
      }
    });

    const transactionCounts = {};
    for (const transaction of allTransactions) {
      const key = `${transaction.user_id}_${transaction.criado_em.toISOString()}`;
      transactionCounts[key] = (transactionCounts[key] || 0) + 1;
    }

    const duplicateTransactions = Object.entries(transactionCounts).filter(([key, count]) => count > 1);
    if (duplicateTransactions.length === 0) {
      console.log('✅ Nenhuma transação duplicada encontrada');
      totalTestsPassed++;
    } else {
      console.log(`❌ ${duplicateTransactions.length} transações duplicadas encontradas`);
      totalTestsFailed++;
    }

    // 8. Verificar auditoria
    console.log('\n7️⃣ Verificando auditoria...');
    const audits = await prisma.purchaseAudit.findMany({
      where: {
        user_id: {
          in: users.map(u => u.id)
        }
      }
    });

    if (audits.length === successfulPurchases.length) {
      console.log(`✅ Auditoria consistente: ${audits.length} compras registradas`);
      totalTestsPassed++;
    } else {
      console.log(`❌ Auditoria inconsistente: esperado ${successfulPurchases.length}, encontrado ${audits.length}`);
      totalTestsFailed++;
    }

    // 9. Verificar race conditions
    console.log('\n8️⃣ Verificando race conditions...');
    const raceConditionTests = {
      noNegativeBalances: true,
      noOverpayments: true,
      consistentData: true
    };

    // Verificar saldos negativos
    for (const user of users) {
      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { saldo: true }
      });

      if (updatedUser.saldo < 0) {
        console.log(`❌ Usuário ${user.nome} com saldo negativo: R$ ${updatedUser.saldo.toFixed(2)}`);
        raceConditionTests.noNegativeBalances = false;
      }
    }

    if (raceConditionTests.noNegativeBalances) {
      console.log('✅ Nenhum saldo negativo encontrado');
      totalTestsPassed++;
    } else {
      console.log('❌ Saldos negativos encontrados');
      totalTestsFailed++;
    }

    // 10. Estatísticas finais
    console.log('\n📊 ESTATÍSTICAS FINAIS');
    console.log('=' .repeat(60));
    console.log(`👥 Usuários testados: ${NUM_USERS}`);
    console.log(`🛒 Compras por usuário: ${PURCHASES_PER_USER}`);
    console.log(`📦 Total de compras: ${userPurchases.length}`);
    console.log(`✅ Compras bem-sucedidas: ${successfulPurchases.length}`);
    console.log(`❌ Compras falharam: ${failedPurchases.length}`);
    console.log(`⏱️ Tempo total: ${endTime - startTime}ms`);
    console.log(`⚡ Compras por segundo: ${(userPurchases.length / ((endTime - startTime) / 1000)).toFixed(2)}`);

  } catch (error) {
    console.error('❌ ERRO NOS TESTES DE CONCORRÊNCIA:', error);
    totalTestsFailed++;
  } finally {
    // Limpeza: remover dados de teste
    console.log('\n🧹 Limpando dados de teste...');
    try {
      await prisma.transaction.deleteMany({
        where: {
          user_id: {
            in: users.map(u => u.id)
          }
        }
      });

      await prisma.purchaseAudit.deleteMany({
        where: {
          user_id: {
            in: users.map(u => u.id)
          }
        }
      });

      await prisma.user.deleteMany({
        where: {
          id: {
            in: users.map(u => u.id)
          }
        }
      });

      console.log('✅ Dados de teste removidos');
    } catch (cleanupError) {
      console.error('⚠️ Erro na limpeza:', cleanupError.message);
    }

    await prisma.$disconnect();
  }

  // Relatório final
  console.log('\n📊 RELATÓRIO FINAL DOS TESTES DE CONCORRÊNCIA');
  console.log('=' .repeat(60));
  console.log(`✅ Testes passaram: ${totalTestsPassed}`);
  console.log(`❌ Testes falharam: ${totalTestsFailed}`);
  console.log(`📈 Taxa de sucesso: ${((totalTestsPassed / (totalTestsPassed + totalTestsFailed)) * 100).toFixed(1)}%`);

  if (totalTestsFailed === 0) {
    console.log('\n🎉 TODOS OS TESTES DE CONCORRÊNCIA PASSARAM! Sistema robusto contra race conditions.');
  } else {
    console.log('\n⚠️ ALGUNS TESTES DE CONCORRÊNCIA FALHARAM. Verifique os logs acima para detalhes.');
  }

  return { totalTestsPassed, totalTestsFailed };
}

// Executar testes se chamado diretamente
if (require.main === module) {
  runConcurrencyTests()
    .then(({ totalTestsPassed, totalTestsFailed }) => {
      process.exit(totalTestsFailed > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error('Erro fatal nos testes de concorrência:', error);
      process.exit(1);
    });
}

module.exports = { runConcurrencyTests };

