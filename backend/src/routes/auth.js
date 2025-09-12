const express = require('express');
const AuthController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Criar instância do controller
const authController = new AuthController();

// Rotas públicas
router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));

// Rotas protegidas
router.get('/me', authenticateToken, authController.me.bind(authController));
router.post('/refresh', authenticateToken, authController.refresh.bind(authController));

module.exports = router;