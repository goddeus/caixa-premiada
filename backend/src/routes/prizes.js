const express = require('express');
const router = express.Router();
const prizeController = require('../controllers/prizeController');
const { authenticateToken } = require('../middleware/auth');

/**
 * Rotas para o sistema de prêmios inteligente
 * Todas as rotas requerem autenticação
 */

// GET /api/prizes/stats - Estatísticas detalhadas do sistema
router.get('/stats', authenticateToken, prizeController.getPrizeStats);

// GET /api/prizes/caixa-liquido - Dados do caixa líquido atual
router.get('/caixa-liquido', authenticateToken, prizeController.getCaixaLiquido);

// GET /api/prizes/fundo-premios - Dados do fundo de prêmios
router.get('/fundo-premios', authenticateToken, prizeController.getFundoPremios);

// POST /api/prizes/simulate - Simular abertura de caixa (para testes)
router.post('/simulate', authenticateToken, prizeController.simulatePrize);

module.exports = router;
