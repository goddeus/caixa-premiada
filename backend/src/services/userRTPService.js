const { PrismaClient } = require('@prisma/client');
const rtpService = require('./rtpService');

const prisma = new PrismaClient();

/**
 * Serviço de Controle de RTP por Sessão de Usuário
 * 
 * Gerencia o RTP individual de cada usuário por caixa,
 * garantindo que não ultrapasse o limite configurado.
 */
class UserRTPService {

  /**
   * Obtém ou cria uma sessão de RTP para o usuário e caixa
   */
  async getOrCreateRTPSession(userId, caseId) {
    try {
      // Buscar sessão ativa
      let session = await prisma.userRTPSession.findFirst({
        where: {
          user_id: userId,
          case_id: caseId,
          session_end: null // Sessão ativa
        },
        include: {
          user: {
            select: { nome: true }
          },
          case: {
            select: { nome: true, preco: true }
          }
        }
      });

      // Se não existe sessão ativa, criar uma nova
      if (!session) {
        const rtpConfig = await rtpService.getRTPConfig();
        
        session = await prisma.userRTPSession.create({
          data: {
            user_id: userId,
            case_id: caseId,
            rtp_limite: rtpConfig.rtp_target
          },
          include: {
            user: {
              select: { nome: true }
            },
            case: {
              select: { nome: true, preco: true }
            }
          }
        });

        console.log(`🆕 Nova sessão RTP criada para usuário ${session.user.nome} na caixa ${session.case.nome}`);
      }

      return session;
    } catch (error) {
      console.error('Erro ao obter/criar sessão RTP:', error);
      throw new Error('Falha ao gerenciar sessão RTP');
    }
  }

  /**
   * Atualiza a sessão RTP após uma compra de caixa
   */
  async updateSessionAfterPurchase(sessionId, casePrice, prizeValue) {
    try {
      const session = await prisma.userRTPSession.findUnique({
        where: { id: sessionId }
      });

      if (!session) {
        throw new Error('Sessão RTP não encontrada');
      }

      // Calcular novos valores
      const novoTotalGasto = session.total_gasto + casePrice;
      const novoTotalPremios = session.total_premios + prizeValue;
      const novoRTP = novoTotalGasto > 0 ? (novoTotalPremios / novoTotalGasto) * 100 : 0;
      const limiteAtingido = novoRTP >= session.rtp_limite;

      // Atualizar sessão
      const updatedSession = await prisma.userRTPSession.update({
        where: { id: sessionId },
        data: {
          total_gasto: novoTotalGasto,
          total_premios: novoTotalPremios,
          rtp_atual: novoRTP,
          limite_atingido: limiteAtingido,
          ultima_atualizacao: new Date()
        }
      });

      console.log(`📊 Sessão RTP atualizada:`, {
        usuario: session.user_id,
        caixa: session.case_id,
        total_gasto: novoTotalGasto,
        total_premios: novoTotalPremios,
        rtp_atual: novoRTP.toFixed(2) + '%',
        limite_atingido: limiteAtingido
      });

      return updatedSession;
    } catch (error) {
      console.error('Erro ao atualizar sessão RTP:', error);
      throw new Error('Falha ao atualizar sessão RTP');
    }
  }

  /**
   * Verifica se o usuário atingiu o limite de RTP
   */
  async hasReachedRTPLimit(userId, caseId) {
    try {
      const session = await this.getOrCreateRTPSession(userId, caseId);
      return session.limite_atingido;
    } catch (error) {
      console.error('Erro ao verificar limite RTP:', error);
      return false; // Em caso de erro, permitir sorteio
    }
  }

