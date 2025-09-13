const express = require('express');
const WithdrawController = require('../controllers/withdrawController');

const router = express.Router();

// POST /api/withdraw/pix - Criar saque PIX
router.post('/pix', WithdrawController.createPixWithdraw);

module.exports = router;
