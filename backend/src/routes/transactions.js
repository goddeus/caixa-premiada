const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const TransactionsController = require('../controllers/transactionsController');

// Criar instância do controller
const transactionsController = new TransactionsController();

// GET /transactions - Listar transações do usuário
router.get('/', authenticateToken, transactionsController.getUserTransactions.bind(transactionsController));

// GET /transactions/recent-winners - Feed de ganhadores recentes
router.get('/recent-winners', transactionsController.getRecentWinners.bind(transactionsController));

// GET /transactions/daily-ranking - Ranking diário de ganhadores
router.get('/daily-ranking', transactionsController.getDailyWinnersRanking.bind(transactionsController));

// POST /transactions/deposit - Processar depósito
router.post('/deposit', authenticateToken, transactionsController.processDeposit.bind(transactionsController));

module.exports = router;
