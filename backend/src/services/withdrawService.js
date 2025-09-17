/**
 * Serviço de Saques
 * Gerencia operações de saque com validações e proteções
 */

const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const prisma = new PrismaClient();

class WithdrawService {
  
  /**
   * Valida dados de saque
   * @param {Object} withdrawData - Dados do saque
   * @returns {Object} Resultado da validação
   */
  async validateWithdrawData(withdrawData) {
    const { userId, amount, pixKey, pixKeyType } = withdrawData;
    const errors = [];
    
    // Validações básicas
    if (!userId) errors.push('userId é obrigatório');
    if (!amount) errors.push('amount é obrigatório');
    if (!pixKey) errors.push('pixKey é obrigatório');
    if (!pixKeyType) errors.push('pixKeyType é obrigatório');
    
    if (errors.length > 0) {
      return { valid: false, errors };
    }
    
    // Validação de valor
    const valorNumerico = Number(amount);
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      errors.push('Valor deve ser um número positivo');
    }
    
    if (valorNumerico < 20.00) {
      errors.push('Valor mínimo para saque é R$ 20,00');
    }
    
    if (valorNumerico > 5000.00) {
      errors.push('Valor máximo para saque é R$ 5.000,00');
    }
    
    // Validação de chave PIX
    if (!this.validatePixKey(pixKey, pixKeyType)) {
      errors.push('Chave PIX inválida');
    }
    
