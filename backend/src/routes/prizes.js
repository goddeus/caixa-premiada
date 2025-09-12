const express = require('express');
const router = express.Router();
const PrizeController = require('../controllers/prizeController');
const { authenticateToken } = require('../middleware/auth');

// Criar instância do controller
const prizeController = new PrizeController();

/**
 * Rotas para o sistema de prêmios inteligente
 * Todas as rotas requerem autenticação
 */

// GET /api/prizes/stats - Estatísticas detalhadas do sistema
router.get('/stats', authenticateToken, prizeController.getPrizeStats.bind(prizeController));

// GET /api/prizes/caixa-liquido - Dados do caixa líquido atual
router.get('/caixa-liquido', authenticateToken, prizeController.getCaixaLiquido.bind(prizeController));

// GET /api/prizes/fundo-premios - Dados do fundo de prêmios
router.get('/fundo-premios', authenticateToken, prizeController.getFundoPremios.bind(prizeController));

// POST /api/prizes/simulate - Simular abertura de caixa (para testes)
router.post('/simulate', authenticateToken, prizeController.simulatePrize.bind(prizeController));

module.exports = router;
