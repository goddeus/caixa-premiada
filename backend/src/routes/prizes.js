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
router.get('/stats', authenticateToken, (req, res) => prizeController.getPrizeStats(req, res));

// GET /api/prizes/caixa-liquido - Dados do caixa líquido atual
router.get('/caixa-liquido', authenticateToken, (req, res) => prizeController.getCaixaLiquido(req, res));

// GET /api/prizes/fundo-premios - Dados do fundo de prêmios
router.get('/fundo-premios', authenticateToken, (req, res) => prizeController.getFundoPremios(req, res));

// POST /api/prizes/simulate - Simular abertura de caixa (para testes)
router.post('/simulate', authenticateToken, (req, res) => prizeController.simulatePrize(req, res));

module.exports = router;
