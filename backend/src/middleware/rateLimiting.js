/**
 * MIDDLEWARE DE RATE LIMITING AVANÇADO
 * 
 * Sistema de limitação de taxa com diferentes regras por endpoint
 */

const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');

// Configurações de rate limiting por endpoint
const rateLimitConfigs = {
  // Endpoints de autenticação
  auth: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // 5 tentativas por IP
    message: {
      error: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
      retryAfter: 15 * 60
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true // Não contar tentativas bem-sucedidas
  }),

  // Endpoints de depósito
  deposit: rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 3, // 3 depósitos por minuto
    message: {
      error: 'Muitos depósitos em pouco tempo. Aguarde um momento.',
      retryAfter: 60
    },
    standardHeaders: true,
    legacyHeaders: false
  }),

  // Endpoints de saque
  withdraw: rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 2, // 2 saques por minuto
    message: {
      error: 'Muitos saques em pouco tempo. Aguarde um momento.',
      retryAfter: 60
    },
    standardHeaders: true,
    legacyHeaders: false
  }),

  // Endpoints de compra de caixas
  casePurchase: rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 20, // 20 compras por minuto
    message: {
      error: 'Muitas compras de caixas em pouco tempo. Aguarde um momento.',
      retryAfter: 60
    },
    standardHeaders: true,
    legacyHeaders: false
  }),

  // Endpoints gerais da API
  api: rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 100, // 100 requisições por minuto
    message: {
      error: 'Muitas requisições. Aguarde um momento.',
      retryAfter: 60
    },
    standardHeaders: true,
    legacyHeaders: false
  }),

  // Endpoints administrativos
  admin: rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 200, // 200 requisições por minuto
    message: {
      error: 'Muitas requisições administrativas. Aguarde um momento.',
      retryAfter: 60
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Pular rate limiting para admins em desenvolvimento
      return process.env.NODE_ENV === 'development' && req.user?.is_admin;
    }
  })
};

// Configurações de slow down (redução gradual de velocidade)
const slowDownConfigs = {
  // Slow down para endpoints críticos
  critical: slowDown({
    windowMs: 15 * 60 * 1000, // 15 minutos
    delayAfter: 10, // Começar a reduzir velocidade após 10 requisições
    delayMs: (used, req) => {
      const delayAfter = req.slowDown.limit;
      return (used - delayAfter) * 500; // Adicionar 500ms de delay por requisição
    },
    maxDelayMs: 20000, // Máximo de 20 segundos de delay
    skipSuccessfulRequests: true,
    skipFailedRequests: false
  }),

  // Slow down para endpoints de autenticação
  auth: slowDown({
    windowMs: 15 * 60 * 1000, // 15 minutos
    delayAfter: 3, // Começar a reduzir velocidade após 3 tentativas
    delayMs: (used, req) => {
      const delayAfter = req.slowDown.limit;
      return (used - delayAfter) * 1000; // Adicionar 1 segundo de delay por tentativa
    },
    maxDelayMs: 30000, // Máximo de 30 segundos de delay
    skipSuccessfulRequests: true,
    skipFailedRequests: false
  })
};

// Função para aplicar rate limiting baseado no endpoint
function getRateLimitForEndpoint(path, method) {
  // Endpoints de autenticação
  if (path.includes('/auth/login') || path.includes('/auth/register')) {
    return rateLimitConfigs.auth;
  }
  
  // Endpoints de depósito
  if (path.includes('/deposit') && method === 'POST') {
    return rateLimitConfigs.deposit;
  }
  
  // Endpoints de saque
  if (path.includes('/withdraw') && method === 'POST') {
    return rateLimitConfigs.withdraw;
  }
  
  // Endpoints de compra de caixas
  if (path.includes('/cases') && (method === 'POST' || path.includes('/buy'))) {
    return rateLimitConfigs.casePurchase;
  }
  
  // Endpoints administrativos
  if (path.includes('/admin')) {
    return rateLimitConfigs.admin;
  }
  
  // Endpoints gerais da API
  if (path.includes('/api')) {
    return rateLimitConfigs.api;
  }
  
  return null;
}

