/**
 * Testes Unitários - CentralizedDrawService
 * Testa as funções core do sistema de sorteio
 */

const { PrismaClient } = require('@prisma/client');
const centralizedDrawService = require('../../backend/src/services/centralizedDrawService');

// Mock do Prisma para testes
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => ({
    user: {
      findUnique: jest.fn(),
      update: jest.fn()
    },
    case: {
      findUnique: jest.fn()
    },
    userSession: {
      findUnique: jest.fn(),
      update: jest.fn()
    },
    transaction: {
      create: jest.fn()
    },
    $transaction: jest.fn()
  }))
}));

describe('CentralizedDrawService', () => {
  let mockPrisma;

  beforeEach(() => {
    mockPrisma = new PrismaClient();
    jest.clearAllMocks();
  });

  describe('sampleIndexByProbabilities', () => {
    test('deve selecionar índice baseado em probabilidades', () => {
      const probabilities = [0.1, 0.3, 0.6];
      
      // Mock Math.random para retornar valores específicos
      const originalRandom = Math.random;
      Math.random = jest.fn()
        .mockReturnValueOnce(0.05)  // Deve retornar índice 0
        .mockReturnValueOnce(0.2)   // Deve retornar índice 1
        .mockReturnValueOnce(0.8);  // Deve retornar índice 2

      expect(centralizedDrawService.sampleIndexByProbabilities(probabilities)).toBe(0);
      expect(centralizedDrawService.sampleIndexByProbabilities(probabilities)).toBe(1);
      expect(centralizedDrawService.sampleIndexByProbabilities(probabilities)).toBe(2);

      Math.random = originalRandom;
    });

    test('deve retornar último índice como fallback', () => {
      const probabilities = [0.1, 0.3, 0.6];
      
      const originalRandom = Math.random;
      Math.random = jest.fn().mockReturnValue(0.99); // Valor muito alto

      expect(centralizedDrawService.sampleIndexByProbabilities(probabilities)).toBe(2);

      Math.random = originalRandom;
    });
  });

  describe('sortearPremio', () => {
    test('deve retornar erro para usuário não encontrado', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await centralizedDrawService.sortearPremio('case1', 'user1');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Usuário não encontrado');
    });

    test('deve usar fluxo demo para contas afiliado_demo', async () => {
      const mockUser = {
        tipo_conta: 'afiliado_demo',
        saldo_reais: 100,
        saldo_demo: 50
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      // Mock do método sortearPremioDemo
      const mockDemoResult = {
        success: true,
        result: 'PAID',
        is_demo: true
      };

      centralizedDrawService.sortearPremioDemo = jest.fn().mockResolvedValue(mockDemoResult);

      const result = await centralizedDrawService.sortearPremio('case1', 'user1');

      expect(centralizedDrawService.sortearPremioDemo).toHaveBeenCalledWith('case1', 'user1');
      expect(result.is_demo).toBe(true);
    });

    test('deve retornar erro para caixa não encontrada', async () => {
      const mockUser = {
        tipo_conta: 'normal',
        saldo_reais: 100
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.case.findUnique.mockResolvedValue(null);

      const result = await centralizedDrawService.sortearPremio('case1', 'user1');

      expect(result.success).toBe(false);
      expect(result.message).toContain('Caixa não encontrada');
    });
  });

  describe('returnIllustrativePrize', () => {
    test('deve retornar prêmio ilustrativo com mensagem aleatória', async () => {
      const mockPrizes = [
        { id: '1', nome: 'Prêmio 1', valor: 10 },
        { id: '2', nome: 'Prêmio 2', valor: 20 }
      ];

      const mockUpdatedUser = {
        saldo_reais: 90,
        saldo_demo: 0,
        tipo_conta: 'normal'
      };

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        await callback(mockPrisma);
      });

      mockPrisma.user.findUnique.mockResolvedValue(mockUpdatedUser);

      const result = await centralizedDrawService.returnIllustrativePrize(
        mockPrizes, 'case1', 'user1', 'session1', 10
      );

      expect(result.success).toBe(true);
      expect(result.result).toBe('NO_PRIZE');
      expect(result.prize.valor).toBe(0);
      expect(result.prize.tipo).toBe('ilustrativo');
      expect(result.prize.sem_imagem).toBe(true);
    });
  });

  describe('executePrizePayment', () => {
    test('deve executar pagamento para conta normal', async () => {
      const mockPrize = {
        id: 'prize1',
        nome: 'Prêmio Teste',
        valor: 50,
        tipo: 'cash'
      };

      const mockCase = {
        id: 'case1',
        nome: 'Caixa Teste',
        preco: 10
      };

      const mockUser = {
        tipo_conta: 'normal'
      };

      const mockUpdatedUser = {
        saldo_reais: 140,
        saldo_demo: 0,
        tipo_conta: 'normal'
      };

      mockPrisma.user.findUnique
        .mockResolvedValueOnce(mockUser)  // Primeira chamada para verificar tipo
        .mockResolvedValueOnce(mockUpdatedUser); // Segunda chamada para saldo atualizado

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        await callback(mockPrisma);
      });

      const result = await centralizedDrawService.executePrizePayment(
        mockPrize, mockCase, 'user1', 'session1'
      );

      expect(result.success).toBe(true);
      expect(result.result).toBe('PAID');
      expect(result.prize.valor).toBe(50);
      expect(result.is_demo).toBe(false);
    });

    test('deve executar pagamento para conta demo', async () => {
      const mockPrize = {
        id: 'prize1',
        nome: 'Prêmio Demo',
        valor: 50,
        tipo: 'cash'
      };

      const mockCase = {
        id: 'case1',
        nome: 'Caixa Demo',
        preco: 10
      };

      const mockUser = {
        tipo_conta: 'afiliado_demo'
      };

      const mockUpdatedUser = {
        saldo_reais: 0,
        saldo_demo: 40,
        tipo_conta: 'afiliado_demo'
      };

      mockPrisma.user.findUnique
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockUpdatedUser);

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        await callback(mockPrisma);
      });

      const result = await centralizedDrawService.executePrizePayment(
        mockPrize, mockCase, 'user1', 'session1'
      );

      expect(result.success).toBe(true);
      expect(result.result).toBe('PAID');
      expect(result.prize.valor).toBe(50);
      expect(result.is_demo).toBe(true);
    });
  });

  describe('sortearPremioDemo', () => {
    test('deve retornar erro para usuário não demo', async () => {
      const mockUser = {
        tipo_conta: 'normal',
        saldo_demo: 50
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await centralizedDrawService.sortearPremioDemo('case1', 'user1');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Usuário não é uma conta demo');
    });

    test('deve retornar erro para saldo insuficiente', async () => {
      const mockUser = {
        tipo_conta: 'afiliado_demo',
        saldo_demo: 5
      };

      const mockCase = {
        id: 'case1',
        preco: 10,
        ativo: true,
        prizes: [{ id: '1', valor: 20, ativo: true, sorteavel: true }]
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.case.findUnique.mockResolvedValue(mockCase);

      await expect(centralizedDrawService.sortearPremioDemo('case1', 'user1'))
        .rejects.toThrow('Saldo insuficiente para abrir esta caixa');
    });
  });
});
