const express = require('express');
const AffiliateController = require('../controllers/affiliateController');
const { authenticateToken, requireNormalAccount } = require('../middleware/auth');

const router = express.Router();

// Validação pública de código (método estático)
router.get('/validate/:code', AffiliateController.validateCode);

// Rotas protegidas (todas as contas autenticadas)
router.post('/create', authenticateToken, AffiliateController.create);
router.get('/', authenticateToken, AffiliateController.me); // Rota principal
router.get('/me', authenticateToken, AffiliateController.me);
router.get('/stats', authenticateToken, AffiliateController.stats);
router.get('/referrals', authenticateToken, AffiliateController.referrals);
router.get('/commissions', authenticateToken, AffiliateController.commissions);
router.post('/withdraw', authenticateToken, requireNormalAccount, AffiliateController.withdraw);
router.get('/withdrawals', authenticateToken, requireNormalAccount, AffiliateController.withdrawals);

module.exports = router;