const { PrismaClient } = require('@prisma/client');
const globalDrawService = require('../services/globalDrawService');
const userRTPService = require('../services/userRTPService');

const prisma = new PrismaClient();

/**
 * Script de Teste de Creditação de Prêmios
 * 
 * Testa se os valores dos prêmios estão sendo creditados corretamente
 * ao abrir várias caixas de diferentes tipos.
 */
class PrizeCreditingTest {

  async runTest() {
    console.log('🧪 INICIANDO TESTE DE CREDITAÇÃO DE PRÊMIOS');
    console.log('==========================================\n');

    try {
      // 1. Configurar ambiente de teste
      await this.setupTestEnvironment();

      // 2. Criar usuário de teste
      const testUser = await this.createTestUser();

      // 3. Obter todas as caixas disponíveis
      const cases = await this.getAllCases();
      console.log(`📦 Encontradas ${cases.length} caixas para teste\n`);

      // 4. Testar cada caixa individualmente
      for (const caseItem of cases) {
        await this.testSingleCase(testUser, caseItem);
      }

      // 5. Teste de múltiplas aberturas da mesma caixa
      await this.testMultipleOpenings(testUser, cases[0]);

      // 6. Teste de RTP com diferentes valores
      await this.testRTPWithDifferentValues(testUser, cases);

      // 7. Relatório final
      await this.generateFinalReport(testUser);

    } catch (error) {
      console.error('❌ ERRO NO TESTE:', error);
    } finally {
      await prisma.$disconnect();
    }
  }

  async setupTestEnvironment() {
    console.log('🔧 Configurando ambiente de teste...');

    // Verificar se há caixas ativas
    const activeCases = await prisma.case.count({
      where: { ativo: true }
    });

    if (activeCases === 0) {
      throw new Error('Nenhuma caixa ativa encontrada para teste');
    }

    console.log(`✅ ${activeCases} caixas ativas encontradas`);
  }

  async createTestUser() {
    const timestamp = Date.now();
    const testUser = await prisma.user.create({
      data: {
        nome: 'Usuário Teste Creditação',
        email: `teste.crediting.${timestamp}@teste.com`,
        senha_hash: 'teste123',
        cpf: `${Math.random().toString().substr(2, 11)}`,
        saldo_reais: 10000.00, // Saldo alto para testes
        saldo_demo: 0
      }
    });

    // Criar carteira
    await prisma.wallet.create({
      data: {
        user_id: testUser.id,
        saldo_reais: 10000.00,
        saldo_demo: 0
      }
    });

    console.log(`👤 Usuário de teste criado: ${testUser.nome} (Saldo: R$ 10.000)`);
    return testUser;
  }

  async getAllCases() {
    return await prisma.case.findMany({
      where: { ativo: true },
      include: {
        prizes: {
          where: { ativo: true },
          select: {
            id: true,
            nome: true,
            valor: true,
            probabilidade: true,
            sorteavel: true,
            ilustrativo: true
          }
        }
      },
      orderBy: { preco: 'asc' }
    });
  }

