/**
 * Testes de Integração - Workflow de Compra de Caixas
 * Testa o fluxo completo: buyCase single e bulk
 */

const request = require('supertest');
const { PrismaClient } = require('@prisma/client');

const app = require('../../backend/src/server');
const prisma = new PrismaClient();

describe('Case Purchase Workflow Integration', () => {
  let testUser;
  let testCase;
  let authToken;

  beforeAll(async () => {
    // Criar usuário de teste com saldo
    testUser = await prisma.user.create({
      data: {
        email: 'test-purchase@example.com',
        senha: 'hashedpassword',
        nome: 'Test User',
        tipo_conta: 'normal',
        saldo_reais: 1000.00, // Saldo suficiente para testes
        saldo_demo: 0
      }
    });

    // Criar wallet
    await prisma.wallet.create({
      data: {
        user_id: testUser.id,
        saldo_reais: 1000.00,
        saldo_demo: 0
      }
    });

    // Criar caixa de teste
    testCase = await prisma.case.create({
      data: {
        nome: 'Caixa Teste',
        preco: 10.00,
        ativo: true,
        descricao: 'Caixa para testes',
        imagem_url: 'test-image.jpg'
      }
    });

    // Criar prêmios para a caixa
    await prisma.prize.createMany({
      data: [
        {
          case_id: testCase.id,
          nome: 'Prêmio Pequeno',
          valor: 5.00,
          probabilidade: 0.5,
          tipo: 'cash',
          ativo: true,
          sorteavel: true
        },
        {
          case_id: testCase.id,
          nome: 'Prêmio Médio',
          valor: 15.00,
          probabilidade: 0.3,
          tipo: 'cash',
          ativo: true,
          sorteavel: true
        },
        {
          case_id: testCase.id,
          nome: 'Prêmio Grande',
          valor: 50.00,
          probabilidade: 0.1,
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

    // Fazer login
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test-purchase@example.com',
        senha: 'hashedpassword'
      });

    authToken = loginResponse.body.token;
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

  describe('POST /api/cases/buy/:id', () => {
    test('deve comprar caixa única com sucesso', async () => {
      const initialBalance = testUser.saldo_reais;

      const response = await request(app)
        .post(`/api/cases/buy/${testCase.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.prize).toBeDefined();
      expect(response.body.userBalance).toBeDefined();

      // Verificar se o saldo foi debitado
      const updatedUser = await prisma.user.findUnique({
        where: { id: testUser.id }
      });

      expect(updatedUser.saldo_reais).toBeLessThan(initialBalance);

      // Verificar se as transações foram criadas
      const transactions = await prisma.transaction.findMany({
        where: { user_id: testUser.id },
        orderBy: { created_at: 'desc' },
        take: 2
      });

      expect(transactions).toHaveLength(2);
      expect(transactions[0].tipo).toBe('premio');
      expect(transactions[1].tipo).toBe('abertura_caixa');
    });

    test('deve rejeitar compra com saldo insuficiente', async () => {
      // Criar usuário sem saldo
      const poorUser = await prisma.user.create({
        data: {
          email: 'poor-user@example.com',
          senha: 'hashedpassword',
          nome: 'Poor User',
          tipo_conta: 'normal',
          saldo_reais: 5.00, // Menos que o preço da caixa
          saldo_demo: 0
        }
      });

      await prisma.wallet.create({
        data: {
          user_id: poorUser.id,
          saldo_reais: 5.00,
          saldo_demo: 0
        }
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'poor-user@example.com',
          senha: 'hashedpassword'
        });

      const poorAuthToken = loginResponse.body.token;

      const response = await request(app)
        .post(`/api/cases/buy/${testCase.id}`)
        .set('Authorization', `Bearer ${poorAuthToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Saldo insuficiente');

      // Limpar usuário pobre
      await prisma.wallet.deleteMany({ where: { user_id: poorUser.id } });
      await prisma.user.deleteMany({ where: { id: poorUser.id } });
    });

    test('deve rejeitar compra de caixa inativa', async () => {
      // Desativar caixa
      await prisma.case.update({
        where: { id: testCase.id },
        data: { ativo: false }
      });

      const response = await request(app)
        .post(`/api/cases/buy/${testCase.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);

      // Reativar caixa para outros testes
      await prisma.case.update({
        where: { id: testCase.id },
        data: { ativo: true }
      });
    });
  });

  describe('POST /api/cases/buy-multiple/:id', () => {
    test('deve comprar múltiplas caixas com sucesso', async () => {
      const quantity = 3;
      const initialBalance = testUser.saldo_reais;

      const response = await request(app)
        .post(`/api/cases/buy-multiple/${testCase.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ quantity });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.prizes).toHaveLength(quantity);
      expect(response.body.totalSpent).toBe(testCase.preco * quantity);

      // Verificar se o saldo foi debitado corretamente
      const updatedUser = await prisma.user.findUnique({
        where: { id: testUser.id }
      });

      expect(updatedUser.saldo_reais).toBe(initialBalance - (testCase.preco * quantity));

      // Verificar se as transações foram criadas
      const transactions = await prisma.transaction.findMany({
        where: { user_id: testUser.id },
        orderBy: { created_at: 'desc' },
        take: quantity * 2 // 2 transações por caixa (abertura + prêmio)
      });

      expect(transactions.length).toBeGreaterThanOrEqual(quantity * 2);
    });

    test('deve rejeitar compra múltipla com quantidade inválida', async () => {
      const response = await request(app)
        .post(`/api/cases/buy-multiple/${testCase.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ quantity: 0 });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('deve rejeitar compra múltipla com saldo insuficiente', async () => {
      const quantity = 200; // Quantidade que excede o saldo

      const response = await request(app)
        .post(`/api/cases/buy-multiple/${testCase.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ quantity });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Saldo insuficiente');
    });
  });

  describe('Fluxo Completo de Compra', () => {
    test('deve executar fluxo completo: verificar saldo → comprar → verificar transações', async () => {
      const initialBalance = testUser.saldo_reais;
      const purchaseQuantity = 2;

      // 1. Verificar saldo inicial
      const balanceResponse = await request(app)
        .get('/api/wallet')
        .set('Authorization', `Bearer ${authToken}`);

      expect(balanceResponse.status).toBe(200);
      expect(balanceResponse.body.saldo_reais).toBe(initialBalance);

      // 2. Fazer compra múltipla
      const purchaseResponse = await request(app)
        .post(`/api/cases/buy-multiple/${testCase.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ quantity: purchaseQuantity });

      expect(purchaseResponse.status).toBe(200);
      expect(purchaseResponse.body.prizes).toHaveLength(purchaseQuantity);

      // 3. Verificar saldo final
      const finalBalanceResponse = await request(app)
        .get('/api/wallet')
        .set('Authorization', `Bearer ${authToken}`);

      const expectedBalance = initialBalance - (testCase.preco * purchaseQuantity);
      expect(finalBalanceResponse.body.saldo_reais).toBe(expectedBalance);

      // 4. Verificar histórico de transações
      const historyResponse = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`);

      expect(historyResponse.status).toBe(200);
      expect(historyResponse.body.transactions).toBeDefined();
    });
  });
});
