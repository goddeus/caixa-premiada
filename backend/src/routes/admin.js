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

// Corrigir preços das caixas
router.post('/fix-case-prices', async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    console.log('🔧 Corrigindo preços de todas as caixas...');
    
    const correctPrices = {
      'CAIXA FINAL DE SEMANA': 1.50,
      'CAIXA KIT NIKE': 2.50,
      'CAIXA SAMSUNG': 3.00,
      'CAIXA APPLE': 7.00,
      'CAIXA CONSOLE DOS SONHOS': 3.50,
      'CAIXA PREMIUM MASTER': 15.00
    };
    
    // Buscar todas as caixas
    const cases = await prisma.case.findMany({
      where: {
        ativo: true
      }
    });
    
    console.log('📦 Caixas encontradas:', cases.length);
    
    const results = [];
    
    for (const caseItem of cases) {
      const correctPrice = correctPrices[caseItem.nome];
      
      if (correctPrice && parseFloat(caseItem.preco) !== correctPrice) {
        console.log(`📝 Corrigindo: ${caseItem.nome} - R$ ${caseItem.preco} → R$ ${correctPrice}`);
        
        const updatedCase = await prisma.case.update({
          where: {
            id: caseItem.id
          },
          data: {
            preco: correctPrice
          }
        });
        
        results.push({
          nome: caseItem.nome,
          preco_anterior: parseFloat(caseItem.preco),
          preco_novo: correctPrice,
          status: 'corrigido'
        });
      } else if (correctPrice) {
        results.push({
          nome: caseItem.nome,
          preco_anterior: parseFloat(caseItem.preco),
          preco_novo: parseFloat(caseItem.preco),
          status: 'já_correto'
        });
      }
    }
    
    await prisma.$disconnect();
    
    console.log('🎉 Correção de preços concluída!');
    
    res.json({
      success: true,
      message: 'Preços das caixas corrigidos com sucesso!',
      results: results
    });
    
  } catch (error) {
    console.error('❌ Erro ao corrigir preços:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// Prêmios e Imagens - Sincronização
router.post('/sync-prizes-images', adminController.syncPrizesAndImages.bind(adminController));
router.get('/prizes-consistency-report', adminController.getPrizeConsistencyReport.bind(adminController));

// Migrações e Seeds
router.get('/migrations/status', adminController.getMigrationStatus.bind(adminController));
router.post('/migrations/seed-audit', adminController.runAuditSeed.bind(adminController));

module.exports = router;