const withdrawService = require('../services/withdrawService');

class WithdrawController {
  
  /**
   * POST /api/withdraw/pix
   * Criar saque via PIX usando VizzionPay
   */
  static async createPixWithdraw(req, res) {
    try {
      console.log('[WITHDRAW] Saque PIX iniciado:', req.body);
      
      const { userId, amount, pixKey, pixKeyType } = req.body;
      
      // Usar serviço de saques
      const result = await withdrawService.createWithdraw({
        userId,
        amount,
        pixKey,
        pixKeyType
      });
      
      if (!result.success) {
        return res.status(400).json(result);
      }
      
      res.json({
        success: true,
        message: 'Saque em processamento',
        data: result.data
      });
      
    } catch (error) {
      console.error('[WITHDRAW] Erro ao criar saque PIX:', error);
      
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
  
  /**
   * GET /api/withdraw/history
   * Obter histórico de saques do usuário
   */
  static async getWithdrawHistory(req, res) {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 20 } = req.query;
      
      const result = await withdrawService.getWithdrawHistory(userId, {
        page: parseInt(page),
        limit: parseInt(limit)
      });
      
      if (!result.success) {
        return res.status(500).json(result);
      }
      
      res.json(result);
      
    } catch (error) {
      console.error('[WITHDRAW] Erro ao obter histórico:', error);
      
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
  
  /**
   * GET /api/withdraw/stats (Admin)
   * Obter estatísticas de saques
   */
  static async getWithdrawStats(req, res) {
    try {
      const result = await withdrawService.getWithdrawStats();
      
      if (!result.success) {
        return res.status(500).json(result);
      }
      
      res.json(result);
      
    } catch (error) {
      console.error('[WITHDRAW] Erro ao obter estatísticas:', error);
      
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = WithdrawController;
