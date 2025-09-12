const { PrismaClient } = require('@prisma/client');
const rtpService = require('./rtpService');

const prisma = new PrismaClient();

class UserSessionService {
  /**
   * Cria uma nova sessão de usuário baseada em um depósito
   * @param {string} userId - ID do usuário
   * @param {number} depositoInicial - Valor do depósito inicial
   * @returns {Object} Sessão criada
   */
  async createSession(userId, depositoInicial) {
    try {
      // Obter RTP configurado
      const rtpConfig = await rtpService.getRTPConfig();
      const rtpDecimal = rtpConfig.rtp_target / 100;
      
      // Calcular limite de retorno
      const limiteRetorno = depositoInicial * rtpDecimal;
      
      // Criar sessão
      const session = await prisma.userSession.create({
        data: {
          user_id: userId,
          deposito_inicial: depositoInicial,
          limite_retorno: limiteRetorno,
          valor_premios_recebidos: 0,
          valor_gasto_caixas: 0,
          rtp_configurado: rtpConfig.rtp_target,
          ativo: true
        }
      });
      
      console.log(`🆕 Nova sessão criada: ${session.id} - Depósito: R$ ${depositoInicial} - Limite: R$ ${limiteRetorno.toFixed(2)}`);
      
      return session;
    } catch (error) {
      console.error('Erro ao criar sessão:', error);
      throw new Error('Falha ao criar sessão de usuário');
    }
  }

  /**
   * Obtém a sessão ativa de um usuário
   * @param {string} userId - ID do usuário
   * @returns {Object|null} Sessão ativa ou null
   */
  async getActiveSession(userId) {
    try {
      const session = await prisma.userSession.findFirst({
        where: {
          user_id: userId,
          ativo: true
        },
        orderBy: {
          criado_em: 'desc'
        }
      });
      
      return session;
    } catch (error) {
      console.error('Erro ao obter sessão ativa:', error);
      return null;
    }
  }

  /**
   * Obtém ou cria uma sessão ativa para o usuário
   * @param {string} userId - ID do usuário
   * @param {number} depositoInicial - Valor do depósito inicial (se criar nova sessão)
   * @returns {Object} Sessão ativa
   */
  async getOrCreateActiveSession(userId, depositoInicial = 20.00) {
    let session = await this.getActiveSession(userId);
    
    if (!session) {
      session = await this.createSession(userId, depositoInicial);
    }
    
    return session;
  }

  /**
   * Verifica se a sessão atingiu o limite de retorno
   * @param {string} sessionId - ID da sessão
   * @returns {boolean} True se atingiu o limite
   */
  async hasReachedLimit(sessionId) {
    try {
      const session = await prisma.userSession.findUnique({
        where: { id: sessionId }
      });
      
      if (!session) {
        return false;
      }
      
      return session.valor_premios_recebidos >= session.limite_retorno;
    } catch (error) {
      console.error('Erro ao verificar limite da sessão:', error);
      return false;
    }
  }

  /**
   * Atualiza os valores da sessão após uma compra de caixa
   * @param {string} sessionId - ID da sessão
   * @param {number} valorCaixa - Valor gasto na caixa
   * @param {number} valorPremio - Valor do prêmio recebido
   * @returns {Object} Sessão atualizada
   */
  async updateSessionAfterPurchase(sessionId, valorCaixa, valorPremio) {
    try {
      const session = await prisma.userSession.update({
        where: { id: sessionId },
        data: {
          valor_gasto_caixas: {
            increment: valorCaixa
          },
          valor_premios_recebidos: {
            increment: valorPremio
          }
        }
      });
      
      console.log(`📊 Sessão atualizada: ${sessionId} - Gasto: R$ ${session.valor_gasto_caixas.toFixed(2)} - Prêmios: R$ ${session.valor_premios_recebidos.toFixed(2)}`);
      
      return session;
    } catch (error) {
      console.error('Erro ao atualizar sessão:', error);
      throw new Error('Falha ao atualizar sessão');
    }
  }

  /**
   * Finaliza uma sessão
   * @param {string} sessionId - ID da sessão
   * @returns {Object} Sessão finalizada
   */
  async endSession(sessionId) {
    try {
      const session = await prisma.userSession.update({
        where: { id: sessionId },
        data: {
          ativo: false,
          finalizado_em: new Date()
        }
      });
      
      console.log(`🏁 Sessão finalizada: ${sessionId}`);
      
      return session;
    } catch (error) {
      console.error('Erro ao finalizar sessão:', error);
      throw new Error('Falha ao finalizar sessão');
    }
  }

  /**
   * Obtém estatísticas da sessão
   * @param {string} sessionId - ID da sessão
   * @returns {Object} Estatísticas da sessão
   */
  async getSessionStats(sessionId) {
    try {
      const session = await prisma.userSession.findUnique({
        where: { id: sessionId }
      });
      
      if (!session) {
        return null;
      }
      
      const rtpAtual = session.valor_gasto_caixas > 0 
        ? (session.valor_premios_recebidos / session.valor_gasto_caixas) * 100 
        : 0;
      
      const restanteSessao = Math.max(0, session.limite_retorno - session.valor_premios_recebidos);
      
      return {
        session,
        rtpAtual,
        restanteSessao,
        limiteAtingido: session.valor_premios_recebidos >= session.limite_retorno
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas da sessão:', error);
      return null;
    }
  }
}

module.exports = new UserSessionService();

