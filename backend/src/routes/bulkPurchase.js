const express = require('express');
const router = express.Router();
const bulkPurchaseController = require('../controllers/bulkPurchaseController');
const { authenticateToken } = require('../middleware/auth');

/**
 * Rotas para compras múltiplas de caixas
 */

// POST /purchase/bulk - Processar compra múltipla
router.post('/bulk', authenticateToken, bulkPurchaseController.processBulkPurchase);

// GET /purchase/audit/:purchaseId - Obter auditoria de compra específica
router.get('/audit/:purchaseId', authenticateToken, bulkPurchaseController.getPurchaseAudit);

// GET /purchase/audit - Listar auditorias com filtros
router.get('/audit', authenticateToken, bulkPurchaseController.listPurchaseAudits);

// GET /purchase/audit-report - Gerar relatório de auditoria
router.get('/audit-report', authenticateToken, bulkPurchaseController.generateAuditReport);

// POST /purchase/verify-discrepancies - Verificar discrepâncias
router.post('/verify-discrepancies', authenticateToken, bulkPurchaseController.verifyDiscrepancies);

module.exports = router;
