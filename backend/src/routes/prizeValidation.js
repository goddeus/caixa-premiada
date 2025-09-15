const express = require('express');
const router = express.Router();
const PrizeValidationController = require('../controllers/prizeValidationController');
const { authenticateToken } = require('../middleware/auth');

// Criar instância do controller
const prizeValidationController = new PrizeValidationController();

// Todas as rotas requerem autenticação de admin
router.use(authenticateToken);

// Verificar se o usuário é admin
router.use((req, res, next) => {
  if (!req.user || !req.user.is_admin) {
    return res.status(403).json({
      success: false,
      error: 'Acesso negado. Apenas administradores podem acessar esta funcionalidade.'
    });
  }
  next();
});

/**
 * @route POST /api/prize-validation/verificar
 * @desc Executa verificação global de consistência de prêmios
 * @access Admin
 */
router.post('/verificar', (req, res) => prizeValidationController.verificarConsistencia(req, res));

/**
 * @route POST /api/prize-validation/corrigir-automaticamente
 * @desc Corrige automaticamente inconsistências simples
 * @access Admin
 */
router.post('/corrigir-automaticamente', (req, res) => prizeValidationController.corrigirAutomaticamente(req, res));

/**
 * @route GET /api/prize-validation/estatisticas
 * @desc Obtém estatísticas de validação
 * @access Admin
 */
router.get('/estatisticas', (req, res) => prizeValidationController.getEstatisticas(req, res));

/**
 * @route GET /api/prize-validation/validar/:prizeId
 * @desc Valida um prêmio específico
 * @access Admin
 */
router.get('/validar/:prizeId', (req, res) => prizeValidationController.validarPremioEspecifico(req, res));

module.exports = router;
