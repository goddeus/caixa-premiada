const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const rtpController = require('../controllers/rtpController');
const cashFlowController = require('../controllers/cashFlowController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Middleware para todas as rotas admin
router.use(authenticateToken);
router.use(requireAdmin);

// Dashboard
router.get('/dashboard/stats', adminController.getDashboardStats);

// Usuários
router.get('/users', adminController.getUsers);
router.put('/users/:userId', adminController.updateUser);
router.post('/users/:userId/reset-password', adminController.resetUserPassword);

// Financeiro - Depósitos
router.get('/deposits', adminController.getDeposits);

// Financeiro - Saques
router.get('/withdrawals', adminController.getWithdrawals);
router.put('/withdrawals/:withdrawalId/status', adminController.updateWithdrawalStatus);

// Afiliados
router.get('/affiliates', adminController.getAffiliates);
router.put('/affiliate-withdrawals/:withdrawalId/status', adminController.updateAffiliateWithdrawalStatus);

// Logs e Histórico
router.get('/logs', adminController.getAdminLogs);
router.get('/login-history', adminController.getLoginHistory);

// Fundos de Teste
router.post('/add-test-funds', adminController.addTestFunds);

// Limpar dados do controle da casa
router.post('/clear-house-data', adminController.clearHouseData);

// Configurações do Sistema
router.get('/settings', adminController.getSettings);
router.put('/settings/:key', adminController.updateSetting);

// Adicionar saldo de teste com rollover
router.post('/add-test-balance/:userId', adminController.addTestBalance);

// Controle da Casa - RTP
router.get('/rtp/config', rtpController.getRTPConfig);
router.put('/rtp/target', rtpController.updateRTPTarget);
router.get('/rtp/recommended', rtpController.getRecommendedRTP);
router.post('/rtp/apply-recommendation', rtpController.applyRecommendation);
router.get('/rtp/cashflow-stats', rtpController.getCashFlowStats);
router.get('/rtp/history', rtpController.getRTPHistory);

// Fluxo de Caixa Centralizado
router.get('/cashflow/liquido', cashFlowController.getCaixaLiquido);
router.get('/cashflow/stats', cashFlowController.getCashFlowStats);
router.post('/cashflow/transacao', cashFlowController.registrarTransacao);
router.get('/cashflow/history', cashFlowController.getCashFlowHistory);
router.post('/cashflow/validar', cashFlowController.validarTransacao);

// Auditoria e Proteção RTP
router.get('/audit/logs', adminController.getAuditLogs);
router.get('/rtp/protection-stats', adminController.getRTPProtectionStats);

module.exports = router;