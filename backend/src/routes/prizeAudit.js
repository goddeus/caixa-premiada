const express = require('express');
const router = express.Router();
const PrizeAuditController = require('../controllers/prizeAuditController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Criar instância do controller
const prizeAuditController = new PrizeAuditController();

// Todas as rotas requerem autenticação de admin
router.use(authenticateToken);

// Middleware para verificar se é admin
router.use(requireAdmin);

/**
 * @route POST /api/admin/prize-audit/run
 * @desc Executa auditoria completa de prêmios
 * @access Admin
 */
router.post('/run', (req, res) => prizeAuditController.runAudit(req, res));

/**
 * @route POST /api/admin/prize-audit/normalize
 * @desc Normaliza nomes de prêmios
 * @access Admin
 */
router.post('/normalize', (req, res) => prizeAuditController.normalizePrizes(req, res));

/**
 * @route GET /api/admin/prize-audit/stats
 * @desc Obtém estatísticas de auditoria
 * @access Admin
 */
router.get('/stats', (req, res) => prizeAuditController.getAuditStats(req, res));

/**
 * @route POST /api/admin/prize-audit/case/:caseId
 * @desc Audita uma caixa específica
 * @access Admin
 */
router.post('/case/:caseId', (req, res) => prizeAuditController.auditSpecificCase(req, res));

/**
 * @route GET /api/admin/prize-audit/validate/:prizeId
 * @desc Valida se um prêmio pode ser sorteado
 * @access Admin
 */
router.get('/validate/:prizeId', (req, res) => prizeAuditController.validatePrizeForDraw(req, res));

/**
 * @route GET /api/admin/prize-audit/normalization-stats
 * @desc Obtém estatísticas de normalização
 * @access Admin
 */
router.get('/normalization-stats', (req, res) => prizeAuditController.getNormalizationStats(req, res));

module.exports = router;