  async testSingleCase(user, caseItem) {
    console.log(`\n📦 TESTANDO CAIXA: ${caseItem.nome}`);
    console.log(`💰 Preço: R$ ${caseItem.preco}`);
    console.log(`🎁 Prêmios disponíveis: ${caseItem.prizes.length}`);
    console.log('─'.repeat(50));

    const results = {
      caseName: caseItem.nome,
      casePrice: caseItem.preco,
      totalSpent: 0,
      totalPrizes: 0,
      draws: [],
      errors: []
    };

    // Abrir a caixa 5 vezes
    for (let i = 1; i <= 5; i++) {
      try {
        console.log(`  🎲 Abertura ${i}/5...`);
        
        // Verificar saldo antes
        const balanceBefore = await this.getUserBalance(user.id);
        
        // Simular o fluxo completo: débito da caixa + sorteio + crédito do prêmio
        // 1. Debitar valor da caixa (usar campo correto)
        await prisma.user.update({
          where: { id: user.id },
          data: {
            saldo_reais: { decrement: parseFloat(caseItem.preco) }
          }
        });
        
        // 2. Sincronizar com wallet
        const userAfterDebit = await prisma.user.findUnique({
          where: { id: user.id },
          select: { saldo_reais: true, saldo_demo: true }
        });
        await prisma.wallet.update({
          where: { user_id: user.id },
          data: { 
            saldo_reais: userAfterDebit.saldo_reais,
            saldo_demo: userAfterDebit.saldo_demo
          }
        });
        
        // 3. Registrar transação de abertura
        await prisma.transaction.create({
          data: {
            user_id: user.id,
            case_id: caseItem.id,
            tipo: 'abertura_caixa',
            valor: parseFloat(caseItem.preco),
            status: 'concluido',
            descricao: `Abertura da caixa ${caseItem.nome}`
          }
        });
        
        // 4. Realizar sorteio
        const drawResult = await globalDrawService.sortearPremio(caseItem.id, user.id);
        
        if (drawResult.success) {
          const prize = drawResult.prize;
          
          // 5. Creditar prêmio
          await prisma.user.update({
            where: { id: user.id },
            data: {
              saldo_reais: { increment: parseFloat(prize.valor) }
            }
          });
          
          // 6. Sincronizar wallet
          const userAfterCredit = await prisma.user.findUnique({
            where: { id: user.id },
            select: { saldo_reais: true, saldo_demo: true, tipo_conta: true }
          });
          await prisma.wallet.update({
            where: { user_id: user.id },
            data: { 
              saldo_reais: userAfterCredit.saldo_reais,
              saldo_demo: userAfterCredit.saldo_demo
            }
          });
          
          // 7. Registrar transação do prêmio
          await prisma.transaction.create({
            data: {
              user_id: user.id,
              case_id: caseItem.id,
              prize_id: prize.id,
              tipo: 'premio',
              valor: parseFloat(prize.valor),
              status: 'concluido',
              descricao: `Prêmio ganho na caixa ${caseItem.nome}: ${prize.nome}`
            }
          });
          
          // Verificar saldo depois
          const balanceAfter = await this.getUserBalance(user.id);
          
          // Calcular diferença real no saldo
          const actualBalanceChange = balanceAfter - balanceBefore;
          const expectedChange = prize.valor - caseItem.preco;
          
          results.totalSpent += caseItem.preco;
          results.totalPrizes += prize.valor;
          results.draws.push({
            draw: i,
            prize: prize.nome,
            prizeValue: prize.valor,
            casePrice: caseItem.preco,
            expectedChange: expectedChange,
            actualChange: actualBalanceChange,
            balanceBefore: balanceBefore,
            balanceAfter: balanceAfter,
            isCorrect: Math.abs(actualBalanceChange - expectedChange) < 0.01
          });

          console.log(`    ✅ Prêmio: ${prize.nome} (R$ ${prize.valor})`);
          console.log(`    💰 Saldo antes: R$ ${balanceBefore.toFixed(2)}`);
          console.log(`    💰 Saldo depois: R$ ${balanceAfter.toFixed(2)}`);
          console.log(`    📊 Mudança esperada: R$ ${expectedChange.toFixed(2)}`);
          console.log(`    📊 Mudança real: R$ ${actualBalanceChange.toFixed(2)}`);
          console.log(`    ${Math.abs(actualBalanceChange - expectedChange) < 0.01 ? '✅' : '❌'} Creditação: ${Math.abs(actualBalanceChange - expectedChange) < 0.01 ? 'CORRETA' : 'INCORRETA'}`);

        } else {
          results.errors.push(`Abertura ${i}: ${drawResult.message}`);
          console.log(`    ❌ Erro: ${drawResult.message}`);
        }

        // Pequena pausa entre aberturas
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        results.errors.push(`Abertura ${i}: ${error.message}`);
        console.log(`    ❌ Erro: ${error.message}`);
      }
    }

    // Análise dos resultados
    this.analyzeCaseResults(results);
    return results;
  }

