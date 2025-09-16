/**
 * Middleware de Monitoramento
 * Coleta métricas e monitora performance do sistema
 */

const alertService = require('../services/alertService');
const loggingService = require('../services/loggingService');

// Métricas em memória (em produção, usar Redis ou banco de dados)
const metrics = {
  requests: {
    total: 0,
    errors: 0,
    byEndpoint: new Map(),
    byMethod: new Map(),
    byStatus: new Map()
  },
  responseTimes: {
    total: 0,
    sum: 0,
    byEndpoint: new Map()
  },
  errors: {
    byType: new Map(),
    byEndpoint: new Map()
  },
  transactions: {
    total: 0,
    byType: new Map(),
    totalValue: 0
  }
};

/**
 * Middleware para coleta de métricas
 */
function collectMetrics(req, res, next) {
  const startTime = Date.now();
  const endpoint = `${req.method} ${req.route?.path || req.path}`;
  
  // Incrementar contador de requisições
  metrics.requests.total++;
  metrics.requests.byEndpoint.set(endpoint, (metrics.requests.byEndpoint.get(endpoint) || 0) + 1);
  metrics.requests.byMethod.set(req.method, (metrics.requests.byMethod.get(req.method) || 0) + 1);
  
  // Interceptar resposta
  const originalSend = res.send;
  res.send = function(data) {
    const responseTime = Date.now() - startTime;
    
    // Coletar métricas de tempo de resposta
    metrics.responseTimes.total++;
    metrics.responseTimes.sum += responseTime;
    metrics.responseTimes.byEndpoint.set(endpoint, {
      count: (metrics.responseTimes.byEndpoint.get(endpoint)?.count || 0) + 1,
      sum: (metrics.responseTimes.byEndpoint.get(endpoint)?.sum || 0) + responseTime
    });
    
    // Coletar métricas de status
    metrics.requests.byStatus.set(res.statusCode, (metrics.requests.byStatus.get(res.statusCode) || 0) + 1);
    
    // Verificar se é erro
    if (res.statusCode >= 400) {
      metrics.requests.errors++;
      metrics.errors.byEndpoint.set(endpoint, (metrics.errors.byEndpoint.get(endpoint) || 0) + 1);
      
      // Verificar taxa de erro
      const errorRate = (metrics.requests.errors / metrics.requests.total) * 100;
      alertService.checkErrorRate(metrics.requests.errors, metrics.requests.total);
    }
    
    // Verificar tempo de resposta
    alertService.checkResponseTime(responseTime, endpoint);
    
    return originalSend.call(this, data);
  };
  
  next();
}

/**
 * Middleware para monitoramento de transações
 */
function monitorTransactions(req, res, next) {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Verificar se é uma transação financeira
    if (isFinancialTransaction(req)) {
      const transactionData = extractTransactionData(req, data);
      
      if (transactionData) {
        metrics.transactions.total++;
        metrics.transactions.totalValue += transactionData.amount;
        metrics.transactions.byType.set(
          transactionData.type,
          (metrics.transactions.byType.get(transactionData.type) || 0) + 1
        );
        
        // Verificar volume de transações
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;
        const recentTransactions = metrics.transactions.total; // Simplificado
        
        alertService.checkHighTransactionVolume(recentTransactions, '1 hora');
      }
    }
    
    return originalSend.call(this, data);
  };
  
  next();
}

/**
 * Middleware para monitoramento de webhooks
 */
function monitorWebhooks(req, res, next) {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Verificar se é um webhook
    if (isWebhook(req)) {
      const webhookData = extractWebhookData(req, data);
      
      if (webhookData) {
        // Verificar delay do webhook
        const delay = Date.now() - req.startTime;
        alertService.checkWebhookDelay(webhookData.provider, delay);
      }
    }
    
    return originalSend.call(this, data);
  };
  
  next();
}

/**
 * Middleware para monitoramento de pagamentos
 */
function monitorPayments(req, res, next) {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Verificar se é uma operação de pagamento
    if (isPaymentOperation(req)) {
      const paymentData = extractPaymentData(req, data);
      
      if (paymentData && res.statusCode >= 400) {
        alertService.alertPaymentFailure(paymentData, new Error('Falha no pagamento'));
      }
    }
    
    return originalSend.call(this, data);
  };
  
  next();
}

/**
 * Middleware para monitoramento de segurança
 */
