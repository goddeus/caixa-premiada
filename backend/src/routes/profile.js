const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { authenticateToken } = require('../middleware/auth');

// GET /profile - Buscar dados do perfil do usuário
router.get('/', authenticateToken, profileController.getProfile);

// PUT /profile - Atualizar dados do perfil
router.put('/', authenticateToken, profileController.updateProfile);

// GET /profile/game-history - Histórico de jogos do usuário
router.get('/game-history', authenticateToken, profileController.getGameHistory);

module.exports = router;
