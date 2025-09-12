const express = require('express');
const router = express.Router();
const CasePrizeController = require('../controllers/casePrizeController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Criar instância do controller
const casePrizeController = new CasePrizeController();

// Todas as rotas requerem autenticação de admin
router.use(authenticateToken);
router.use(requireAdmin);

/**
 * @route GET /api/admin/caixas
 * @desc Lista todas as caixas disponíveis
 * @access Admin
 */
router.get('/caixas', casePrizeController.getAllCases.bind(casePrizeController));

/**
 * @route GET /api/admin/caixas/:caixaId/premios
 * @desc Busca todos os prêmios de uma caixa específica
 * @access Admin
 */
router.get('/caixas/:caixaId/premios', casePrizeController.getPrizesByCase.bind(casePrizeController));

/**
 * @route POST /api/admin/caixas/:caixaId/audit
 * @desc Executa auditoria apenas nos prêmios de uma caixa específica
 * @access Admin
 */
router.post('/caixas/:caixaId/audit', casePrizeController.auditCasePrizes.bind(casePrizeController));

/**
 * @route PUT /api/admin/premios/:prizeId
 * @desc Atualiza um prêmio específico
 * @access Admin
 */
router.put('/premios/:prizeId', casePrizeController.updatePrize.bind(casePrizeController));

module.exports = router;
