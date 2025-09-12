const express = require('express');
const router = express.Router();
const ProfileController = require('../controllers/profileController');
const { authenticateToken } = require('../middleware/auth');

// Criar instância do controller
const profileController = new ProfileController();

// GET /profile - Buscar dados do perfil do usuário
router.get('/', authenticateToken, profileController.getProfile.bind(profileController));

// PUT /profile - Atualizar dados do perfil
router.put('/', authenticateToken, profileController.updateProfile.bind(profileController));

// GET /profile/game-history - Histórico de jogos do usuário
router.get('/game-history', authenticateToken, profileController.getGameHistory.bind(profileController));

module.exports = router;
