const bulkPurchaseService = require('../services/bulkPurchaseServiceOptimized');
const { v4: uuidv4 } = require('uuid');

/**
 * Controller para compras múltiplas de caixas
 */
class BulkPurchaseController {

  /**
   * POST /purchase/bulk
   * Processa compra múltipla de caixas
   */
  async processBulkPurchase(req, res) {
    try {
      const { userId } = req.user;
      const { sessionId, caixaItems, purchaseId } = req.body;

      // Validar dados de entrada
      if (!caixaItems || !Array.isArray(caixaItems) || caixaItems.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Lista de caixas é obrigatória'
        });
      }

      // Gerar ID único se não fornecido
      const finalPurchaseId = purchaseId || uuidv4();

      console.log(`🛒 Processando compra múltipla - Purchase ID: ${finalPurchaseId}`);
      console.log(`👤 Usuário: ${userId}`);
      console.log(`📦 Caixas solicitadas:`, caixaItems);

      // Processar compra múltipla
      const result = await bulkPurchaseService.processBulkPurchase(
        userId,
        sessionId,
        caixaItems,
        finalPurchaseId
      );

      if (result.success) {
        if (result.alreadyProcessed) {
          return res.json({
            success: true,
            message: 'Compra já foi processada anteriormente',
            purchaseId: result.purchaseId,
            totalDebitado: result.totalDebitado,
            somaPremios: result.somaPremios,
            saldoFinal: result.saldoFinal,
            alreadyProcessed: true
          });
        }

        return res.json({
          success: true,
          message: 'Compra múltipla processada com sucesso',
          purchaseId: result.purchaseId,
          totalDebitado: result.totalDebitado,
          somaPremios: result.somaPremios,
          saldoFinal: result.saldoFinal,
          premios: result.premios,
          premiosPorCaixa: result.premiosPorCaixa,
          isDemoAccount: result.isDemoAccount,
          processingTimeMs: result.processingTimeMs
        });
      } else {
        return res.status(400).json({
          success: false,
          error: result.error,
          purchaseId: result.purchaseId,
          processingTimeMs: result.processingTimeMs
        });
      }

    } catch (error) {
      console.error('❌ Erro no controller de compra múltipla:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }

  /**
   * GET /purchase/audit/:purchaseId
   * Obtém auditoria de uma compra específica
   */
  async getPurchaseAudit(req, res) {
    try {
      const { purchaseId } = req.params;

      if (!purchaseId) {
        return res.status(400).json({
          success: false,
          error: 'ID da compra é obrigatório'
        });
      }

      const audit = await bulkPurchaseService.getPurchaseAudit(purchaseId);

      if (!audit) {
        return res.status(404).json({
          success: false,
          error: 'Compra não encontrada'
        });
      }

      // Parsear dados JSON armazenados
      const caixasCompradas = JSON.parse(audit.caixas_compradas || '[]');
      const premiosDetalhados = JSON.parse(audit.premios_detalhados || '[]');

      return res.json({
        success: true,
        audit: {
          ...audit,
          caixas_compradas: caixasCompradas,
          premios_detalhados: premiosDetalhados
        }
      });

    } catch (error) {
      console.error('❌ Erro ao obter auditoria:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }

  /**
   * GET /purchase/audit
   * Lista compras múltiplas com filtros
   */
  async listPurchaseAudits(req, res) {
    try {
      const {
        userId,
        status,
        tipoConta,
        dataInicio,
        dataFim,
        page = 1,
        limit = 20
      } = req.query;

      const filters = {
        userId,
        status,
        tipoConta,
        dataInicio,
        dataFim,
        page: parseInt(page),
        limit: parseInt(limit)
      };

      const result = await bulkPurchaseService.listBulkPurchases(filters);

      return res.json({
        success: true,
        ...result
      });

    } catch (error) {
      console.error('❌ Erro ao listar auditorias:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }

  /**
   * GET /purchase/audit-report
   * Gera relatório de auditoria das compras múltiplas
   */
  async generateAuditReport(req, res) {
    try {
      const { limit = 100 } = req.query;

      const report = await bulkPurchaseService.generateAuditReport(parseInt(limit));

      return res.json({
        success: true,
        report,
        generatedAt: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Erro ao gerar relatório:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }

  /**
   * POST /purchase/verify-discrepancies
   * Verifica e marca compras com discrepâncias para investigação
   */
  async verifyDiscrepancies(req, res) {
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      // Buscar compras concluídas dos últimos 30 dias
      const purchases = await prisma.purchaseAudit.findMany({
        where: {
          status: 'concluido',
          criado_em: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        },
        orderBy: { criado_em: 'desc' },
        take: 1000
      });

      const discrepancies = [];
      let markedForInvestigation = 0;

      for (const purchase of purchases) {
        const caixasCompradas = JSON.parse(purchase.caixas_compradas || '[]');
        const premiosDetalhados = JSON.parse(purchase.premios_detalhados || '[]');

        // Calcular total esperado das caixas
        let totalEsperadoCaixas = 0;
        for (const caixa of caixasCompradas) {
          totalEsperadoCaixas += (caixa.preco || 0) * (caixa.quantidade || 0);
        }

        // Calcular total esperado dos prêmios
        let totalEsperadoPremios = 0;
        for (const premio of premiosDetalhados) {
          if (!premio.isIllustrative && premio.sorteavel !== false) {
            totalEsperadoPremios += premio.valor || 0;
          }
        }

        const expectedFinalBalance = purchase.saldo_antes - purchase.total_preco + purchase.soma_premios;
        const actualFinalBalance = purchase.saldo_depois;
        
        const issues = [];

        // Verificar discrepância no total debitado
        if (Math.abs(purchase.total_preco - totalEsperadoCaixas) > 0.01) {
          issues.push({
            type: 'total_debitado_incorreto',
            expected: totalEsperadoCaixas,
            actual: purchase.total_preco,
            difference: purchase.total_preco - totalEsperadoCaixas
          });
        }

        // Verificar discrepância na soma de prêmios
        if (Math.abs(purchase.soma_premios - totalEsperadoPremios) > 0.01) {
          issues.push({
            type: 'soma_premios_incorreta',
            expected: totalEsperadoPremios,
            actual: purchase.soma_premios,
            difference: purchase.soma_premios - totalEsperadoPremios
          });
        }

        // Verificar discrepância no saldo final
        if (Math.abs(expectedFinalBalance - actualFinalBalance) > 0.01) {
          issues.push({
            type: 'saldo_final_incorreto',
            expected: expectedFinalBalance,
            actual: actualFinalBalance,
            difference: actualFinalBalance - expectedFinalBalance
          });
        }

        // Se há discrepâncias, adicionar à lista
        if (issues.length > 0) {
          discrepancies.push({
            purchaseId: purchase.purchase_id,
            userId: purchase.user_id,
            expected: expectedFinalBalance,
            actual: actualFinalBalance,
            difference: actualFinalBalance - expectedFinalBalance,
            totalPreco: purchase.total_preco,
            somaPremios: purchase.soma_premios,
            saldoAntes: purchase.saldo_antes,
            saldoDepois: purchase.saldo_depois,
            issues: issues
          });

          // Marcar para investigação
          await prisma.purchaseAudit.update({
            where: { id: purchase.id },
            data: { status: 'investigar' }
          });

          markedForInvestigation++;
        }
      }

      await prisma.$disconnect();

      return res.json({
        success: true,
        message: `Verificação concluída. ${markedForInvestigation} compras marcadas para investigação.`,
        totalChecked: purchases.length,
        discrepanciesFound: discrepancies.length,
        markedForInvestigation,
        discrepancies: discrepancies.slice(0, 50) // Limitar a 50 para não sobrecarregar a resposta
      });

    } catch (error) {
      console.error('❌ Erro ao verificar discrepâncias:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }
}

const controller = new BulkPurchaseController();

module.exports = {
  processBulkPurchase: controller.processBulkPurchase.bind(controller),
  getPurchaseAudit: controller.getPurchaseAudit.bind(controller),
  listPurchaseAudits: controller.listPurchaseAudits.bind(controller),
  generateAuditReport: controller.generateAuditReport.bind(controller),
  verifyDiscrepancies: controller.verifyDiscrepancies.bind(controller)
};
