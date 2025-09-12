require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Importar rotas
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const casesRoutes = require('./routes/cases');
const walletRoutes = require('./routes/wallet');
const paymentRoutes = require('./routes/payments');
const affiliateRoutes = require('./routes/affiliate');
const profileRoutes = require('./routes/profile');
const transactionsRoutes = require('./routes/transactions');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware de segurança
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: 'Muitas tentativas, tente novamente em 15 minutos'
});
app.use(limiter);

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://slotbox.shop',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Middleware para parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/caixas', casesRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/affiliate', affiliateRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/transactions', transactionsRoutes);

// Rota de teste para depósitos
app.get('/api/vizzionpay-test', (req, res) => {
  res.json({
    message: 'VizzionPay credentials test',
    hasApiKey: !!process.env.VIZZIONPAY_API_KEY,
    hasPixKey: !!process.env.VIZZIONPAY_PIX_KEY,
    hasSecret: !!process.env.VIZZIONPAY_SECRET
  });
});

// Rota de teste do banco
app.get('/api/db-test', async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    // Testar conexão
    await prisma.$connect();
    
    // Contar usuários
    const userCount = await prisma.user.count();
    
    // Verificar se existem contas demo
    const demoCount = await prisma.user.count({
      where: { tipo_conta: 'afiliado_demo' }
    });
    
    // Verificar se existem admins
    const adminCount = await prisma.user.count({
      where: { is_admin: true }
    });
    
    await prisma.$disconnect();
    
    res.json({
      success: true,
      message: 'Banco funcionando',
      stats: {
        totalUsers: userCount,
        demoAccounts: demoCount,
        adminAccounts: adminCount,
        setupComplete: userCount > 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro no banco',
      error: error.message
    });
  }
});

// Middleware de erro global
app.use((err, req, res, next) => {
  console.error('Erro:', err);
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado'
  });
});

// Rota 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🌐 Ambiente: ${process.env.NODE_ENV || 'production'}`);
  console.log(`🔗 Frontend: ${process.env.FRONTEND_URL || 'https://slotbox.shop'}`);
});

module.exports = app;