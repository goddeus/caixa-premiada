const { PrismaClient } = require('@prisma/client');
const cashFlowService = require('./cashFlowService');

const prisma = new PrismaClient();

/**
 * Serviço de RTP Centralizado
 * Gerencia configuração manual e recomendação automática de RTP
 */
class RTPService {
  
  /**
   * Obtém a configuração atual de RTP
   */
  async getRTPConfig() {
    try {
      let config = await prisma.rTPConfig.findFirst({
        orderBy: { updated_at: 'desc' }
      });

      // Se não existe configuração, criar uma padrão
      if (!config) {
        config = await prisma.rTPConfig.create({
          data: {
            rtp_target: 50.0,
            updated_by: null
          }
        });
      }

      return config;
    } catch (error) {
      console.error('Erro ao obter configuração de RTP:', error);
      throw new Error('Falha ao obter configuração de RTP');
    }
  }

  /**
   * Atualiza o RTP alvo manualmente
   */
  async updateRTPTarget(newRTP, adminId, reason = null) {
    try {
      // Validar RTP
      if (newRTP < 10 || newRTP > 90) {
        throw new Error('RTP deve estar entre 10% e 90%');
      }

      const currentConfig = await this.getRTPConfig();
      const oldRTP = currentConfig.rtp_target;

      // Atualizar configuração
      const updatedConfig = await prisma.rTPConfig.update({
        where: { id: currentConfig.id },
        data: {
          rtp_target: newRTP,
          updated_by: adminId,
          updated_at: new Date()
        }
      });

      // Registrar no histórico
      await prisma.rTPHistory.create({
        data: {
          rtp_config_id: currentConfig.id,
          old_rtp: oldRTP,
          new_rtp: newRTP,
          change_type: 'manual',
          reason: reason,
          changed_by: adminId
        }
      });

      return updatedConfig;
    } catch (error) {
      console.error('Erro ao atualizar RTP alvo:', error);
      throw error;
    }
  }

  /**
   * Calcula o RTP recomendado baseado no caixa líquido
   */
  async calculateRecommendedRTP() {
    try {
      // Usar serviço centralizado de fluxo de caixa
      const cashFlowStats = await cashFlowService.getCashFlowStats();
      const caixaData = await cashFlowService.calcularCaixaLiquido();
      
      const saldoLiquido = caixaData.caixaLiquido;
      const depositos7d = cashFlowStats.ultimos_7_dias.depositos.valor;
      const saques7d = cashFlowStats.ultimos_7_dias.saques.valor;
      
      // Calcular média de entradas dos últimos 7 dias
      const mediaEntradas = (depositos7d - saques7d) / 7;

      // Aplicar fórmula de recomendação
      let rtpRecomendado;
      if (saldoLiquido > (mediaEntradas * 14)) {
        // Caixa alto - RTP generoso
        rtpRecomendado = Math.random() * 5 + 55; // 55-60%
      } else if (saldoLiquido > (mediaEntradas * 7)) {
        // Caixa equilibrado - RTP médio
        rtpRecomendado = Math.random() * 5 + 45; // 45-50%
      } else {
        // Caixa baixo - RTP restrito
        rtpRecomendado = Math.random() * 5 + 30; // 30-35%
      }

      // Garantir que está dentro dos limites
      rtpRecomendado = Math.max(10, Math.min(90, rtpRecomendado));

      // Atualizar recomendação na configuração
      const currentConfig = await this.getRTPConfig();
      await prisma.rTPConfig.update({
        where: { id: currentConfig.id },
        data: {
          rtp_recommended: rtpRecomendado
        }
      });

      return {
        rtp_recommended: rtpRecomendado,
        saldo_liquido: saldoLiquido,
        media_entradas_7d: mediaEntradas,
        depositos_7d: depositos7d,
        saques_7d: saques7d,
        comissoes_7d: cashFlowStats.ultimos_7_dias.comissoes_afiliados.valor,
        depositos_total: caixaData.totalDepositos,
        saques_total: caixaData.totalSaques,
        comissoes_total: caixaData.totalComissoesAfiliados
      };
    } catch (error) {
      console.error('Erro ao calcular RTP recomendado:', error);
      throw new Error('Falha no cálculo do RTP recomendado');
    }
  }

  /**
   * Aplica a recomendação de RTP
   */
  async applyRecommendation(adminId) {
    try {
      const recommendation = await this.calculateRecommendedRTP();
      const currentConfig = await this.getRTPConfig();
      
      const updatedConfig = await prisma.rTPConfig.update({
        where: { id: currentConfig.id },
        data: {
          rtp_target: recommendation.rtp_recommended,
          updated_by: adminId,
          updated_at: new Date()
        }
      });

      // Registrar no histórico
      await prisma.rTPHistory.create({
        data: {
          rtp_config_id: currentConfig.id,
          old_rtp: currentConfig.rtp_target,
          new_rtp: recommendation.rtp_recommended,
          change_type: 'recommendation',
          reason: 'Aplicação automática da recomendação do sistema',
          changed_by: adminId
        }
      });

      return {
        config: updatedConfig,
        recommendation: recommendation
      };
    } catch (error) {
      console.error('Erro ao aplicar recomendação:', error);
      throw error;
    }
  }

  /**
   * Obtém estatísticas do caixa para o painel administrativo
   */
  async getCashFlowStats() {
    try {
      // Usar serviço centralizado de fluxo de caixa
      const cashFlowStats = await cashFlowService.getCashFlowStats();
      const recommendation = await this.calculateRecommendedRTP();
      const rtpConfig = await this.getRTPConfig();

      return {
        ultimos_7_dias: cashFlowStats.ultimos_7_dias,
        caixa_atual: {
          saldo_liquido: cashFlowStats.caixa_atual.saldo_liquido,
          rtp_target: rtpConfig.rtp_target,
          rtp_recommended: rtpConfig.rtp_recommended
        },
        recomendacao: recommendation,
        timestamp: cashFlowStats.timestamp
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas do caixa:', error);
      throw new Error('Falha ao obter estatísticas do caixa');
    }
  }

  /**
   * Obtém histórico de alterações do RTP
   */
  async getRTPHistory(limit = 50) {
    try {
      const history = await prisma.rTPHistory.findMany({
        orderBy: { created_at: 'desc' },
        take: limit,
        include: {
          rtp_config: {
            select: {
              rtp_target: true,
              updated_at: true
            }
          }
        }
      });

      return history;
    } catch (error) {
      console.error('Erro ao obter histórico de RTP:', error);
      throw new Error('Falha ao obter histórico de RTP');
    }
  }
}

module.exports = new RTPService();
