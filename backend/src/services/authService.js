const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const prisma = require('../utils/prisma');
const { validateRegisterData, validateLoginData, sanitizeString } = require('../utils/validation');

class AuthService {
  // Gerar hash da senha
  async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  // Comparar senha com hash
  async comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  // Gerar token JWT
  generateToken(userId) {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  // Registrar novo usuário
  async register(userData) {
    // Validar dados
    const validation = validateRegisterData(userData);
    if (!validation.isValid) {
      throw new Error(`Dados inválidos: ${validation.errors.join(', ')}`);
    }

    // Sanitizar dados
    const sanitizedData = {
      nome: sanitizeString(userData.nome),
      email: userData.email.toLowerCase().trim(),
      cpf: userData.cpf.replace(/\D/g, ''), // Remove caracteres não numéricos
      senha: userData.senha
    };

    // Verificar se email já existe
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: sanitizedData.email },
          { cpf: sanitizedData.cpf }
        ]
      }
    });

    if (existingUser) {
      throw new Error('Email ou CPF já cadastrado');
    }

    // Criar hash da senha
    const senha_hash = await this.hashPassword(sanitizedData.senha);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        nome: sanitizedData.nome,
        email: sanitizedData.email,
        cpf: sanitizedData.cpf,
        senha_hash,
        codigo_indicacao_usado: userData.codigo_indicacao_usado || null
      },
      select: {
        id: true,
        nome: true,
        email: true,
        cpf: true,
        saldo: true,
        is_admin: true,
        ativo: true,
        banido_em: true,
        motivo_ban: true,
        ultimo_login: true,
        criado_em: true
      }
    });

    // Criar carteira para o usuário
    await prisma.wallet.create({
      data: {
        user_id: user.id,
        saldo: 0
      }
    });

    // Gerar token
    const token = this.generateToken(user.id);

    return {
      user,
      token
    };
  }

  // Login do usuário
  async login(credentials) {
    // Validar dados
    const validation = validateLoginData(credentials);
    if (!validation.isValid) {
      throw new Error(`Dados inválidos: ${validation.errors.join(', ')}`);
    }

    const email = credentials.email.toLowerCase().trim();

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        wallet: true
      }
    });

    if (!user) {
      throw new Error('Email ou senha incorretos');
    }

    // Verificar senha
    const isValidPassword = await this.comparePassword(credentials.senha, user.senha_hash);
    if (!isValidPassword) {
      throw new Error('Email ou senha incorretos');
    }

    // Gerar token
    const token = this.generateToken(user.id);

    // Retornar dados do usuário (sem senha)
    const { senha_hash, ...userData } = user;

    return {
      user: userData,
      token
    };
  }

  // Buscar dados do usuário logado
  async getCurrentUser(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nome: true,
        email: true,
        cpf: true,
        saldo: true,
        saldo_demo: true,
        tipo_conta: true,
        is_admin: true,
        ativo: true,
        banido_em: true,
        motivo_ban: true,
        ultimo_login: true,
        criado_em: true,
        wallet: {
          select: {
            id: true,
            saldo: true,
            atualizado_em: true
          }
        },
        affiliate: {
          select: {
            id: true,
            codigo_indicacao: true,
            ganhos: true,
            atualizado_em: true
          }
        }
      }
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Para contas demo, usar saldo_demo como saldo principal
    if (user.tipo_conta === 'afiliado_demo') {
      user.saldo_reais = user.saldo_demo;
    }

    return user;
  }
}

module.exports = new AuthService();
