const express = require('express');
const DepositController = require('../controllers/depositController');

const router = express.Router();

// POST /api/deposit/pix - Criar depósito PIX
router.post('/pix', DepositController.createPixDeposit);

module.exports = router;
