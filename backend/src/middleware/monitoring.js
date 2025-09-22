/**
 * MIDDLEWARE DE MONITORAMENTO E OBSERVABILIDADE
 * 
 * Sistema completo de monitoramento para produção
 */

const fs = require('fs');
const path = require('path');

class MonitoringMiddleware {
  
  constructor() {
    this.logsPath = path.join(__dirname, '../../logs');
    this.ensureLogsDirectory();
    this.initializeMetrics();
  }

  ensureLogsDirectory() {
    if (!fs.existsSync(this.logsPath)) {
      fs.mkdirSync(this.logsPath, { recursive: true });
    }
  }

  initializeMetrics() {
    this.metrics = {
      requests: {
        total: 0,
        by_endpoint: {},
        by_method: {},
        by_status: {},
        response_times: []
      },
      errors: {
        total: 0,
        by_type: {},
        recent: []
      },
      performance: {
        avg_response_time: 0,
        slowest_endpoints: [],
        memory_usage: [],
        cpu_usage: []
      },
      business: {
        deposits: 0,
        withdrawals: 0,
        case_opens: 0,
        prizes_won: 0,
        total_revenue: 0
      }
    };
  }

  // Middleware principal
  middleware() {
    return (req, res, next) => {
      const startTime = Date.now();
      
      // Incrementar contador de requisições
      this.metrics.requests.total++;
      
      // Registrar endpoint
      const endpoint = `${req.method} ${req.route?.path || req.path}`;
      this.metrics.requests.by_endpoint[endpoint] = 
        (this.metrics.requests.by_endpoint[endpoint] || 0) + 1;
      
      // Registrar método
      this.metrics.requests.by_method[req.method] = 
        (this.metrics.requests.by_method[req.method] || 0) + 1;

      // Interceptar resposta
      const originalSend = res.send;
      res.send = (data) => {
        const responseTime = Date.now() - startTime;
        
        // Registrar tempo de resposta
        this.metrics.requests.response_times.push(responseTime);
        
        // Manter apenas os últimos 1000 tempos
        if (this.metrics.requests.response_times.length > 1000) {
          this.metrics.requests.response_times.shift();
        }
        
        // Calcular tempo médio
        const avgTime = this.metrics.requests.response_times.reduce((a, b) => a + b, 0) / 
                       this.metrics.requests.response_times.length;
        this.metrics.performance.avg_response_time = Math.round(avgTime);
        
        // Registrar status
        this.metrics.requests.by_status[res.statusCode] = 
          (this.metrics.requests.by_status[res.statusCode] || 0) + 1;
        
        // Registrar endpoints lentos
        if (responseTime > 1000) { // Mais de 1 segundo
          this.metrics.performance.slowest_endpoints.push({
            endpoint,
            response_time: responseTime,
            timestamp: new Date().toISOString()
          });
          
          // Manter apenas os 50 mais lentos
          this.metrics.performance.slowest_endpoints = 
            this.metrics.performance.slowest_endpoints
              .sort((a, b) => b.response_time - a.response_time)
              .slice(0, 50);
        }
        
        // Log de requisição
        this.logRequest(req, res, responseTime);
        
        return originalSend.call(res, data);
      };

      next();
    };
  }

  // Middleware de tratamento de erros
  errorHandler() {
    return (err, req, res, next) => {
      // Incrementar contador de erros
      this.metrics.errors.total++;
      
      // Registrar tipo de erro
      const errorType = err.constructor.name;
      this.metrics.errors.by_type[errorType] = 
        (this.metrics.errors.by_type[errorType] || 0) + 1;
      
      // Adicionar erro recente
      this.metrics.errors.recent.push({
        type: errorType,
        message: err.message,
        stack: err.stack,
        endpoint: `${req.method} ${req.path}`,
        timestamp: new Date().toISOString(),
        user_id: req.user?.id || null,
        ip: req.ip
      });
      
      // Manter apenas os últimos 100 erros
      if (this.metrics.errors.recent.length > 100) {
        this.metrics.errors.recent.shift();
      }
      
      // Log de erro
      this.logError(err, req);
      
      next(err);
    };
  }

