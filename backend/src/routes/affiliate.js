const express = require('express');
const AffiliateController = require('../controllers/affiliateController');
const { authenticateToken, requireNormalAccount } = require('../middleware/auth');

const router = express.Router();

// Validação pública de código
router.get('/validate/:code', AffiliateController.validateCode);

// Rotas protegidas (apenas contas normais)
router.post('/create', authenticateToken, requireNormalAccount, AffiliateController.create);
router.get('/me', authenticateToken, requireNormalAccount, AffiliateController.me);
router.get('/stats', authenticateToken, requireNormalAccount, AffiliateController.stats);
router.get('/referrals', authenticateToken, requireNormalAccount, AffiliateController.referrals);
router.get('/commissions', authenticateToken, requireNormalAccount, AffiliateController.commissions);
router.post('/withdraw', authenticateToken, requireNormalAccount, AffiliateController.withdraw);
router.get('/withdrawals', authenticateToken, requireNormalAccount, AffiliateController.withdrawals);

module.exports = router;