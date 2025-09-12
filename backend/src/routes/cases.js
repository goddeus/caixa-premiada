const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const casesController = require('../controllers/casesController');

// GET /cases - Listar todas as caixas disponíveis
router.get('/', casesController.getCases);

// GET /cases/premios - Listar prêmios de todas as caixas (para debug)
router.get('/premios', casesController.getPremios);

// GET /cases/map/:frontendId - Mapear ID do frontend para ID real do banco
router.get('/map/:frontendId', casesController.mapFrontendId);

// GET /cases/:id - Buscar detalhes de uma caixa específica
router.get('/:id', casesController.getCaseById);

// POST /cases/debit/:id - Debitar valor da caixa (primeira etapa)
router.post('/debit/:id', authenticateToken, casesController.debitCase);

// POST /cases/draw/:id - Fazer sorteio e creditar prêmio (segunda etapa)
router.post('/draw/:id', authenticateToken, casesController.drawPrize);

// POST /cases/buy/:id - Comprar e abrir uma caixa (método antigo)
router.post('/buy/:id', authenticateToken, casesController.buyCase);

// POST /cases/buy-multiple/:id - Comprar e abrir múltiplas caixas
router.post('/buy-multiple/:id', authenticateToken, casesController.buyMultipleCases);

// POST /cases/credit/:id - Creditar prêmio após ver o resultado
router.post('/credit/:id', authenticateToken, casesController.creditPrize);

// GET /cases/history - Histórico de aberturas do usuário
router.get('/history', authenticateToken, casesController.getUserHistory);

// GET /cases/rtp/stats - Estatísticas de RTP do usuário
router.get('/rtp/stats', authenticateToken, casesController.getUserRTPStats);

// GET /cases/rtp/stats/:caseId - Estatísticas de RTP para uma caixa específica
router.get('/rtp/stats/:caseId', authenticateToken, casesController.getUserRTPStats);

// POST /cases/rtp/end/:caseId - Finalizar sessão RTP
router.post('/rtp/end/:caseId', authenticateToken, casesController.endRTPSession);

module.exports = router;