  // Log de requisições
  logRequest(req, res, responseTime) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      status: res.statusCode,
      response_time: responseTime,
      user_agent: req.get('User-Agent'),
      ip: req.ip,
      user_id: req.user?.id || null,
      body_size: JSON.stringify(req.body).length
    };
    
    // Log apenas requisições importantes ou lentas
    if (responseTime > 500 || res.statusCode >= 400 || req.path.includes('/api/')) {
      const logLine = JSON.stringify(logEntry) + '\n';
      fs.appendFileSync(
        path.join(this.logsPath, 'requests.log'), 
        logLine
      );
    }
  }

  // Log de erros
  logError(err, req) {
    const errorEntry = {
      timestamp: new Date().toISOString(),
      error: {
        name: err.name,
        message: err.message,
        stack: err.stack
      },
      request: {
        method: req.method,
        url: req.url,
        body: req.body,
        params: req.params,
        query: req.query
      },
      user: {
        id: req.user?.id || null,
        ip: req.ip
      }
    };
    
    const logLine = JSON.stringify(errorEntry) + '\n';
    fs.appendFileSync(
      path.join(this.logsPath, 'errors.log'), 
      logLine
    );
  }

  // Métricas de negócio
  trackBusinessEvent(event, data = {}) {
    switch (event) {
      case 'deposit':
        this.metrics.business.deposits++;
        this.metrics.business.total_revenue += data.amount || 0;
        break;
      case 'withdrawal':
        this.metrics.business.withdrawals++;
        break;
      case 'case_open':
        this.metrics.business.case_opens++;
        break;
      case 'prize_won':
        this.metrics.business.prizes_won++;
        break;
    }
    
    this.logBusinessEvent(event, data);
  }

  logBusinessEvent(event, data) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      data,
      user_id: data.user_id || null
    };
    
    const logLine = JSON.stringify(logEntry) + '\n';
    fs.appendFileSync(
      path.join(this.logsPath, 'business.log'), 
      logLine
    );
  }

  // Obter métricas
  getMetrics() {
    return {
      ...this.metrics,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage()
    };
  }

  // Health check
  getHealthStatus() {
    const memoryUsage = process.memoryUsage();
    const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
    
    const status = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: memoryUsage.heapUsed,
        total: memoryUsage.heapTotal,
        percentage: Math.round(memoryUsagePercent)
      },
      metrics: {
        total_requests: this.metrics.requests.total,
        error_rate: this.metrics.requests.total > 0 ? 
          (this.metrics.errors.total / this.metrics.requests.total * 100).toFixed(2) + '%' : '0%',
        avg_response_time: this.metrics.performance.avg_response_time
      }
    };
    
    // Marcar como unhealthy se:
    // - Uso de memória > 90%
    // - Taxa de erro > 10%
    // - Tempo médio de resposta > 5 segundos
    if (memoryUsagePercent > 90 || 
        this.metrics.errors.total / Math.max(this.metrics.requests.total, 1) > 0.1 ||
        this.metrics.performance.avg_response_time > 5000) {
      status.status = 'unhealthy';
    }
    
    return status;
  }

  // Limpar logs antigos (executar diariamente)
  cleanupOldLogs() {
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 dias
    const now = Date.now();
    
    const logFiles = ['requests.log', 'errors.log', 'business.log'];
    
    logFiles.forEach(filename => {
      const filePath = path.join(this.logsPath, filename);
      
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          // Manter apenas as últimas 1000 linhas
          const content = fs.readFileSync(filePath, 'utf8');
          const lines = content.split('\n').filter(line => line.trim());
          const recentLines = lines.slice(-1000);
          
          fs.writeFileSync(filePath, recentLines.join('\n') + '\n');
        }
      }
    });
  }
}

module.exports = new MonitoringMiddleware();

