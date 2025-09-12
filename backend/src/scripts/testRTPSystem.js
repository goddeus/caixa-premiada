const { PrismaClient } = require('@prisma/client');
const userRTPService = require('../services/userRTPService');
const globalDrawService = require('../services/globalDrawService');
const illustrativePrizeService = require('../services/illustrativePrizeService');

const prisma = new PrismaClient();

/**
 * Script de Teste do Sistema de RTP
 * 
 * Simula diferentes cenários de usuários gastando valores variados
 * para validar se o RTP está funcionando corretamente.
 */
class RTPTestScript {

  async runTests() {
    console.log('🧪 INICIANDO TESTES DO SISTEMA DE RTP');
    console.log('=====================================\n');

    try {
      // 1. Configurar ambiente de teste
      await this.setupTestEnvironment();

      // 2. Executar testes
      await this.testScenario1(); // Usuário gastando R$ 20
      await this.testScenario2(); // Usuário gastando R$ 50
      await this.testScenario3(); // Usuário gastando R$ 100
      await this.testScenario4(); // Múltiplos usuários simultâneos

      // 3. Relatório final
      await this.generateFinalReport();

    } catch (error) {
      console.error('❌ ERRO NOS TESTES:', error);
    } finally {
      await prisma.$disconnect();
    }
  }

  async setupTestEnvironment() {
    console.log('🔧 Configurando ambiente de teste...');

    // Buscar uma caixa de teste
    const testCase = await prisma.case.findFirst({
      where: { ativo: true }
    });

    if (!testCase) {
      throw new Error('Nenhuma caixa ativa encontrada para teste');
    }

    this.testCaseId = testCase.id;
    this.testCasePrice = testCase.preco;

    console.log(`✅ Caixa de teste: ${testCase.nome} (R$ ${testCase.preco})`);

    // Criar prêmios ilustrativos para a caixa
    await illustrativePrizeService.createDefaultIllustrativePrizes(this.testCaseId);
    console.log('✅ Prêmios ilustrativos criados');
  }

  async testScenario1() {
    console.log('\n📊 TESTE 1: Usuário gastando R$ 20');
    console.log('-----------------------------------');

    const testUser = await this.createTestUser('teste_rtp_20');
    const totalSpent = 20.00;
    const expectedMaxRTP = 50; // 50% de RTP

    console.log(`👤 Usuário: ${testUser.nome}`);
    console.log(`💰 Valor a gastar: R$ ${totalSpent}`);
    console.log(`🎯 RTP esperado: máximo ${expectedMaxRTP}%`);

    const results = await this.simulateUserSpending(testUser.id, totalSpent);
    this.analyzeResults('Teste 1', results, totalSpent, expectedMaxRTP);
  }

  async testScenario2() {
    console.log('\n📊 TESTE 2: Usuário gastando R$ 50');
    console.log('-----------------------------------');

    const testUser = await this.createTestUser('teste_rtp_50');
    const totalSpent = 50.00;
    const expectedMaxRTP = 50;

    console.log(`👤 Usuário: ${testUser.nome}`);
    console.log(`💰 Valor a gastar: R$ ${totalSpent}`);
    console.log(`🎯 RTP esperado: máximo ${expectedMaxRTP}%`);

    const results = await this.simulateUserSpending(testUser.id, totalSpent);
    this.analyzeResults('Teste 2', results, totalSpent, expectedMaxRTP);
  }

  async testScenario3() {
    console.log('\n📊 TESTE 3: Usuário gastando R$ 100');
    console.log('------------------------------------');

    const testUser = await this.createTestUser('teste_rtp_100');
    const totalSpent = 100.00;
    const expectedMaxRTP = 50;

    console.log(`👤 Usuário: ${testUser.nome}`);
    console.log(`💰 Valor a gastar: R$ ${totalSpent}`);
    console.log(`🎯 RTP esperado: máximo ${expectedMaxRTP}%`);

    const results = await this.simulateUserSpending(testUser.id, totalSpent);
    this.analyzeResults('Teste 3', results, totalSpent, expectedMaxRTP);
  }

  async testScenario4() {
    console.log('\n📊 TESTE 4: Múltiplos usuários simultâneos');
    console.log('------------------------------------------');

    const users = await Promise.all([
      this.createTestUser('teste_rtp_multi_1'),
      this.createTestUser('teste_rtp_multi_2'),
      this.createTestUser('teste_rtp_multi_3')
    ]);

    console.log(`👥 ${users.length} usuários simultâneos`);
    console.log(`💰 Cada um gastará R$ 30`);

    const results = await Promise.all(
      users.map(user => this.simulateUserSpending(user.id, 30.00))
    );

    console.log('\n📈 Resultados dos usuários simultâneos:');
    results.forEach((result, index) => {
      const rtp = (result.totalPrizes / result.totalSpent) * 100;
      console.log(`  Usuário ${index + 1}: RTP ${rtp.toFixed(2)}% (Gasto: R$ ${result.totalSpent}, Prêmios: R$ ${result.totalPrizes})`);
    });
  }

