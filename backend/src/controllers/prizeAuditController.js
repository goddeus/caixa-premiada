const prizeAuditService = require('../services/prizeAuditService');
const prizeNormalizationService = require('../services/prizeNormalizationService');

class PrizeAuditController {
  
  /**
   * Executa auditoria completa de prêmios
   * POST /api/admin/prize-audit/run
   */
  async runAudit(req, res) {
    try {
      console.log('🔍 Admin solicitou execução de auditoria completa de prêmios');
      
      const result = await prizeAuditService.auditarPremios();
      
      res.json({
        success: result.success,
        message: result.success ? 'Auditoria executada com sucesso' : 'Erro na auditoria',
        data: result
      });
      
    } catch (error) {
      console.error('Erro no controller de auditoria:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }

  /**
   * Normaliza nomes de prêmios
   * POST /api/admin/prize-audit/normalize
   */
  async normalizePrizes(req, res) {
    try {
      console.log('🔧 Admin solicitou normalização de nomes de prêmios');
      
      const result = await prizeNormalizationService.normalizarTodosPremios();
      
      res.json({
        success: result.success,
        message: result.success ? 'Normalização executada com sucesso' : 'Erro na normalização',
        data: result
      });
      
    } catch (error) {
      console.error('Erro na normalização:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }

  /**
   * Obtém estatísticas de auditoria
   * GET /api/admin/prize-audit/stats
   */
  async getAuditStats(req, res) {
    try {
      const stats = await prizeAuditService.getAuditStats();
      
      res.json({
        success: true,
        data: stats
      });
      
    } catch (error) {
      console.error('Erro ao obter estatísticas de auditoria:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }

  /**
   * Audita uma caixa específica
   * POST /api/admin/prize-audit/case/:caseId
   */
  async auditSpecificCase(req, res) {
    try {
      const { caseId } = req.params;
      
      if (!caseId) {
        return res.status(400).json({
          success: false,
          error: 'ID da caixa é obrigatório'
        });
      }

      console.log(`🔍 Admin solicitou auditoria da caixa ${caseId}`);
      
      const result = await prizeAuditService.auditarCaixaEspecifica(caseId);
      
      res.json({
        success: result.success,
        message: result.success ? 'Auditoria da caixa executada com sucesso' : 'Erro na auditoria da caixa',
        data: result
      });
      
    } catch (error) {
      console.error('Erro na auditoria da caixa:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }

  /**
   * Valida se um prêmio pode ser sorteado
   * GET /api/admin/prize-audit/validate/:prizeId
   */
  async validatePrizeForDraw(req, res) {
    try {
      const { prizeId } = req.params;
      
      if (!prizeId) {
        return res.status(400).json({
          success: false,
          error: 'ID do prêmio é obrigatório'
        });
      }

      const result = await prizeAuditService.validarPremioParaSorteio(prizeId);
      
      res.json({
        success: true,
        data: result
      });
      
    } catch (error) {
      console.error('Erro na validação do prêmio:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }

  /**
   * Obtém estatísticas de normalização
   * GET /api/admin/prize-audit/normalization-stats
   */
  async getNormalizationStats(req, res) {
    try {
      const stats = await prizeNormalizationService.getNormalizationStats();
      
      res.json({
        success: true,
        data: stats
      });
      
    } catch (error) {
      console.error('Erro ao obter estatísticas de normalização:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }
}

module.exports = PrizeAuditController;
