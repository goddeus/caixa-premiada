const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const RTPController = require('../controllers/rtpController');
const CashFlowController = require('../controllers/cashFlowController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Criar instâncias dos controllers
const adminController = new AdminController();
const rtpController = new RTPController();
const cashFlowController = new CashFlowController();

// Middleware para todas as rotas admin
router.use(authenticateToken);
router.use(requireAdmin);

// Dashboard
router.get('/dashboard/stats', adminController.getDashboardStats.bind(adminController));

// Usuários
router.get('/users', adminController.getUsers.bind(adminController));
router.put('/users/:userId', adminController.updateUser.bind(adminController));
router.post('/users/:userId/reset-password', adminController.resetUserPassword.bind(adminController));

// Financeiro - Depósitos
router.get('/deposits', adminController.getDeposits.bind(adminController));

// Financeiro - Saques
router.get('/withdrawals', adminController.getWithdrawals.bind(adminController));
router.put('/withdrawals/:withdrawalId/status', adminController.updateWithdrawalStatus.bind(adminController));

// Afiliados
router.get('/affiliates', adminController.getAffiliates.bind(adminController));
router.put('/affiliate-withdrawals/:withdrawalId/status', adminController.updateAffiliateWithdrawalStatus.bind(adminController));

// Logs e Histórico
router.get('/logs', adminController.getAdminLogs.bind(adminController));
router.get('/login-history', adminController.getLoginHistory.bind(adminController));

// Fundos de Teste
router.post('/add-test-funds', adminController.addTestFunds.bind(adminController));

// Limpar dados do controle da casa
router.post('/clear-house-data', adminController.clearHouseData.bind(adminController));

// Configurações do Sistema
router.get('/settings', adminController.getSettings.bind(adminController));
router.put('/settings/:key', adminController.updateSetting.bind(adminController));

// Adicionar saldo de teste com rollover
router.post('/add-test-balance/:userId', adminController.addTestBalance.bind(adminController));

// Controle da Casa - RTP
router.get('/rtp/config', rtpController.getRTPConfig.bind(rtpController));
router.put('/rtp/target', rtpController.updateRTPTarget.bind(rtpController));
router.get('/rtp/recommended', rtpController.getRecommendedRTP.bind(rtpController));
router.post('/rtp/apply-recommendation', rtpController.applyRecommendation.bind(rtpController));
router.get('/rtp/cashflow-stats', rtpController.getCashFlowStats.bind(rtpController));
router.get('/rtp/history', rtpController.getRTPHistory.bind(rtpController));

// Fluxo de Caixa Centralizado
router.get('/cashflow/liquido', cashFlowController.getCaixaLiquido.bind(cashFlowController));
router.get('/cashflow/stats', cashFlowController.getCashFlowStats.bind(cashFlowController));
router.post('/cashflow/transacao', cashFlowController.registrarTransacao.bind(cashFlowController));
router.get('/cashflow/history', cashFlowController.getCashFlowHistory.bind(cashFlowController));
router.post('/cashflow/validar', cashFlowController.validarTransacao.bind(cashFlowController));

// Auditoria e Proteção RTP
router.get('/audit/logs', adminController.getAuditLogs.bind(adminController));
router.get('/rtp/protection-stats', adminController.getRTPProtectionStats.bind(adminController));

module.exports = router;