const express = require('express');
const PaymentController = require('../controllers/paymentController');
const { authenticateToken, requireNormalAccount } = require('../middleware/auth');

const router = express.Router();

// Rotas de depósito (métodos estáticos)
router.post('/deposit', authenticateToken, PaymentController.createDeposit);
router.post('/deposit/pix', PaymentController.createDepositPix);
router.post('/deposit/callback', PaymentController.depositCallback);

// Webhook VizzionPay
router.post('/webhook/vizzion', PaymentController.vizzionWebhook);

// Rotas de saque (apenas contas normais) (métodos estáticos)
router.post('/withdraw', authenticateToken, requireNormalAccount, PaymentController.createWithdraw);
router.post('/withdraw/callback', PaymentController.withdrawCallback);

// Histórico e consultas (métodos estáticos)
router.get('/history', authenticateToken, PaymentController.history);
router.get('/:id', authenticateToken, PaymentController.getPayment);
router.get('/:id/status', authenticateToken, PaymentController.checkStatus);

module.exports = router;