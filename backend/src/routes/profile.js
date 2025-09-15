const express = require('express');
const router = express.Router();
const ProfileController = require('../controllers/profileController');
const { authenticateToken } = require('../middleware/auth');

// Criar instância do controller
const profileController = new ProfileController();

// GET /profile - Buscar dados do perfil do usuário
router.get('/', authenticateToken, (req, res) => profileController.getProfile(req, res));

// PUT /profile - Atualizar dados do perfil
router.put('/', authenticateToken, (req, res) => profileController.updateProfile(req, res));

// GET /profile/game-history - Histórico de jogos do usuário
router.get('/game-history', authenticateToken, (req, res) => profileController.getGameHistory(req, res));

module.exports = router;
