/**
 * Testes de Stress - Compras Concorrentes
 * Simula 200 requisições paralelas de compra para testar atomicidade
 */

const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const prisma = new PrismaClient();

describe('Concurrent Purchases Stress Test', () => {
  let testUser;
  let testCase;
  let authToken;
  const CONCURRENT_REQUESTS = 200;
  const INITIAL_BALANCE = 10000.00; // Saldo suficiente para todas as compras

  beforeAll(async () => {
    // Criar usuário de teste com saldo alto
    testUser = await prisma.user.create({
      data: {
        email: `stress-test-${Date.now()}@example.com`,
        senha: 'hashedpassword',
        nome: 'Stress Test User',
        tipo_conta: 'normal',
        saldo_reais: INITIAL_BALANCE,
        saldo_demo: 0
      }
    });

    // Criar wallet
    await prisma.wallet.create({
      data: {
        user_id: testUser.id,
        saldo_reais: INITIAL_BALANCE,
        saldo_demo: 0
      }
    });

    // Criar caixa de teste
    testCase = await prisma.case.create({
      data: {
        nome: 'Caixa Stress Test',
        preco: 10.00,
        ativo: true,
        descricao: 'Caixa para testes de stress',
        imagem_url: 'stress-test.jpg'
      }
    });

    // Criar prêmios para a caixa
    await prisma.prize.createMany({
      data: [
        {
          case_id: testCase.id,
          nome: 'Prêmio Stress 1',
          valor: 5.00,
          probabilidade: 0.4,
          tipo: 'cash',
          ativo: true,
          sorteavel: true
        },
        {
          case_id: testCase.id,
          nome: 'Prêmio Stress 2',
          valor: 15.00,
          probabilidade: 0.3,
          tipo: 'cash',
          ativo: true,
          sorteavel: true
        },
        {
          case_id: testCase.id,
          nome: 'Prêmio Stress 3',
          valor: 25.00,
          probabilidade: 0.2,
          tipo: 'cash',
          ativo: true,
          sorteavel: true
        },
        {
          case_id: testCase.id,
          nome: 'Prêmio Ilustrativo',
          valor: 0.00,
          probabilidade: 0.1,
          tipo: 'ilustrativo',
          ativo: true,
          sorteavel: false
        }
      ]
    });

    // Fazer login para obter token
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: testUser.email,
      senha: 'hashedpassword'
    });

    authToken = loginResponse.data.token;
  });

  afterAll(async () => {
    // Limpar dados de teste
    await prisma.transaction.deleteMany({
      where: { user_id: testUser.id }
    });
    await prisma.prize.deleteMany({
      where: { case_id: testCase.id }
    });
    await prisma.case.deleteMany({
      where: { id: testCase.id }
    });
    await prisma.wallet.deleteMany({
      where: { user_id: testUser.id }
    });
    await prisma.user.deleteMany({
      where: { id: testUser.id }
    });
  });

  test('deve processar compras concorrentes sem condições de corrida', async () => {
    const startTime = Date.now();
    const results = [];
    const errors = [];

    console.log(`🚀 Iniciando teste de stress com ${CONCURRENT_REQUESTS} requisições concorrentes...`);

    // Criar array de promessas para requisições concorrentes
    const promises = Array.from({ length: CONCURRENT_REQUESTS }, (_, index) => {
      return axios.post(
        `http://localhost:3001/api/cases/buy/${testCase.id}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 segundos timeout
        }
      ).then(response => {
        results.push({
          index,
          success: true,
          status: response.status,
          data: response.data,
          timestamp: Date.now()
        });
      }).catch(error => {
        errors.push({
          index,
          success: false,
          error: error.message,
          status: error.response?.status,
          timestamp: Date.now()
        });
      });
    });

    // Aguardar todas as requisições
    await Promise.allSettled(promises);

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`⏱️ Teste concluído em ${duration}ms`);
    console.log(`✅ Sucessos: ${results.length}`);
    console.log(`❌ Erros: ${errors.length}`);

    // Verificações de integridade
    await test.step('Verificar integridade do saldo', async () => {
      const finalUser = await prisma.user.findUnique({
        where: { id: testUser.id }
      });

      const expectedBalance = INITIAL_BALANCE - (results.length * testCase.preco);
      const actualBalance = finalUser.saldo_reais;

      console.log(`💰 Saldo inicial: R$ ${INITIAL_BALANCE.toFixed(2)}`);
      console.log(`💰 Saldo final: R$ ${actualBalance.toFixed(2)}`);
      console.log(`💰 Saldo esperado: R$ ${expectedBalance.toFixed(2)}`);
      console.log(`💰 Diferença: R$ ${(actualBalance - expectedBalance).toFixed(2)}`);

      // Verificar se o saldo está correto (tolerância de 0.01 para arredondamentos)
      expect(Math.abs(actualBalance - expectedBalance)).toBeLessThan(0.01);
    });

    await test.step('Verificar transações criadas', async () => {
      const transactions = await prisma.transaction.findMany({
        where: { user_id: testUser.id },
        orderBy: { created_at: 'asc' }
      });

      console.log(`📊 Total de transações: ${transactions.length}`);
      console.log(`📊 Transações esperadas: ${results.length * 2}`); // 2 por compra (abertura + prêmio)

      // Verificar se todas as transações foram criadas
      expect(transactions.length).toBe(results.length * 2);

      // Verificar tipos de transação
      const aberturaTransactions = transactions.filter(t => t.tipo === 'abertura_caixa');
      const premioTransactions = transactions.filter(t => t.tipo === 'premio');

      expect(aberturaTransactions.length).toBe(results.length);
      expect(premioTransactions.length).toBe(results.length);

      // Verificar se não há transações duplicadas
      const uniqueTransactionIds = new Set(transactions.map(t => t.id));
      expect(uniqueTransactionIds.size).toBe(transactions.length);
    });

    await test.step('Verificar performance', async () => {
      const avgResponseTime = results.reduce((acc, r) => acc + (r.timestamp - startTime), 0) / results.length;
      const requestsPerSecond = (results.length / duration) * 1000;

      console.log(`⚡ Tempo médio de resposta: ${avgResponseTime.toFixed(2)}ms`);
      console.log(`⚡ Requisições por segundo: ${requestsPerSecond.toFixed(2)}`);

      // Verificar se a performance está dentro dos limites aceitáveis
      expect(avgResponseTime).toBeLessThan(5000); // Menos de 5 segundos por requisição
      expect(requestsPerSecond).toBeGreaterThan(10); // Pelo menos 10 req/s
    });

    await test.step('Verificar taxa de erro', async () => {
      const errorRate = (errors.length / CONCURRENT_REQUESTS) * 100;
      console.log(`📈 Taxa de erro: ${errorRate.toFixed(2)}%`);

      // Verificar se a taxa de erro está dentro dos limites aceitáveis
      expect(errorRate).toBeLessThan(5); // Menos de 5% de erro
    });

    // Relatório final
    console.log('\n📋 RELATÓRIO FINAL DO TESTE DE STRESS:');
    console.log(`   • Requisições totais: ${CONCURRENT_REQUESTS}`);
    console.log(`   • Sucessos: ${results.length} (${((results.length / CONCURRENT_REQUESTS) * 100).toFixed(2)}%)`);
    console.log(`   • Erros: ${errors.length} (${((errors.length / CONCURRENT_REQUESTS) * 100).toFixed(2)}%)`);
    console.log(`   • Duração total: ${duration}ms`);
    console.log(`   • Performance: ${(results.length / duration * 1000).toFixed(2)} req/s`);
    console.log(`   • Integridade do saldo: ✅`);
    console.log(`   • Integridade das transações: ✅`);
  });

  test('deve testar compras múltiplas concorrentes', async () => {
    const MULTIPLE_PURCHASE_REQUESTS = 50;
    const QUANTITY_PER_REQUEST = 2;
    const results = [];
    const errors = [];

    console.log(`🚀 Testando ${MULTIPLE_PURCHASE_REQUESTS} compras múltiplas concorrentes...`);

    const promises = Array.from({ length: MULTIPLE_PURCHASE_REQUESTS }, (_, index) => {
      return axios.post(
        `http://localhost:3001/api/cases/buy-multiple/${testCase.id}`,
        { quantity: QUANTITY_PER_REQUEST },
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      ).then(response => {
        results.push({
          index,
          success: true,
          status: response.status,
          data: response.data
        });
      }).catch(error => {
        errors.push({
          index,
          success: false,
          error: error.message,
          status: error.response?.status
        });
      });
    });

    await Promise.allSettled(promises);

    console.log(`✅ Compras múltiplas sucessos: ${results.length}`);
    console.log(`❌ Compras múltiplas erros: ${errors.length}`);

    // Verificar se todas as compras múltiplas foram processadas corretamente
    const expectedPurchases = results.length * QUANTITY_PER_REQUEST;
    const transactions = await prisma.transaction.findMany({
      where: { user_id: testUser.id }
    });

    const aberturaTransactions = transactions.filter(t => t.tipo === 'abertura_caixa');
    expect(aberturaTransactions.length).toBeGreaterThanOrEqual(expectedPurchases);
  });
});
