const express = require('express');
const router = express.Router();
const BulkPurchaseController = require('../controllers/bulkPurchaseController');
const { authenticateToken } = require('../middleware/auth');

// Criar instância do controller
const bulkPurchaseController = new BulkPurchaseController();

/**
 * Rotas para compras múltiplas de caixas
 */

// POST /purchase/bulk - Processar compra múltipla
router.post('/bulk', authenticateToken, bulkPurchaseController.processBulkPurchase.bind(bulkPurchaseController));

// GET /purchase/audit/:purchaseId - Obter auditoria de compra específica
router.get('/audit/:purchaseId', authenticateToken, bulkPurchaseController.getPurchaseAudit.bind(bulkPurchaseController));

// GET /purchase/audit - Listar auditorias com filtros
router.get('/audit', authenticateToken, bulkPurchaseController.listPurchaseAudits.bind(bulkPurchaseController));

// GET /purchase/audit-report - Gerar relatório de auditoria
router.get('/audit-report', authenticateToken, bulkPurchaseController.generateAuditReport.bind(bulkPurchaseController));

// POST /purchase/verify-discrepancies - Verificar discrepâncias
router.post('/verify-discrepancies', authenticateToken, bulkPurchaseController.verifyDiscrepancies.bind(bulkPurchaseController));

module.exports = router;
