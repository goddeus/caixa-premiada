const cashFlowService = require('../services/cashFlowService');

class CashFlowController {
  
  /**
   * Obtém o caixa líquido atual
   */
  async getCaixaLiquido(req, res) {
    try {
      const caixaData = await cashFlowService.calcularCaixaLiquido();
      res.json({ success: true, data: caixaData });
    } catch (error) {
      console.error('Erro ao obter caixa líquido:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Erro interno do servidor' 
      });
    }
  }

  /**
   * Obtém estatísticas detalhadas do fluxo de caixa
   */
  async getCashFlowStats(req, res) {
    try {
      const stats = await cashFlowService.getCashFlowStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      console.error('Erro ao obter estatísticas do fluxo de caixa:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Registra uma transação no sistema
   */
  async registrarTransacao(req, res) {
    try {
      const { tipo, valor, user_id, descricao, status = 'concluido' } = req.body;

      if (!tipo || !valor || !user_id) {
        return res.status(400).json({
          success: false,
          error: 'Tipo, valor e user_id são obrigatórios'
        });
      }

      // Validar transação antes de processar
      const validacao = await cashFlowService.validarTransacao(tipo, valor);
      if (!validacao.valida) {
        return res.status(400).json({
          success: false,
          error: validacao.motivo
        });
      }

      const transactionData = {
        tipo,
        valor: parseFloat(valor),
        user_id,
        descricao: descricao || `Transação ${tipo}`,
        status
      };

      const transaction = await cashFlowService.registrarTransacao(transactionData);
      
      res.json({
        success: true,
        message: 'Transação registrada com sucesso',
        data: transaction
      });
    } catch (error) {
      console.error('Erro ao registrar transação:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obtém histórico de transações
   */
  async getCashFlowHistory(req, res) {
    try {
      const { limit = 50 } = req.query;
      const history = await cashFlowService.getCashFlowHistory(parseInt(limit));
      res.json({ success: true, data: history });
    } catch (error) {
      console.error('Erro ao obter histórico do fluxo de caixa:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Valida se uma transação pode ser processada
   */
  async validarTransacao(req, res) {
    try {
      const { tipo, valor } = req.body;

      if (!tipo || !valor) {
        return res.status(400).json({
          success: false,
          error: 'Tipo e valor são obrigatórios'
        });
      }

      const validacao = await cashFlowService.validarTransacao(tipo, parseFloat(valor));
      res.json({ success: true, data: validacao });
    } catch (error) {
      console.error('Erro ao validar transação:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = CashFlowController;
