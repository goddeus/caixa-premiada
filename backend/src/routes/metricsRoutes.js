/**
 * Rotas de Métricas
 * Endpoints para visualizar métricas do sistema
 */

const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { getMetrics, resetMetrics } = require('../middleware/monitoringMiddleware');
const loggingService = require('../services/loggingService');

// Aplicar middleware de autenticação e autorização para todas as rotas
router.use(authenticateToken);
router.use(requireAdmin);

/**
 * GET /api/metrics/overview
 * Retorna visão geral das métricas
 */
router.get('/overview', async (req, res) => {
  try {
    const metrics = getMetrics();
    
    // Calcular métricas derivadas
    const avgResponseTime = metrics.responseTimes.total > 0 
      ? metrics.responseTimes.sum / metrics.responseTimes.total 
      : 0;
    
    const errorRate = metrics.requests.total > 0 
      ? (metrics.requests.errors / metrics.requests.total) * 100 
      : 0;
    
    const overview = {
      timestamp: new Date().toISOString(),
      requests: {
        total: metrics.requests.total,
        errors: metrics.requests.errors,
        errorRate: parseFloat(errorRate.toFixed(2))
      },
      performance: {
        avgResponseTime: parseFloat(avgResponseTime.toFixed(2)),
        totalResponseTime: metrics.responseTimes.sum
      },
      transactions: {
        total: metrics.transactions.total,
        totalValue: metrics.transactions.totalValue,
        byType: metrics.transactions.byType
      },
      system: {
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime(),
        nodeVersion: process.version
      }
    };
    
    res.json({
      success: true,
      data: overview
    });
    
  } catch (error) {
    loggingService.error('Erro ao obter métricas', {
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
 * GET /api/metrics/requests
 * Retorna métricas de requisições
 */
router.get('/requests', async (req, res) => {
  try {
    const metrics = getMetrics();
    
    const requestMetrics = {
      timestamp: new Date().toISOString(),
      total: metrics.requests.total,
      errors: metrics.requests.errors,
      errorRate: metrics.requests.total > 0 
        ? parseFloat(((metrics.requests.errors / metrics.requests.total) * 100).toFixed(2))
        : 0,
      byMethod: metrics.requests.byMethod,
      byStatus: metrics.requests.byStatus,
      byEndpoint: metrics.requests.byEndpoint
    };
    
    res.json({
      success: true,
      data: requestMetrics
    });
    
  } catch (error) {
    loggingService.error('Erro ao obter métricas de requisições', {
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
 * GET /api/metrics/performance
 * Retorna métricas de performance
 */
router.get('/performance', async (req, res) => {
  try {
    const metrics = getMetrics();
    
    const performanceMetrics = {
      timestamp: new Date().toISOString(),
      total: metrics.responseTimes.total,
      sum: metrics.responseTimes.sum,
      average: metrics.responseTimes.total > 0 
        ? parseFloat((metrics.responseTimes.sum / metrics.responseTimes.total).toFixed(2))
        : 0,
      byEndpoint: Object.fromEntries(
        Array.from(metrics.responseTimes.byEndpoint.entries()).map(([endpoint, data]) => [
          endpoint,
          {
            count: data.count,
            sum: data.sum,
            average: parseFloat((data.sum / data.count).toFixed(2))
          }
        ])
      )
    };
    
    res.json({
      success: true,
      data: performanceMetrics
    });
    
  } catch (error) {
    loggingService.error('Erro ao obter métricas de performance', {
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
 * GET /api/metrics/transactions
 * Retorna métricas de transações
 */
router.get('/transactions', async (req, res) => {
  try {
    const metrics = getMetrics();
    
    const transactionMetrics = {
      timestamp: new Date().toISOString(),
      total: metrics.transactions.total,
      totalValue: metrics.transactions.totalValue,
      averageValue: metrics.transactions.total > 0 
        ? parseFloat((metrics.transactions.totalValue / metrics.transactions.total).toFixed(2))
        : 0,
      byType: metrics.transactions.byType
    };
    
    res.json({
      success: true,
      data: transactionMetrics
    });
    
  } catch (error) {
    loggingService.error('Erro ao obter métricas de transações', {
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
 * GET /api/metrics/system
 * Retorna métricas do sistema
 */
router.get('/system', async (req, res) => {
  try {
    const systemMetrics = {
      timestamp: new Date().toISOString(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024),
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024)
      },
      cpu: {
        usage: process.cpuUsage(),
        uptime: process.uptime()
      },
      node: {
        version: process.version,
        platform: process.platform,
        arch: process.arch
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        port: process.env.PORT
      }
    };
    
    res.json({
      success: true,
      data: systemMetrics
    });
    
  } catch (error) {
    loggingService.error('Erro ao obter métricas do sistema', {
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
 * POST /api/metrics/reset
 * Reseta todas as métricas
 */
router.post('/reset', async (req, res) => {
  try {
    resetMetrics();
    
    loggingService.audit('reset_metrics', req.user.id, 'metrics', {});
    
    res.json({
      success: true,
      message: 'Métricas resetadas com sucesso'
    });
    
  } catch (error) {
    loggingService.error('Erro ao resetar métricas', {
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
 * GET /api/metrics/health
 * Retorna status de saúde do sistema
 */
router.get('/health', async (req, res) => {
  try {
    const metrics = getMetrics();
    const errorRate = metrics.requests.total > 0 
      ? (metrics.requests.errors / metrics.requests.total) * 100 
      : 0;
    
    const avgResponseTime = metrics.responseTimes.total > 0 
      ? metrics.responseTimes.sum / metrics.responseTimes.total 
      : 0;
    
    const health = {
      timestamp: new Date().toISOString(),
      status: 'healthy',
      checks: {
        errorRate: {
          status: errorRate < 5 ? 'healthy' : 'unhealthy',
          value: parseFloat(errorRate.toFixed(2)),
          threshold: 5
        },
        responseTime: {
          status: avgResponseTime < 2000 ? 'healthy' : 'unhealthy',
          value: parseFloat(avgResponseTime.toFixed(2)),
          threshold: 2000
        },
        memory: {
          status: process.memoryUsage().heapUsed < 500 * 1024 * 1024 ? 'healthy' : 'unhealthy',
          value: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          threshold: 500
        }
      }
    };
    
    // Determinar status geral
    const checks = Object.values(health.checks);
    if (checks.some(check => check.status === 'unhealthy')) {
      health.status = 'unhealthy';
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

module.exports = router;
