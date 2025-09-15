const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const TransactionsController = require('../controllers/transactionsController');

// Criar instância do controller
const transactionsController = new TransactionsController();

// GET /transactions - Listar transações do usuário
router.get('/', authenticateToken, (req, res) => transactionsController.getUserTransactions(req, res));

// GET /transactions/recent-winners - Feed de ganhadores recentes
router.get('/recent-winners', (req, res) => transactionsController.getRecentWinners(req, res));

// GET /transactions/daily-ranking - Ranking diário de ganhadores
router.get('/daily-ranking', (req, res) => transactionsController.getDailyWinnersRanking(req, res));

// POST /transactions/deposit - Processar depósito
router.post('/deposit', authenticateToken, (req, res) => transactionsController.processDeposit(req, res));

module.exports = router;
