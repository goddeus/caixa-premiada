require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config/index');

// Importar rotas
const authRoutes = require('./routes/auth');
const caixasRoutes = require('./routes/caixas');
const paymentsRoutes = require('./routes/payments');
const affiliateRoutes = require('./routes/affiliate');
const adminRoutes = require('./routes/admin');
const walletRoutes = require('./routes/wallet');
const transactionsRoutes = require('./routes/transactions');
const profileRoutes = require('./routes/profile');
const casesRoutes = require('./routes/cases');
const prizesRoutes = require('./routes/prizes');
const bulkPurchaseRoutes = require('./routes/bulkPurchase');
const imageUploadRoutes = require('./routes/imageUpload');
const gatewayConfigRoutes = require('./routes/gatewayConfig');
const casePrizeRoutes = require('./routes/casePrize');
const prizeAuditRoutes = require('./routes/prizeAudit');
const prizeSyncRoutes = require('./routes/prizeSync');
const prizeValidationRoutes = require('./routes/prizeValidation');

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

// Rotas da API
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/caixas', caixasRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/affiliate', affiliateRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/cases', casesRoutes);
app.use('/api/prizes', prizesRoutes);
app.use('/api/bulk-purchase', bulkPurchaseRoutes);
app.use('/api/upload', imageUploadRoutes);
app.use('/api/gateway-config', gatewayConfigRoutes);
app.use('/api/admin/case-prizes', casePrizeRoutes);
app.use('/api/admin/prize-audit', prizeAuditRoutes);
app.use('/api/admin/prize-sync', prizeSyncRoutes);
app.use('/api/admin/prize-validation', prizeValidationRoutes);

// Rota de saúde
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando corretamente',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv
  });
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