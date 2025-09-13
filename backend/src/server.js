require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config/index');

// Importar rotas
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const casesRoutes = require('./routes/cases');
const paymentsRoutes = require('./routes/payments');
const affiliateRoutes = require('./routes/affiliate');
const transactionsRoutes = require('./routes/transactions');
const prizesRoutes = require('./routes/prizes');
const profileRoutes = require('./routes/profile');
const walletRoutes = require('./routes/wallet');
const caixasRoutes = require('./routes/caixas');
const bulkPurchaseRoutes = require('./routes/bulkPurchase');
const casePrizeRoutes = require('./routes/casePrize');
const prizeAuditRoutes = require('./routes/prizeAudit');
const prizeSyncRoutes = require('./routes/prizeSync');
const prizeValidationRoutes = require('./routes/prizeValidation');
const imageUploadRoutes = require('./routes/imageUpload');
const gatewayConfigRoutes = require('./routes/gatewayConfig');
const globalDrawRoutes = require('./routes/globalDraw');
const seedRoutes = require('./routes/seedRoutes');

// Novas rotas VizzionPay
const depositRoutes = require('./routes/depositRoutes');
const withdrawRoutes = require('./routes/withdrawRoutes');
const webhookRoutes = require('./routes/webhookRoutes');

const app = express();

// Middleware de segurança
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://slotbox.shop', 'https://www.slotbox.shop'] 
    : [
    'https://slotbox.shop',
    'https://www.slotbox.shop',
    'http://localhost:5173'
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

// ROTAS DE AUTENTICAÇÃO BÁSICAS
// Rota de login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    
    if (!email || !senha) {
      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios'
      });
    }

    const { PrismaClient } = require('@prisma/client');
    const bcrypt = require('bcryptjs');
    const jwt = require('jsonwebtoken');
    
    const prisma = new PrismaClient();
    
    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email },
      include: { wallet: true }
    });

    if (!user) {
      await prisma.$disconnect();
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, user.senha_hash);
    if (!senhaValida) {
      await prisma.$disconnect();
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        isAdmin: user.is_admin 
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    // Atualizar último login
    await prisma.user.update({
      where: { id: user.id },
      data: { ultimo_login: new Date() }
    });

    await prisma.$disconnect();

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        is_admin: user.is_admin,
        saldo_reais: user.saldo_reais,
        saldo_demo: user.saldo_demo,
        tipo_conta: user.tipo_conta
      }
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Rota de registro
app.post('/api/auth/register', async (req, res) => {
  try {
    const { nome, email, senha, cpf, codigo_indicacao } = req.body;
    
    if (!nome || !email || !senha || !cpf) {
      return res.status(400).json({
        success: false,
        message: 'Todos os campos são obrigatórios'
      });
    }

    const { PrismaClient } = require('@prisma/client');
    const bcrypt = require('bcryptjs');
    const jwt = require('jsonwebtoken');
    
    const prisma = new PrismaClient();
    
    // Verificar se email já existe
    const emailExiste = await prisma.user.findUnique({
      where: { email }
    });

    if (emailExiste) {
      await prisma.$disconnect();
      return res.status(400).json({
        success: false,
        message: 'Email já cadastrado'
      });
    }

    // Verificar se CPF já existe
    const cpfExiste = await prisma.user.findUnique({
      where: { cpf }
    });

    if (cpfExiste) {
      await prisma.$disconnect();
      return res.status(400).json({
        success: false,
        message: 'CPF já cadastrado'
      });
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 12);

    // Criar usuário
    const novoUsuario = await prisma.user.create({
      data: {
        nome,
        email,
        senha_hash: senhaHash,
        cpf,
        codigo_indicacao_usado: codigo_indicacao || null,
        saldo_reais: 0,
        saldo_demo: 0,
        tipo_conta: 'normal'
      }
    });

    // Criar wallet
    await prisma.wallet.create({
      data: {
        user_id: novoUsuario.id,
        saldo_reais: 0,
        saldo_demo: 0
      }
    });

    // Gerar token JWT
    const token = jwt.sign(
      { 
        userId: novoUsuario.id, 
        email: novoUsuario.email,
        isAdmin: false 
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    await prisma.$disconnect();

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      token,
      user: {
        id: novoUsuario.id,
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        is_admin: false,
        saldo_reais: 0,
        saldo_demo: 0,
        tipo_conta: 'normal'
      }
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// MIDDLEWARE DE AUTENTICAÇÃO
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acesso requerido'
      });
    }
    
    const jwt = require('jsonwebtoken');
    const { PrismaClient } = require('@prisma/client');
    
    // Verificar e decodificar token
    const decoded = jwt.verify(token, config.jwt.secret);
    
    // Buscar usuário no banco
    const prisma = new PrismaClient();
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        ativo: true,
        banido_em: true,
        motivo_ban: true,
        is_admin: true,
        tipo_conta: true,
        saldo_reais: true,
        saldo_demo: true
      }
    });
    
    await prisma.$disconnect();
    
    if (!user || !user.ativo) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado ou inativo'
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

