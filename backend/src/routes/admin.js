const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const rtpController = require('../controllers/rtpController');
const cashFlowController = require('../controllers/cashFlowController');
const { authenticateToken, requireAdmin, logAdminActivity } = require('../middleware/auth');

// Middleware para todas as rotas admin
router.use(authenticateToken);
router.use(requireAdmin);

// Dashboard
router.get('/dashboard/stats', adminController.getDashboardStats);

// Usuários
router.get('/users', logAdminActivity('LISTAR_USUARIOS'), adminController.getUsers);
router.put('/users/:userId', logAdminActivity('EDITAR_USUARIO'), adminController.updateUser);
router.post('/users/:userId/reset-password', logAdminActivity('RESETAR_SENHA'), adminController.resetUserPassword);

// Financeiro - Depósitos
router.get('/deposits', logAdminActivity('LISTAR_DEPOSITOS'), adminController.getDeposits);

// Financeiro - Saques
router.get('/withdrawals', logAdminActivity('LISTAR_SAQUES'), adminController.getWithdrawals);
router.put('/withdrawals/:withdrawalId/status', logAdminActivity('ATUALIZAR_STATUS_SAQUE'), adminController.updateWithdrawalStatus);

// Afiliados
router.get('/affiliates', logAdminActivity('LISTAR_AFILIADOS'), adminController.getAffiliates);
router.put('/affiliate-withdrawals/:withdrawalId/status', logAdminActivity('ATUALIZAR_STATUS_SAQUE_AFILIADO'), adminController.updateAffiliateWithdrawalStatus);

// Logs e Histórico
router.get('/logs', logAdminActivity('LISTAR_LOGS'), adminController.getAdminLogs);
router.get('/login-history', logAdminActivity('LISTAR_HISTORICO_LOGIN'), adminController.getLoginHistory);

// Fundos de Teste
router.post('/add-test-funds', logAdminActivity('ADICIONAR_FUNDOS_TESTE'), adminController.addTestFunds);

// Limpar dados do controle da casa
router.post('/clear-house-data', logAdminActivity('LIMPAR_DADOS_CASA'), adminController.clearHouseData);

// Configurações do Sistema
router.get('/settings', logAdminActivity('LISTAR_CONFIGURACOES'), adminController.getSettings);
router.put('/settings/:key', logAdminActivity('ATUALIZAR_CONFIGURACAO'), adminController.updateSetting);

// Adicionar saldo de teste com rollover
router.post('/add-test-balance/:userId', logAdminActivity('ADICIONAR_SALDO_TESTE'), adminController.addTestBalance);

// Controle da Casa - RTP
router.get('/rtp/config', logAdminActivity('VER_CONFIGURACAO_RTP'), rtpController.getRTPConfig);
router.put('/rtp/target', logAdminActivity('ATUALIZAR_RTP_ALVO'), rtpController.updateRTPTarget);
router.get('/rtp/recommended', logAdminActivity('VER_RTP_RECOMENDADO'), rtpController.getRecommendedRTP);
router.post('/rtp/apply-recommendation', logAdminActivity('APLICAR_RTP_RECOMENDADO'), rtpController.applyRecommendation);
router.get('/rtp/cashflow-stats', logAdminActivity('VER_ESTATISTICAS_CAIXA'), rtpController.getCashFlowStats);
router.get('/rtp/history', logAdminActivity('VER_HISTORICO_RTP'), rtpController.getRTPHistory);

// Fluxo de Caixa Centralizado
router.get('/cashflow/liquido', logAdminActivity('VER_CAIXA_LIQUIDO'), cashFlowController.getCaixaLiquido);
router.get('/cashflow/stats', logAdminActivity('VER_ESTATISTICAS_FLUXO'), cashFlowController.getCashFlowStats);
router.post('/cashflow/transacao', logAdminActivity('REGISTRAR_TRANSACAO'), cashFlowController.registrarTransacao);
router.get('/cashflow/history', logAdminActivity('VER_HISTORICO_FLUXO'), cashFlowController.getCashFlowHistory);
router.post('/cashflow/validar', logAdminActivity('VALIDAR_TRANSACAO'), cashFlowController.validarTransacao);

// Auditoria e Proteção RTP
router.get('/audit/logs', logAdminActivity('VER_LOGS_AUDITORIA'), adminController.getAuditLogs);
router.get('/rtp/protection-stats', logAdminActivity('VER_ESTATISTICAS_PROTECAO'), adminController.getRTPProtectionStats);

module.exports = router;