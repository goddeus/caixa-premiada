
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const config = require('../config/index');
const AffiliateService = require('../services/affiliateService');

const prisma = new PrismaClient();

class AuthController {
  
  /**
   * POST /api/auth/create-test-accounts
   * Endpoint temporário para criar contas de teste
   */
  static async createTestAccounts(req, res) {
    try {
      // Verificar se é uma requisição autorizada (apenas localhost ou IP específico)
      const clientIP = req.ip || req.connection.remoteAddress;
      const isLocalhost = clientIP.includes('127.0.0.1') || clientIP.includes('::1') || clientIP.includes('localhost');
      
      if (!isLocalhost) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado'
        });
      }

      console.log('🔧 Criando contas de teste...');

      // 1. CONTAS ADMIN
      console.log('👑 Criando contas admin...');
      
      const adminPassword = await bcrypt.hash('paineladm@', 12);
      
      const adminAccounts = [
        { nome: 'Eduarda', email: 'eduarda@admin.com', cpf: '00000000001' },
        { nome: 'Junior', email: 'junior@admin.com', cpf: '00000000002' }
      ];

      const createdAdmins = [];
      for (const adminData of adminAccounts) {
        try {
          const admin = await prisma.user.upsert({
            where: { email: adminData.email },
            update: {
              nome: adminData.nome,
              senha_hash: adminPassword,
              cpf: adminData.cpf,
              is_admin: true,
              tipo_conta: 'admin',
              saldo_reais: 10000.00,
              saldo_demo: 100.00
            },
            create: {
              nome: adminData.nome,
              email: adminData.email,
              senha_hash: adminPassword,
              cpf: adminData.cpf,
              is_admin: true,
              tipo_conta: 'admin',
              saldo_reais: 10000.00,
              saldo_demo: 100.00,
              email_verificado: true,
              data_cadastro: new Date(),
              ultimo_acesso: new Date()
            }
          });
          createdAdmins.push(admin.email);
          console.log(`✅ Admin criado: ${adminData.email}`);
        } catch (error) {
          console.log(`❌ Erro ao criar ${adminData.email}:`, error.message);
        }
      }

      // 2. CONTAS DEMO
      console.log('\n🎭 Criando contas demo...');
      
      const demoPassword = await bcrypt.hash('Afiliado@123', 12);
      
      const demoAccounts = [
        { nome: 'João Ferreira', email: 'joao.ferreira@test.com', cpf: '11111111111' },
        { nome: 'Lucas Almeida', email: 'lucas.almeida@test.com', cpf: '11111111112' },
        { nome: 'Pedro Henrique', email: 'pedro.henrique@test.com', cpf: '11111111113' },
        { nome: 'Rafael Costa', email: 'rafael.costa@test.com', cpf: '11111111114' },
        { nome: 'Bruno Martins', email: 'bruno.martins@test.com', cpf: '11111111115' },
        { nome: 'Diego Oliveira', email: 'diego.oliveira@test.com', cpf: '11111111116' },
        { nome: 'Matheus Rocha', email: 'matheus.rocha@test.com', cpf: '11111111117' },
        { nome: 'Thiago Mendes', email: 'thiago.mendes@test.com', cpf: '11111111118' },
        { nome: 'Felipe Carvalho', email: 'felipe.carvalho@test.com', cpf: '11111111119' },
        { nome: 'Gustavo Lima', email: 'gustavo.lima@test.com', cpf: '11111111120' },
        { nome: 'André Pereira', email: 'andre.pereira@test.com', cpf: '11111111121' },
        { nome: 'Rodrigo Santos', email: 'rodrigo.santos@test.com', cpf: '11111111122' },
        { nome: 'Marcelo Nunes', email: 'marcelo.nunes@test.com', cpf: '11111111123' },
        { nome: 'Vinícius Araújo', email: 'vinicius.araujo@test.com', cpf: '11111111124' },
        { nome: 'Eduardo Ramos', email: 'eduardo.ramos@test.com', cpf: '11111111125' }
      ];

      const createdDemos = [];
      for (const demoData of demoAccounts) {
        try {
          const demo = await prisma.user.upsert({
            where: { email: demoData.email },
            update: {
              nome: demoData.nome,
              senha_hash: demoPassword,
              cpf: demoData.cpf,
              saldo_demo: 100.00
            },
            create: {
              nome: demoData.nome,
              email: demoData.email,
              senha_hash: demoPassword,
              cpf: demoData.cpf,
              is_admin: false,
              tipo_conta: 'demo',
              saldo_reais: 0.00,
              saldo_demo: 100.00,
              email_verificado: true,
              data_cadastro: new Date(),
              ultimo_acesso: new Date()
            }
          });
          createdDemos.push(demo.email);
          console.log(`✅ Demo criado: ${demoData.email}`);
        } catch (error) {
          console.log(`❌ Erro ao criar ${demoData.email}:`, error.message);
        }
      }

      res.json({
        success: true,
        message: 'Contas de teste criadas com sucesso',
        data: {
          admins: createdAdmins,
          demos: createdDemos,
          credentials: {
            admins: [
              { email: 'eduarda@admin.com', senha: 'paineladm@' },
              { email: 'junior@admin.com', senha: 'paineladm@' }
            ],
            demos: [
              { email: 'joao.ferreira@test.com', senha: 'Afiliado@123' },
              { email: 'eduardo.ramos@test.com', senha: 'Afiliado@123' },
              { email: 'lucas.almeida@test.com', senha: 'Afiliado@123' }
            ]
          }
        }
      });

    } catch (error) {
      console.error('Erro ao criar contas de teste:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
  
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
      
      // Aplicar código de indicação se válido
      if (ref_code && affiliateId) {
        await AffiliateService.applyReferralCode(user.id, ref_code);
      }
      
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
