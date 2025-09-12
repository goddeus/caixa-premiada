const express = require('express');
const CaixasController = require('../controllers/caixasController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Rotas públicas (com auth opcional) (métodos estáticos)
router.get('/', optionalAuth, CaixasController.list);
router.get('/stats', optionalAuth, CaixasController.stats);
router.get('/:id', optionalAuth, CaixasController.getById);
router.get('/:id/historico', optionalAuth, CaixasController.historico);

// Rotas protegidas (métodos estáticos)
router.post('/:id/abrir', authenticateToken, CaixasController.abrir);

module.exports = router;


