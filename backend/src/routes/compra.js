const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const CompraController = require('../controllers/compraController');

// Criar instância do controller
const compraController = new CompraController();

// GET /compra/cases - Listar todas as caixas disponíveis
router.get('/cases', (req, res) => compraController.getCases(req, res));

// GET /compra/cases/:id - Buscar detalhes de uma caixa específica
router.get('/cases/:id', (req, res) => compraController.getCaseById(req, res));

// POST /compra/buy/:id - Comprar e abrir uma caixa (SISTEMA CORRIGIDO)
router.post('/buy/:id', authenticateToken, (req, res) => compraController.buyCase(req, res));

// POST /compra/buy-multiple/:id - Comprar e abrir múltiplas caixas (SISTEMA CORRIGIDO)
router.post('/buy-multiple/:id', authenticateToken, (req, res) => compraController.buyMultipleCases(req, res));

module.exports = router;
