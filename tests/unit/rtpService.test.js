/**
 * Testes Unitários - RTPService
 * Testa as funções de cálculo e configuração de RTP
 */

const { PrismaClient } = require('@prisma/client');
const rtpService = require('../../backend/src/services/rtpService');

// Mock do Prisma
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => ({
    rTPConfig: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn()
    }
  }))
}));

// Mock do cashFlowService
jest.mock('../../backend/src/services/cashFlowService', () => ({
  getCashFlowStats: jest.fn(),
  calcularCaixaLiquido: jest.fn()
}));

const cashFlowService = require('../../backend/src/services/cashFlowService');

describe('RTPService', () => {
  let mockPrisma;

  beforeEach(() => {
    mockPrisma = new PrismaClient();
    jest.clearAllMocks();
  });

  describe('getRTPConfig', () => {
    test('deve retornar configuração existente', async () => {
      const mockConfig = {
        id: '1',
        rtp_target: 15.0,
        ativo: true,
        atualizado_em: new Date()
      };

      mockPrisma.rTPConfig.findFirst.mockResolvedValue(mockConfig);

      const result = await rtpService.getRTPConfig();

      expect(result).toEqual(mockConfig);
      expect(mockPrisma.rTPConfig.findFirst).toHaveBeenCalledWith({
        orderBy: { atualizado_em: 'desc' }
      });
    });

    test('deve criar configuração padrão se não existir', async () => {
      const mockNewConfig = {
        id: '1',
        rtp_target: 10.0,
        ativo: true
      };

      mockPrisma.rTPConfig.findFirst.mockResolvedValue(null);
      mockPrisma.rTPConfig.create.mockResolvedValue(mockNewConfig);

      const result = await rtpService.getRTPConfig();

      expect(result).toEqual(mockNewConfig);
      expect(mockPrisma.rTPConfig.create).toHaveBeenCalledWith({
        data: {
          rtp_target: 10.0,
          ativo: true
        }
      });
    });
  });

  describe('updateRTPTarget', () => {
    test('deve atualizar RTP com valor válido', async () => {
      const currentConfig = {
        id: '1',
        rtp_target: 10.0,
        ativo: true
      };

      const updatedConfig = {
        id: '1',
        rtp_target: 25.0,
        ativo: true
      };

      mockPrisma.rTPConfig.findFirst.mockResolvedValue(currentConfig);
      mockPrisma.rTPConfig.update.mockResolvedValue(updatedConfig);

      const result = await rtpService.updateRTPTarget(25.0, 'admin1', 'Teste');

      expect(result).toEqual(updatedConfig);
      expect(mockPrisma.rTPConfig.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          rtp_target: 25.0,
          ativo: true
        }
      });
    });

    test('deve rejeitar RTP muito baixo', async () => {
      await expect(rtpService.updateRTPTarget(5.0, 'admin1'))
        .rejects.toThrow('RTP deve estar entre 10% e 90%');
    });

    test('deve rejeitar RTP muito alto', async () => {
      await expect(rtpService.updateRTPTarget(95.0, 'admin1'))
        .rejects.toThrow('RTP deve estar entre 10% e 90%');
    });
  });

  describe('calculateRecommendedRTP', () => {
    test('deve calcular RTP recomendado para caixa alto', async () => {
      const mockCashFlowStats = {
        ultimos_7_dias: {
          depositos: { valor: 1000 },
          saques: { valor: 500 },
          comissoes_afiliados: { valor: 100 }
        }
      };

      const mockCaixaData = {
        caixaLiquido: 20000, // Alto
        totalDepositos: 5000,
        totalSaques: 2000,
        totalComissoesAfiliados: 500
      };

      cashFlowService.getCashFlowStats.mockResolvedValue(mockCashFlowStats);
      cashFlowService.calcularCaixaLiquido.mockResolvedValue(mockCaixaData);

      // Mock Math.random para retornar valor específico
      const originalRandom = Math.random;
      Math.random = jest.fn().mockReturnValue(0.5); // 55-60% range

      const result = await rtpService.calculateRecommendedRTP();

      expect(result.rtp_recommended).toBeGreaterThanOrEqual(55);
      expect(result.rtp_recommended).toBeLessThanOrEqual(60);
      expect(result.saldo_liquido).toBe(20000);

      Math.random = originalRandom;
    });

    test('deve calcular RTP recomendado para caixa baixo', async () => {
      const mockCashFlowStats = {
        ultimos_7_dias: {
          depositos: { valor: 1000 },
          saques: { valor: 500 },
          comissoes_afiliados: { valor: 100 }
        }
      };

      const mockCaixaData = {
        caixaLiquido: 2000, // Baixo
        totalDepositos: 5000,
        totalSaques: 2000,
        totalComissoesAfiliados: 500
      };

      cashFlowService.getCashFlowStats.mockResolvedValue(mockCashFlowStats);
      cashFlowService.calcularCaixaLiquido.mockResolvedValue(mockCaixaData);

      const originalRandom = Math.random;
      Math.random = jest.fn().mockReturnValue(0.5); // 30-35% range

      const result = await rtpService.calculateRecommendedRTP();

      expect(result.rtp_recommended).toBeGreaterThanOrEqual(30);
      expect(result.rtp_recommended).toBeLessThanOrEqual(35);

      Math.random = originalRandom;
    });

    test('deve garantir RTP dentro dos limites', async () => {
      const mockCashFlowStats = {
        ultimos_7_dias: {
          depositos: { valor: 1000 },
          saques: { valor: 500 },
          comissoes_afiliados: { valor: 100 }
        }
      };

      const mockCaixaData = {
        caixaLiquido: 20000,
        totalDepositos: 5000,
        totalSaques: 2000,
        totalComissoesAfiliados: 500
      };

      cashFlowService.getCashFlowStats.mockResolvedValue(mockCashFlowStats);
      cashFlowService.calcularCaixaLiquido.mockResolvedValue(mockCaixaData);

      const result = await rtpService.calculateRecommendedRTP();

      expect(result.rtp_recommended).toBeGreaterThanOrEqual(10);
      expect(result.rtp_recommended).toBeLessThanOrEqual(90);
    });
  });

  describe('applyRecommendation', () => {
    test('deve aplicar recomendação de RTP', async () => {
      const currentConfig = {
        id: '1',
        rtp_target: 10.0,
        ativo: true
      };

      const updatedConfig = {
        id: '1',
        rtp_target: 25.0,
        ativo: true
      };

      const mockRecommendation = {
        rtp_recommended: 25.0,
        saldo_liquido: 10000,
        media_entradas_7d: 500
      };

      mockPrisma.rTPConfig.findFirst.mockResolvedValue(currentConfig);
      mockPrisma.rTPConfig.update.mockResolvedValue(updatedConfig);

      // Mock do calculateRecommendedRTP
      rtpService.calculateRecommendedRTP = jest.fn().mockResolvedValue(mockRecommendation);

      const result = await rtpService.applyRecommendation('admin1');

      expect(result.config).toEqual(updatedConfig);
      expect(result.recommendation).toEqual(mockRecommendation);
      expect(mockPrisma.rTPConfig.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          rtp_target: 25.0,
          ativo: true
        }
      });
    });
  });

  describe('getCashFlowStats', () => {
    test('deve retornar estatísticas do caixa', async () => {
      const mockCashFlowStats = {
        ultimos_7_dias: {
          depositos: { valor: 1000 },
          saques: { valor: 500 }
        },
        caixa_atual: {
          saldo_liquido: 10000
        },
        timestamp: new Date()
      };

      const mockRTPConfig = {
        rtp_target: 15.0
      };

      const mockRecommendation = {
        rtp_recommended: 20.0
      };

      cashFlowService.getCashFlowStats.mockResolvedValue(mockCashFlowStats);
      mockPrisma.rTPConfig.findFirst.mockResolvedValue(mockRTPConfig);
      rtpService.calculateRecommendedRTP = jest.fn().mockResolvedValue(mockRecommendation);

      const result = await rtpService.getCashFlowStats();

      expect(result.ultimos_7_dias).toEqual(mockCashFlowStats.ultimos_7_dias);
      expect(result.caixa_atual.rtp_target).toBe(15.0);
      expect(result.recomendacao).toEqual(mockRecommendation);
    });
  });
});