  /**
   * Obtém estatísticas da sessão RTP
   */
  async getSessionStats(userId, caseId) {
    try {
      const session = await this.getOrCreateRTPSession(userId, caseId);
      
      return {
        session_id: session.id,
        total_gasto: session.total_gasto,
        total_premios: session.total_premios,
        rtp_atual: session.rtp_atual,
        rtp_limite: session.rtp_limite,
        limite_atingido: session.limite_atingido,
        session_start: session.session_start,
        ultima_atualizacao: session.ultima_atualizacao
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas da sessão:', error);
      throw new Error('Falha ao obter estatísticas da sessão');
    }
  }

  /**
   * Finaliza uma sessão RTP (quando usuário para de jogar)
   */
  async endSession(sessionId) {
    try {
      const session = await prisma.userRTPSession.update({
        where: { id: sessionId },
        data: {
          session_end: new Date()
        }
      });

      console.log(`🔚 Sessão RTP finalizada:`, {
        session_id: sessionId,
        total_gasto: session.total_gasto,
        total_premios: session.total_premios,
        rtp_final: session.rtp_atual.toFixed(2) + '%'
      });

      return session;
    } catch (error) {
      console.error('Erro ao finalizar sessão RTP:', error);
      throw new Error('Falha ao finalizar sessão RTP');
    }
  }

  /**
   * Obtém prêmios disponíveis baseado no status do RTP
   */
  async getAvailablePrizes(caseId, userId) {
    try {
      const session = await this.getOrCreateRTPSession(userId, caseId);
      
      // Se atingiu o limite de RTP, retornar apenas prêmios de R$ 1,00 e ilustrativos
      if (session.limite_atingido) {
        console.log(`🚫 Limite RTP atingido para usuário ${userId}. Apenas prêmios de R$ 1,00 e ilustrativos disponíveis.`);
        
        // Buscar prêmios ilustrativos
        const illustrativePrizes = await prisma.illustrativePrize.findMany({
          where: {
            case_id: caseId,
            ativo: true
          }
        });

        // Criar prêmio de R$ 1,00
        const minPrize = {
          id: 'minimo_rtp',
          nome: 'Prêmio Mínimo',
          valor: 1.00,
          probabilidade: 0.8, // 80% de chance
          imagem_url: null,
          tipo: 'cash',
          sorteavel: true
        };

        // Adicionar prêmios ilustrativos (não sortáveis, apenas para exibição)
        const displayPrizes = illustrativePrizes.map(prize => ({
          ...prize,
          probabilidade: 0.0, // Não sortáveis
          sorteavel: false,
          tipo: 'ilustrativo'
        }));

        return [minPrize, ...displayPrizes];
      }

      // Se não atingiu o limite, retornar prêmios normais
      const normalPrizes = await prisma.prize.findMany({
        where: {
          case_id: caseId,
          ativo: true,
          sorteavel: true,
          ilustrativo: false
        }
      });

      return normalPrizes;
    } catch (error) {
      console.error('Erro ao obter prêmios disponíveis:', error);
      throw new Error('Falha ao obter prêmios disponíveis');
    }
  }

  /**
   * Obtém estatísticas gerais de RTP por usuário
   */
  async getUserRTPStats(userId) {
    try {
      const sessions = await prisma.userRTPSession.findMany({
        where: {
          user_id: userId,
          session_end: { not: null } // Apenas sessões finalizadas
        },
        include: {
          case: {
            select: { nome: true, preco: true }
          }
        },
        orderBy: { session_start: 'desc' }
      });

      const totalGasto = sessions.reduce((acc, s) => acc + s.total_gasto, 0);
      const totalPremios = sessions.reduce((acc, s) => acc + s.total_premios, 0);
      const rtpGeral = totalGasto > 0 ? (totalPremios / totalGasto) * 100 : 0;

      return {
        total_sessoes: sessions.length,
        total_gasto: totalGasto,
        total_premios: totalPremios,
        rtp_geral: rtpGeral,
        sessoes: sessions.map(s => ({
          case_name: s.case.nome,
          total_gasto: s.total_gasto,
          total_premios: s.total_premios,
          rtp_atual: s.rtp_atual,
          limite_atingido: s.limite_atingido,
          session_start: s.session_start,
          session_end: s.session_end
        }))
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas RTP do usuário:', error);
      throw new Error('Falha ao obter estatísticas RTP do usuário');
    }
  }

  /**
   * Limpa sessões antigas (mais de 24 horas sem atividade)
   */
  async cleanupOldSessions() {
    try {
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

      const result = await prisma.userRTPSession.updateMany({
        where: {
          session_end: null,
          ultima_atualizacao: { lt: twentyFourHoursAgo }
        },
        data: {
          session_end: new Date()
        }
      });

      console.log(`🧹 Limpeza de sessões RTP: ${result.count} sessões finalizadas`);
      return result.count;
    } catch (error) {
      console.error('Erro na limpeza de sessões RTP:', error);
      return 0;
    }
  }
}

module.exports = new UserRTPService();
