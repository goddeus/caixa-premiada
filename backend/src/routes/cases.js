const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const CasesController = require('../controllers/casesController');

// Criar instância do controller
const casesController = new CasesController();

// GET /cases - Listar todas as caixas disponíveis
router.get('/', casesController.getCases.bind(casesController));

// GET /cases/premios - Listar prêmios de todas as caixas (para debug)
router.get('/premios', casesController.getPremios.bind(casesController));

// GET /cases/map/:frontendId - Mapear ID do frontend para ID real do banco
router.get('/map/:frontendId', casesController.mapFrontendId.bind(casesController));

// GET /cases/:id - Buscar detalhes de uma caixa específica
router.get('/:id', casesController.getCaseById.bind(casesController));

// POST /cases/debit/:id - Debitar valor da caixa (primeira etapa)
router.post('/debit/:id', authenticateToken, casesController.debitCase.bind(casesController));

// POST /cases/draw/:id - Fazer sorteio e creditar prêmio (segunda etapa)
router.post('/draw/:id', authenticateToken, casesController.drawPrize.bind(casesController));

// POST /cases/buy/:id - Comprar e abrir uma caixa (método antigo)
router.post('/buy/:id', authenticateToken, casesController.buyCase.bind(casesController));

// POST /cases/buy-multiple/:id - Comprar e abrir múltiplas caixas
router.post('/buy-multiple/:id', authenticateToken, casesController.buyMultipleCases.bind(casesController));

// POST /cases/credit/:id - Creditar prêmio após ver o resultado
router.post('/credit/:id', authenticateToken, casesController.creditPrize.bind(casesController));

// GET /cases/history - Histórico de aberturas do usuário
router.get('/history', authenticateToken, casesController.getUserHistory.bind(casesController));

// GET /cases/rtp/stats - Estatísticas de RTP do usuário
router.get('/rtp/stats', authenticateToken, casesController.getUserRTPStats.bind(casesController));

// GET /cases/rtp/stats/:caseId - Estatísticas de RTP para uma caixa específica
router.get('/rtp/stats/:caseId', authenticateToken, casesController.getUserRTPStats.bind(casesController));

// POST /cases/rtp/end/:caseId - Finalizar sessão RTP
router.post('/rtp/end/:caseId', authenticateToken, casesController.endRTPSession.bind(casesController));

module.exports = router;
