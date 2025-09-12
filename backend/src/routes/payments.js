const express = require('express');
const PaymentController = require('../controllers/paymentController');
const { authenticateToken, requireNormalAccount } = require('../middleware/auth');

const router = express.Router();

// Criar instância do controller
const paymentController = new PaymentController();

// Rotas de depósito
router.post('/deposit', authenticateToken, paymentController.createDeposit.bind(paymentController));
router.post('/deposit/callback', paymentController.depositCallback.bind(paymentController));

// Rotas de saque (apenas contas normais)
router.post('/withdraw', authenticateToken, requireNormalAccount, paymentController.createWithdraw.bind(paymentController));
router.post('/withdraw/callback', paymentController.withdrawCallback.bind(paymentController));

// Histórico e consultas
router.get('/history', authenticateToken, paymentController.history.bind(paymentController));
router.get('/:id', authenticateToken, paymentController.getPayment.bind(paymentController));
router.get('/:id/status', authenticateToken, paymentController.checkStatus.bind(paymentController));

module.exports = router;