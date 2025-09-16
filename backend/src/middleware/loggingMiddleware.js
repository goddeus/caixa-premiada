/**
 * Middleware de Logging para Express
 * Registra todas as requisições e respostas
 */

const loggingService = require('../services/loggingService');

/**
 * Middleware para logging de requisições HTTP
 */
function requestLogging(req, res, next) {
  const startTime = Date.now();
  const requestId = generateRequestId();
  
  // Adicionar requestId ao req para uso posterior
  req.requestId = requestId;
  
  // Log da requisição
  loggingService.info('Requisição recebida', {
    requestId,
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    userId: req.user?.id
  });

  // Interceptar resposta
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - startTime;
    
    // Log da resposta
    loggingService.info('Resposta enviada', {
      requestId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      userId: req.user?.id
    });

    // Log de performance se demorou muito
    if (duration > 5000) {
      loggingService.performance(`${req.method} ${req.url}`, duration, {
        requestId,
        userId: req.user?.id
      });
    }

    // Log de erro se status >= 400
    if (res.statusCode >= 400) {
      loggingService.error('Erro na requisição', {
        requestId,
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration,
        userId: req.user?.id,
        error: data
      });
    }

    return originalSend.call(this, data);
  };

  next();
}

/**
 * Middleware para logging de erros
 */
function errorLogging(err, req, res, next) {
  const requestId = req.requestId || generateRequestId();
  
  loggingService.error('Erro não tratado', {
    requestId,
    method: req.method,
    url: req.url,
    error: err.message,
    stack: err.stack,
    userId: req.user?.id
  });

  next(err);
}

/**
 * Middleware para logging de transações financeiras
 */
function transactionLogging(req, res, next) {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Verificar se é uma transação financeira
    if (isFinancialTransaction(req)) {
      const transactionData = extractTransactionData(req, data);
      
      if (transactionData) {
        loggingService.transaction(
          transactionData.type,
          transactionData.userId,
          transactionData.amount,
          {
            requestId: req.requestId,
            method: req.method,
            url: req.url,
            ...transactionData.metadata
          }
        );
      }
    }

    return originalSend.call(this, data);
  };

  next();
}

/**
 * Middleware para logging de pagamentos
 */
function paymentLogging(req, res, next) {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Verificar se é uma operação de pagamento
    if (isPaymentOperation(req)) {
      const paymentData = extractPaymentData(req, data);
      
      if (paymentData) {
        loggingService.payment(
          paymentData.action,
          paymentData.data,
          {
            requestId: req.requestId,
            method: req.method,
            url: req.url,
            userId: req.user?.id
          }
        );
      }
    }

    return originalSend.call(this, data);
  };

  next();
}

/**
 * Middleware para logging de webhooks
 */
function webhookLogging(req, res, next) {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Verificar se é um webhook
    if (isWebhook(req)) {
      const webhookData = extractWebhookData(req, data);
      
      if (webhookData) {
        loggingService.webhook(
          webhookData.provider,
          webhookData.event,
          webhookData.data,
          {
            requestId: req.requestId,
            method: req.method,
            url: req.url
          }
        );
      }
    }

    return originalSend.call(this, data);
  };

  next();
}

/**
 * Middleware para logging de auditoria
 */
function auditLogging(req, res, next) {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Verificar se é uma operação de auditoria
    if (isAuditOperation(req)) {
      const auditData = extractAuditData(req, data);
      
      if (auditData) {
        loggingService.audit(
          auditData.action,
          auditData.userId,
          auditData.resource,
          {
            requestId: req.requestId,
            method: req.method,
            url: req.url,
            ...auditData.metadata
          }
        );
      }
    }

    return originalSend.call(this, data);
  };

  next();
}

/**
 * Middleware para logging de segurança
 */
function securityLogging(req, res, next) {
  // Verificar tentativas de login
  if (req.url.includes('/auth/login') && req.method === 'POST') {
    const originalSend = res.send;
    
    res.send = function(data) {
      if (res.statusCode === 401) {
        loggingService.security('Tentativa de login falhada', {
          requestId: req.requestId,
          email: req.body?.email,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });
      }
      
      return originalSend.call(this, data);
    };
  }

  // Verificar tentativas de acesso não autorizado
  if (res.statusCode === 403) {
    loggingService.security('Acesso negado', {
      requestId: req.requestId,
      method: req.method,
      url: req.url,
      ip: req.ip,
      userId: req.user?.id
    });
  }

  next();
}

// Funções auxiliares

function generateRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

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
        userId: req.user?.id,
        amount: data.casePrice || 0,
        metadata: {
          caseId: data.caseId,
          prizeId: data.prizeId,
          prizeValue: data.prizeValue
        }
      };
    }
    
    if (req.url.includes('/deposit')) {
      return {
        type: 'deposito',
        userId: req.user?.id,
        amount: data.amount || 0,
        metadata: {
          identifier: data.identifier,
          status: data.status
        }
      };
    }
    
    if (req.url.includes('/withdraw')) {
      return {
        type: 'saque',
        userId: req.user?.id,
        amount: data.amount || 0,
        metadata: {
          pixKey: data.pixKey,
          status: data.status
        }
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
    
    if (req.url.includes('/deposit/pix')) {
      return {
        action: 'deposit_created',
        data: {
          amount: data.amount,
          identifier: data.identifier,
          qrCode: data.qrCode ? 'generated' : null
        }
      };
    }
    
    if (req.url.includes('/withdraw/pix')) {
      return {
        action: 'withdraw_created',
        data: {
          amount: data.amount,
          pixKey: data.pixKey,
          status: data.status
        }
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
        event: data.event || 'unknown',
        data: {
          identifier: data.identifier,
          status: data.status,
          amount: data.amount
        }
      };
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

function isAuditOperation(req) {
  return req.url.includes('/admin') || 
         req.url.includes('/users') ||
         req.url.includes('/cases') ||
         req.url.includes('/prizes');
}

function extractAuditData(req, responseData) {
  try {
    const data = typeof responseData === 'string' ? JSON.parse(responseData) : responseData;
    
    return {
      action: `${req.method.toLowerCase()}_${req.url.split('/').pop()}`,
      userId: req.user?.id,
      resource: req.url,
      metadata: {
        success: res.statusCode < 400,
        statusCode: res.statusCode
      }
    };
  } catch (error) {
    return null;
  }
}

module.exports = {
  requestLogging,
  errorLogging,
  transactionLogging,
  paymentLogging,
  webhookLogging,
  auditLogging,
  securityLogging
};
