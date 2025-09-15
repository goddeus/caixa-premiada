const express = require('express');
const WithdrawController = require('../controllers/withdrawController');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

const router = express.Router();

// POST /api/withdraw/pix - Criar saque PIX
router.post('/pix', authMiddleware, WithdrawController.createPixWithdraw);

// GET /api/withdraw/history/:userId - Histórico de saques do usuário
router.get('/history/:userId', authMiddleware, WithdrawController.getWithdrawHistory);

// GET /api/withdraw/stats - Estatísticas de saques (Admin)
router.get('/stats', authMiddleware, adminMiddleware, WithdrawController.getWithdrawStats);

module.exports = router;