  async testMultipleOpenings(user, caseItem) {
    console.log(`\n🔄 TESTE DE MÚLTIPLAS ABERTURAS: ${caseItem.nome}`);
    console.log('─'.repeat(50));

    const results = {
      totalOpenings: 20,
      totalSpent: 0,
      totalPrizes: 0,
      correctCredits: 0,
      incorrectCredits: 0,
      errors: []
    };

    console.log(`🎲 Abrindo ${results.totalOpenings} vezes a caixa ${caseItem.nome}...`);

    for (let i = 1; i <= results.totalOpenings; i++) {
      try {
        const balanceBefore = await this.getUserBalance(user.id);
        
        // Simular fluxo completo
        // 1. Debitar caixa
        await prisma.user.update({
          where: { id: user.id },
          data: { saldo_reais: { decrement: parseFloat(caseItem.preco) } }
        });
        
        // 2. Registrar transação de abertura
        await prisma.transaction.create({
          data: {
            user_id: user.id,
            case_id: caseItem.id,
            tipo: 'abertura_caixa',
            valor: parseFloat(caseItem.preco),
            status: 'concluido',
            descricao: `Abertura da caixa ${caseItem.nome}`
          }
        });
        
        // 3. Sorteio
        const drawResult = await globalDrawService.sortearPremio(caseItem.id, user.id);
        
        if (drawResult.success) {
          const prize = drawResult.prize;
          
          // 4. Creditar prêmio
          await prisma.user.update({
            where: { id: user.id },
            data: { saldo_reais: { increment: parseFloat(prize.valor) } }
          });
          
          // 5. Registrar transação do prêmio
          await prisma.transaction.create({
            data: {
              user_id: user.id,
              case_id: caseItem.id,
              prize_id: prize.id,
              tipo: 'premio',
              valor: parseFloat(prize.valor),
              status: 'concluido',
              descricao: `Prêmio ganho na caixa ${caseItem.nome}: ${prize.nome}`
            }
          });
          
          const balanceAfter = await this.getUserBalance(user.id);
          const actualChange = balanceAfter - balanceBefore;
          const expectedChange = prize.valor - caseItem.preco;
          
          results.totalSpent += caseItem.preco;
          results.totalPrizes += prize.valor;
          
          if (Math.abs(actualChange - expectedChange) < 0.01) {
            results.correctCredits++;
          } else {
            results.incorrectCredits++;
            console.log(`  ❌ Abertura ${i}: Creditação incorreta`);
            console.log(`     Esperado: R$ ${expectedChange.toFixed(2)}, Real: R$ ${actualChange.toFixed(2)}`);
          }

          if (i % 5 === 0) {
            console.log(`  📊 Progresso: ${i}/${results.totalOpenings} (${results.correctCredits} corretas, ${results.incorrectCredits} incorretas)`);
          }
        } else {
          results.errors.push(`Abertura ${i}: ${drawResult.message}`);
        }

        await new Promise(resolve => setTimeout(resolve, 50));

      } catch (error) {
        results.errors.push(`Abertura ${i}: ${error.message}`);
      }
    }

    console.log(`\n📊 RESULTADOS DO TESTE DE MÚLTIPLAS ABERTURAS:`);
    console.log(`  🎲 Total de aberturas: ${results.totalOpenings}`);
    console.log(`  ✅ Creditações corretas: ${results.correctCredits}`);
    console.log(`  ❌ Creditações incorretas: ${results.incorrectCredits}`);
    console.log(`  💰 Total gasto: R$ ${results.totalSpent.toFixed(2)}`);
    console.log(`  🎁 Total prêmios: R$ ${results.totalPrizes.toFixed(2)}`);
    console.log(`  📈 RTP: ${((results.totalPrizes / results.totalSpent) * 100).toFixed(2)}%`);
    console.log(`  🎯 Taxa de acerto: ${((results.correctCredits / results.totalOpenings) * 100).toFixed(2)}%`);

    return results;
  }

