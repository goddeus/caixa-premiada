require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config/index');

const app = express();

// Middleware de segurança
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || 'https://slotbox.shop'] 
    : [
        'https://slotbox.shop',
        'https://www.slotbox.shop',
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:8080'
      ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Signature']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP por janela
  message: {
    success: false,
    message: 'Muitas requisições. Tente novamente em 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use(limiter);

// Rate limiting mais restritivo para auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // máximo 10 tentativas de login por IP por janela
  message: {
    success: false,
    message: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
  }
});

// Middleware para parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy para obter IP real
app.set('trust proxy', 1);

// Middleware para logs
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const ip = req.ip || req.connection.remoteAddress;
  console.log(`[${timestamp}] ${req.method} ${req.path} - ${ip}`);
  next();
});

// Rota de saúde
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando corretamente',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv
  });
});

// Rota de teste do banco
app.get('/api/db-test', async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    // Teste simples de conexão
    await prisma.$connect();
    
    res.json({
      success: true,
      message: 'Database conectado com sucesso',
      database_url: config.database.url ? 'Configurado' : 'Não configurado'
    });
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Erro de conexão com o banco:', error);
    res.status(500).json({
      success: false,
      message: 'Erro de conexão com o banco',
      error: error.message,
      database_url: config.database.url ? 'Configurado' : 'Não configurado'
    });
  }
});

// Rota de teste do VizzionPay
app.get('/api/vizzionpay-test', (req, res) => {
  try {
    res.json({
      success: true,
      message: 'VizzionPay configurações',
      config: {
        apiKey: config.vizzionpay.apiKey ? '***configurado***' : 'NÃO CONFIGURADO',
        baseUrl: config.vizzionpay.baseUrl || 'NÃO CONFIGURADO',
        webhookSecret: config.vizzionpay.webhookSecret ? '***configurado***' : 'NÃO CONFIGURADO',
        pixKey: config.vizzionpay.pixKey || 'NÃO CONFIGURADO',
        pixKeyType: config.vizzionpay.pixKeyType || 'NÃO CONFIGURADO'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar configurações VizzionPay',
      error: error.message
    });
  }
});

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Caixa Premiada API',
    version: '2.0.0',
    environment: config.nodeEnv
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada'
  });
});

// Middleware global de tratamento de erros
app.use((error, req, res, next) => {
  console.error('Erro não tratado:', error);
  
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
    ...(config.nodeEnv === 'development' && { error: error.message })
  });
});

// Iniciar servidor
const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📍 Ambiente: ${config.nodeEnv}`);
  console.log(`🌐 API: http://localhost:${PORT}`);
  console.log(`💻 Frontend: ${config.frontend.url}`);
  
  if (config.nodeEnv === 'development') {
    console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
  }
  
  // Keep-alive para Render Free Tier
  if (config.nodeEnv === 'production') {
    const keepAliveInterval = 14 * 60 * 1000; // 14 minutos
    setInterval(() => {
      const https = require('https');
      https.get(`${config.api.baseUrl}/api/health`, (res) => {
        console.log(`⏰ Keep-alive ping - Status: ${res.statusCode}`);
      }).on('error', (err) => {
        console.log(`❌ Keep-alive error:`, err.message);
      });
    }, keepAliveInterval);
    
    console.log(`⏰ Keep-alive ativado - Ping a cada 14 minutos`);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM recebido. Encerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor encerrado');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT recebido. Encerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor encerrado');
    process.exit(0);
  });
});

module.exports = app;
