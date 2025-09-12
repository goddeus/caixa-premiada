const express = require('express');
const CaixasController = require('../controllers/caixasController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Criar instância do controller
const caixasController = new CaixasController();

// Rotas públicas (com auth opcional)
router.get('/', optionalAuth, caixasController.list.bind(caixasController));
router.get('/stats', optionalAuth, caixasController.stats.bind(caixasController));
router.get('/:id', optionalAuth, caixasController.getById.bind(caixasController));
router.get('/:id/historico', optionalAuth, caixasController.historico.bind(caixasController));

// Rotas protegidas
router.post('/:id/abrir', authenticateToken, caixasController.abrir.bind(caixasController));

module.exports = router;


