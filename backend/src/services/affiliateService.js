const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

/**
 * Serviço para sistema de afiliados com comissão automática
 * Implementação conforme especificação do prompt
 */
class AffiliateService {
  
  /**
   * Processar comissão de afiliado no primeiro depósito válido
   * @param {Object} params - { userId, depositAmount, depositStatus }
   */
  static async processAffiliateCommission({ userId, depositAmount, depositStatus }) {
    if (depositStatus !== 'concluido' && depositStatus !== 'paid') {
      return; // Só processar depósitos confirmados
    }
    
    const depositValue = Number(depositAmount);
    if (depositValue < 20.00) {
      return; // Só processar depósitos >= R$ 20
    }
    
    try {
      await prisma.$transaction(async (tx) => {
        // 1. Buscar usuário que fez o depósito
        const user = await tx.user.findUnique({
          where: { id: userId }
        });
        
        if (!user || !user.affiliate_id) {
          return; // Usuário não tem afiliado
        }
        
        // 2. Verificar se é o primeiro depósito válido
        const isFirstDeposit = await this.isFirstValidDeposit(tx, userId, depositValue);
        if (!isFirstDeposit) {
          return; // Não é o primeiro depósito válido
        }
        
        // 3. Buscar dados do afiliado
        const affiliate = await tx.affiliate.findUnique({
          where: { user_id: user.affiliate_id },
          include: { user: true }
        });
        
        if (!affiliate) {
          console.error(`Afiliado não encontrado para user_id: ${user.affiliate_id}`);
          return;
        }
        
        // 4. Verificar se já existe comissão para este usuário indicado
        const existingCommission = await tx.affiliateCommission.findFirst({
          where: {
            affiliate_id: affiliate.id,
            referred_user_id: userId
          }
        });
        
        if (existingCommission) {
          console.log(`Comissão já existe para afiliado ${affiliate.id} e usuário ${userId}`);
          return;
        }
        
        // 5. Criar comissão de R$ 10,00
        const commissionValue = 10.00;
        
        const commission = await tx.affiliateCommission.create({
          data: {
            affiliate_id: affiliate.id,
            referred_user_id: userId,
            valor: commissionValue,
            status: 'creditado'
          }
        });
        
        // 6. Creditar R$ 10,00 no saldo do afiliado
        await tx.user.update({
          where: { id: affiliate.user_id },
          data: {
            saldo_reais: { increment: commissionValue }
          }
        });
        
        // 7. Atualizar dados do afiliado
        await tx.affiliate.update({
          where: { id: affiliate.id },
          data: {
            ganhos: { increment: commissionValue },
            saldo_disponivel: { increment: commissionValue }
          }
        });
        
        // 8. Registrar transação de comissão
        await tx.transaction.create({
          data: {
            user_id: affiliate.user_id,
            tipo: 'affiliate_credit',
            valor: commissionValue,
            status: 'concluido',
            descricao: `Comissão por indicação - ${user.nome} (${user.email})`
          }
        });
        
        // 9. Registrar no histórico de afiliados
        await tx.affiliateHistory.create({
          data: {
            affiliate_id: affiliate.id,
            indicado_id: userId,
            deposito_valido: true,
            valor_deposito: depositValue,
            comissao_gerada: commissionValue,
            status: 'pago'
          }
        });
        
        console.log(`✅ Comissão de afiliado processada: R$ ${commissionValue} para ${affiliate.user.email} por indicação de ${user.email}`);
      });
      
    } catch (error) {
      console.error('Erro ao processar comissão de afiliado:', error);
    }
  }
  
  /**
   * Verificar se é o primeiro depósito válido do usuário
   */
  static async isFirstValidDeposit(tx, userId, currentDepositValue) {
    // Buscar depósitos anteriores válidos (>= R$ 20)
    const previousValidDeposits = await tx.payment.count({
      where: {
        user_id: userId,
        tipo: 'deposito',
        status: { in: ['concluido', 'paid'] },
        valor: { gte: 20.00 }
      }
    });
    
    // É o primeiro se não há depósitos anteriores válidos
    return previousValidDeposits === 0;
  }
  
