const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const transactionsController = require('../controllers/transactionsController');

// GET /transactions - Listar transações do usuário
router.get('/', authenticateToken, transactionsController.getUserTransactions);

// GET /transactions/recent-winners - Feed de ganhadores recentes
router.get('/recent-winners', transactionsController.getRecentWinners);

// GET /transactions/daily-ranking - Ranking diário de ganhadores
router.get('/daily-ranking', transactionsController.getDailyWinnersRanking);

// POST /transactions/deposit - Processar depósito
router.post('/deposit', authenticateToken, transactionsController.processDeposit);

module.exports = router;
