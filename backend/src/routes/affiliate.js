const express = require('express');
const AffiliateController = require('../controllers/affiliateController');
const { authenticateToken, requireNormalAccount } = require('../middleware/auth');

const router = express.Router();

// Criar instância do controller
const affiliateController = new AffiliateController();

// Validação pública de código
router.get('/validate/:code', affiliateController.validateCode.bind(affiliateController));

// Rotas protegidas (apenas contas normais)
router.post('/create', authenticateToken, requireNormalAccount, affiliateController.create.bind(affiliateController));
router.get('/me', authenticateToken, requireNormalAccount, affiliateController.me.bind(affiliateController));
router.get('/stats', authenticateToken, requireNormalAccount, affiliateController.stats.bind(affiliateController));
router.get('/referrals', authenticateToken, requireNormalAccount, affiliateController.referrals.bind(affiliateController));
router.get('/commissions', authenticateToken, requireNormalAccount, affiliateController.commissions.bind(affiliateController));
router.post('/withdraw', authenticateToken, requireNormalAccount, affiliateController.withdraw.bind(affiliateController));
router.get('/withdrawals', authenticateToken, requireNormalAccount, affiliateController.withdrawals.bind(affiliateController));

module.exports = router;