// ROTAS DE WALLET
// GET /api/wallet - Consultar saldo
app.get('/api/wallet', authenticateToken, async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { wallet: true }
    });
    
    await prisma.$disconnect();
    
    res.json({
      success: true,
      data: {
        saldo_reais: user.saldo_reais,
        saldo_demo: user.saldo_demo,
        total_giros: user.total_giros,
        rollover_liberado: user.rollover_liberado,
        rollover_minimo: user.rollover_minimo,
        primeiro_deposito_feito: user.primeiro_deposito_feito,
        tipo_conta: user.tipo_conta
      }
    });
  } catch (error) {
    console.error('Erro ao consultar saldo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// ROTAS DE CAIXAS
// GET /api/cases - Listar todas as caixas
app.get('/api/cases', async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const cases = await prisma.case.findMany({
      where: { ativo: true },
      include: {
        prizes: {
          where: { ativo: true }
        }
      },
      orderBy: { preco: 'asc' }
    });
    
    await prisma.$disconnect();
    
    res.json({
      success: true,
      data: cases
    });
  } catch (error) {
    console.error('Erro ao listar caixas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/cases/:id - Buscar caixa específica
app.get('/api/cases/:id', async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const caseData = await prisma.case.findUnique({
      where: { id: req.params.id },
      include: {
        prizes: {
          where: { ativo: true }
        }
      }
    });
    
    await prisma.$disconnect();
    
    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: 'Caixa não encontrada'
      });
    }
    
    res.json({
      success: true,
      data: caseData
    });
  } catch (error) {
    console.error('Erro ao buscar caixa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/cases/buy/:id - Comprar e abrir caixa
app.post('/api/cases/buy/:id', authenticateToken, async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    // Buscar caixa
    const caseData = await prisma.case.findUnique({
      where: { id: req.params.id },
      include: { prizes: true }
    });
    
    if (!caseData) {
      await prisma.$disconnect();
      return res.status(404).json({
        success: false,
        message: 'Caixa não encontrada'
      });
    }
    
    // Verificar saldo
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });
    
    const saldoDisponivel = user.tipo_conta === 'afiliado_demo' ? user.saldo_demo : user.saldo_reais;
    
    if (saldoDisponivel < caseData.preco) {
      await prisma.$disconnect();
      return res.status(400).json({
        success: false,
        message: 'Saldo insuficiente'
      });
    }
    
    // Debitar saldo
    const updateData = user.tipo_conta === 'afiliado_demo' 
      ? { saldo_demo: { decrement: caseData.preco } }
      : { saldo_reais: { decrement: caseData.preco } };
    
    await prisma.user.update({
      where: { id: req.user.id },
      data: updateData
    });
    
    // Simular sorteio (RTP 10% para contas normais, 70% para demo)
    const rtp = user.tipo_conta === 'afiliado_demo' ? 0.7 : 0.1;
    const ganhou = Math.random() < rtp;
    
    let premio = null;
    if (ganhou && caseData.prizes.length > 0) {
      // Selecionar prêmio aleatório
      const randomIndex = Math.floor(Math.random() * caseData.prizes.length);
      premio = caseData.prizes[randomIndex];
      
      // Creditar prêmio
      const creditData = user.tipo_conta === 'afiliado_demo'
        ? { saldo_demo: { increment: premio.valor } }
        : { saldo_reais: { increment: premio.valor } };
      
      await prisma.user.update({
        where: { id: req.user.id },
        data: creditData
      });
    }
    
    await prisma.$disconnect();
    
    res.json({
      success: true,
      data: {
        ganhou,
        premio: premio ? {
          id: premio.id,
          nome: premio.nome,
          valor: premio.valor,
          imagem: premio.imagem
        } : null,
        saldo_restante: saldoDisponivel - caseData.preco + (premio ? premio.valor : 0)
      }
    });
  } catch (error) {
    console.error('Erro ao comprar caixa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// ROTAS DE PAGAMENTOS
// POST /api/payments/deposit - Criar depósito
app.post('/api/payments/deposit', authenticateToken, async (req, res) => {
  try {
    const { valor, metodo } = req.body;
    
    if (!valor || valor < 20) {
      return res.status(400).json({
        success: false,
        message: 'Valor mínimo de depósito é R$ 20,00'
      });
    }
    
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    // Criar registro de pagamento
    const payment = await prisma.payment.create({
      data: {
        user_id: req.user.id,
        tipo: 'deposito',
        valor: valor,
        metodo: metodo || 'pix',
        status: 'pendente'
      }
    });
    
    await prisma.$disconnect();
    
    res.json({
      success: true,
      message: 'Depósito criado com sucesso',
      data: {
        id: payment.id,
        valor: payment.valor,
        status: payment.status
      }
    });
  } catch (error) {
    console.error('Erro ao criar depósito:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/payments/withdraw - Criar saque
app.post('/api/payments/withdraw', authenticateToken, async (req, res) => {
  try {
    const { valor, metodo } = req.body;
    
    // Verificar se é conta normal (não demo)
    if (req.user.tipo_conta === 'afiliado_demo') {
      return res.status(400).json({
        success: false,
        message: 'Contas demo não podem sacar'
      });
    }
    
    if (!valor || valor < 20) {
      return res.status(400).json({
        success: false,
        message: 'Valor mínimo de saque é R$ 20,00'
      });
    }
    
    if (req.user.saldo_reais < valor) {
      return res.status(400).json({
        success: false,
        message: 'Saldo insuficiente'
      });
    }
    
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    // Criar registro de saque
    const payment = await prisma.payment.create({
      data: {
        user_id: req.user.id,
        tipo: 'saque',
        valor: valor,
        metodo: metodo || 'pix',
        status: 'pendente'
      }
    });
    
    await prisma.$disconnect();
    
    res.json({
      success: true,
      message: 'Saque solicitado com sucesso',
      data: {
        id: payment.id,
        valor: payment.valor,
        status: payment.status
      }
    });
  } catch (error) {
    console.error('Erro ao criar saque:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// ROTAS DE AFILIADOS - Movidas para arquivo separado (affiliate.js)

// ROTAS ADMIN
// Middleware para verificar se é admin
const requireAdmin = (req, res, next) => {
  if (!req.user.is_admin) {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Apenas administradores.'
    });
  }
  next();
};

// GET /api/admin/dashboard/stats - Estatísticas do dashboard
app.get('/api/admin/dashboard/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const [totalUsers, totalAffiliates, totalRevenue, totalPayouts] = await Promise.all([
      prisma.user.count(),
      prisma.affiliate.count(),
      prisma.payment.aggregate({
        where: { tipo: 'deposito', status: 'aprovado' },
        _sum: { valor: true }
      }),
      prisma.payment.aggregate({
        where: { tipo: 'saque', status: 'aprovado' },
        _sum: { valor: true }
      })
    ]);
    
    await prisma.$disconnect();
    
    res.json({
      success: true,
      data: {
        totalUsers,
        totalAffiliates,
        totalRevenue: totalRevenue._sum.valor || 0,
        totalPayouts: totalPayouts._sum.valor || 0,
        profit: (totalRevenue._sum.valor || 0) - (totalPayouts._sum.valor || 0)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/admin/users - Listar usuários
app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        cpf: true,
        saldo_reais: true,
        saldo_demo: true,
        tipo_conta: true,
        is_admin: true,
        ativo: true,
        criado_em: true,
        ultimo_login: true
      },
      orderBy: { criado_em: 'desc' }
    });
    
    await prisma.$disconnect();
    
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// PUT /api/admin/users/:userId - Atualizar usuário
app.put('/api/admin/users/:userId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { nome, email, saldo_reais, saldo_demo, ativo, is_admin } = req.body;
    
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        nome,
        email,
        saldo_reais,
        saldo_demo,
        ativo,
        is_admin
      }
    });
    
    await prisma.$disconnect();
    
    res.json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      data: updatedUser
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// ROTAS DE AFILIADOS - Movidas para arquivo separado (affiliate.js)

// GET /api/admin/financial - Dados financeiros
app.get('/api/admin/financial', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const [deposits, withdrawals, pendingDeposits, pendingWithdrawals] = await Promise.all([
      prisma.payment.findMany({
        where: { tipo: 'deposito', status: 'aprovado' },
        orderBy: { criado_em: 'desc' },
        take: 50
      }),
      prisma.payment.findMany({
        where: { tipo: 'saque', status: 'aprovado' },
        orderBy: { criado_em: 'desc' },
        take: 50
      }),
      prisma.payment.findMany({
        where: { tipo: 'deposito', status: 'pendente' },
        orderBy: { criado_em: 'desc' }
      }),
      prisma.payment.findMany({
        where: { tipo: 'saque', status: 'pendente' },
        orderBy: { criado_em: 'desc' }
      })
    ]);
    
    await prisma.$disconnect();
    
    res.json({
      success: true,
      data: {
        deposits,
        withdrawals,
        pendingDeposits,
        pendingWithdrawals
      }
    });
  } catch (error) {
    console.error('Erro ao buscar dados financeiros:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/admin/clear-house-data - Limpar dados da casa
app.post('/api/admin/clear-house-data', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    // Limpar logs de sorteio
    await prisma.drawDetailedLog.deleteMany({});
    
    await prisma.$disconnect();
    
    res.json({
      success: true,
      message: 'Dados da casa limpos com sucesso'
    });
  } catch (error) {
    console.error('Erro ao limpar dados:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// ROTAS DE TRANSAÇÕES
// GET /api/transactions - Histórico de transações
app.get('/api/transactions', authenticateToken, async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const transactions = await prisma.transaction.findMany({
      where: { user_id: req.user.id },
      orderBy: { criado_em: 'desc' },
      take: 100
    });
    
    await prisma.$disconnect();
    
    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/transactions/demo - Histórico de transações demo
app.get('/api/transactions/demo', authenticateToken, async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const transactions = await prisma.transactionDemo.findMany({
      where: { user_id: req.user.id },
      orderBy: { criado_em: 'desc' },
      take: 100
    });
    
    await prisma.$disconnect();
    
    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    console.error('Erro ao buscar transações demo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// ROTAS DE PAGAMENTOS AVANÇADAS
// GET /api/payments/history - Histórico de pagamentos
app.get('/api/payments/history', authenticateToken, async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const payments = await prisma.payment.findMany({
      where: { user_id: req.user.id },
      orderBy: { criado_em: 'desc' },
      take: 50
    });
    
    await prisma.$disconnect();
    
    res.json({
      success: true,
      data: payments
    });
  } catch (error) {
    console.error('Erro ao buscar histórico de pagamentos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/payments/:id - Buscar pagamento específico
app.get('/api/payments/:id', authenticateToken, async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const payment = await prisma.payment.findFirst({
      where: { 
        id: req.params.id,
        user_id: req.user.id 
      }
    });
    
    await prisma.$disconnect();
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Pagamento não encontrado'
      });
    }
    
    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Erro ao buscar pagamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/payments/:id/status - Verificar status do pagamento
app.get('/api/payments/:id/status', authenticateToken, async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const payment = await prisma.payment.findFirst({
      where: { 
        id: req.params.id,
        user_id: req.user.id 
      },
      select: { status: true, processado_em: true }
    });
    
    await prisma.$disconnect();
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Pagamento não encontrado'
      });
    }
    
    res.json({
      success: true,
      data: {
        status: payment.status,
        processado_em: payment.processado_em
      }
    });
  } catch (error) {
    console.error('Erro ao verificar status:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/payments/deposit/callback - Callback de depósito
app.post('/api/payments/deposit/callback', async (req, res) => {
  try {
    const { payment_id, status, valor } = req.body;
    
    if (!payment_id || !status) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos'
      });
    }
    
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    // Atualizar status do pagamento
    const payment = await prisma.payment.update({
      where: { id: payment_id },
      data: { 
        status: status,
        processado_em: new Date()
      }
    });
    
    // Se aprovado, creditar saldo
    if (status === 'aprovado') {
      await prisma.user.update({
        where: { id: payment.user_id },
        data: { 
          saldo_reais: { increment: valor || payment.valor },
          primeiro_deposito_feito: true
        }
      });
      
      // Criar transação
      await prisma.transaction.create({
        data: {
          user_id: payment.user_id,
          tipo: 'deposito',
          valor: valor || payment.valor,
          saldo_antes: 0, // Será calculado
          saldo_depois: 0, // Será calculado
          descricao: 'Depósito aprovado',
          status: 'processado'
        }
      });
    }
    
    await prisma.$disconnect();
    
    res.json({
      success: true,
      message: 'Callback processado com sucesso'
    });
  } catch (error) {
    console.error('Erro no callback de depósito:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/payments/withdraw/callback - Callback de saque
app.post('/api/payments/withdraw/callback', async (req, res) => {
  try {
    const { payment_id, status } = req.body;
    
    if (!payment_id || !status) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos'
      });
    }
    
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    // Atualizar status do pagamento
    const payment = await prisma.payment.update({
      where: { id: payment_id },
      data: { 
        status: status,
        processado_em: new Date()
      }
    });
    
    // Se rejeitado, devolver saldo
    if (status === 'rejeitado') {
      await prisma.user.update({
        where: { id: payment.user_id },
        data: { 
          saldo_reais: { increment: payment.valor }
        }
      });
    }
    
    await prisma.$disconnect();
    
    res.json({
      success: true,
      message: 'Callback processado com sucesso'
    });
  } catch (error) {
    console.error('Erro no callback de saque:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// ROTAS DE PRÊMIOS
// GET /api/prizes - Listar prêmios
app.get('/api/prizes', async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const prizes = await prisma.prize.findMany({
      where: { ativo: true },
      include: {
        case: {
          select: { nome: true }
        }
      },
      orderBy: { valor: 'desc' }
    });
    
    await prisma.$disconnect();
    
    res.json({
      success: true,
      data: prizes
    });
  } catch (error) {
    console.error('Erro ao listar prêmios:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/prizes - Criar prêmio (admin)
app.post('/api/prizes', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { case_id, nome, descricao, valor, probabilidade, imagem } = req.body;
    
    if (!case_id || !nome || !valor || !probabilidade) {
      return res.status(400).json({
        success: false,
        message: 'Dados obrigatórios: case_id, nome, valor, probabilidade'
      });
    }
    
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const prize = await prisma.prize.create({
      data: {
        case_id,
        nome,
        descricao,
        valor,
        probabilidade,
        imagem
      }
    });
    
    await prisma.$disconnect();
    
    res.json({
      success: true,
      message: 'Prêmio criado com sucesso',
      data: prize
    });
  } catch (error) {
    console.error('Erro ao criar prêmio:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// PUT /api/prizes/:id - Atualizar prêmio (admin)
app.put('/api/prizes/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao, valor, probabilidade, imagem, ativo } = req.body;
    
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const prize = await prisma.prize.update({
      where: { id },
      data: {
        nome,
        descricao,
        valor,
        probabilidade,
        imagem,
        ativo
      }
    });
    
    await prisma.$disconnect();
    
    res.json({
      success: true,
      message: 'Prêmio atualizado com sucesso',
      data: prize
    });
  } catch (error) {
    console.error('Erro ao atualizar prêmio:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// DELETE /api/prizes/:id - Deletar prêmio (admin)
app.delete('/api/prizes/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    await prisma.prize.delete({
      where: { id }
    });
    
    await prisma.$disconnect();
    
    res.json({
      success: true,
      message: 'Prêmio deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar prêmio:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// ROTAS DE PERFIL
// GET /api/profile - Dados do perfil
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        nome: true,
        email: true,
        cpf: true,
        saldo_reais: true,
        saldo_demo: true,
        tipo_conta: true,
        criado_em: true,
        ultimo_login: true,
        total_giros: true,
        rollover_liberado: true,
        rollover_minimo: true,
        primeiro_deposito_feito: true
      }
    });
    
    await prisma.$disconnect();
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// PUT /api/profile - Atualizar perfil
app.put('/api/profile', authenticateToken, async (req, res) => {
  try {
    const { nome, email } = req.body;
    
    if (!nome || !email) {
      return res.status(400).json({
        success: false,
        message: 'Nome e email são obrigatórios'
      });
    }
    
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    // Verificar se email já existe em outro usuário
    const existingUser = await prisma.user.findFirst({
      where: { 
        email: email,
        id: { not: req.user.id }
      }
    });
    
    if (existingUser) {
      await prisma.$disconnect();
      return res.status(400).json({
        success: false,
        message: 'Email já está em uso'
      });
    }
    
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { nome, email }
    });
    
    await prisma.$disconnect();
    
    res.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      data: {
        nome: updatedUser.nome,
        email: updatedUser.email
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
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

// Rota para inicializar banco (apenas em produção)
app.post('/api/init-db', async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const bcrypt = require('bcryptjs');
    const prisma = new PrismaClient();
    
    // Verificar se admin já existe
    const existingAdmin = await prisma.user.findFirst({
      where: { email: 'admin@slotbox.shop' }
    });
    
    if (!existingAdmin) {
      const adminPassword = await bcrypt.hash('admin123456', 10);
      
      const admin = await prisma.user.create({
        data: {
          nome: 'Administrador',
          email: 'admin@slotbox.shop',
          senha_hash: adminPassword,
          cpf: '00000000000',
          is_admin: true,
          saldo_reais: 10000.00,
          primeiro_deposito_feito: true,
          rollover_liberado: true
        }
      });
      
      await prisma.wallet.create({
        data: {
          user_id: admin.id,
          saldo_reais: 10000.00,
          saldo_demo: 0
        }
      });
      
      await prisma.$disconnect();
      
      res.json({
        success: true,
        message: 'Banco inicializado com sucesso!',
        admin: {
          email: 'admin@slotbox.shop',
          senha: 'admin123456'
        }
      });
    } else {
      await prisma.$disconnect();
      res.json({
        success: true,
        message: 'Banco já foi inicializado anteriormente'
      });
    }
  } catch (error) {
    console.error('Erro ao inicializar banco:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao inicializar banco',
      error: error.message
    });
  }
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

// Rota para inicializar/corrigir contas demo e admin
app.post('/api/init-demo-accounts', async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const bcrypt = require('bcryptjs');
    const prisma = new PrismaClient();
    
    console.log('🌱 Iniciando criação/correção de contas demo e admin...');

    const results = {
      demos: [],
      admins: [],
      errors: []
    };

    // 1. CRIAR/CORRIGIR CONTAS ADMIN
    console.log('👑 Criando/corrigindo contas ADMIN...');
    
    const adminPassword = await bcrypt.hash('paineladm@', 12);
    
    const adminAccounts = [
      { nome: 'Eduarda', email: 'eduarda@admin.com', username: 'eduarda' },
      { nome: 'Junior', email: 'junior@admin.com', username: 'junior' }
    ];

    for (const adminData of adminAccounts) {
      try {
        // Verificar se já existe
        const existingUser = await prisma.user.findUnique({
          where: { email: adminData.email }
        });

        if (existingUser) {
          // Atualizar conta existente
          await prisma.user.update({
            where: { email: adminData.email },
            data: {
              senha_hash: adminPassword,
              is_admin: true,
              tipo_conta: 'normal',
              ativo: true,
              saldo_reais: 10000.00,
              saldo_demo: 0.00
            }
          });

          await prisma.wallet.upsert({
            where: { user_id: existingUser.id },
            update: {
              saldo_reais: 10000.00,
              saldo_demo: 0.00
            },
            create: {
              user_id: existingUser.id,
              saldo_reais: 10000.00,
              saldo_demo: 0.00
            }
          });

          results.admins.push({
            email: adminData.email,
            status: 'Atualizado',
            saldo_reais: 10000.00
          });
        } else {
          // Criar nova conta admin
          const admin = await prisma.user.create({
            data: {
              nome: adminData.nome,
              email: adminData.email,
              senha_hash: adminPassword,
              cpf: `0000000000${adminAccounts.indexOf(adminData) + 1}`,
              is_admin: true,
              tipo_conta: 'normal',
              ativo: true,
              saldo_reais: 10000.00,
              saldo_demo: 0.00
            }
          });

          await prisma.wallet.create({
            data: {
              user_id: admin.id,
              saldo_reais: 10000.00,
              saldo_demo: 0.00
            }
          });

          results.admins.push({
            email: adminData.email,
            status: 'Criado',
            saldo_reais: 10000.00
          });
        }

        console.log(`✅ Admin ${adminData.email}: ${existingUser ? 'Atualizado' : 'Criado'}`);

      } catch (error) {
        console.error(`❌ Erro ao criar/atualizar admin ${adminData.email}:`, error.message);
        results.errors.push({
          email: adminData.email,
          error: error.message
        });
      }
    }

    // 2. CRIAR/CORRIGIR CONTAS DEMO
    console.log('🎭 Criando/corrigindo contas DEMO...');
    
    const demoPassword = await bcrypt.hash('demo123', 12);
    
    const demoAccounts = [
      { nome: 'Demo 1', email: 'demo1@test.com' },
      { nome: 'Demo 2', email: 'demo2@test.com' },
      { nome: 'Demo 3', email: 'demo3@test.com' }
    ];

    for (const demoData of demoAccounts) {
      try {
        // Verificar se já existe
        const existingUser = await prisma.user.findUnique({
          where: { email: demoData.email }
        });

        if (existingUser) {
          // Atualizar conta existente
          await prisma.user.update({
            where: { email: demoData.email },
            data: {
              senha_hash: demoPassword,
              is_admin: false,
              tipo_conta: 'afiliado_demo',
              ativo: true,
              saldo_reais: 0.00,
              saldo_demo: 100.00
            }
          });

          await prisma.wallet.upsert({
            where: { user_id: existingUser.id },
            update: {
              saldo_reais: 0.00,
              saldo_demo: 100.00
            },
            create: {
              user_id: existingUser.id,
              saldo_reais: 0.00,
              saldo_demo: 100.00
            }
          });

          results.demos.push({
            email: demoData.email,
            status: 'Atualizado',
            saldo_demo: 100.00
          });
        } else {
          // Criar nova conta demo
          const demo = await prisma.user.create({
            data: {
              nome: demoData.nome,
              email: demoData.email,
              senha_hash: demoPassword,
              cpf: `1111111111${demoAccounts.indexOf(demoData) + 1}`,
              is_admin: false,
              tipo_conta: 'afiliado_demo',
              ativo: true,
              saldo_reais: 0.00,
              saldo_demo: 100.00
            }
          });

          await prisma.wallet.create({
            data: {
              user_id: demo.id,
              saldo_reais: 0.00,
              saldo_demo: 100.00
            }
          });

          results.demos.push({
            email: demoData.email,
            status: 'Criado',
            saldo_demo: 100.00
          });
        }

        console.log(`✅ Demo ${demoData.email}: ${existingUser ? 'Atualizado' : 'Criado'}`);

      } catch (error) {
        console.error(`❌ Erro ao criar/atualizar demo ${demoData.email}:`, error.message);
        results.errors.push({
          email: demoData.email,
          error: error.message
        });
      }
    }

    // 3. CORRIGIR CONTAS DEMO EXISTENTES COM TIPO INCORRETO
    console.log('🔧 Corrigindo contas demo com tipo incorreto...');
    
    const incorrectDemoAccounts = await prisma.user.findMany({
      where: { tipo_conta: 'demo' },
      select: { id: true, email: true, nome: true }
    });

    for (const account of incorrectDemoAccounts) {
      try {
        await prisma.user.update({
          where: { id: account.id },
          data: {
            tipo_conta: 'afiliado_demo',
            saldo_demo: 100.00
          }
        });

        await prisma.wallet.upsert({
          where: { user_id: account.id },
          update: { saldo_demo: 100.00 },
          create: {
            user_id: account.id,
            saldo_reais: 0.00,
            saldo_demo: 100.00
          }
        });

        results.demos.push({
          email: account.email,
          status: 'Corrigido',
          saldo_demo: 100.00
        });

        console.log(`✅ Demo corrigido: ${account.email}`);
      } catch (error) {
        console.error(`❌ Erro ao corrigir demo ${account.email}:`, error.message);
        results.errors.push({
          email: account.email,
          error: error.message
        });
      }
    }

    // 4. RESUMO FINAL
    const totalAdmins = results.admins.length;
    const totalDemos = results.demos.length;
    const totalErrors = results.errors.length;
    
    console.log(`\n📊 Resumo:`);
    console.log(`👑 Admins: ${totalAdmins} contas`);
    console.log(`🎭 Demos: ${totalDemos} contas`);
    console.log(`❌ Erros: ${totalErrors} contas`);

    await prisma.$disconnect();
    
    res.json({
      success: true,
      message: 'Contas demo e admin criadas/corrigidas com sucesso!',
      data: {
        admins: results.admins,
        demos: results.demos,
        errors: results.errors,
        summary: {
          totalAdmins,
          totalDemos,
          totalErrors
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao criar/corrigir contas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar/corrigir contas',
      error: error.message
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

// Usar rotas
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cases', casesRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/affiliate', affiliateRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/prizes', prizesRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/caixas', caixasRoutes);
app.use('/api/bulk-purchase', bulkPurchaseRoutes);
app.use('/api/case-prize', casePrizeRoutes);
app.use('/api/prize-audit', prizeAuditRoutes);
app.use('/api/prize-sync', prizeSyncRoutes);
app.use('/api/prize-validation', prizeValidationRoutes);
app.use('/api/image-upload', imageUploadRoutes);
app.use('/api/gateway-config', gatewayConfigRoutes);
app.use('/api/global-draw', globalDrawRoutes);
app.use('/api/seed', seedRoutes);

// Novas rotas VizzionPay
app.use('/api/deposit', depositRoutes);
app.use('/api/withdraw', withdrawRoutes);
app.use('/api/webhook', webhookRoutes);

// Servir arquivos estáticos do frontend (para produção)
if (config.nodeEnv === 'production') {
  const path = require('path');
  app.use(express.static(path.join(__dirname, '../../frontend/dist')));
  
  // Rota para servir o index.html para todas as rotas do frontend (SPA)
  app.get('*', (req, res) => {
    // Se for uma rota da API, retornar 404
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({
        success: false,
        message: 'Rota da API não encontrada'
      });
    }
    
    // Para todas as outras rotas, servir o index.html do frontend
    res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
  });
} else {
  // Em desenvolvimento, apenas retornar 404 para rotas não encontradas
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      message: 'Rota não encontrada'
    });
  });
}

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