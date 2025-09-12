const rtpService = require('../services/rtpService');

class RTPController {
  
  /**
   * Obtém configuração atual de RTP
   */
  async getRTPConfig(req, res) {
    try {
      const config = await rtpService.getRTPConfig();
      res.json({ success: true, data: config });
    } catch (error) {
      console.error('Erro ao obter configuração de RTP:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Erro interno do servidor' 
      });
    }
  }

  /**
   * Atualiza RTP alvo manualmente
   */
  async updateRTPTarget(req, res) {
    try {
      const { rtp_target, reason } = req.body;
      const adminId = req.user.id;

      if (!rtp_target || typeof rtp_target !== 'number') {
        return res.status(400).json({
          success: false,
          error: 'RTP alvo é obrigatório e deve ser um número'
        });
      }

      const updatedConfig = await rtpService.updateRTPTarget(rtp_target, adminId, reason);
      
      res.json({
        success: true,
        message: 'RTP alvo atualizado com sucesso',
        data: updatedConfig
      });
    } catch (error) {
      console.error('Erro ao atualizar RTP alvo:', error);
      
      if (error.message.includes('RTP deve estar entre')) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Calcula e retorna RTP recomendado
   */
  async getRecommendedRTP(req, res) {
    try {
      const recommendation = await rtpService.calculateRecommendedRTP();
      res.json({ success: true, data: recommendation });
    } catch (error) {
      console.error('Erro ao calcular RTP recomendado:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Aplica recomendação de RTP
   */
  async applyRecommendation(req, res) {
    try {
      const adminId = req.user.id;
      const result = await rtpService.applyRecommendation(adminId);
      
      res.json({
        success: true,
        message: 'Recomendação de RTP aplicada com sucesso',
        data: result
      });
    } catch (error) {
      console.error('Erro ao aplicar recomendação:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obtém estatísticas do caixa para o painel administrativo
   */
  async getCashFlowStats(req, res) {
    try {
      const stats = await rtpService.getCashFlowStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      console.error('Erro ao obter estatísticas do caixa:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obtém histórico de alterações do RTP
   */
  async getRTPHistory(req, res) {
    try {
      const { limit = 50 } = req.query;
      const history = await rtpService.getRTPHistory(parseInt(limit));
      res.json({ success: true, data: history });
    } catch (error) {
      console.error('Erro ao obter histórico de RTP:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = RTPController;
