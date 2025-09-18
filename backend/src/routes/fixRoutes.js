/**
 * ROTAS PARA CORREÇÃO MANUAL
 * 
 * Estas rotas permitem executar correções via HTTP
 * Útil para o Render onde não é possível executar npm run
 */

const express = require('express');
const router = express.Router();

// Middleware para verificar se é admin (opcional)
const requireAdmin = (req, res, next) => {
  // Por enquanto, permitir acesso sem autenticação para correção
  next();
};

/**
 * POST /api/fix/force-all
 * Executar correção forçada completa
 */
router.post('/force-all', requireAdmin, async (req, res) => {
  try {
    console.log('🔧 Executando correção forçada via API...');
    
    const { forceFixAll } = require('../scripts/forceFixAll');
    await forceFixAll();
    
    res.json({
      success: true,
      message: 'Correção forçada executada com sucesso!',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Erro na correção forçada via API:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao executar correção forçada',
      error: error.message
    });
  }
});

/**
 * POST /api/fix/check-balance
 * Verificar saldo do usuário
 */
router.post('/check-balance', requireAdmin, async (req, res) => {
  try {
    console.log('🔍 Verificando saldo via API...');
    
    const { checkUserBalance } = require('../scripts/checkUserBalance');
    await checkUserBalance();
    
    res.json({
      success: true,
      message: 'Verificação de saldo executada com sucesso!',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Erro na verificação de saldo via API:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar saldo',
      error: error.message
    });
  }
});

/**
 * POST /api/fix/affiliate
 * Corrigir vinculação de afiliado
 */
router.post('/affiliate', requireAdmin, async (req, res) => {
  try {
    console.log('🎯 Corrigindo afiliado via API...');
    
    const { fixAffiliateLink } = require('../scripts/fixAffiliateLink');
    await fixAffiliateLink();
    
    res.json({
      success: true,
      message: 'Correção de afiliado executada com sucesso!',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Erro na correção de afiliado via API:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao corrigir afiliado',
      error: error.message
    });
  }
});

/**
 * GET /api/fix/status
 * Verificar status das correções
 */
router.get('/status', requireAdmin, async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const userId = '6f73f55f-f9d6-4108-8838-ab76407d7e63';
    
    // Buscar dados do usuário
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { wallet: true }
    });
    
    // Buscar transações de depósito
    const deposits = await prisma.transaction.findMany({
      where: {
        user_id: userId,
        tipo: 'deposito'
      },
      orderBy: { criado_em: 'desc' },
      take: 5
    });
    
    // Buscar comissões de afiliado
    const commissions = await prisma.affiliateCommission.findMany({
      where: { user_id: userId },
      include: { affiliate: true }
    });
    
    await prisma.$disconnect();
    
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          saldo_reais: user.saldo_reais,
          saldo_demo: user.saldo_demo,
          affiliate_id: user.affiliate_id,
          codigo_indicacao_usado: user.codigo_indicacao_usado,
          wallet: user.wallet
        },
        deposits: deposits.map(d => ({
          id: d.id,
          valor: d.valor,
          status: d.status,
          criado_em: d.criado_em,
          identifier: d.identifier
        })),
        commissions: commissions.map(c => ({
          id: c.id,
          valor: c.valor,
          status: c.status,
          criado_em: c.criado_em
        }))
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Erro ao verificar status:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar status',
      error: error.message
    });
  }
});

module.exports = router;