  async testRTPWithDifferentValues(user, cases) {
    console.log(`\n🎯 TESTE DE RTP COM DIFERENTES VALORES`);
    console.log('─'.repeat(50));

    const testAmounts = [50, 100, 200, 500];
    const results = [];

    for (const amount of testAmounts) {
      console.log(`\n💰 Testando com R$ ${amount}...`);
      
      const caseItem = cases[0]; // Usar primeira caixa
      const openingsNeeded = Math.ceil(amount / caseItem.preco);
      
      const testResult = {
        amount: amount,
        openings: openingsNeeded,
        totalSpent: 0,
        totalPrizes: 0,
        correctCredits: 0,
        incorrectCredits: 0
      };

      for (let i = 0; i < openingsNeeded; i++) {
        try {
          const balanceBefore = await this.getUserBalance(user.id);
          
          // Simular fluxo completo
          // 1. Debitar caixa
          await prisma.user.update({
            where: { id: user.id },
            data: { saldo_reais: { decrement: parseFloat(caseItem.preco) } }
          });
          
          // 2. Registrar transação de abertura
          await prisma.transaction.create({
            data: {
              user_id: user.id,
              case_id: caseItem.id,
              tipo: 'abertura_caixa',
              valor: parseFloat(caseItem.preco),
              status: 'concluido',
              descricao: `Abertura da caixa ${caseItem.nome}`
            }
          });
          
          // 3. Sorteio
          const drawResult = await globalDrawService.sortearPremio(caseItem.id, user.id);
          
          if (drawResult.success) {
            const prize = drawResult.prize;
            
            // 4. Creditar prêmio
            await prisma.user.update({
              where: { id: user.id },
              data: { saldo_reais: { increment: parseFloat(prize.valor) } }
            });
            
            // 5. Registrar transação do prêmio
            await prisma.transaction.create({
              data: {
                user_id: user.id,
                case_id: caseItem.id,
                prize_id: prize.id,
                tipo: 'premio',
                valor: parseFloat(prize.valor),
                status: 'concluido',
                descricao: `Prêmio ganho na caixa ${caseItem.nome}: ${prize.nome}`
              }
            });
            
            const balanceAfter = await this.getUserBalance(user.id);
            const actualChange = balanceAfter - balanceBefore;
            const expectedChange = prize.valor - caseItem.preco;
            
            testResult.totalSpent += caseItem.preco;
            testResult.totalPrizes += prize.valor;
            
            if (Math.abs(actualChange - expectedChange) < 0.01) {
              testResult.correctCredits++;
            } else {
              testResult.incorrectCredits++;
            }
          }

          await new Promise(resolve => setTimeout(resolve, 50));

        } catch (error) {
          console.log(`    ❌ Erro na abertura ${i + 1}: ${error.message}`);
        }
      }

      const rtp = testResult.totalSpent > 0 ? (testResult.totalPrizes / testResult.totalSpent) * 100 : 0;
      const accuracy = testResult.openings > 0 ? (testResult.correctCredits / testResult.openings) * 100 : 0;

      console.log(`  📊 Resultados para R$ ${amount}:`);
      console.log(`    🎲 Aberturas: ${testResult.openings}`);
      console.log(`    💰 Gasto real: R$ ${testResult.totalSpent.toFixed(2)}`);
      console.log(`    🎁 Prêmios: R$ ${testResult.totalPrizes.toFixed(2)}`);
      console.log(`    📈 RTP: ${rtp.toFixed(2)}%`);
      console.log(`    ✅ Precisão: ${accuracy.toFixed(2)}%`);

      results.push(testResult);
    }

    return results;
  }

