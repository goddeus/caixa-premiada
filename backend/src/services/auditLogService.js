const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Serviço de Logs de Auditoria Detalhados
 * 
 * Este serviço é responsável por registrar todos os sorteios e atividades
 * importantes do sistema para auditoria e análise.
 */
class AuditLogService {

  /**
   * Registra um sorteio global no log de auditoria
   * @param {Object} logData - Dados do sorteio para auditoria
   */
  async logGlobalDraw(logData) {
    try {
      // Salvar no modelo DrawLog para logs específicos de sorteio
      await prisma.drawLog.create({
        data: {
          user_id: logData.user_id,
          case_id: logData.case_id,
          rtp_config: logData.rtp_config?.rtp_target || 0,
          caixa_liquido_before: logData.caixa_liquido_before || 0,
          caixa_liquido_after: logData.caixa_liquido_after || 0,
          prize_selected_id: logData.prize_selected?.id || null,
          prize_value: logData.prize_selected?.valor || 0,
          protection_applied: logData.protection_applied || false,
          retry_count: logData.retry_count || 0,
          processing_time_ms: logData.processing_time_ms || 0,
          success: logData.success || false,
          error_message: logData.error || null
        }
      });

      // Log detalhado no console para desenvolvimento
      console.log('📝 AUDITORIA - Sorteio Global:', {
        timestamp: logData.timestamp,
        user_id: logData.user_id,
        case_id: logData.case_id,
        success: logData.success,
        prize: logData.prize_selected,
        rtp_config: logData.rtp_config,
        caixa_liquido_before: logData.caixa_liquido_before,
        caixa_liquido_after: logData.caixa_liquido_after,
        protection_applied: logData.protection_applied,
        retry_count: logData.retry_count,
        processing_time_ms: logData.processing_time_ms,
        error: logData.error
      });

    } catch (error) {
      console.error('❌ Erro ao registrar log de auditoria:', error);
    }
  }

