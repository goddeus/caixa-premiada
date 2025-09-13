const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Serviço Centralizado de Fluxo de Caixa
 * Fonte única para cálculo de caixa líquido em toda a plataforma
 */
class CashFlowService {
  
  /**
   * Calcula o caixa líquido da plataforma
   * Fórmula: caixa_liquido = total_depositos - total_saques - total_comissoes_afiliados
   * EXCLUI transações de contas demo (tipo_conta = 'afiliado_demo')
   */
  async calcularCaixaLiquido() {
    try {
      // Buscar total de depósitos válidos (apenas contas normais)
      const totalDepositos = await prisma.transaction.aggregate({
        where: {
          tipo: 'deposito',
          status: 'concluido',
          user: {
            tipo_conta: 'normal' // Apenas contas normais
          }
        },
        _sum: {
          valor: true
        }
      });

      // Buscar total de saques processados (apenas contas normais)
      const totalSaques = await prisma.transaction.aggregate({
        where: {
          tipo: 'saque',
          status: 'concluido',
          user: {
            tipo_conta: 'normal' // Apenas contas normais
          }
        },
        _sum: {
          valor: true
        }
      });

      // Buscar total de comissões de afiliados pagas (apenas contas normais)
      const totalComissoesAfiliados = await prisma.transaction.aggregate({
        where: {
          tipo: 'comissao_afiliado',
          status: 'concluido',
          user: {
            tipo_conta: 'normal' // Apenas contas normais
          }
        },
        _sum: {
          valor: true
        }
      });

      // Buscar total de aberturas de caixas (apenas contas normais)
      const totalAberturasCaixas = await prisma.transaction.aggregate({
        where: {
          tipo: 'abertura_caixa',
          status: 'concluido',
          user: {
            tipo_conta: 'normal' // Apenas contas normais
          }
        },
        _sum: {
          valor: true
        }
      });

      // Buscar total de prêmios pagos (apenas contas normais)
      const totalPremiosPagos = await prisma.transaction.aggregate({
        where: {
          tipo: 'premio',
          status: 'concluido',
          user: {
            tipo_conta: 'normal' // Apenas contas normais
          }
        },
        _sum: {
          valor: true
        }
      });

      // Buscar fundos de teste adicionados pela administração
      const fundosTeste = await prisma.transaction.aggregate({
        where: {
          tipo: 'deposito_casa',
          status: 'concluido'
        },
        _sum: {
          valor: true
        }
      });

      const depositos = totalDepositos._sum.valor || 0;
      const saques = totalSaques._sum.valor || 0;
      const comissoesAfiliados = totalComissoesAfiliados._sum.valor || 0;
      const aberturasCaixas = Math.abs(totalAberturasCaixas._sum.valor) || 0; // Sempre positivo
      const premiosPagos = totalPremiosPagos._sum.valor || 0;
      const fundosTesteTotal = fundosTeste._sum.valor || 0;

      // Calcular caixa líquido
      // Fórmula: depósitos + fundos_teste - saques - comissões - prêmios_pagos
      const caixaLiquido = depositos + fundosTesteTotal - saques - comissoesAfiliados - premiosPagos;

      return {
        caixaLiquido: caixaLiquido,
        totalDepositos: depositos,
        totalSaques: saques,
        totalComissoesAfiliados: comissoesAfiliados,
        totalAberturasCaixas: aberturasCaixas,
        totalPremiosPagos: premiosPagos,
        fundosTeste: fundosTesteTotal,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Erro ao calcular caixa líquido:', error);
      throw new Error('Falha no cálculo do caixa líquido');
    }
  }

  /**
   * Obtém estatísticas detalhadas do fluxo de caixa
   */
  async getCashFlowStats() {
    try {
      const caixaData = await this.calcularCaixaLiquido();
      
      // Estatísticas dos últimos 7 dias
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const [
        deposits7d,
        withdrawals7d,
        affiliateCommissions7d,
        caseOpenings7d,
        prizesPaid7d
      ] = await Promise.all([
        prisma.transaction.aggregate({
          where: {
            tipo: 'deposito',
            status: 'concluido',
            criado_em: { gte: sevenDaysAgo },
            user: {
              tipo_conta: 'normal' // Apenas contas normais
            }
          },
          _sum: { valor: true },
          _count: { valor: true }
        }),
        prisma.transaction.aggregate({
          where: {
            tipo: 'saque',
            status: 'concluido',
            criado_em: { gte: sevenDaysAgo },
            user: {
              tipo_conta: 'normal' // Apenas contas normais
            }
          },
          _sum: { valor: true },
          _count: { valor: true }
        }),
        prisma.transaction.aggregate({
          where: {
            tipo: 'comissao_afiliado',
            status: 'concluido',
            criado_em: { gte: sevenDaysAgo },
            user: {
              tipo_conta: 'normal' // Apenas contas normais
            }
          },
          _sum: { valor: true },
          _count: { valor: true }
        }),
        prisma.transaction.aggregate({
          where: {
            tipo: 'abertura_caixa',
            status: 'concluido',
            criado_em: { gte: sevenDaysAgo },
            user: {
              tipo_conta: 'normal' // Apenas contas normais
            }
          },
          _sum: { valor: true },
          _count: { valor: true }
        }),
        prisma.transaction.aggregate({
          where: {
            tipo: 'premio',
            status: 'concluido',
            criado_em: { gte: sevenDaysAgo },
            user: {
              tipo_conta: 'normal' // Apenas contas normais
            }
          },
          _sum: { valor: true },
          _count: { valor: true }
        })
      ]);

      return {
        caixa_atual: {
          saldo_liquido: caixaData.caixaLiquido,
          total_depositos: caixaData.totalDepositos,
          total_saques: caixaData.totalSaques,
          total_comissoes_afiliados: caixaData.totalComissoesAfiliados,
          fundos_teste: caixaData.fundosTeste
        },
        ultimos_7_dias: {
          depositos: {
            valor: deposits7d._sum.valor || 0,
            quantidade: deposits7d._count.valor || 0
          },
          saques: {
            valor: withdrawals7d._sum.valor || 0,
            quantidade: withdrawals7d._count.valor || 0
          },
          comissoes_afiliados: {
            valor: affiliateCommissions7d._sum.valor || 0,
            quantidade: affiliateCommissions7d._count.valor || 0
          },
          aberturas_caixas: {
            valor: caseOpenings7d._sum.valor || 0,
            quantidade: caseOpenings7d._count.valor || 0
          },
          premios_pagos: {
            valor: prizesPaid7d._sum.valor || 0,
            quantidade: prizesPaid7d._count.valor || 0
          }
        },
        timestamp: caixaData.timestamp
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas do fluxo de caixa:', error);
      throw new Error('Falha ao obter estatísticas do fluxo de caixa');
    }
  }

  /**
   * Registra uma transação e atualiza o caixa em tempo real
   */
  async registrarTransacao(transactionData) {
    try {
      const result = await prisma.$transaction(async (tx) => {
        // Criar a transação
        const transaction = await tx.transaction.create({
          data: transactionData
        });

        // Atualizar saldo do usuário se necessário
        if (transactionData.tipo === 'deposito' && transactionData.status === 'concluido') {
          // Buscar tipo de conta do usuário
          const user = await tx.user.findUnique({
            where: { id: transactionData.user_id },
            select: { tipo_conta: true }
          });

          const isDemoAccount = user && user.tipo_conta === 'afiliado_demo';

          await tx.user.update({
            where: { id: transactionData.user_id },
            data: isDemoAccount ? {
              saldo_demo: {
                increment: transactionData.valor
              }
            } : {
              saldo_reais: {
                increment: transactionData.valor
              }
            }
          });

          // Atualizar carteira
          await tx.wallet.update({
            where: { user_id: transactionData.user_id },
            data: isDemoAccount ? {
              saldo_demo: {
                increment: transactionData.valor
              }
            } : {
              saldo_reais: {
                increment: transactionData.valor
              }
            }
          });
        }

        if (transactionData.tipo === 'saque' && transactionData.status === 'concluido') {
          // Buscar tipo de conta do usuário
          const user = await tx.user.findUnique({
            where: { id: transactionData.user_id },
            select: { tipo_conta: true }
          });

          const isDemoAccount = user && user.tipo_conta === 'afiliado_demo';

          await tx.user.update({
            where: { id: transactionData.user_id },
            data: isDemoAccount ? {
              saldo_demo: {
                decrement: transactionData.valor
              }
            } : {
              saldo_reais: {
                decrement: transactionData.valor
              }
            }
          });

          // Atualizar carteira
          await tx.wallet.update({
            where: { user_id: transactionData.user_id },
            data: isDemoAccount ? {
              saldo_demo: {
                decrement: transactionData.valor
              }
            } : {
              saldo_reais: {
                decrement: transactionData.valor
              }
            }
          });
        }

        if (transactionData.tipo === 'premio' && transactionData.status === 'concluido') {
          // Buscar tipo de conta do usuário
          const user = await tx.user.findUnique({
            where: { id: transactionData.user_id },
            select: { tipo_conta: true }
          });

          const isDemoAccount = user && user.tipo_conta === 'afiliado_demo';

          await tx.user.update({
            where: { id: transactionData.user_id },
            data: isDemoAccount ? {
              saldo_demo: {
                increment: transactionData.valor
              }
            } : {
              saldo_reais: {
                increment: transactionData.valor
              }
            }
          });

          // Atualizar carteira
          await tx.wallet.update({
            where: { user_id: transactionData.user_id },
            data: isDemoAccount ? {
              saldo_demo: {
                increment: transactionData.valor
              }
            } : {
              saldo_reais: {
                increment: transactionData.valor
              }
            }
          });
        }

        return transaction;
      });

      // Log da transação
      await this.logCashFlowChange({
        tipo: transactionData.tipo,
        valor: transactionData.valor,
        user_id: transactionData.user_id,
        descricao: transactionData.descricao,
        transaction_id: result.id
      });

      return result;
    } catch (error) {
      console.error('Erro ao registrar transação:', error);
      throw new Error('Falha ao registrar transação');
    }
  }

  /**
   * Log de alterações no fluxo de caixa
   */
  async logCashFlowChange(logData) {
    try {
      console.log('💰 Log de alteração no caixa:', logData.tipo);
      
      // Apenas calcular e logar, sem registrar nova transação
      console.log('🔍 Calculando caixa líquido...');
      const caixaAtual = await this.calcularCaixaLiquido();
      console.log('✅ Caixa líquido calculado:', caixaAtual.caixaLiquido);
      
      console.log('💰 Alteração no Caixa:', {
        timestamp: new Date(),
        tipo: logData.tipo,
        valor: logData.valor,
        caixa_atual: caixaAtual.caixaLiquido,
        user_id: logData.user_id,
        transaction_id: logData.transaction_id,
        descricao: logData.descricao
      });

      return true;
    } catch (error) {
      console.error('Erro ao logar alteração no caixa:', error);
      return false;
    }
  }

  /**
   * Obtém histórico de alterações no caixa
   */
  async getCashFlowHistory(limit = 50) {
    try {
      const history = await prisma.transaction.findMany({
        where: {
          tipo: {
            in: ['deposito', 'saque', 'comissao_afiliado', 'premio', 'deposito_casa', 'abertura_caixa']
          },
          status: 'concluido',
          user: {
            tipo_conta: 'normal' // Apenas contas normais
          }
        },
        orderBy: { criado_em: 'desc' },
        take: limit,
        select: {
          id: true,
          tipo: true,
          valor: true,
          descricao: true,
          criado_em: true,
          user: {
            select: {
              nome: true,
              tipo_conta: true
            }
          }
        }
      });

      return history;
    } catch (error) {
      console.error('Erro ao obter histórico do fluxo de caixa:', error);
      throw new Error('Falha ao obter histórico do fluxo de caixa');
    }
  }

  /**
   * Valida se uma transação pode ser processada sem comprometer o caixa
   */
  async validarTransacao(tipo, valor) {
    try {
      const caixaData = await this.calcularCaixaLiquido();
      
      // Para saques, verificar se há caixa suficiente
      if (tipo === 'saque' && valor > caixaData.caixaLiquido) {
        return {
          valida: false,
          motivo: `Caixa insuficiente. Disponível: R$ ${caixaData.caixaLiquido.toFixed(2)}, Solicitado: R$ ${valor.toFixed(2)}`
        };
      }

      // Para prêmios, verificar se há caixa suficiente
      if (tipo === 'premio' && valor > caixaData.caixaLiquido) {
        return {
          valida: false,
          motivo: `Caixa insuficiente para prêmio. Disponível: R$ ${caixaData.caixaLiquido.toFixed(2)}, Prêmio: R$ ${valor.toFixed(2)}`
        };
      }

      return {
        valida: true,
        caixa_disponivel: caixaData.caixaLiquido
      };
    } catch (error) {
      console.error('Erro ao validar transação:', error);
      return {
        valida: false,
        motivo: 'Erro interno na validação'
      };
    }
  }
}

module.exports = new CashFlowService();
