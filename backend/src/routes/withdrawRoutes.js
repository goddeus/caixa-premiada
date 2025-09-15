const express = require('express');
const WithdrawController = require('../controllers/withdrawController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// POST /api/withdraw/pix - Criar saque PIX
router.post('/pix', authenticateToken, (req, res) => WithdrawController.createPixWithdraw(req, res));

// GET /api/withdraw/history/:userId - Histórico de saques do usuário
router.get('/history/:userId', authenticateToken, (req, res) => WithdrawController.getWithdrawHistory(req, res));

// GET /api/withdraw/stats - Estatísticas de saques (Admin)
router.get('/stats', authenticateToken, requireAdmin, (req, res) => WithdrawController.getWithdrawStats(req, res));

module.exports = router;
