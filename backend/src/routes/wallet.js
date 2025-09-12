const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const { authenticateToken } = require('../middleware/auth');

// GET /wallet - Consultar saldo
router.get('/', authenticateToken, walletController.getBalance);

// POST /wallet/deposit - Fazer depósito
router.post('/deposit', authenticateToken, walletController.deposit);

// POST /wallet/withdraw - Solicitar saque
router.post('/withdraw', authenticateToken, walletController.withdraw);

// POST /wallet/recharge-demo - Recarregar saldo demo (apenas contas demo)
router.post('/recharge-demo', authenticateToken, walletController.rechargeDemo);

module.exports = router;
