const express = require('express');
const DepositController = require('../controllers/depositController');

const router = express.Router();

// POST /api/deposit/pix - Criar depósito PIX
router.post('/pix', (req, res) => DepositController.createPixDeposit(req, res));

module.exports = router;
