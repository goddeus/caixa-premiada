/**
 * Testes de Integração - Workflow de Depósito
 * Testa o fluxo completo: deposit → webhook → saldo credita
 */

const request = require('supertest');
const { PrismaClient } = require('@prisma/client');

// Mock do servidor
const app = require('../../backend/src/server');

const prisma = new PrismaClient();

describe('Deposit Workflow Integration', () => {
  let testUser;
  let authToken;

  beforeAll(async () => {
    // Criar usuário de teste
    testUser = await prisma.user.create({
      data: {
        email: 'test-deposit@example.com',
        senha: 'hashedpassword',
        nome: 'Test User',
        tipo_conta: 'normal',
        saldo_reais: 0,
        saldo_demo: 0
      }
    });

    // Criar wallet para o usuário
    await prisma.wallet.create({
      data: {
        user_id: testUser.id,
        saldo_reais: 0,
        saldo_demo: 0
      }
    });

    // Fazer login para obter token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test-deposit@example.com',
        senha: 'hashedpassword'
      });

    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    // Limpar dados de teste
    await prisma.transaction.deleteMany({
      where: { user_id: testUser.id }
    });
    await prisma.payment.deleteMany({
      where: { user_id: testUser.id }
    });
    await prisma.wallet.deleteMany({
      where: { user_id: testUser.id }
    });
    await prisma.user.deleteMany({
      where: { id: testUser.id }
    });
  });

  describe('POST /api/deposit/pix', () => {
    test('deve criar depósito PIX com sucesso', async () => {
      const depositData = {
        amount: 100.00,
        idempotencyKey: `test-${Date.now()}`
      };

      const response = await request(app)
        .post('/api/deposit/pix')
        .set('Authorization', `Bearer ${authToken}`)
        .send(depositData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.deposit).toBeDefined();
      expect(response.body.deposit.amount).toBe(100.00);
      expect(response.body.deposit.status).toBe('pending');
      expect(response.body.deposit.qrCode).toBeDefined();
      expect(response.body.deposit.pixCopiaECola).toBeDefined();
    });

    test('deve rejeitar depósito com valor inválido', async () => {
      const depositData = {
        amount: -50.00,
        idempotencyKey: `test-invalid-${Date.now()}`
      };

      const response = await request(app)
        .post('/api/deposit/pix')
        .set('Authorization', `Bearer ${authToken}`)
        .send(depositData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('deve rejeitar depósito sem token de autenticação', async () => {
      const depositData = {
        amount: 100.00
      };

      const response = await request(app)
        .post('/api/deposit/pix')
        .send(depositData);

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/webhook/pix', () => {
    test('deve processar webhook PIX e creditar saldo', async () => {
      // Primeiro, criar um depósito
      const depositData = {
        amount: 50.00,
        idempotencyKey: `webhook-test-${Date.now()}`
      };

      const depositResponse = await request(app)
        .post('/api/deposit/pix')
        .set('Authorization', `Bearer ${authToken}`)
        .send(depositData);

      const deposit = depositResponse.body.deposit;

      // Simular webhook de confirmação
      const webhookData = {
        identifier: deposit.identifier,
        status: 'paid',
        amount: 50.00,
        transaction_id: `vizzion-${Date.now()}`
      };

      const webhookResponse = await request(app)
        .post('/api/webhook/pix')
        .send(webhookData);

      expect(webhookResponse.status).toBe(200);
      expect(webhookResponse.body.success).toBe(true);

      // Verificar se o saldo foi creditado
      const updatedUser = await prisma.user.findUnique({
        where: { id: testUser.id }
      });

      expect(updatedUser.saldo_reais).toBe(50.00);

      // Verificar se a transação foi criada
      const transaction = await prisma.transaction.findFirst({
        where: {
          user_id: testUser.id,
          tipo: 'deposito'
        }
      });

      expect(transaction).toBeDefined();
      expect(transaction.valor).toBe(50.00);
      expect(transaction.status).toBe('concluido');
    });

    test('deve rejeitar webhook com dados inválidos', async () => {
      const webhookData = {
        identifier: 'invalid-identifier',
        status: 'paid',
        amount: 50.00
      };

      const response = await request(app)
        .post('/api/webhook/pix')
        .send(webhookData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Fluxo Completo de Depósito', () => {
    test('deve executar fluxo completo: criar depósito → webhook → verificar saldo', async () => {
      const initialBalance = testUser.saldo_reais;
      const depositAmount = 75.00;

      // 1. Criar depósito
      const depositData = {
        amount: depositAmount,
        idempotencyKey: `complete-test-${Date.now()}`
      };

      const depositResponse = await request(app)
        .post('/api/deposit/pix')
        .set('Authorization', `Bearer ${authToken}`)
        .send(depositData);

      expect(depositResponse.status).toBe(201);
      const deposit = depositResponse.body.deposit;

      // 2. Simular webhook de pagamento
      const webhookData = {
        identifier: deposit.identifier,
        status: 'paid',
        amount: depositAmount,
        transaction_id: `complete-${Date.now()}`
      };

      const webhookResponse = await request(app)
        .post('/api/webhook/pix')
        .send(webhookData);

      expect(webhookResponse.status).toBe(200);

      // 3. Verificar saldo final
      const finalUser = await prisma.user.findUnique({
        where: { id: testUser.id }
      });

      expect(finalUser.saldo_reais).toBe(initialBalance + depositAmount);

      // 4. Verificar transações criadas
      const transactions = await prisma.transaction.findMany({
        where: { user_id: testUser.id },
        orderBy: { created_at: 'desc' },
        take: 2
      });

      expect(transactions).toHaveLength(2);
      expect(transactions[0].tipo).toBe('deposito');
      expect(transactions[0].valor).toBe(depositAmount);
    });
  });
});
