const express = require('express');
const WebhookController = require('../controllers/webhookController');

const router = express.Router();

// Middleware para receber JSON bruto (caso a VizzionPay envie assinatura no futuro)
router.use(express.json({ type: "*/*" }));

// POST /api/webhook/pix - Webhook de confirmação PIX
router.post('/pix', WebhookController.handlePixWebhook);

// POST /api/webhook/withdraw - Webhook de confirmação saque
router.post('/withdraw', WebhookController.handleWithdrawWebhook);

module.exports = router;
