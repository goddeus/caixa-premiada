const prizeValidationService = require('../services/prizeValidationService');

class PrizeValidationController {
  
  /**
   * Executa verificação global de consistência de prêmios
   */
  async verificarConsistencia(req, res) {
    try {
      console.log('🔍 Admin solicitou verificação de consistência de prêmios');
      
      const result = await prizeValidationService.verificarConsistenciaPremios();
      
      res.json({
        success: result.success,
        message: result.success ? 'Verificação concluída com sucesso' : 'Erro na verificação',
        data: result
      });
      
    } catch (error) {
      console.error('Erro no controller de validação:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }

  /**
   * Corrige automaticamente inconsistências simples
   */
  async corrigirAutomaticamente(req, res) {
    try {
      console.log('🔧 Admin solicitou correção automática de inconsistências');
      
      const result = await prizeValidationService.corrigirInconsistenciasAutomaticamente();
      
      res.json({
        success: result.success,
        message: result.success ? 'Correção automática concluída' : 'Erro na correção automática',
        data: result
      });
      
    } catch (error) {
      console.error('Erro na correção automática:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }

  /**
   * Obtém estatísticas de validação
   */
  async getEstatisticas(req, res) {
    try {
      const stats = await prizeValidationService.getValidationStats();
      
      res.json({
        success: true,
        data: stats
      });
      
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }

  /**
   * Valida um prêmio específico
   */
  async validarPremioEspecifico(req, res) {
    try {
      const { prizeId } = req.params;
      
      if (!prizeId) {
        return res.status(400).json({
          success: false,
          error: 'ID do prêmio é obrigatório'
        });
      }

      const result = await prizeValidationService.validatePrizeBeforeCredit(prizeId);
      
      // Adicionar informações sobre status do prêmio
      if (result.prize) {
        result.status = result.prize.ilustrativo ? 'Ilustrativo' : 'Ativo';
        result.can_be_drawn = !result.prize.ilustrativo && result.valid;
      }
      
      res.json({
        success: true,
        data: result
      });
      
    } catch (error) {
      console.error('Erro na validação específica:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }
}

module.exports = PrizeValidationController;

