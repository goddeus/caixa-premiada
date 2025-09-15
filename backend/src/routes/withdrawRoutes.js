const express = require('express');
const WithdrawController = require('../controllers/withdrawController');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

const router = express.Router();

// POST /api/withdraw/pix - Criar saque PIX
router.post('/pix', authMiddleware, (req, res) => WithdrawController.createPixWithdraw(req, res));

// GET /api/withdraw/history/:userId - Histórico de saques do usuário
router.get('/history/:userId', authMiddleware, (req, res) => WithdrawController.getWithdrawHistory(req, res));

// GET /api/withdraw/stats - Estatísticas de saques (Admin)
router.get('/stats', authMiddleware, adminMiddleware, (req, res) => WithdrawController.getWithdrawStats(req, res));

module.exports = router;