function monitorSecurity(req, res, next) {
  // Verificar tentativas de login
  if (req.url.includes('/auth/login') && req.method === 'POST') {
    const originalSend = res.send;
    
    res.send = function(data) {
      if (res.statusCode === 401) {
        // Verificar se é tentativa de fraude
        const loginAttempts = getLoginAttempts(req.ip);
        if (loginAttempts > 5) {
          alertService.alertFraudAttempt(null, {
            ip: req.ip,
            email: req.body?.email,
            attempts: loginAttempts
          });
        }
      }
      
      return originalSend.call(this, data);
    };
  }
  
  next();
}

/**
 * Middleware para monitoramento de sistema
 */
function monitorSystem(req, res, next) {
  // Verificar uso de memória
  const memUsage = process.memoryUsage();
  const memUsageMB = memUsage.heapUsed / 1024 / 1024;
  
  if (memUsageMB > 500) { // 500MB
    alertService.sendAlert('high_memory_usage', {
      message: `Uso alto de memória: ${memUsageMB.toFixed(2)}MB`,
      memoryUsage: memUsageMB
    });
  }
  
  // Verificar CPU (simplificado)
  const cpuUsage = process.cpuUsage();
  if (cpuUsage.user > 1000000) { // 1 segundo
    alertService.sendAlert('high_cpu_usage', {
      message: `Uso alto de CPU: ${cpuUsage.user}μs`,
      cpuUsage: cpuUsage.user
    });
  }
  
  next();
}

// Funções auxiliares

function isFinancialTransaction(req) {
  return req.url.includes('/cases/buy') || 
         req.url.includes('/deposit') || 
         req.url.includes('/withdraw');
}

function extractTransactionData(req, responseData) {
  try {
    const data = typeof responseData === 'string' ? JSON.parse(responseData) : responseData;
    
    if (req.url.includes('/cases/buy')) {
      return {
        type: 'abertura_caixa',
        amount: data.casePrice || 0
      };
    }
    
    if (req.url.includes('/deposit')) {
      return {
        type: 'deposito',
        amount: data.amount || 0
      };
    }
    
    if (req.url.includes('/withdraw')) {
      return {
        type: 'saque',
        amount: data.amount || 0
      };
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

function isWebhook(req) {
  return req.url.includes('/webhook');
}

function extractWebhookData(req, responseData) {
  try {
    const data = typeof responseData === 'string' ? JSON.parse(responseData) : responseData;
    
    if (req.url.includes('/webhook/pix')) {
      return {
        provider: 'vizzionpay',
        event: data.event || 'unknown'
      };
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

function isPaymentOperation(req) {
  return req.url.includes('/deposit/pix') || 
         req.url.includes('/withdraw/pix');
}

function extractPaymentData(req, responseData) {
  try {
    const data = typeof responseData === 'string' ? JSON.parse(responseData) : responseData;
    
    return {
      amount: data.amount,
      type: req.url.includes('/deposit') ? 'deposit' : 'withdraw'
    };
  } catch (error) {
    return null;
  }
}

function getLoginAttempts(ip) {
  // Implementar contador de tentativas de login por IP
  // Por enquanto, retornar valor fixo
  return 1;
}

/**
 * Obtém métricas atuais
 */
function getMetrics() {
  return {
    ...metrics,
    requests: {
      ...metrics.requests,
      byEndpoint: Object.fromEntries(metrics.requests.byEndpoint),
      byMethod: Object.fromEntries(metrics.requests.byMethod),
      byStatus: Object.fromEntries(metrics.requests.byStatus)
    },
    responseTimes: {
      ...metrics.responseTimes,
      byEndpoint: Object.fromEntries(metrics.responseTimes.byEndpoint)
    },
    errors: {
      byType: Object.fromEntries(metrics.errors.byType),
      byEndpoint: Object.fromEntries(metrics.errors.byEndpoint)
    },
    transactions: {
      ...metrics.transactions,
      byType: Object.fromEntries(metrics.transactions.byType)
    }
  };
}

/**
 * Reseta métricas
 */
function resetMetrics() {
  metrics.requests.total = 0;
  metrics.requests.errors = 0;
  metrics.requests.byEndpoint.clear();
  metrics.requests.byMethod.clear();
  metrics.requests.byStatus.clear();
  
  metrics.responseTimes.total = 0;
  metrics.responseTimes.sum = 0;
  metrics.responseTimes.byEndpoint.clear();
  
  metrics.errors.byType.clear();
  metrics.errors.byEndpoint.clear();
  
  metrics.transactions.total = 0;
  metrics.transactions.byType.clear();
  metrics.transactions.totalValue = 0;
}

module.exports = {
  collectMetrics,
  monitorTransactions,
  monitorWebhooks,
  monitorPayments,
  monitorSecurity,
  monitorSystem,
  getMetrics,
  resetMetrics
};
