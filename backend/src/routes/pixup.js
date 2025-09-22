const express = require('express');
const PixupController = require('../controllers/pixupController');
const PixupWebhookController = require('../controllers/pixupWebhookController');
const { authenticateToken, requireNormalAccount } = require('../middleware/auth');

const router = express.Router();

// Rotas de depósito Pixup
router.post('/deposit', authenticateToken, PixupController.createDeposit);
router.get('/deposit/status/:externalId', authenticateToken, PixupController.checkDepositStatus);

// Rotas de saque Pixup (apenas contas normais)
router.post('/withdraw', authenticateToken, requireNormalAccount, PixupController.createWithdraw);
router.get('/withdraw/status/:externalId', authenticateToken, PixupController.checkWithdrawStatus);

// Webhooks Pixup (sem autenticação - chamados pelo Pixup)
router.post('/webhook/payment', PixupWebhookController.handlePaymentWebhook);
router.post('/webhook/transfer', PixupWebhookController.handleTransferWebhook);

module.exports = router;
