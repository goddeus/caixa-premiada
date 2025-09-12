const express = require('express');
const AuthController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Rotas públicas
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// Rotas protegidas
router.get('/me', authenticateToken, AuthController.me);
router.post('/refresh', authenticateToken, AuthController.refresh);

module.exports = router;