  async simulateUserSpending(userId, totalAmount) {
    const results = {
      totalSpent: 0,
      totalPrizes: 0,
      draws: [],
      rtpLimitReached: false
    };

    const drawsNeeded = Math.ceil(totalAmount / this.testCasePrice);
    
    for (let i = 0; i < drawsNeeded; i++) {
      try {
        // Verificar se atingiu limite de RTP
        const hasReachedLimit = await userRTPService.hasReachedRTPLimit(userId, this.testCaseId);
        
        if (hasReachedLimit && !results.rtpLimitReached) {
          console.log(`  🚫 Limite de RTP atingido no sorteio ${i + 1}`);
          results.rtpLimitReached = true;
        }

        // Realizar sorteio
        const drawResult = await globalDrawService.sortearPremio(this.testCaseId, userId);
        
        if (drawResult.success) {
          const prize = drawResult.prize;
          results.totalSpent += this.testCasePrice;
          results.totalPrizes += prize.valor;
          results.draws.push({
            draw: i + 1,
            prize: prize.nome,
            value: prize.valor,
            rtpLimitReached: hasReachedLimit
          });

          console.log(`  🎲 Sorteio ${i + 1}: ${prize.nome} (R$ ${prize.valor})`);
        }

        // Pequena pausa entre sorteios
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`  ❌ Erro no sorteio ${i + 1}:`, error.message);
      }
    }

    return results;
  }

  analyzeResults(testName, results, expectedSpent, expectedMaxRTP) {
    const actualRTP = (results.totalPrizes / results.totalSpent) * 100;
    const rtpWithinLimit = actualRTP <= expectedMaxRTP;
    const spentCorrectly = Math.abs(results.totalSpent - expectedSpent) < 0.01;

    console.log(`\n📊 Análise do ${testName}:`);
    console.log(`  💰 Total gasto: R$ ${results.totalSpent.toFixed(2)} (esperado: R$ ${expectedSpent})`);
    console.log(`  🎁 Total prêmios: R$ ${results.totalPrizes.toFixed(2)}`);
    console.log(`  📈 RTP atual: ${actualRTP.toFixed(2)}% (limite: ${expectedMaxRTP}%)`);
    console.log(`  🚫 Limite atingido: ${results.rtpLimitReached ? 'SIM' : 'NÃO'}`);
    console.log(`  ✅ RTP dentro do limite: ${rtpWithinLimit ? 'SIM' : 'NÃO'}`);
    console.log(`  ✅ Valor gasto correto: ${spentCorrectly ? 'SIM' : 'NÃO'}`);

    // Verificar se apenas prêmios de R$ 1,00 foram sorteados após atingir limite
    if (results.rtpLimitReached) {
      const drawsAfterLimit = results.draws.filter(d => d.rtpLimitReached);
      const onlyMinPrizes = drawsAfterLimit.every(d => d.value === 1.00);
      console.log(`  ✅ Apenas prêmios de R$ 1,00 após limite: ${onlyMinPrizes ? 'SIM' : 'NÃO'}`);
    }

    return {
      testName,
      rtpWithinLimit,
      spentCorrectly,
      actualRTP,
      rtpLimitReached: results.rtpLimitReached
    };
  }

  async createTestUser(suffix) {
    const testUser = await prisma.user.create({
      data: {
        nome: `Usuário Teste ${suffix}`,
        email: `${suffix}@teste.com`,
        senha_hash: 'teste123',
        cpf: `${Math.random().toString().substr(2, 11)}`,
        saldo: 1000.00 // Saldo alto para testes
      }
    });

    // Criar carteira
    await prisma.wallet.create({
      data: {
        user_id: testUser.id,
        saldo: 1000.00
      }
    });

    return testUser;
  }

  async generateFinalReport() {
    console.log('\n📋 RELATÓRIO FINAL DOS TESTES');
    console.log('==============================');

    // Estatísticas gerais
    const totalUsers = await prisma.user.count({
      where: { nome: { contains: 'Usuário Teste' } }
    });

    const totalSessions = await prisma.userRTPSession.count({
      where: {
        user: { nome: { contains: 'Usuário Teste' } }
      }
    });

    const totalSpent = await prisma.userRTPSession.aggregate({
      where: {
        user: { nome: { contains: 'Usuário Teste' } }
      },
      _sum: { total_gasto: true }
    });

    const totalPrizes = await prisma.userRTPSession.aggregate({
      where: {
        user: { nome: { contains: 'Usuário Teste' } }
      },
      _sum: { total_premios: true }
    });

    const overallRTP = totalSpent._sum.total_gasto > 0 
      ? (totalPrizes._sum.total_premios / totalSpent._sum.total_gasto) * 100 
      : 0;

    console.log(`👥 Total de usuários de teste: ${totalUsers}`);
    console.log(`🎲 Total de sessões RTP: ${totalSessions}`);
    console.log(`💰 Total gasto: R$ ${totalSpent._sum.total_gasto?.toFixed(2) || 0}`);
    console.log(`🎁 Total prêmios: R$ ${totalPrizes._sum.total_premios?.toFixed(2) || 0}`);
    console.log(`📈 RTP geral: ${overallRTP.toFixed(2)}%`);

    // Limpar dados de teste
    await this.cleanupTestData();
    console.log('\n🧹 Dados de teste limpos');
  }

  async cleanupTestData() {
    // Deletar sessões RTP de teste
    await prisma.userRTPSession.deleteMany({
      where: {
        user: { nome: { contains: 'Usuário Teste' } }
      }
    });

    // Deletar transações de teste
    await prisma.transaction.deleteMany({
      where: {
        user: { nome: { contains: 'Usuário Teste' } }
      }
    });

    // Deletar carteiras de teste
    await prisma.wallet.deleteMany({
      where: {
        user: { nome: { contains: 'Usuário Teste' } }
      }
    });

    // Deletar usuários de teste
    await prisma.user.deleteMany({
      where: { nome: { contains: 'Usuário Teste' } }
    });

    // Deletar prêmios ilustrativos de teste
    await prisma.illustrativePrize.deleteMany({
      where: {
        case_id: this.testCaseId
      }
    });
  }
}

// Executar testes se chamado diretamente
if (require.main === module) {
  const testScript = new RTPTestScript();
  testScript.runTests().catch(console.error);
}

module.exports = RTPTestScript;
