const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const config = require('../config/index');
const AffiliateService = require('../services/affiliateService');

const prisma = new PrismaClient();

class AuthController {
  
  /**
   * POST /api/auth/register
   * Registrar novo usuário
   */
  static async register(req, res) {
    try {
      const { nome, email, senha, cpf, ref_code } = req.body;
      
      // Validações básicas
      if (!nome || !email || !senha || !cpf) {
        return res.status(400).json({
          success: false,
          message: 'Todos os campos são obrigatórios'
        });
      }
      
      if (senha.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Senha deve ter pelo menos 6 caracteres'
        });
      }
      
      // Verificar se email já existe
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'E-mail já cadastrado'
        });
      }
      
      // Verificar se CPF já existe
      const existingCpf = await prisma.user.findUnique({
        where: { cpf: cpf.replace(/\D/g, '') }
      });
      
      if (existingCpf) {
        return res.status(400).json({
          success: false,
          message: 'CPF já cadastrado'
        });
      }
      
      // Validar código de indicação se fornecido
      let affiliateId = null;
      if (ref_code) {
        const affiliate = await AffiliateService.validateReferralCode(ref_code);
        if (affiliate) {
          affiliateId = affiliate.user_id;
        }
      }
      
      // Hash da senha
      const senhaHash = await bcrypt.hash(senha, 12);
      
      // Criar usuário
      const user = await prisma.user.create({
        data: {
          nome,
          email: email.toLowerCase(),
          senha_hash: senhaHash,
          cpf: cpf.replace(/\D/g, ''),
          saldo_reais: 0,
          saldo_demo: 0,
          tipo_conta: 'normal',
          affiliate_id: affiliateId,
          codigo_indicacao_usado: ref_code ? ref_code.toUpperCase() : null,
          primeiro_deposito_feito: false,
          rollover_liberado: false
        }
      });
      
      // Código de indicação já foi aplicado na criação do usuário
      // Não precisa aplicar novamente
      
      // Gerar token JWT
      const token = jwt.sign(
        { 
          userId: user.id,
          email: user.email,
          tipo_conta: user.tipo_conta
        },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );
      
      // Registrar login
      await prisma.loginHistory.create({
        data: {
          user_id: user.id,
          ip_address: req.ip || req.connection.remoteAddress || 'unknown',
          user_agent: req.get('User-Agent') || 'unknown',
          sucesso: true
        }
      });
      
      console.log(`✅ Usuário registrado: ${email} ${ref_code ? `(ref: ${ref_code})` : ''}`);
      
      res.status(201).json({
        success: true,
        message: 'Usuário registrado com sucesso',
        data: {
          token,
          user: {
            id: user.id,
            nome: user.nome,
            email: user.email,
            saldo_reais: user.saldo_reais,
            saldo_demo: user.saldo_demo,
            tipo_conta: user.tipo_conta,
            primeiro_deposito_feito: user.primeiro_deposito_feito,
            rollover_liberado: user.rollover_liberado
          }
        }
      });
      
    } catch (error) {
      console.error('Erro no registro:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
  
  /**
   * POST /api/auth/login
   * Fazer login
   */
  static async login(req, res) {
    try {
      const { email, senha } = req.body;
      
      if (!email || !senha) {
        return res.status(400).json({
          success: false,
          message: 'E-mail e senha são obrigatórios'
        });
      }
      
      // Buscar usuário
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Credenciais inválidas'
        });
      }
      
      // Verificar se usuário está ativo
      if (!user.ativo) {
        return res.status(401).json({
          success: false,
          message: 'Conta desativada'
        });
      }
      
      // Verificar se usuário está banido
      if (user.banido_em) {
        return res.status(401).json({
          success: false,
          message: `Conta banida. Motivo: ${user.motivo_ban || 'Não especificado'}`
        });
      }
      
      // Verificar senha
      const senhaValida = await bcrypt.compare(senha, user.senha_hash);
      
      if (!senhaValida) {
        // Registrar tentativa de login falhada
        await prisma.loginHistory.create({
          data: {
            user_id: user.id,
            ip_address: req.ip || req.connection.remoteAddress || 'unknown',
            user_agent: req.get('User-Agent') || 'unknown',
            sucesso: false
          }
        });
        
        return res.status(401).json({
          success: false,
          message: 'Credenciais inválidas'
        });
      }
      
      // Atualizar último login
      await prisma.user.update({
        where: { id: user.id },
        data: { ultimo_login: new Date() }
      });
      
      // Registrar login bem-sucedido
      await prisma.loginHistory.create({
        data: {
          user_id: user.id,
          ip_address: req.ip || req.connection.remoteAddress || 'unknown',
          user_agent: req.get('User-Agent') || 'unknown',
          sucesso: true
        }
      });
      
      // Gerar token JWT
      const token = jwt.sign(
        { 
          userId: user.id,
          email: user.email,
          tipo_conta: user.tipo_conta,
          is_admin: user.is_admin
        },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );
      
      console.log(`✅ Login realizado: ${email}`);
      
      res.json({
        success: true,
        message: 'Login realizado com sucesso',
        data: {
          token,
          user: {
            id: user.id,
            nome: user.nome,
            email: user.email,
            saldo_reais: user.saldo_reais,
            saldo_demo: user.saldo_demo,
            tipo_conta: user.tipo_conta,
            primeiro_deposito_feito: user.primeiro_deposito_feito,
            rollover_liberado: user.rollover_liberado,
            is_admin: user.is_admin
          }
        }
      });
      
    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
  
  /**
   * GET /api/auth/me
   * Obter dados do usuário logado
   */
  static async me(req, res) {
    try {
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
          primeiro_deposito_feito: true,
          rollover_liberado: true,
          rollover_minimo: true,
          total_giros: true,
          is_admin: true,
          criado_em: true,
          ultimo_login: true
        }
      });
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }
      
      res.json({
        success: true,
        data: { user }
      });
      
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
  
  /**
   * POST /api/auth/refresh
   * Renovar token JWT
   */
  static async refresh(req, res) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id }
      });
      
      if (!user || !user.ativo) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não encontrado ou inativo'
        });
      }
      
      // Gerar novo token
      const token = jwt.sign(
        { 
          userId: user.id,
          email: user.email,
          tipo_conta: user.tipo_conta,
          is_admin: user.is_admin
        },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );
      
      res.json({
        success: true,
        data: { token }
      });
      
    } catch (error) {
      console.error('Erro ao renovar token:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = AuthController;