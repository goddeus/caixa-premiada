/**
 * Rotas de Administração
 * Endpoints para administradores gerenciarem o sistema
 */

const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');
const loggingService = require('../services/loggingService');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Aplicar middleware de autenticação e autorização para todas as rotas
router.use(authenticateToken);
router.use(requireAdmin);

/**
 * GET /api/admin/logs/export
 * Exporta logs para análise
 */
router.get('/logs/export', async (req, res) => {
  try {
    const { startDate, endDate, logTypes } = req.query;
    
    // Validar parâmetros
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'startDate e endDate são obrigatórios'
      });
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Datas inválidas'
      });
    }
    
    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: 'startDate deve ser anterior a endDate'
      });
    }
    
    // Exportar logs
    const logTypesArray = logTypes ? logTypes.split(',') : [];
    const exportedLogs = loggingService.exportLogs(start, end, logTypesArray);
    
    if (!exportedLogs) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao exportar logs'
      });
    }
    
    // Log da operação
    loggingService.audit('export_logs', req.user.id, 'logs', {
      startDate,
      endDate,
      logTypes: logTypesArray,
      logCount: exportedLogs.logs.length
    });
    
    res.json({
      success: true,
      data: exportedLogs
    });
    
  } catch (error) {
    loggingService.error('Erro ao exportar logs', {
      error: error.message,
      userId: req.user.id
    });
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * GET /api/admin/logs/stats
 * Retorna estatísticas dos logs
 */
router.get('/logs/stats', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    // Exportar logs do período
    const exportedLogs = loggingService.exportLogs(startDate, endDate);
    
    if (!exportedLogs) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao obter estatísticas dos logs'
      });
    }
    
    // Calcular estatísticas
    const stats = {
      totalLogs: exportedLogs.logs.length,
      byLevel: {},
      byType: {},
      errors: 0,
      warnings: 0,
      transactions: 0,
      payments: 0,
      webhooks: 0
    };
    
    exportedLogs.logs.forEach(log => {
      // Por nível
      stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;
      
      // Por tipo
      if (log.message.includes('Transação')) {
        stats.transactions++;
        stats.byType.transaction = (stats.byType.transaction || 0) + 1;
      } else if (log.message.includes('Pagamento')) {
        stats.payments++;
        stats.byType.payment = (stats.byType.payment || 0) + 1;
      } else if (log.message.includes('Webhook')) {
        stats.webhooks++;
        stats.byType.webhook = (stats.byType.webhook || 0) + 1;
      }
      
      // Contadores específicos
      if (log.level === 'ERROR') stats.errors++;
      if (log.level === 'WARN') stats.warnings++;
    });
    
    res.json({
      success: true,
      data: {
        period: { startDate, endDate },
        stats
      }
    });
    
  } catch (error) {
    loggingService.error('Erro ao obter estatísticas dos logs', {
      error: error.message,
      userId: req.user.id
    });
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * POST /api/admin/logs/cleanup
 * Limpa logs antigos
 */
router.post('/logs/cleanup', async (req, res) => {
  try {
    const { daysToKeep = 30 } = req.body;
    
    if (daysToKeep < 7) {
      return res.status(400).json({
        success: false,
        message: 'daysToKeep deve ser pelo menos 7 dias'
      });
    }
    
    // Executar limpeza
    loggingService.cleanupOldLogs(daysToKeep);
    
    // Log da operação
    loggingService.audit('cleanup_logs', req.user.id, 'logs', {
      daysToKeep
    });
    
    res.json({
      success: true,
      message: `Logs antigos removidos (mantidos últimos ${daysToKeep} dias)`
    });
    
  } catch (error) {
    loggingService.error('Erro ao limpar logs', {
      error: error.message,
      userId: req.user.id
    });
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * GET /api/admin/system/health
 * Retorna status detalhado do sistema
 */
router.get('/system/health', async (req, res) => {
  try {
    const health = {
      timestamp: new Date().toISOString(),
      status: 'healthy',
      services: {},
      metrics: {}
    };
    
    // Verificar banco de dados
    try {
      await prisma.$queryRaw`SELECT 1`;
      health.services.database = { status: 'healthy', responseTime: Date.now() };
    } catch (error) {
      health.services.database = { status: 'unhealthy', error: error.message };
      health.status = 'unhealthy';
    }
    
    // Verificar VizzionPay (simulação)
    try {
      // Aqui seria feita uma verificação real da API da VizzionPay
      health.services.vizzionpay = { status: 'healthy', responseTime: Date.now() };
    } catch (error) {
      health.services.vizzionpay = { status: 'unhealthy', error: error.message };
      health.status = 'unhealthy';
    }
    
    // Métricas básicas
    try {
      const userCount = await prisma.user.count();
      const transactionCount = await prisma.transaction.count();
      const caseCount = await prisma.case.count();
      
      health.metrics = {
        users: userCount,
        transactions: transactionCount,
        cases: caseCount
      };
    } catch (error) {
      health.metrics = { error: 'Erro ao obter métricas' };
    }
    
    res.json({
      success: true,
      data: health
    });
    
  } catch (error) {
    loggingService.error('Erro ao verificar saúde do sistema', {
      error: error.message,
      userId: req.user.id
    });
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * GET /api/admin/users/stats
 * Retorna estatísticas de usuários
 */
router.get('/users/stats', async (req, res) => {
  try {
    const stats = await prisma.user.groupBy({
      by: ['tipo_conta'],
      _count: {
        id: true
      }
    });
    
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({
      where: {
        saldo_reais: { gt: 0 }
      }
    });
    
    res.json({
      success: true,
      data: {
        total: totalUsers,
        active: activeUsers,
        byType: stats.reduce((acc, stat) => {
          acc[stat.tipo_conta] = stat._count.id;
          return acc;
        }, {})
      }
    });
    
  } catch (error) {
    loggingService.error('Erro ao obter estatísticas de usuários', {
      error: error.message,
      userId: req.user.id
    });
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * GET /api/admin/transactions/stats
 * Retorna estatísticas de transações
 */
router.get('/transactions/stats', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const stats = await prisma.transaction.groupBy({
      by: ['tipo'],
      where: {
        created_at: {
          gte: startDate,
          lte: endDate
        }
      },
      _count: {
        id: true
      },
      _sum: {
        valor: true
      }
    });
    
    const totalTransactions = await prisma.transaction.count({
      where: {
        created_at: {
          gte: startDate,
          lte: endDate
        }
      }
    });
    
    const totalValue = await prisma.transaction.aggregate({
      where: {
        created_at: {
          gte: startDate,
          lte: endDate
        }
      },
      _sum: {
        valor: true
      }
    });
    
    res.json({
      success: true,
      data: {
        period: { startDate, endDate },
        total: totalTransactions,
        totalValue: totalValue._sum.valor || 0,
        byType: stats.reduce((acc, stat) => {
          acc[stat.tipo] = {
            count: stat._count.id,
            value: stat._sum.valor || 0
          };
          return acc;
        }, {})
      }
    });
    
  } catch (error) {
    loggingService.error('Erro ao obter estatísticas de transações', {
      error: error.message,
      userId: req.user.id
    });
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