  /**
   * Registra alterações de RTP para auditoria
   * @param {string} adminId - ID do administrador que fez a alteração
   * @param {number} oldRTP - RTP anterior
   * @param {number} newRTP - Novo RTP
   * @param {string} reason - Motivo da alteração
   */
  async logRTPChange(adminId, oldRTP, newRTP, reason = 'Alteração manual') {
    try {
      // Obter configuração atual de RTP
      const rtpConfig = await prisma.rTPConfig.findFirst({
        orderBy: { updated_at: 'desc' }
      });

      if (rtpConfig) {
        await prisma.rTPHistory.create({
          data: {
            rtp_config_id: rtpConfig.id,
            old_rtp: oldRTP,
            new_rtp: newRTP,
            change_type: 'manual',
            reason: reason,
            changed_by: adminId
          }
        });
      }

      console.log('📝 AUDITORIA - Alteração de RTP:', {
        admin_id: adminId,
        old_rtp: oldRTP,
        new_rtp: newRTP,
        reason: reason,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('❌ Erro ao registrar alteração de RTP:', error);
    }
  }

  /**
   * Registra atividade administrativa
   * @param {string} adminId - ID do administrador
   * @param {string} action - Tipo de ação executada
   * @param {string} description - Descrição da ação
   * @param {Object} dataBefore - Dados antes da alteração
   * @param {Object} dataAfter - Dados após a alteração
   * @param {string} affectedUserId - ID do usuário afetado (opcional)
   */
  async logAdminAction(adminId, action, description, dataBefore = null, dataAfter = null, affectedUserId = null) {
    try {
      await prisma.adminLog.create({
        data: {
          admin_id: adminId,
          acao: action,
          descricao: description,
          dados_antes: dataBefore ? JSON.stringify(dataBefore) : null,
          dados_depois: dataAfter ? JSON.stringify(dataAfter) : null,
          usuario_afetado_id: affectedUserId,
          ip_address: null, // Pode ser implementado posteriormente
          user_agent: null  // Pode ser implementado posteriormente
        }
      });

      console.log('📝 AUDITORIA - Ação Administrativa:', {
        admin_id: adminId,
        action: action,
        description: description,
        affected_user: affectedUserId,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('❌ Erro ao registrar ação administrativa:', error);
    }
  }

  /**
   * Registra bloqueio de prêmio por segurança
   * @param {Object} prize - Dados do prêmio bloqueado
   * @param {number} maxLimit - Limite máximo permitido
   * @param {number} rtpConfig - RTP configurado
   * @param {number} caixaLiquido - Caixa líquido atual
   */
  async logPrizeBlocked(prize, maxLimit, rtpConfig, caixaLiquido) {
    try {
      await prisma.transaction.create({
        data: {
          user_id: null, // Log do sistema
          tipo: 'auditoria_premio_bloqueado',
          valor: parseFloat(prize.valor),
          status: 'concluido',
          descricao: `Prêmio bloqueado por segurança: ${prize.nome} (R$ ${parseFloat(prize.valor)}) - Limite: R$ ${maxLimit} (RTP: ${rtpConfig}%)`
        }
      });

      console.log('📝 AUDITORIA - Prêmio Bloqueado:', {
        prize_name: prize.nome,
        prize_value: prize.valor,
        max_limit: maxLimit,
        rtp_config: rtpConfig,
        caixa_liquido: caixaLiquido,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('❌ Erro ao registrar bloqueio de prêmio:', error);
    }
  }

  /**
   * Obtém logs de sorteios para análise
   * @param {Object} filters - Filtros para a consulta
   * @returns {Array} Lista de logs de sorteios
   */
  async getDrawLogs(filters = {}) {
    try {
      const whereClause = {};
      
      if (filters.user_id) {
        whereClause.user_id = filters.user_id;
      }
      
      if (filters.case_id) {
        whereClause.case_id = filters.case_id;
      }
      
      if (filters.success !== undefined) {
        whereClause.success = filters.success;
      }
      
      if (filters.date_from && filters.date_to) {
        whereClause.created_at = {
          gte: new Date(filters.date_from),
          lte: new Date(filters.date_to)
        };
      }

      const logs = await prisma.drawLog.findMany({
        where: whereClause,
        orderBy: { created_at: 'desc' },
        take: filters.limit || 100
      });

      return logs;
    } catch (error) {
      console.error('❌ Erro ao obter logs de sorteios:', error);
      throw new Error('Falha ao obter logs de auditoria');
    }
  }

  /**
   * Obtém estatísticas de auditoria
   * @returns {Object} Estatísticas do sistema
   */
  async getAuditStats() {
    try {
      const totalDraws = await prisma.drawLog.count();
      const successfulDraws = await prisma.drawLog.count({
        where: { success: true }
      });
      const failedDraws = await prisma.drawLog.count({
        where: { success: false }
      });
      
      const avgProcessingTime = await prisma.drawLog.aggregate({
        _avg: {
          processing_time_ms: true
        }
      });

      const totalPrizeValue = await prisma.drawLog.aggregate({
        _sum: {
          prize_value: true
        }
      });

      const protectionAppliedCount = await prisma.drawLog.count({
        where: { protection_applied: true }
      });

      return {
        total_draws: totalDraws,
        successful_draws: successfulDraws,
        failed_draws: failedDraws,
        success_rate: totalDraws > 0 ? (successfulDraws / totalDraws * 100).toFixed(2) + '%' : '0%',
        avg_processing_time_ms: Math.round(avgProcessingTime._avg.processing_time_ms || 0),
        total_prize_value: totalPrizeValue._sum.prize_value || 0,
        protection_applied_count: protectionAppliedCount,
        protection_rate: totalDraws > 0 ? (protectionAppliedCount / totalDraws * 100).toFixed(2) + '%' : '0%'
      };
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas de auditoria:', error);
      throw new Error('Falha ao obter estatísticas');
    }
  }

  /**
   * Obtém histórico de alterações de RTP
   * @param {number} limit - Limite de registros
   * @returns {Array} Histórico de alterações
   */
  async getRTPHistory(limit = 50) {
    try {
      const history = await prisma.rTPHistory.findMany({
        orderBy: { created_at: 'desc' },
        take: limit,
        include: {
          rtp_config: true
        }
      });

      return history;
    } catch (error) {
      console.error('❌ Erro ao obter histórico de RTP:', error);
      throw new Error('Falha ao obter histórico de RTP');
    }
  }

  /**
   * Obtém logs de atividades administrativas
   * @param {Object} filters - Filtros para a consulta
   * @returns {Array} Lista de logs administrativos
   */
  async getAdminLogs(filters = {}) {
    try {
      const whereClause = {};
      
      if (filters.admin_id) {
        whereClause.admin_id = filters.admin_id;
      }
      
      if (filters.action) {
        whereClause.acao = filters.action;
      }
      
      if (filters.date_from && filters.date_to) {
        whereClause.criado_em = {
          gte: new Date(filters.date_from),
          lte: new Date(filters.date_to)
        };
      }

      const logs = await prisma.adminLog.findMany({
        where: whereClause,
        orderBy: { criado_em: 'desc' },
        take: filters.limit || 100
      });

      return logs;
    } catch (error) {
      console.error('❌ Erro ao obter logs administrativos:', error);
      throw new Error('Falha ao obter logs administrativos');
    }
  }
}

module.exports = new AuditLogService();