// Função para aplicar slow down baseado no endpoint
function getSlowDownForEndpoint(path) {
  // Slow down para endpoints críticos
  if (path.includes('/deposit') || path.includes('/withdraw')) {
    return slowDownConfigs.critical;
  }
  
  // Slow down para endpoints de autenticação
  if (path.includes('/auth')) {
    return slowDownConfigs.auth;
  }
  
  return null;
}

// Middleware dinâmico de rate limiting
function dynamicRateLimit(req, res, next) {
  const rateLimitMiddleware = getRateLimitForEndpoint(req.path, req.method);
  
  if (rateLimitMiddleware) {
    return rateLimitMiddleware(req, res, next);
  }
  
  next();
}

// Middleware dinâmico de slow down
function dynamicSlowDown(req, res, next) {
  const slowDownMiddleware = getSlowDownForEndpoint(req.path);
  
  if (slowDownMiddleware) {
    return slowDownMiddleware(req, res, next);
  }
  
  next();
}

// Middleware de rate limiting por usuário (além do IP)
function userRateLimit(windowMs = 60 * 1000, maxRequests = 50) {
  const userRequests = new Map();
  
  return (req, res, next) => {
    // Aplicar apenas se usuário estiver logado
    if (!req.user?.id) {
      return next();
    }
    
    const userId = req.user.id;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Limpar requisições antigas
    if (userRequests.has(userId)) {
      const requests = userRequests.get(userId).filter(time => time > windowStart);
      userRequests.set(userId, requests);
    } else {
      userRequests.set(userId, []);
    }
    
    const userRequestCount = userRequests.get(userId).length;
    
    if (userRequestCount >= maxRequests) {
      return res.status(429).json({
        error: 'Muitas requisições para este usuário. Aguarde um momento.',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
    
    // Adicionar requisição atual
    userRequests.get(userId).push(now);
    
    next();
  };
}

// Middleware de rate limiting para operações financeiras
function financialOperationRateLimit() {
  const financialRequests = new Map();
  
  return (req, res, next) => {
    const userId = req.user?.id;
    const ip = req.ip;
    const key = userId ? `user:${userId}` : `ip:${ip}`;
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minuto
    const maxRequests = 5; // 5 operações financeiras por minuto
    const windowStart = now - windowMs;
    
    // Limpar requisições antigas
    if (financialRequests.has(key)) {
      const requests = financialRequests.get(key).filter(time => time > windowStart);
      financialRequests.set(key, requests);
    } else {
      financialRequests.set(key, []);
    }
    
    const requestCount = financialRequests.get(key).length;
    
    if (requestCount >= maxRequests) {
      return res.status(429).json({
        error: 'Muitas operações financeiras em pouco tempo. Aguarde um momento.',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
    
    // Adicionar requisição atual
    financialRequests.get(key).push(now);
    
    next();
  };
}

// Middleware para detectar e bloquear bots/suspeitos
function botDetection() {
  const suspiciousActivity = new Map();
  
  return (req, res, next) => {
    const ip = req.ip;
    const userAgent = req.get('User-Agent') || '';
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minuto
    
    // Detectar padrões suspeitos
    const isSuspicious = 
      !userAgent || // Sem User-Agent
      userAgent.includes('bot') || // Bot conhecido
      userAgent.includes('crawler') || // Crawler
      userAgent.includes('spider') || // Spider
      userAgent.length < 10; // User-Agent muito curto
    
    if (isSuspicious) {
      if (!suspiciousActivity.has(ip)) {
        suspiciousActivity.set(ip, []);
      }
      
      suspiciousActivity.get(ip).push(now);
      
      // Se muitas atividades suspeitas, bloquear temporariamente
      const suspiciousCount = suspiciousActivity.get(ip).length;
      if (suspiciousCount > 10) {
        return res.status(403).json({
          error: 'Atividade suspeita detectada. Acesso temporariamente bloqueado.',
          retryAfter: 300 // 5 minutos
        });
      }
    }
    
    next();
  };
}

module.exports = {
  dynamicRateLimit,
  dynamicSlowDown,
  userRateLimit,
  financialOperationRateLimit,
  botDetection,
  rateLimitConfigs,
  slowDownConfigs
};