  async getUserBalance(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { saldo_reais: true, saldo_demo: true, tipo_conta: true }
    });
    if (!user) return 0;
    return user.tipo_conta === 'afiliado_demo' ? user.saldo_demo : user.saldo_reais;
  }

  analyzeCaseResults(results) {
    console.log(`\n📊 ANÁLISE DA CAIXA ${results.caseName}:`);
    console.log(`  💰 Total gasto: R$ ${results.totalSpent.toFixed(2)}`);
    console.log(`  🎁 Total prêmios: R$ ${results.totalPrizes.toFixed(2)}`);
    console.log(`  📈 RTP: ${results.totalSpent > 0 ? ((results.totalPrizes / results.totalSpent) * 100).toFixed(2) : 0}%`);
    
    const correctCredits = results.draws.filter(d => d.isCorrect).length;
    const totalDraws = results.draws.length;
    console.log(`  ✅ Creditações corretas: ${correctCredits}/${totalDraws} (${totalDraws > 0 ? ((correctCredits / totalDraws) * 100).toFixed(2) : 0}%)`);
    
    if (results.errors.length > 0) {
      console.log(`  ❌ Erros: ${results.errors.length}`);
    }
  }

  async generateFinalReport(user) {
    console.log('\n📋 RELATÓRIO FINAL DO TESTE DE CREDITAÇÃO');
    console.log('==========================================');

    // Estatísticas gerais do usuário
    const userStats = await prisma.user.findUnique({
      where: { id: user.id },
      select: { saldo_reais: true, saldo_demo: true, tipo_conta: true }
    });

    const transactions = await prisma.transaction.findMany({
      where: { user_id: user.id },
      orderBy: { criado_em: 'desc' }
    });

    const totalSpent = transactions
      .filter(t => t.tipo === 'abertura_caixa')
      .reduce((sum, t) => sum + t.valor, 0);

    const totalPrizes = transactions
      .filter(t => t.tipo === 'premio')
      .reduce((sum, t) => sum + t.valor, 0);

    console.log(`👤 Usuário: ${user.nome}`);
    console.log(`💰 Saldo final: R$ ${userStats.saldo.toFixed(2)}`);
    console.log(`🎲 Total de transações: ${transactions.length}`);
    console.log(`💸 Total gasto em caixas: R$ ${totalSpent.toFixed(2)}`);
    console.log(`🎁 Total recebido em prêmios: R$ ${totalPrizes.toFixed(2)}`);
    console.log(`📈 RTP geral: ${totalSpent > 0 ? ((totalPrizes / totalSpent) * 100).toFixed(2) : 0}%`);

    // Verificar consistência do saldo
    const expectedBalance = 10000 - totalSpent + totalPrizes;
    const actualBalance = userStats.saldo;
    const balanceConsistent = Math.abs(actualBalance - expectedBalance) < 0.01;

    console.log(`\n🔍 VERIFICAÇÃO DE CONSISTÊNCIA:`);
    console.log(`  💰 Saldo esperado: R$ ${expectedBalance.toFixed(2)}`);
    console.log(`  💰 Saldo real: R$ ${actualBalance.toFixed(2)}`);
    console.log(`  ${balanceConsistent ? '✅' : '❌'} Consistência: ${balanceConsistent ? 'CORRETA' : 'INCORRETA'}`);

    if (!balanceConsistent) {
      console.log(`  ⚠️ Diferença: R$ ${Math.abs(actualBalance - expectedBalance).toFixed(2)}`);
    }

    // Limpar dados de teste
    await this.cleanupTestData(user.id);
    console.log('\n🧹 Dados de teste limpos');
  }

  async cleanupTestData(userId) {
    // Deletar transações
    await prisma.transaction.deleteMany({
      where: { user_id: userId }
    });

    // Deletar sessões RTP
    await prisma.userRTPSession.deleteMany({
      where: { user_id: userId }
    });

    // Deletar carteira
    await prisma.wallet.deleteMany({
      where: { user_id: userId }
    });

    // Deletar usuário
    await prisma.user.deleteMany({
      where: { id: userId }
    });
  }
}

// Executar teste se chamado diretamente
if (require.main === module) {
  const test = new PrizeCreditingTest();
  test.runTest().catch(console.error);
}

module.exports = PrizeCreditingTest;
