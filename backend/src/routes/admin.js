const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const CashFlowController = require('../controllers/cashFlowController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Criar instâncias dos controllers
const adminController = new AdminController();
const cashFlowController = new CashFlowController();

// Middleware para todas as rotas admin
router.use(authenticateToken);
router.use(requireAdmin);

// Dashboard
router.get('/dashboard/stats', (req, res) => adminController.getDashboardStats(req, res));

// Usuários
router.get('/users', (req, res) => adminController.getUsers(req, res));
router.put('/users/:userId', (req, res) => adminController.updateUser(req, res));
router.post('/users/:userId/reset-password', (req, res) => adminController.resetUserPassword(req, res));

// Financeiro - Depósitos
router.get('/deposits', (req, res) => adminController.getDeposits(req, res));

// Financeiro - Saques
router.get('/withdrawals', (req, res) => adminController.getWithdrawals(req, res));
router.put('/withdrawals/:withdrawalId/status', (req, res) => adminController.updateWithdrawalStatus(req, res));

// Afiliados
router.get('/affiliates', (req, res) => adminController.getAffiliates(req, res));
router.put('/affiliate-withdrawals/:withdrawalId/status', (req, res) => adminController.updateAffiliateWithdrawalStatus(req, res));

// Logs e Histórico
router.get('/logs', (req, res) => adminController.getAdminLogs(req, res));
router.get('/login-history', (req, res) => adminController.getLoginHistory(req, res));

// Fundos de Teste
router.post('/add-test-funds', (req, res) => adminController.addTestFunds(req, res));

// Limpar dados do controle da casa
router.post('/clear-house-data', (req, res) => adminController.clearHouseData(req, res));

// Configurações do Sistema
router.get('/settings', (req, res) => adminController.getSettings(req, res));
router.put('/settings/:key', (req, res) => adminController.updateSetting(req, res));

// Adicionar saldo de teste com rollover
router.post('/add-test-balance/:userId', (req, res) => adminController.addTestBalance(req, res));


// Fluxo de Caixa Centralizado
router.get('/cashflow/liquido', (req, res) => cashFlowController.getCaixaLiquido(req, res));
router.get('/cashflow/stats', (req, res) => cashFlowController.getCashFlowStats(req, res));
router.post('/cashflow/transacao', (req, res) => cashFlowController.registrarTransacao(req, res));
router.get('/cashflow/history', (req, res) => cashFlowController.getCashFlowHistory(req, res));
router.post('/cashflow/validar', (req, res) => cashFlowController.validarTransacao(req, res));

// Auditoria
router.get('/audit/logs', (req, res) => adminController.getAuditLogs(req, res));

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
router.post('/sync-prizes-images', (req, res) => adminController.syncPrizesAndImages(req, res));
router.get('/prizes-consistency-report', (req, res) => adminController.getPrizeConsistencyReport(req, res));

// Migrações e Seeds
router.get('/migrations/status', (req, res) => adminController.getMigrationStatus(req, res));
router.post('/migrations/seed-audit', (req, res) => adminController.runAuditSeed(req, res));

module.exports = router;