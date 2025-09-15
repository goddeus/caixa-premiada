const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const CasesController = require('../controllers/casesController');

// Criar instância do controller
const casesController = new CasesController();

// GET /cases - Listar todas as caixas disponíveis
router.get('/', (req, res) => casesController.getCases(req, res));

// GET /cases/premios - Listar prêmios de todas as caixas (para debug)
router.get('/premios', (req, res) => casesController.getPremios(req, res));

// GET /cases/map/:frontendId - Mapear ID do frontend para ID real do banco
router.get('/map/:frontendId', (req, res) => casesController.mapFrontendId(req, res));

// GET /cases/:id - Buscar detalhes de uma caixa específica
router.get('/:id', (req, res) => casesController.getCaseById(req, res));

// POST /cases/debit/:id - Debitar valor da caixa (primeira etapa)
router.post('/debit/:id', authenticateToken, (req, res) => casesController.debitCase(req, res));

// POST /cases/draw/:id - Fazer sorteio e creditar prêmio (segunda etapa)
router.post('/draw/:id', authenticateToken, (req, res) => casesController.drawPrize(req, res));

// POST /cases/buy/:id - Comprar e abrir uma caixa (método antigo)
router.post('/buy/:id', authenticateToken, (req, res) => casesController.buyCase(req, res));

// POST /cases/buy-multiple/:id - Comprar e abrir múltiplas caixas
router.post('/buy-multiple/:id', authenticateToken, (req, res) => casesController.buyMultipleCases(req, res));

// POST /cases/credit/:id - Creditar prêmio após ver o resultado
router.post('/credit/:id', authenticateToken, (req, res) => casesController.creditPrize(req, res));

// GET /cases/history - Histórico de aberturas do usuário
router.get('/history', authenticateToken, (req, res) => casesController.getUserHistory(req, res));

// GET /cases/rtp/stats - Estatísticas de RTP do usuário
router.get('/rtp/stats', authenticateToken, (req, res) => casesController.getUserRTPStats(req, res));

// GET /cases/rtp/stats/:caseId - Estatísticas de RTP para uma caixa específica
router.get('/rtp/stats/:caseId', authenticateToken, (req, res) => casesController.getUserRTPStats(req, res));

// POST /cases/rtp/end/:caseId - Finalizar sessão RTP
router.post('/rtp/end/:caseId', authenticateToken, (req, res) => casesController.endRTPSession(req, res));

module.exports = router;