    return { valid: errors.length === 0, errors, amount: valorNumerico };
  }
  
  /**
   * Valida chave PIX
   * @param {string} pixKey - Chave PIX
   * @param {string} pixKeyType - Tipo da chave
   * @returns {boolean} Se a chave é válida
   */
  validatePixKey(pixKey, pixKeyType) {
    if (!pixKey || !pixKeyType) return false;
    
    switch (pixKeyType) {
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pixKey);
      case 'cpf':
        return /^\d{11}$/.test(pixKey.replace(/\D/g, ''));
      case 'cnpj':
        return /^\d{14}$/.test(pixKey.replace(/\D/g, ''));
      case 'phone':
        return /^\+?55\d{10,11}$/.test(pixKey.replace(/\D/g, ''));
      case 'random':
        return /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(pixKey);
      default:
        return false;
    }
  }
  
  /**
   * Verifica se usuário pode fazer saque
   * @param {string} userId - ID do usuário
   * @param {number} amount - Valor do saque
   * @returns {Object} Resultado da verificação
   */
  async canUserWithdraw(userId, amount) {
    try {
      // Buscar usuário com saldo
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          nome: true,
          tipo_conta: true,
          saldo_reais: true,
          saldo_demo: true,
          cpf: true
        }
      });
      
      if (!user) {
        return { canWithdraw: false, reason: 'Usuário não encontrado' };
      }
      
      // Verificar se é conta demo
      if (user.tipo_conta === 'afiliado_demo') {
        return { canWithdraw: false, reason: 'Contas demo não podem realizar saques' };
      }
      
      // Verificar saldo
      if (user.saldo_reais < amount) {
        return { canWithdraw: false, reason: 'Saldo insuficiente' };
      }
      
      // Verificar limite diário de saques
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayWithdrawals = await prisma.transaction.aggregate({
        where: {
          user_id: userId,
          tipo: 'saque',
          status: { in: ['processando', 'concluido'] },
          created_at: { gte: today }
        },
        _sum: { valor: true },
        _count: { id: true }
      });
      
      const totalToday = todayWithdrawals._sum.valor || 0;
      const countToday = todayWithdrawals._count.id || 0;
      
      // Limite diário de R$ 10.000
      if (totalToday + amount > 10000) {
        return { canWithdraw: false, reason: 'Limite diário de saque excedido (R$ 10.000)' };
      }
      
      // Máximo 5 saques por dia
      if (countToday >= 5) {
        return { canWithdraw: false, reason: 'Máximo de 5 saques por dia' };
      }
      
      return { canWithdraw: true, user };
      
    } catch (error) {
      console.error('Erro ao verificar permissão de saque:', error);
      return { canWithdraw: false, reason: 'Erro interno' };
    }
  }
  
  /**
   * Cria saque via VizzionPay
   * @param {Object} withdrawData - Dados do saque
   * @returns {Object} Resultado do saque
   */
  async createWithdraw(withdrawData) {
    const { userId, amount, pixKey, pixKeyType } = withdrawData;
    
    try {
      // Validar dados
      const validation = await this.validateWithdrawData(withdrawData);
      if (!validation.valid) {
        return {
          success: false,
          error: 'Dados inválidos',
          details: validation.errors
        };
      }
      
      // Verificar permissão
      const permission = await this.canUserWithdraw(userId, validation.amount);
      if (!permission.canWithdraw) {
        return {
          success: false,
          error: permission.reason
        };
      }
      
      const user = permission.user;
      
      // Gerar identifier único
      const timestamp = Date.now();
      const identifier = `withdraw_${userId}_${timestamp}`;
      
      // Preparar dados para VizzionPay
      const vizzionData = {
        identifier,
        amount: validation.amount,
        pixKey: pixKey.trim(),
        pixKeyType,
        client: {
          name: user.nome || "Usuário SlotBox",
          document: user.cpf || "00000000000",
          email: user.email || "teste@slotbox.shop"
        }
      };
      
      console.log(`[WITHDRAW] Enviando saque para VizzionPay: ${identifier} - R$ ${validation.amount}`);
      
      // Fazer requisição para VizzionPay
      const response = await axios.post(
        'https://app.vizzionpay.com/api/v1/gateway/pix/transfer',
        vizzionData,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-public-key': process.env.VIZZION_PUBLIC_KEY,
            'x-secret-key': process.env.VIZZION_SECRET_KEY
          },
          timeout: 30000
        }
      );
      
      console.log(`[WITHDRAW] Resposta VizzionPay:`, response.data);
      
      // Processar transação no banco
      const result = await prisma.$transaction(async (tx) => {
        // Debitar saldo do usuário
        await tx.user.update({
          where: { id: userId },
          data: { saldo_reais: { decrement: validation.amount } }
        });
        
        // Sincronizar com Wallet
        await tx.wallet.update({
          where: { user_id: userId },
          data: { saldo_reais: { decrement: validation.amount } }
        });
        
        // Criar transação de saque
        const transaction = await tx.transaction.create({
          data: {
            user_id: userId,
            tipo: 'saque',
            valor: validation.amount,
            status: 'processando',
            identifier,
            descricao: `Saque PIX para ${pixKey}`,
            metadata: {
              pixKey,
              pixKeyType,
              vizzionResponse: response.data
            }
          }
        });
        
        return transaction;
      });
      
      console.log(`[WITHDRAW] Saque criado com sucesso: ${identifier}`);
      
      return {
        success: true,
        data: {
          identifier,
          amount: validation.amount,
          pixKey,
          pixKeyType,
          status: 'processing',
          transactionId: result.id
        }
      };
      
    } catch (error) {
      console.error('[WITHDRAW] Erro ao criar saque:', error);
      
      if (error.response) {
        console.error('[WITHDRAW] Erro VizzionPay:', error.response.data);
        return {
          success: false,
          error: 'Erro no processamento do saque',
          details: error.response.data
        };
      }
      
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }
  
  /**
   * Processa webhook de saque
   * @param {Object} webhookData - Dados do webhook
   * @returns {Object} Resultado do processamento
   */
  async processWithdrawWebhook(webhookData) {
    const { identifier, status, transactionId } = webhookData;
    
    try {
      // Buscar transação de saque
      const withdrawTransaction = await prisma.transaction.findFirst({
        where: { identifier },
        include: { user: true }
      });
      
      if (!withdrawTransaction) {
        return {
          success: false,
          error: 'Transação não encontrada'
        };
      }
      
      // Processar resultado
      const result = await prisma.$transaction(async (tx) => {
        if (status === 'approved' || status === 'paid') {
          // Saque aprovado
          await tx.transaction.update({
            where: { id: withdrawTransaction.id },
            data: {
              status: 'concluido',
              processado_em: new Date(),
              metadata: {
                ...withdrawTransaction.metadata,
                vizzionTransactionId: transactionId,
                finalStatus: status
              }
            }
          });
          
          console.log(`[WITHDRAW] Saque aprovado: ${identifier} - R$ ${withdrawTransaction.valor}`);
          
          return { success: true, action: 'approved' };
          
        } else if (status === 'rejected' || status === 'failed') {
          // Saque rejeitado - devolver saldo
          await tx.transaction.update({
            where: { id: withdrawTransaction.id },
            data: {
              status: 'rejeitado',
              processado_em: new Date(),
              metadata: {
                ...withdrawTransaction.metadata,
                vizzionTransactionId: transactionId,
                finalStatus: status
              }
            }
          });
          
          // Devolver saldo ao usuário
          await tx.user.update({
            where: { id: withdrawTransaction.user_id },
            data: { saldo_reais: { increment: withdrawTransaction.valor } }
          });
          
          // Sincronizar com Wallet
          await tx.wallet.update({
            where: { user_id: withdrawTransaction.user_id },
            data: { saldo_reais: { increment: withdrawTransaction.valor } }
          });
          
          console.log(`[WITHDRAW] Saque rejeitado - saldo devolvido: ${identifier} - R$ ${withdrawTransaction.valor}`);
          
          return { success: true, action: 'rejected' };
        }
        
        return { success: true, action: 'no_change' };
      });
      
      return result;
      
    } catch (error) {
      console.error('[WITHDRAW] Erro ao processar webhook:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }
  
  /**
   * Obtém histórico de saques do usuário
   * @param {string} userId - ID do usuário
   * @param {Object} options - Opções de paginação
   * @returns {Object} Histórico de saques
   */
  async getWithdrawHistory(userId, options = {}) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;
    
    try {
      const [withdrawals, total] = await Promise.all([
        prisma.transaction.findMany({
          where: {
            user_id: userId,
            tipo: 'saque'
          },
          orderBy: { created_at: 'desc' },
          skip,
          take: limit
        }),
        prisma.transaction.count({
          where: {
            user_id: userId,
            tipo: 'saque'
          }
        })
      ]);
      
      return {
        success: true,
        data: {
          withdrawals,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      };
      
    } catch (error) {
      console.error('Erro ao obter histórico de saques:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }
  
  /**
   * Obtém estatísticas de saques para admin
   * @returns {Object} Estatísticas de saques
   */
  async getWithdrawStats() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const [todayStats, totalStats, pendingStats] = await Promise.all([
        // Estatísticas de hoje
        prisma.transaction.aggregate({
          where: {
            tipo: 'saque',
            created_at: { gte: today }
          },
          _sum: { valor: true },
          _count: { id: true }
        }),
        
        // Estatísticas totais
        prisma.transaction.aggregate({
          where: { tipo: 'saque' },
          _sum: { valor: true },
          _count: { id: true }
        }),
        
        // Saques pendentes
        prisma.transaction.count({
          where: {
            tipo: 'saque',
            status: 'processando'
          }
        })
      ]);
      
      return {
        success: true,
        data: {
          today: {
            count: todayStats._count.id || 0,
            total: todayStats._sum.valor || 0
          },
          total: {
            count: totalStats._count.id || 0,
            total: totalStats._sum.valor || 0
          },
          pending: pendingStats
        }
      };
      
    } catch (error) {
      console.error('Erro ao obter estatísticas de saques:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }
}

module.exports = new WithdrawService();
