const express = require('express');
const router = express.Router();
const WalletController = require('../controllers/walletController');
const { authenticateToken } = require('../middleware/auth');

// Criar instância do controller
const walletController = new WalletController();

// GET /wallet - Consultar saldo
router.get('/', authenticateToken, (req, res) => walletController.getBalance(req, res));

// POST /wallet/deposit - Fazer depósito
router.post('/deposit', authenticateToken, (req, res) => walletController.deposit(req, res));

// POST /wallet/withdraw - Solicitar saque
router.post('/withdraw', authenticateToken, (req, res) => walletController.withdraw(req, res));

// POST /wallet/recharge-demo - Recarregar saldo demo (apenas contas demo)
router.post('/recharge-demo', authenticateToken, (req, res) => walletController.rechargeDemo(req, res));

module.exports = router;
