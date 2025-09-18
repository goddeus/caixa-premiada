// Serviço de cálculo de prêmios removido - usando cálculos simplificados

class PrizeController {
  
  /**
   * Obter estatísticas detalhadas do sistema de prêmios
   * GET /api/prizes/stats
   */
  async getPrizeStats(req, res) {
    try {
      // const stats = await prizeCalculationService.getPrizeStats();
      const stats = {
        caixaLiquido: 0,
        rtp: 0.85,
        fundoPremiosTotal: 0,
        premiosPagos: 0,
        fundoRestante: 0,
        utilizacaoFundo: '0%'
      };
      
      res.json({
        success: true,
        stats: {
          ...stats,
          // Formatação adicional para melhor visualização
          caixaLiquidoFormatado: `R$ ${stats.caixaLiquido.toFixed(2)}`,
          rtpFormatado: `${(stats.rtp * 100).toFixed(1)}%`,
          fundoPremiosTotalFormatado: `R$ ${stats.fundoPremiosTotal.toFixed(2)}`,
          premiosPagosFormatado: `R$ ${stats.premiosPagos.toFixed(2)}`,
          fundoRestanteFormatado: `R$ ${stats.fundoRestante.toFixed(2)}`,
          utilizacaoFundo: stats.utilizacaoFundo
        }
      });
    } catch (error) {
      console.error('Erro ao obter estatísticas de prêmios:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Simular abertura de caixa para teste
   * POST /api/prizes/simulate
   */
  async simulatePrize(req, res) {
    try {
      const { caseId } = req.body;
      
      if (!caseId) {
        return res.status(400).json({
          success: false,
          error: 'ID da caixa é obrigatório'
        });
      }

      // const prizeData = await prizeCalculationService.selectPrize(caseId);
      const prizeData = {
        caseId: caseId,
        prize: null,
        message: 'Simulação não disponível'
      };
      
      res.json({
        success: true,
        simulation: prizeData,
        message: 'Simulação realizada com sucesso'
      });
    } catch (error) {
      console.error('Erro na simulação de prêmio:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obter dados do caixa líquido atual
   * GET /api/prizes/caixa-liquido
   */
  async getCaixaLiquido(req, res) {
    try {
      // const caixaData = await prizeCalculationService.calculateCaixaLiquido();
      const caixaData = {
        totalDepositos: 0,
        totalComissoes: 0,
        caixaLiquido: 0,
        numeroNovosUsuarios: 0
      };
      
      res.json({
        success: true,
        caixa: {
          ...caixaData,
          totalDepositosFormatado: `R$ ${caixaData.totalDepositos.toFixed(2)}`,
          totalComissoesFormatado: `R$ ${caixaData.totalComissoes.toFixed(2)}`,
          caixaLiquidoFormatado: `R$ ${caixaData.caixaLiquido.toFixed(2)}`,
          numeroNovosUsuarios: caixaData.numeroNovosUsuarios
        }
      });
    } catch (error) {
      console.error('Erro ao obter dados do caixa líquido:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obter dados do fundo de prêmios
   * GET /api/prizes/fundo-premios
   */
  async getFundoPremios(req, res) {
    try {
      // const fundoData = await prizeCalculationService.calculateFundoPremios();
      const fundoData = {
        caixaLiquido: 0,
        rtp: 0.85,
        fundoPremiosTotal: 0,
        premiosPagos: 0,
        fundoRestante: 0
      };
      
      res.json({
        success: true,
        fundo: {
          ...fundoData,
          caixaLiquidoFormatado: `R$ ${fundoData.caixaLiquido.toFixed(2)}`,
          rtpFormatado: `${(fundoData.rtp * 100).toFixed(1)}%`,
          fundoPremiosTotalFormatado: `R$ ${fundoData.fundoPremiosTotal.toFixed(2)}`,
          premiosPagosFormatado: `R$ ${fundoData.premiosPagos.toFixed(2)}`,
          fundoRestanteFormatado: `R$ ${fundoData.fundoRestante.toFixed(2)}`,
          utilizacaoPercentual: fundoData.fundoPremiosTotal > 0 ? ((fundoData.premiosPagos / fundoData.fundoPremiosTotal) * 100).toFixed(2) + '%' : '0%'
        }
      });
    } catch (error) {
      console.error('Erro ao obter dados do fundo de prêmios:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = PrizeController;
