const prisma = require('../utils/prisma');
const { isValidAmount } = require('../utils/validation');

class WalletService {
  // Consultar saldo
  async getBalance(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        tipo_conta: true,
        saldo: true,
        saldo_reais: true,
        saldo_demo: true,
        nome: true,
        email: true,
        total_giros: true,
        rollover_liberado: true,
        rollover_minimo: true
      }
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Para contas demo, usar saldo_demo; para normais, usar saldo_reais
    // IMPORTANTE: Não mostrar diferença na interface - contas demo devem parecer normais
    const saldoPrincipal = user.tipo_conta === 'afiliado_demo' ? user.saldo_demo : user.saldo_reais;

    return {
      saldo: saldoPrincipal,
      // OCULTAR tipo_conta para não mostrar que é demo
      atualizado_em: new Date(),
      usuario: {
        nome: user.nome,
        email: user.email,
        total_giros: user.total_giros || 0,
        rollover_liberado: user.rollover_liberado || false,
        rollover_minimo: user.rollover_minimo || 20.0
      }
    };
  }

  // Simular depósito (futuro: integração com ASAAS)
  async deposit(userId, amount) {
    if (!isValidAmount(amount) || amount < 20) {
      throw new Error('Valor mínimo para depósito é R$ 20,00');
    }

    if (amount > 10000) {
      throw new Error('Valor máximo para depósito é R$ 10.000,00');
    }

    // Verificar se é o primeiro depósito do usuário e se tem afiliado
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        primeiro_deposito_feito: true,
        total_giros: true,
        rollover_liberado: true,
        rollover_minimo: true,
        affiliate_id: true,
        tipo_conta: true
      }
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Bloquear depósito para contas demo
    if (user.tipo_conta === 'afiliado_demo') {
      throw new Error('Depósitos não são permitidos em contas demo');
    }

    // Verificar se é o primeiro depósito e se tem afiliado
    const isFirstDeposit = !user.primeiro_deposito_feito;
    const hasAffiliate = user.affiliate_id;

    // Criar transação de depósito
    const transaction = await prisma.transaction.create({
      data: {
        user_id: userId,
        tipo: 'deposito',
        valor: amount,
        status: 'concluido',
        descricao: `Depósito de R$ ${amount.toFixed(2)}`
      }
    });

    // Atualizar saldo do usuário
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        saldo: {
          increment: amount
        },
        // Marcar que fez o primeiro depósito
        primeiro_deposito_feito: true
      },
      select: {
        id: true,
        nome: true,
        saldo: true,
        total_giros: true,
        rollover_liberado: true,
        rollover_minimo: true,
        primeiro_deposito_feito: true
      }
    });

    // Atualizar carteira
    await prisma.wallet.update({
      where: { user_id: userId },
      data: {
        saldo: updatedUser.saldo
      }
    });

    // Processar comissão de afiliado se for primeiro depósito >= R$20
    if (isFirstDeposit && hasAffiliate && amount >= 20) {
      try {
        await this.processAffiliateCommission(userId, amount);
      } catch (error) {
        console.error('Erro ao processar comissão de afiliado:', error);
        // Não falha o depósito por causa da comissão
      }
    }

    return {
      transaction,
      novo_saldo: updatedUser.saldo,
      message: `Depósito de R$ ${amount.toFixed(2)} realizado com sucesso`
    };
  }

  // Solicitar saque
  async withdraw(userId, amount, pixKey) {
    if (!isValidAmount(amount) || amount < 20) {
      throw new Error('Valor mínimo para saque é R$ 20,00');
    }

    if (amount > 5000) {
      throw new Error('Valor máximo para saque é R$ 5.000,00');
    }

    if (!pixKey || pixKey.trim().length === 0) {
      throw new Error('Chave PIX é obrigatória');
    }

    // Verificar tipo de conta e saldo
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        saldo: true, 
        total_giros: true, 
        rollover_liberado: true, 
        rollover_minimo: true,
        primeiro_deposito_feito: true,
        tipo_conta: true
      }
    });

    // Bloquear saque para contas demo (sem mencionar que é demo)
    if (user.tipo_conta === 'afiliado_demo') {
      throw new Error('Saque temporariamente indisponível. Tente novamente mais tarde.');
    }

    if (parseFloat(user.saldo_reais) < amount) {
      throw new Error('Saldo insuficiente para o saque');
    }

    // Verificar rollover APENAS se já fez o primeiro depósito
    if (user.primeiro_deposito_feito && !user.rollover_liberado) {
      const girosFaltantes = user.rollover_minimo - user.total_giros;
      throw new Error(`Você precisa apostar mais R$ ${girosFaltantes.toFixed(2)} para liberar saques. Total apostado: R$ ${user.total_giros.toFixed(2)}/${user.rollover_minimo.toFixed(2)}`);
    }

    // Criar transação de saque
    const transaction = await prisma.transaction.create({
      data: {
        user_id: userId,
        tipo: 'saque',
        valor: amount,
        status: 'pendente',
        descricao: `Saque de R$ ${amount.toFixed(2)} - PIX: ${pixKey}`
      }
    });

    // Deduzir saldo do usuário
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        saldo: {
          decrement: amount
        }
      },
      select: {
        id: true,
        nome: true,
        saldo: true
      }
    });

    // Atualizar carteira
    await prisma.wallet.update({
      where: { user_id: userId },
      data: {
        saldo: updatedUser.saldo
      }
    });

    return {
      transaction,
      novo_saldo: updatedUser.saldo,
      message: `Saque de R$ ${amount.toFixed(2)} solicitado. Processamento em até 24h.`
    };
  }

  // Atualizar saldo (usado internamente)
  async updateBalance(userId, amount, type = 'add') {
    const operation = type === 'add' ? 'increment' : 'decrement';
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        saldo: {
          [operation]: amount
        }
      },
      select: {
        id: true,
        saldo: true
      }
    });

    await prisma.wallet.update({
      where: { user_id: userId },
      data: {
        saldo: updatedUser.saldo
      }
    });

    return updatedUser.saldo;
  }

  // Verificar se tem saldo suficiente
  async hasEnoughBalance(userId, amount) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        saldo: true, 
        saldo_demo: true, 
        tipo_conta: true 
      }
    });

    if (!user) {
      return false;
    }

    // Para contas demo, verificar saldo_demo; para contas normais, verificar saldo_reais
    const saldoRelevante = user.tipo_conta === 'afiliado_demo' ? user.saldo_demo : user.saldo_reais;
    return parseFloat(saldoRelevante) >= amount;
  }

  // Recarregar saldo demo para afiliados
  async rechargeDemoBalance(userId, amount = 1000) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        tipo_conta: true,
        saldo_demo: true 
      }
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    if (user.tipo_conta !== 'afiliado_demo') {
      throw new Error('Apenas contas demo podem recarregar saldo demo');
    }

    // Atualizar saldo demo
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        saldo_demo: {
          increment: amount
        }
      },
      select: {
        saldo_demo: true
      }
    });

    // Registrar transação de recarga demo
    await prisma.transaction.create({
      data: {
        user_id: userId,
        tipo: 'recarga_demo',
        valor: amount,
        status: 'concluido',
        descricao: `Recarga de saldo demo: R$ ${amount.toFixed(2)}`
      }
    });

    return {
      novo_saldo_demo: updatedUser.saldo_demo,
      message: `Saldo demo recarregado com R$ ${amount.toFixed(2)}`
    };
  }

  // Processar comissão de afiliado
  async processAffiliateCommission(userId, depositAmount) {
    try {
      console.log(`💰 Processando comissão de afiliado para usuário ${userId}, depósito: R$ ${depositAmount}`);

      // Buscar dados do usuário e afiliado
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          affiliate_id: true,
          nome: true
        }
      });

      if (!user || !user.affiliate_id) {
        console.log('Usuário não tem afiliado vinculado');
        return;
      }

      // Buscar dados do afiliado
      const affiliate = await prisma.affiliate.findUnique({
        where: { id: user.affiliate_id },
        select: {
          user_id: true,
          codigo_indicacao: true
        }
      });

      if (!affiliate) {
        console.log('Afiliado não encontrado');
        return;
      }

      const commissionAmount = 10.00; // R$ 10 fixo

      // Processar comissão em transação
      await prisma.$transaction(async (tx) => {
        // 1. Creditar R$ 10 no saldo_reais do afiliado
        await tx.user.update({
          where: { id: affiliate.user_id },
          data: {
            saldo_reais: { increment: commissionAmount }
          }
        });

        // 2. Atualizar carteira do afiliado
        await tx.wallet.upsert({
          where: { user_id: affiliate.user_id },
          update: {
            saldo: { increment: commissionAmount }
          },
          create: {
            user_id: affiliate.user_id,
            saldo: commissionAmount
          }
        });

        // 3. Atualizar dados do afiliado
        await tx.affiliate.update({
          where: { id: user.affiliate_id },
          data: {
            ganhos: { increment: commissionAmount },
            saldo_disponivel: { increment: commissionAmount }
          }
        });

        // 4. Registrar comissão na tabela de comissões
        await tx.affiliateCommission.create({
          data: {
            affiliate_id: user.affiliate_id,
            referred_user_id: userId,
            valor: commissionAmount,
            status: 'pago'
          }
        });

        // 5. Registrar transação de comissão
        await tx.transaction.create({
          data: {
            user_id: affiliate.user_id,
            tipo: 'comissao_afiliado',
            valor: commissionAmount,
            status: 'concluido',
            descricao: `Comissão de afiliado: ${user.nome} fez primeiro depósito`
          }
        });
      });

      console.log(`✅ Comissão de R$ ${commissionAmount} creditada para afiliado ${affiliate.codigo_indicacao}`);

    } catch (error) {
      console.error('Erro ao processar comissão de afiliado:', error);
      throw error;
    }
  }
}

module.exports = new WalletService();