  /**
   * Criar código de indicação único para afiliado
   */
  static generateAffiliateCode(userName) {
    const cleanName = userName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const shortName = cleanName.substring(0, 6);
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${shortName}${randomSuffix}`;
  }
  
  /**
   * Criar afiliado para usuário
   */
  static async createAffiliate(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });
      
      if (!user) {
        throw new Error('Usuário não encontrado');
      }
      
      // Verificar se já é afiliado
      const existingAffiliate = await prisma.affiliate.findUnique({
        where: { user_id: userId }
      });
      
      if (existingAffiliate) {
        return existingAffiliate;
      }
      
      // Gerar código único
      let affiliateCode;
      let isUnique = false;
      let attempts = 0;
      
      while (!isUnique && attempts < 10) {
        affiliateCode = this.generateAffiliateCode(user.nome);
        
        const existing = await prisma.affiliate.findUnique({
          where: { codigo_indicacao: affiliateCode }
        });
        
        if (!existing) {
          isUnique = true;
        }
        attempts++;
      }
      
      if (!isUnique) {
        // Fallback: usar UUID
        affiliateCode = `AFF${uuidv4().substring(0, 8).toUpperCase()}`;
      }
      
      // Criar afiliado
      const affiliate = await prisma.affiliate.create({
        data: {
          user_id: userId,
          codigo_indicacao: affiliateCode,
          ganhos: 0,
          saldo_disponivel: 0,
          total_sacado: 0
        }
      });
      
      console.log(`✅ Afiliado criado: ${user.email} - Código: ${affiliateCode}`);
      return affiliate;
      
    } catch (error) {
      console.error('Erro ao criar afiliado:', error);
      throw error;
    }
  }
  
  /**
   * Buscar dados do afiliado
   */
  static async getAffiliateData(userId) {
    const affiliate = await prisma.affiliate.findUnique({
      where: { user_id: userId },
      include: {
        user: {
          select: { nome: true, email: true }
        },
        affiliate_history: {
          include: {
            indicado: {
              select: { nome: true, email: true }
            }
          },
          orderBy: { data: 'desc' }
        },
        commissions: {
          include: {
            referred_user: {
              select: { nome: true, email: true }
            }
          },
          orderBy: { criado_em: 'desc' }
        }
      }
    });
    
    if (!affiliate) {
      return null;
    }
    
    // Calcular estatísticas
    const totalIndicados = affiliate.affiliate_history.length;
    const indicadosComDeposito = affiliate.affiliate_history.filter(h => h.deposito_valido).length;
    const totalComissoes = affiliate.commissions.reduce((sum, c) => sum + Number(c.valor), 0);
    
    return {
      ...affiliate,
      stats: {
        totalIndicados,
        indicadosComDeposito,
        totalComissoes,
        taxaConversao: totalIndicados > 0 ? (indicadosComDeposito / totalIndicados * 100).toFixed(1) : 0
      }
    };
  }
  
  /**
   * Processar saque de afiliado
   */
  static async processAffiliateWithdrawal({ affiliateId, valor, pixKey, pixKeyType }) {
    return await prisma.$transaction(async (tx) => {
      const affiliate = await tx.affiliate.findUnique({
        where: { id: affiliateId },
        include: { user: true }
      });
      
      if (!affiliate) {
        throw new Error('Afiliado não encontrado');
      }
      
      const withdrawValue = Number(valor);
      
      if (withdrawValue > affiliate.saldo_disponivel) {
        throw new Error('Saldo insuficiente para saque');
      }
      
      if (withdrawValue < 50.00) {
        throw new Error('Valor mínimo para saque é R$ 50,00');
      }
      
      // Criar solicitação de saque
      const withdrawal = await tx.affiliateWithdrawal.create({
        data: {
          affiliate_id: affiliateId,
          valor: withdrawValue,
          pix_key: pixKey,
          pix_key_type: pixKeyType,
          status: 'pendente'
        }
      });
      
      // Reservar valor (debitar do saldo disponível)
      await tx.affiliate.update({
        where: { id: affiliateId },
        data: {
          saldo_disponivel: { decrement: withdrawValue }
        }
      });
      
      // Registrar transação
      await tx.transaction.create({
        data: {
          user_id: affiliate.user_id,
          tipo: 'affiliate_withdrawal',
          valor: -withdrawValue,
          status: 'pendente',
          descricao: `Saque de afiliado - PIX: ${pixKey}`
        }
      });
      
      console.log(`✅ Saque de afiliado criado: R$ ${withdrawValue} para ${affiliate.user.email}`);
      return withdrawal;
    });
  }
  
  /**
   * Validar código de indicação
   */
  static async validateReferralCode(code) {
    if (!code) return null;
    
    const affiliate = await prisma.affiliate.findUnique({
      where: { codigo_indicacao: code.toUpperCase() },
      include: {
        user: {
          select: { id: true, nome: true, email: true }
        }
      }
    });
    
    return affiliate;
  }
  
  /**
   * Aplicar código de indicação no registro
   */
  static async applyReferralCode(userId, referralCode) {
    if (!referralCode) return;
    
    const affiliate = await this.validateReferralCode(referralCode);
    if (!affiliate) {
      console.log(`Código de indicação inválido: ${referralCode}`);
      return;
    }
    
    // Atualizar usuário com ID do afiliado
    await prisma.user.update({
      where: { id: userId },
      data: {
        affiliate_id: affiliate.user_id,
        codigo_indicacao_usado: referralCode.toUpperCase()
      }
    });
    
    console.log(`✅ Código de indicação aplicado: ${referralCode} para usuário ${userId}`);
  }
}

module.exports = AffiliateService;