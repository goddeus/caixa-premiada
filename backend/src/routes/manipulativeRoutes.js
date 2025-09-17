const express = require('express');
const router = express.Router();
const manipulativeCompraController = require('../controllers/manipulativeCompraController');
const { authenticateToken } = require('../middleware/auth');

/**
 * ROTAS DO SISTEMA MANIPULATIVO
 * 
 * Estas rotas implementam o sistema mais agressivo e viciante
 * para maximizar retenção e lucros através de técnicas psicológicas.
 */

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

/**
 * POST /api/manipulative/cases/:id/buy
 * Compra de caixa com sistema manipulativo
 */
router.post('/cases/:id/buy', async (req, res) => {
  try {
    await manipulativeCompraController.buyCaseManipulative(req, res);
  } catch (error) {
    console.error('Erro na rota de compra manipulativa:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno no servidor',
      message: error.message
    });
  }
});

/**
 * POST /api/manipulative/cases/:id/buy-multiple
 * Compra múltipla com sistema manipulativo
 */
router.post('/cases/:id/buy-multiple', async (req, res) => {
  try {
    await manipulativeCompraController.buyMultipleCasesManipulative(req, res);
  } catch (error) {
    console.error('Erro na rota de compra múltipla manipulativa:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno no servidor',
      message: error.message
    });
  }
});

/**
 * GET /api/manipulative/user/stats
 * Estatísticas manipulativas do usuário
 */
router.get('/user/stats', async (req, res) => {
  try {
    await manipulativeCompraController.getUserManipulativeStats(req, res);
  } catch (error) {
    console.error('Erro na rota de estatísticas manipulativas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno no servidor',
      message: error.message
    });
  }
});

module.exports = router;
