const express = require('express');
const router = express.Router();
const WalletController = require('../controllers/walletController');
const { authenticateToken } = require('../middleware/auth');

// Criar instância do controller
const walletController = new WalletController();

// GET /wallet - Consultar saldo
router.get('/', authenticateToken, walletController.getBalance.bind(walletController));

// POST /wallet/deposit - Fazer depósito
router.post('/deposit', authenticateToken, walletController.deposit.bind(walletController));

// POST /wallet/withdraw - Solicitar saque
router.post('/withdraw', authenticateToken, walletController.withdraw.bind(walletController));

// POST /wallet/recharge-demo - Recarregar saldo demo (apenas contas demo)
router.post('/recharge-demo', authenticateToken, walletController.rechargeDemo.bind(walletController));

module.exports = router;
