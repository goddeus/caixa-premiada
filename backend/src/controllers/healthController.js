/**
 * CONTROLLER DE HEALTHCHECK E MONITORAMENTO
 * 
 * Endpoints para monitoramento de saúde do sistema
 */

const monitoring = require('../middleware/monitoring');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class HealthController {
  
  // Health check básico
  async basicHealth(req, res) {
    try {
      const health = monitoring.getHealthStatus();
      
      if (health.status === 'healthy') {
        res.status(200).json(health);
      } else {
        res.status(503).json(health);
      }
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Health check detalhado
  async detailedHealth(req, res) {
    try {
      const startTime = Date.now();
      
      // Verificar banco de dados
      const dbHealth = await this.checkDatabase();
      
      // Verificar serviços externos
      const externalHealth = await this.checkExternalServices();
      
      // Verificar recursos do sistema
      const systemHealth = this.checkSystemResources();
      
      // Verificar integridade dos dados
      const dataHealth = await this.checkDataIntegrity();
      
      const responseTime = Date.now() - startTime;
      
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        response_time: responseTime,
        checks: {
          database: dbHealth,
          external_services: externalHealth,
          system_resources: systemHealth,
          data_integrity: dataHealth
        },
        metrics: monitoring.getMetrics()
      };
      
      // Determinar status geral
      const allHealthy = Object.values(health.checks).every(check => check.status === 'healthy');
      health.status = allHealthy ? 'healthy' : 'unhealthy';
      
      const statusCode = allHealthy ? 200 : 503;
      res.status(statusCode).json(health);
      
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Verificar banco de dados
  async checkDatabase() {
    try {
      const startTime = Date.now();
      
      // Teste simples de conexão
      await prisma.$queryRaw`SELECT 1`;
      
      // Verificar contagens básicas
      const [users, cases, prizes, transactions] = await Promise.all([
        prisma.user.count(),
        prisma.case.count({ where: { ativo: true } }),
        prisma.prize.count({ where: { ativo: true } }),
        prisma.transaction.count({ 
          where: { 
            criado_em: { 
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000) 
            } 
          } 
        })
      ]);
      
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'healthy',
        response_time: responseTime,
        data: {
          total_users: users,
          active_cases: cases,
          active_prizes: prizes,
          recent_transactions: transactions
        }
      };
      
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        response_time: null
      };
    }
  }

  // Verificar serviços externos
  async checkExternalServices() {
    const services = {};
    
    // Verificar VizzionPay (simulado)
    try {
      services.vizzionpay = {
        status: 'healthy',
        response_time: 150,
        note: 'Simulado - implementar verificação real'
      };
    } catch (error) {
      services.vizzionpay = {
        status: 'unhealthy',
        error: error.message
      };
    }
    
    return services;
  }

  // Verificar recursos do sistema
  checkSystemResources() {
    const memoryUsage = process.memoryUsage();
    const memoryPercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
    
    return {
      status: memoryPercent < 90 ? 'healthy' : 'unhealthy',
      memory: {
        used: memoryUsage.heapUsed,
        total: memoryUsage.heapTotal,
        percentage: Math.round(memoryPercent)
      },
      uptime: process.uptime(),
      cpu_usage: process.cpuUsage()
    };
  }

  // Verificar integridade dos dados
  async checkDataIntegrity() {
    try {
      // Verificar sincronização User/Wallet
      const syncIssues = await this.checkUserWalletSync();
      
      // Verificar transações órfãs
      const orphanTransactions = await this.checkOrphanTransactions();
      
      // Verificar prêmios inconsistentes
      const prizeIssues = await this.checkPrizeConsistency();
      
      return {
        status: (syncIssues + orphanTransactions + prizeIssues) === 0 ? 'healthy' : 'warning',
        issues: {
          user_wallet_sync: syncIssues,
          orphan_transactions: orphanTransactions,
          prize_inconsistencies: prizeIssues
        }
      };
      
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }

  // Verificar sincronização User/Wallet
  async checkUserWalletSync() {
    try {
      const users = await prisma.user.findMany({
        include: { wallet: true }
      });
      
      let syncIssues = 0;
      
      for (const user of users) {
        if (user.wallet) {
          const userBalance = user.saldo_reais;
          const walletBalance = user.wallet.saldo_reais;
          const difference = Math.abs(userBalance - walletBalance);
          
          if (difference > 0.01) {
            syncIssues++;
          }
        } else {
          syncIssues++; // Usuário sem wallet
        }
      }
      
      return syncIssues;
      
    } catch (error) {
      console.error('Erro ao verificar sincronização:', error);
      return -1; // Erro
    }
  }

  // Verificar transações órfãs
  async checkOrphanTransactions() {
    try {
      const orphanTransactions = await prisma.transaction.count({
        where: {
          user: null
        }
      });
      
      return orphanTransactions;
      
    } catch (error) {
      console.error('Erro ao verificar transações órfãs:', error);
      return -1;
    }
  }

  // Verificar consistência de prêmios
  async checkPrizeConsistency() {
    try {
      // Verificar prêmios com probabilidade inválida
      const invalidPrizes = await prisma.prize.count({
        where: {
          OR: [
            { probabilidade: { lt: 0 } },
            { probabilidade: { gt: 1 } },
            { valor: { lt: 0 } }
          ]
        }
      });
      
      return invalidPrizes;
      
    } catch (error) {
      console.error('Erro ao verificar consistência de prêmios:', error);
      return -1;
    }
  }

  // Obter métricas detalhadas
  async getMetrics(req, res) {
    try {
      const metrics = monitoring.getMetrics();
      
      // Adicionar métricas de negócio do banco
      const businessMetrics = await this.getBusinessMetrics();
      
      res.json({
        ...metrics,
        business_database: businessMetrics
      });
      
    } catch (error) {
      res.status(500).json({
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Obter métricas de negócio do banco
  async getBusinessMetrics() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const [
        todayDeposits,
        todayWithdrawals,
        todayCaseOpens,
        totalUsers,
        activeUsers
      ] = await Promise.all([
        prisma.transaction.aggregate({
          where: {
            tipo: 'deposito',
            status: 'concluido',
            criado_em: { gte: today }
          },
          _sum: { valor: true },
          _count: true
        }),
        
        prisma.transaction.aggregate({
          where: {
            tipo: 'saque',
            status: 'concluido',
            criado_em: { gte: today }
          },
          _sum: { valor: true },
          _count: true
        }),
        
        prisma.transaction.count({
          where: {
            tipo: 'compra_caixa',
            criado_em: { gte: today }
          }
        }),
        
        prisma.user.count(),
        
        prisma.user.count({
          where: {
            ultimo_login: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          }
        })
      ]);
      
      return {
        today: {
          deposits: {
            count: todayDeposits._count,
            total_value: todayDeposits._sum.valor || 0
          },
          withdrawals: {
            count: todayWithdrawals._count,
            total_value: todayWithdrawals._sum.valor || 0
          },
          case_opens: todayCaseOpens
        },
        users: {
          total: totalUsers,
          active_last_7_days: activeUsers
        }
      };
      
    } catch (error) {
      console.error('Erro ao obter métricas de negócio:', error);
      return null;
    }
  }

  // Endpoint para alertas
  async getAlerts(req, res) {
    try {
      const alerts = [];
      
      // Verificar métricas e gerar alertas
      const metrics = monitoring.getMetrics();
      
      // Alerta de alta taxa de erro
      if (metrics.errors.total > 0 && metrics.requests.total > 0) {
        const errorRate = metrics.errors.total / metrics.requests.total;
        if (errorRate > 0.05) { // 5%
          alerts.push({
            type: 'error',
            severity: 'high',
            message: `Alta taxa de erro: ${(errorRate * 100).toFixed(2)}%`,
            timestamp: new Date().toISOString()
          });
        }
      }
      
      // Alerta de tempo de resposta lento
      if (metrics.performance.avg_response_time > 2000) {
        alerts.push({
          type: 'performance',
          severity: 'medium',
          message: `Tempo de resposta lento: ${metrics.performance.avg_response_time}ms`,
          timestamp: new Date().toISOString()
        });
      }
      
      // Alerta de uso de memória alto
      const memoryUsage = process.memoryUsage();
      const memoryPercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
      if (memoryPercent > 85) {
        alerts.push({
          type: 'resource',
          severity: 'high',
          message: `Uso de memória alto: ${Math.round(memoryPercent)}%`,
          timestamp: new Date().toISOString()
        });
      }
      
      res.json({
        alerts,
        total: alerts.length,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      res.status(500).json({
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

module.exports = new HealthController();

