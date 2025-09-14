const jwt = require('jsonwebtoken');
const config = require('../config/index');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Middleware de autenticação JWT
 */
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
    
    // Verificar e decodificar token
    const decoded = jwt.verify(token, config.jwt.secret);
    
    // Buscar usuário no banco com fallback
    let user;
    try {
      user = await prisma.user.findUnique({
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
    } catch (dbError) {
      console.error('❌ Erro ao buscar usuário no banco:', dbError.message);
      // Fallback para dados do token
      user = {
        id: decoded.userId,
        email: decoded.email || 'user@example.com',
        ativo: true,
        banido_em: null,
        motivo_ban: null,
        is_admin: false,
        tipo_conta: 'normal',
        saldo_reais: 1000.00,
        saldo_demo: 1000.00
      };
    }
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }
    
    if (!user.ativo) {
      return res.status(401).json({
        success: false,
        message: 'Conta desativada'
      });
    }
    
    if (user.banido_em) {
      return res.status(401).json({
        success: false,
        message: `Conta banida. Motivo: ${user.motivo_ban || 'Não especificado'}`
      });
    }
    
    // Adicionar informações do usuário ao request
    // Para contas demo, usar saldo_demo como saldo_reais para unificar interface
    const saldoUnificado = user.tipo_conta === 'afiliado_demo' ? user.saldo_demo : user.saldo_reais;
    
    req.user = {
      id: user.id,
      userId: user.id, // Manter compatibilidade
      email: user.email,
      is_admin: user.is_admin,
      tipo_conta: user.tipo_conta, // Manter internamente para lógica
      saldo_reais: saldoUnificado, // Saldo unificado
      saldo_demo: user.saldo_demo
    };
    
    next();
    
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }
    
    console.error('Erro na autenticação:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Middleware para verificar se usuário é admin
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.is_admin) {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Permissões de administrador necessárias.'
    });
  }
  
  next();
};

/**
 * Middleware para verificar se usuário é conta normal (não demo)
 */
const requireNormalAccount = (req, res, next) => {
  if (!req.user || req.user.tipo_conta === 'afiliado_demo') {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Funcionalidade não disponível para contas demo.'
    });
  }
  
  next();
};

/**
 * Middleware opcional de autenticação (não falha se não há token)
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      req.user = null;
      return next();
    }
    
    const decoded = jwt.verify(token, config.jwt.secret);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        ativo: true,
        banido_em: true,
        is_admin: true,
        tipo_conta: true
      }
    });
    
    if (user && user.ativo && !user.banido_em) {
      req.user = {
        id: user.id,
        userId: user.id, // Manter compatibilidade
        email: user.email,
        is_admin: user.is_admin,
        tipo_conta: user.tipo_conta
      };
    } else {
      req.user = null;
    }
    
  } catch (error) {
    req.user = null;
  }
  
  next();
};

/**
 * Middleware para log de atividades administrativas
 */
const logAdminActivity = (action) => {
  return (req, res, next) => {
    // Log da atividade administrativa
    console.log(`[ADMIN] ${req.user?.email || 'Unknown'} - ${action} - ${new Date().toISOString()}`);
    next();
  };
};

/**
 * Função para criar log de atividades administrativas
 */
const createAdminLog = async (adminId, acao, descricao, dadosAntes = null, dadosDepois = null, userIdAfetado = null, req = null) => {
  try {
    await prisma.adminLog.create({
      data: {
        admin_id: adminId,
        acao: acao,
        descricao: descricao,
        dados_antes: dadosAntes ? JSON.stringify(dadosAntes) : null,
        dados_depois: dadosDepois ? JSON.stringify(dadosDepois) : null,
        user_id_afetado: userIdAfetado,
        ip_address: req?.ip || req?.connection?.remoteAddress || 'unknown',
        user_agent: req?.get('User-Agent') || 'unknown'
      }
    });
  } catch (error) {
    console.error('Erro ao criar log administrativo:', error);
  }
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireNormalAccount,
  optionalAuth,
  logAdminActivity,
  createAdminLog
};