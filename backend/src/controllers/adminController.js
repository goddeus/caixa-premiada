const prisma = require('../utils/prisma');
const bcrypt = require('bcryptjs');
const { createAdminLog } = require('../middleware/auth');
const prizeCalculationService = require('../services/prizeCalculationService');
const cashFlowService = require('../services/cashFlowService');
const prizeImageSyncService = require('../services/prizeImageSyncService');

class AdminController {
  // Dashboard - Métricas gerais
  async getDashboardStats(req, res) {
    try {
      // Usar serviço centralizado de fluxo de caixa
      const caixaData = await cashFlowService.calcularCaixaLiquido();
      const fundoData = await prizeCalculationService.calculateFundoPremios();

      const [
        totalUsers,
        activeUsers,
        totalWithdrawals,
        newUsersToday,
        newUsersThisWeek,
        recentTransactions,
        pendingWithdrawals,
        pendingAffiliateWithdrawals
      ] = await Promise.all([
        // Total de usuários
        prisma.user.count(),
        
        // Usuários ativos (com saldo > 0)
        prisma.user.count({
          where: {
            OR: [
              { saldo_reais: { gt: 0 } },
              { saldo_demo: { gt: 0 } }
            ]
          }
        }),
        
        // Total de saques confirmados
        prisma.payment.aggregate({
          where: { 
            tipo: 'saque',
            status: 'concluido'
          },
          _sum: { valor: true }
        }).catch(() => ({ _sum: { valor: 0 } })),
        
        // Novos usuários hoje
        prisma.user.count({
          where: {
            criado_em: {
              gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
          }
        }),
        
        // Novos usuários esta semana
        prisma.user.count({
          where: {
            criado_em: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          }
        }),
        
        // Transações recentes
        prisma.transaction.findMany({
          take: 10,
          orderBy: { criado_em: 'desc' },
          include: {
            user: {
              select: { nome: true, email: true }
            }
          }
        }).catch(() => []),
        
        // Saques pendentes
        prisma.payment.count({
          where: { 
            tipo: 'saque',
            status: 'pendente'
          }
        }).catch(() => 0),
        
        // Saques de afiliados pendentes
        prisma.affiliateWithdrawal.count({
          where: { status: 'pendente' }
        }).catch(() => 0)
      ]);

      const stats = {
        total_users: totalUsers,
        active_users: activeUsers,
        total_deposits: caixaData.totalDepositos,
        total_withdrawals: totalWithdrawals._sum?.valor || 0,
        total_affiliate_payments: caixaData.totalComissoes,
        new_users_today: newUsersToday,
        new_users_this_week: newUsersThisWeek,
        pending_withdrawals: pendingWithdrawals,
        pending_affiliate_withdrawals: pendingAffiliateWithdrawals,
        recent_transactions: recentTransactions,
        // CAIXA LÍQUIDO CALCULADO PELO SISTEMA DE PRÊMIOS
        house_edge: caixaData.caixaLiquido,
        caixa_liquido: caixaData.caixaLiquido, // Campo unificado
        // Dados do sistema de prêmios
        prize_system: {
          rtp: fundoData.rtp,
          fundo_premios_total: fundoData.fundoPremiosTotal,
          premios_pagos: fundoData.premiosPagos,
          fundo_restante: fundoData.fundoRestante,
          utilizacao_percentual: fundoData.fundoPremiosTotal > 0 
            ? ((fundoData.premiosPagos / fundoData.fundoPremiosTotal) * 100).toFixed(2) + '%'
            : '0%'
        }
      };

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas do dashboard:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Listar todos os usuários com filtros
  async getUsers(req, res) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        search = '', 
        status = 'all',
        min_balance = null,
        max_balance = null,
        sort_by = 'criado_em',
        sort_order = 'desc'
      } = req.query;

      console.log('🔍 Admin getUsers - Parâmetros:', {
        page, limit, search, status, min_balance, max_balance, sort_by, sort_order
      });

      const skip = (page - 1) * limit;
      
      // Construir filtros
      const where = {};
      
      if (search) {
        where.OR = [
          { nome: { contains: search } },
          { email: { contains: search } },
          { cpf: { contains: search } }
        ];
      }
      
      if (status !== 'all') {
        if (status === 'active') {
          where.ativo = true;
        } else if (status === 'banned') {
          where.ativo = false;
        } else if (status === 'with_balance') {
          where.saldo_reais = { gt: 0 };
        } else if (status === 'without_balance') {
          where.saldo_reais = { lte: 0 };
        }
      }
      
      if (min_balance !== null && min_balance !== '') {
        where.saldo_reais = { ...where.saldo_reais, gte: parseFloat(min_balance) };
      }
      
      if (max_balance !== null && max_balance !== '') {
        where.saldo_reais = { ...where.saldo_reais, lte: parseFloat(max_balance) };
      }

      console.log('🔍 Admin getUsers - Filtros aplicados:', where);

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: parseInt(limit),
          orderBy: { [sort_by]: sort_order },
          select: {
            id: true,
            nome: true,
            email: true,
            cpf: true,
            saldo_reais: true,
            saldo_demo: true,
            tipo_conta: true,
            ativo: true,
            banido_em: true,
            motivo_ban: true,
            ultimo_login: true,
            criado_em: true,
            is_admin: true,
            affiliate: {
              select: {
                codigo_indicacao: true,
                ganhos: true,
                saldo_disponivel: true
              }
            }
          }
        }),
        prisma.user.count({ where })
      ]);

      console.log(`📊 Admin getUsers - Total: ${total}, Encontrados: ${users.length}`);

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Editar usuário
  async updateUser(req, res) {
    try {
      const { userId } = req.params;
      const { nome, email, saldo_reais, ativo, motivo_ban } = req.body;

      // Buscar usuário atual
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          nome: true,
          email: true,
          saldo_reais: true,
          saldo_demo: true,
          tipo_conta: true,
          ativo: true,
          motivo_ban: true
        }
      });

      if (!currentUser) {
        return res.status(404).json({
          success: false,
          error: 'Usuário não encontrado'
        });
      }

      // Preparar dados para atualização
      const updateData = {};
      
      if (nome !== undefined) updateData.nome = nome;
      if (email !== undefined) updateData.email = email;
      if (saldo_reais !== undefined) {
        const newSaldo = parseFloat(saldo_reais);
        
        // Determinar qual campo atualizar baseado no tipo de conta
        if (currentUser.tipo_conta === 'afiliado_demo') {
          const oldSaldo = parseFloat(currentUser.saldo_demo);
          const saldoDifference = newSaldo - oldSaldo;
          
          updateData.saldo_demo = newSaldo;
          
          // Para contas demo, não aplicar rollover
          console.log(`[DEBUG] Admin atualizando saldo_demo: ${oldSaldo} → ${newSaldo} (diff: ${saldoDifference})`);
        } else {
          const oldSaldo = parseFloat(currentUser.saldo_reais);
          const saldoDifference = newSaldo - oldSaldo;
          
          updateData.saldo_reais = newSaldo;
          
          // Se o admin está adicionando saldo, considerar como "giro" para rollover
          if (saldoDifference > 0) {
            updateData.total_giros = {
              increment: saldoDifference
            };
            
            // Verificar se atingiu o rollover mínimo
            const userWithGiros = await prisma.user.findUnique({
              where: { id: userId },
              select: { total_giros: true, rollover_minimo: true, rollover_liberado: true }
            });
            
            const newTotalGiros = (userWithGiros.total_giros || 0) + saldoDifference;
            if (!userWithGiros.rollover_liberado && newTotalGiros >= userWithGiros.rollover_minimo) {
              updateData.rollover_liberado = true;
            }
          }
          
          console.log(`[DEBUG] Admin atualizando saldo_reais: ${oldSaldo} → ${newSaldo} (diff: ${saldoDifference})`);
        }
      }
      if (ativo !== undefined) {
        updateData.ativo = ativo;
        if (!ativo) {
          updateData.banido_em = new Date();
          updateData.motivo_ban = motivo_ban || 'Banido por administrador';
        } else {
          updateData.banido_em = null;
          updateData.motivo_ban = null;
        }
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          nome: true,
          email: true,
          saldo_reais: true,
          saldo_demo: true,
          tipo_conta: true,
          ativo: true,
          banido_em: true,
          motivo_ban: true,
          criado_em: true,
          ultimo_login: true
        }
      });

      // Sincronizar com a tabela Wallet
      await prisma.wallet.update({
        where: { user_id: userId },
        data: {
          saldo_reais: updatedUser.saldo_reais,
          saldo_demo: updatedUser.saldo_demo
        }
      });

      // Criar log da ação
      await createAdminLog(
        req.user.id,
        'EDITAR_USUARIO',
        `Usuário ${currentUser.nome} (${currentUser.email}) foi editado`,
        currentUser,
        updatedUser,
        userId,
        req
      );

      res.json({
        success: true,
        message: 'Usuário atualizado com sucesso',
        data: updatedUser
      });
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Resetar senha do usuário
  async resetUserPassword(req, res) {
    try {
      const { userId } = req.params;
      const { nova_senha } = req.body;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, nome: true, email: true }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'Usuário não encontrado'
        });
      }

      const senha_hash = await bcrypt.hash(nova_senha, 10);

      await prisma.user.update({
        where: { id: userId },
        data: { senha_hash }
      });

      // Criar log da ação
      await createAdminLog(
        req.user.id,
        'RESETAR_SENHA',
        `Senha resetada para usuário ${user.nome} (${user.email})`,
        null,
        { usuario_id: userId },
        userId,
        req
      );

      res.json({
        success: true,
        message: 'Senha resetada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao resetar senha:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Listar depósitos
  async getDeposits(req, res) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        status = 'all',
        start_date,
        end_date,
        min_value,
        max_value
      } = req.query;

      const skip = (page - 1) * limit;
      
      const where = {};
      
      if (status !== 'all') {
        where.status = status;
      }
      
      if (start_date) {
        where.created_at = { ...where.created_at, gte: new Date(start_date) };
      }
      
      if (end_date) {
        where.created_at = { ...where.created_at, lte: new Date(end_date) };
      }
      
      if (min_value) {
        where.amount = { ...where.amount, gte: parseFloat(min_value) };
      }
      
      if (max_value) {
        where.amount = { ...where.amount, lte: parseFloat(max_value) };
      }

      const [deposits, total] = await Promise.all([
        prisma.deposit.findMany({
          where,
          skip,
          take: parseInt(limit),
          orderBy: { created_at: 'desc' },
          include: {
            user: {
              select: { id: true, nome: true, email: true }
            }
          }
        }),
        prisma.deposit.count({ where })
      ]);

      res.json({
        success: true,
        data: {
          deposits,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Erro ao buscar depósitos:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Listar saques
  async getWithdrawals(req, res) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        status = 'all',
        start_date,
        end_date,
        min_value,
        max_value
      } = req.query;

      const skip = (page - 1) * limit;
      
      const where = {};
      
      if (status !== 'all') {
        where.status = status;
      }
      
      if (start_date) {
        where.created_at = { ...where.created_at, gte: new Date(start_date) };
      }
      
      if (end_date) {
        where.created_at = { ...where.created_at, lte: new Date(end_date) };
      }
      
      if (min_value) {
        where.amount = { ...where.amount, gte: parseFloat(min_value) };
      }
      
      if (max_value) {
        where.amount = { ...where.amount, lte: parseFloat(max_value) };
      }

      const [withdrawals, total] = await Promise.all([
        prisma.withdrawal.findMany({
          where,
          skip,
          take: parseInt(limit),
          orderBy: { created_at: 'desc' },
          include: {
            user: {
              select: { id: true, nome: true, email: true }
            }
          }
        }),
        prisma.withdrawal.count({ where })
      ]);

      res.json({
        success: true,
        data: {
          withdrawals,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Erro ao buscar saques:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Aprovar/Recusar saque
  async updateWithdrawalStatus(req, res) {
    try {
      const { withdrawalId } = req.params;
      const { status, motivo } = req.body;

      const withdrawal = await prisma.withdrawal.findUnique({
        where: { id: withdrawalId },
        include: {
          user: {
            select: { id: true, nome: true, email: true, saldo_reais: true, saldo_demo: true, tipo_conta: true }
          }
        }
      });

      if (!withdrawal) {
        return res.status(404).json({
          success: false,
          error: 'Saque não encontrado'
        });
      }

      // Se está aprovando o saque
      if (status === 'approved') {
        // Verificar se o usuário tem saldo suficiente
        const saldoAtual = withdrawal.user.tipo_conta === 'afiliado_demo' 
          ? withdrawal.user.saldo_demo 
          : withdrawal.user.saldo_reais;
          
        if (saldoAtual < withdrawal.amount) {
          return res.status(400).json({
            success: false,
            error: 'Usuário não possui saldo suficiente'
          });
        }

        // Atualizar status e processar saque
        await prisma.$transaction(async (tx) => {
          // Atualizar status do saque
          await tx.withdrawal.update({
            where: { id: withdrawalId },
            data: { 
              status: 'approved',
              processado_em: new Date()
            }
          });

          // Debitar saldo do usuário baseado no tipo de conta
          if (withdrawal.user.tipo_conta === 'afiliado_demo') {
            await tx.user.update({
              where: { id: withdrawal.user.id },
              data: {
                saldo_demo: {
                  decrement: withdrawal.amount
                }
              }
            });
          } else {
            await tx.user.update({
              where: { id: withdrawal.user.id },
              data: {
                saldo_reais: {
                  decrement: withdrawal.amount
                }
              }
            });
          }

          // Criar transação de débito
          await tx.transaction.create({
            data: {
              user_id: withdrawal.user.id,
              tipo: 'saque',
              valor: withdrawal.amount,
              status: 'processado',
              descricao: `Saque aprovado - ${motivo || 'Aprovado por administrador'}`
            }
          });
        });

        // Criar log da ação
        await createAdminLog(
          req.user.id,
          'APROVAR_SAQUE',
          `Saque de R$ ${withdrawal.amount} aprovado para ${withdrawal.user.nome}`,
          { status: withdrawal.status },
          { status: 'approved', valor: withdrawal.amount },
          withdrawal.user.id,
          req
        );

      } else if (status === 'failed') {
        // Apenas atualizar status para failed
        await prisma.withdrawal.update({
          where: { id: withdrawalId },
          data: { 
            status: 'failed',
            processado_em: new Date()
          }
        });

        // Criar log da ação
        await createAdminLog(
          req.user.id,
          'CANCELAR_SAQUE',
          `Saque de R$ ${withdrawal.valor} cancelado para ${withdrawal.user.nome} - Motivo: ${motivo}`,
          { status: withdrawal.status },
          { status: 'cancelado', motivo },
          withdrawal.user.id,
          req
        );
      }

      res.json({
        success: true,
        message: `Saque ${status === 'concluido' ? 'aprovado' : 'cancelado'} com sucesso`
      });
    } catch (error) {
      console.error('Erro ao atualizar status do saque:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Listar afiliados
  async getAffiliates(req, res) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        search = '',
        sort_by = 'ganhos',
        sort_order = 'desc'
      } = req.query;

      const skip = (page - 1) * limit;
      
      const where = {};
      
      if (search) {
        where.OR = [
          { user: { nome: { contains: search } } },
          { user: { email: { contains: search } } },
          { codigo_indicacao: { contains: search } }
        ];
      }

      const [affiliates, total] = await Promise.all([
        prisma.affiliate.findMany({
          where,
          skip,
          take: parseInt(limit),
          orderBy: { [sort_by]: sort_order },
          include: {
            user: {
              select: { id: true, nome: true, email: true, criado_em: true }
            }
          }
        }),
        prisma.affiliate.count({ where })
      ]);

      res.json({
        success: true,
        data: {
          affiliates,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Erro ao buscar afiliados:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Aprovar/Recusar saque de afiliado
  async updateAffiliateWithdrawalStatus(req, res) {
    try {
      const { withdrawalId } = req.params;
      const { status, motivo } = req.body;

      const withdrawal = await prisma.affiliateWithdrawal.findUnique({
        where: { id: withdrawalId },
        include: {
          affiliate: {
            include: {
              user: {
                select: { id: true, nome: true, email: true }
              }
            }
          }
        }
      });

      if (!withdrawal) {
        return res.status(404).json({
          success: false,
          error: 'Saque de afiliado não encontrado'
        });
      }

      await prisma.affiliateWithdrawal.update({
        where: { id: withdrawalId },
        data: { 
          status: status === 'processado' ? 'processado' : 'cancelado',
          processado_em: new Date()
        }
      });

      // Criar log da ação
      await createAdminLog(
        req.user.id,
        status === 'processado' ? 'APROVAR_SAQUE_AFILIADO' : 'CANCELAR_SAQUE_AFILIADO',
        `Saque de afiliado de R$ ${withdrawal.valor} ${status === 'processado' ? 'aprovado' : 'cancelado'} para ${withdrawal.affiliate.user.nome}`,
        { status: withdrawal.status },
        { status: status === 'processado' ? 'processado' : 'cancelado', motivo },
        withdrawal.affiliate.user.id,
        req
      );

      res.json({
        success: true,
        message: `Saque de afiliado ${status === 'processado' ? 'aprovado' : 'cancelado'} com sucesso`
      });
    } catch (error) {
      console.error('Erro ao atualizar status do saque de afiliado:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Listar logs administrativos
  async getAdminLogs(req, res) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        acao = '',
        start_date,
        end_date
      } = req.query;

      const skip = (page - 1) * limit;
      
      const where = {};
      
      if (acao) {
        where.acao = { contains: acao };
      }
      
      if (start_date) {
        where.criado_em = { ...where.criado_em, gte: new Date(start_date) };
      }
      
      if (end_date) {
        where.criado_em = { ...where.criado_em, lte: new Date(end_date) };
      }

      const [logs, total] = await Promise.all([
        prisma.adminLog.findMany({
          where,
          skip,
          take: parseInt(limit),
          orderBy: { criado_em: 'desc' }
        }),
        prisma.adminLog.count({ where })
      ]);

      res.json({
        success: true,
        data: {
          logs,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Erro ao buscar logs administrativos:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Listar histórico de login
  async getLoginHistory(req, res) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        user_id = '',
        sucesso = '',
        start_date,
        end_date
      } = req.query;

      const skip = (page - 1) * limit;
      
      const where = {};
      
      if (user_id) {
        where.user_id = user_id;
      }
      
      if (sucesso !== '') {
        where.sucesso = sucesso === 'true';
      }
      
      if (start_date) {
        where.criado_em = { ...where.criado_em, gte: new Date(start_date) };
      }
      
      if (end_date) {
        where.criado_em = { ...where.criado_em, lte: new Date(end_date) };
      }

      const [loginHistory, total] = await Promise.all([
        prisma.loginHistory.findMany({
          where,
          skip,
          take: parseInt(limit),
          orderBy: { criado_em: 'desc' },
          include: {
            user: {
              select: { id: true, nome: true, email: true }
            }
          }
        }),
        prisma.loginHistory.count({ where })
      ]);

      res.json({
        success: true,
        data: {
          loginHistory,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Erro ao buscar histórico de login:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Adicionar fundos de teste para a casa
  async addTestFunds(req, res) {
    try {
      const { amount } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Valor inválido'
        });
      }

      // Criar uma transação de depósito fictício para a casa
      await prisma.transaction.create({
        data: {
          user_id: req.user.id, // Admin que está adicionando os fundos
          tipo: 'deposito_casa',
          valor: parseFloat(amount),
          status: 'concluido',
          descricao: `Fundos de teste adicionados pela administração - R$ ${amount}`
        }
      });

      // Adicionar saldo ao usuário de teste e contar para rollover
      const testUser = await prisma.user.findFirst({
        where: { 
          is_admin: false,
          email: 'user@test.com'
        }
      });

      if (testUser) {
        await prisma.user.update({
          where: { id: testUser.id },
          data: {
            saldo_reais: {
              increment: parseFloat(amount)
            },
            total_giros: {
              increment: parseFloat(amount)
            }
          }
        });

        // Verificar se atingiu o rollover
        const updatedUser = await prisma.user.findUnique({
          where: { id: testUser.id },
          select: { total_giros: true, rollover_minimo: true, rollover_liberado: true }
        });

        if (!updatedUser.rollover_liberado && updatedUser.total_giros >= updatedUser.rollover_minimo) {
          await prisma.user.update({
            where: { id: testUser.id },
            data: {
              rollover_liberado: true
            }
          });
        }

        // Atualizar carteira do usuário
        await prisma.wallet.update({
          where: { user_id: testUser.id },
          data: {
            saldo_reais: {
              increment: parseFloat(amount)
            }
          }
        });
      }

      // Criar log da ação
      await createAdminLog(
        req.user.id,
        'ADICIONAR_FUNDOS_TESTE',
        `Fundos de teste de R$ ${amount} adicionados à casa`,
        null,
        { valor: amount },
        null,
        req
      );

      res.json({
        success: true,
        message: `Fundos de teste de R$ ${amount} adicionados com sucesso`
      });
    } catch (error) {
      console.error('Erro ao adicionar fundos de teste:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Limpar dados do controle da casa para novos testes
  async clearHouseData(req, res) {
    try {
      console.log('🧹 Iniciando limpeza dos dados do controle da casa...');

      // Limpar TODAS as transações (exceto as essenciais do admin)
      const deletedTransactions = await prisma.transaction.deleteMany({
        where: {
          OR: [
            { tipo: 'deposito_casa' },
            { tipo: 'teste' },
            { tipo: 'abertura_caixa' },
            { tipo: 'premio' },
            { tipo: 'afiliado' },
            { descricao: { contains: 'teste' } },
            { descricao: { contains: 'Teste' } }
          ]
        }
      });

      // Limpar pagamentos de teste (baseado no tipo)
      const deletedPayments = await prisma.payment.deleteMany({
        where: {
          tipo: 'deposito_casa'
        }
      });

      // Resetar saldos dos usuários para valores de teste baixos
      const updatedUsers = await prisma.user.updateMany({
        where: {
          is_admin: false, // Não resetar admin
          OR: [
            { saldo_reais: { gt: 0 } },
            { saldo_demo: { gt: 0 } }
          ]
        },
        data: {
          saldo_reais: 10.00, // Saldo inicial para testes
          saldo_demo: 10.00
        }
      });

      // Atualizar carteiras correspondentes
      const updatedWallets = await prisma.wallet.updateMany({
        where: {
          user: {
            is_admin: false
          },
          OR: [
            { saldo_reais: { gt: 0 } },
            { saldo_demo: { gt: 0 } }
          ]
        },
        data: {
          saldo_reais: 10.00,
          saldo_demo: 10.00
        }
      });

      // Criar log da ação
      await createAdminLog(
        req.user.id,
        'LIMPAR_DADOS_CASA',
        `Dados do controle da casa limpos - Transações: ${deletedTransactions.count}, Pagamentos: ${deletedPayments.count}, Usuários: ${updatedUsers.count}`,
        null,
        { 
          transacoes_removidas: deletedTransactions.count,
          pagamentos_removidos: deletedPayments.count,
          usuarios_atualizados: updatedUsers.count,
          carteiras_atualizadas: updatedWallets.count
        },
        null,
        req
      );

      console.log('✅ Limpeza concluída:', {
        transacoes: deletedTransactions.count,
        pagamentos: deletedPayments.count,
        usuarios: updatedUsers.count,
        carteiras: updatedWallets.count
      });

      res.json({
        success: true,
        message: 'Dados do controle da casa limpos com sucesso!',
        data: {
          transacoes_removidas: deletedTransactions.count,
          pagamentos_removidos: deletedPayments.count,
          usuarios_atualizados: updatedUsers.count,
          carteiras_atualizadas: updatedWallets.count
        }
      });
    } catch (error) {
      console.error('Erro ao limpar dados da casa:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Configurações do Sistema
  async getSettings(req, res) {
    try {
      // Configurações padrão do sistema
      const settings = [
        { 
          chave: 'comissao_afiliado', 
          valor: 'R$10,00', 
          descricao: 'Percentual de comissão para afiliados em R$',
          tipo: 'valor'
        },
        { 
          chave: 'deposito_minimo', 
          valor: '20.00', 
          descricao: 'Valor mínimo para depósito (R$)',
          tipo: 'valor'
        },
        { 
          chave: 'saque_minimo', 
          valor: '20.00', 
          descricao: 'Valor mínimo para saque (R$)',
          tipo: 'valor'
        },
        { 
          chave: 'taxa_saque', 
          valor: '2.50', 
          descricao: 'Taxa por saque (R$)',
          tipo: 'valor'
        },
        { 
          chave: 'manutencao', 
          valor: 'false', 
          descricao: 'Modo de manutenção',
          tipo: 'boolean'
        }
      ];

      res.json({
        success: true,
        settings
      });
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  async updateSetting(req, res) {
    try {
      const { key } = req.params;
      const { valor, descricao } = req.body;

      // Validar se a configuração existe
      const validKeys = ['comissao_afiliado', 'deposito_minimo', 'saque_minimo', 'taxa_saque', 'manutencao'];
      if (!validKeys.includes(key)) {
        return res.status(400).json({
          success: false,
          error: 'Configuração inválida'
        });
      }

      // Validar valor baseado no tipo
      if (key === 'manutencao') {
        if (!['true', 'false'].includes(valor)) {
          return res.status(400).json({
            success: false,
            error: 'Valor deve ser true ou false para modo de manutenção'
          });
        }
      } else {
        const numValue = parseFloat(valor);
        if (isNaN(numValue) || numValue < 0) {
          return res.status(400).json({
            success: false,
            error: 'Valor deve ser um número positivo'
          });
        }
      }

      // Aqui você pode salvar no banco de dados se necessário
      // Por enquanto, apenas retornamos sucesso
      console.log(`Configuração ${key} atualizada para: ${valor}`);

      res.json({
        success: true,
        message: 'Configuração atualizada com sucesso',
        setting: {
          chave: key,
          valor: valor,
          descricao: descricao
        }
      });
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Adicionar saldo de teste com rollover
  async addTestBalance(req, res) {
    try {
      const { userId } = req.params;
      const { amount } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Valor inválido'
        });
      }

      // Buscar usuário
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { 
          id: true, 
          nome: true, 
          email: true, 
          saldo_reais: true, 
          total_giros: true, 
          rollover_liberado: true, 
          rollover_minimo: true 
        }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'Usuário não encontrado'
        });
      }

      // Adicionar saldo e contar para rollover
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          saldo_reais: {
            increment: parseFloat(amount)
          },
          total_giros: {
            increment: parseFloat(amount)
          }
        },
        select: {
          saldo_reais: true,
          total_giros: true,
          rollover_liberado: true,
          rollover_minimo: true
        }
      });

      // Verificar se atingiu o rollover
      if (!updatedUser.rollover_liberado && updatedUser.total_giros >= updatedUser.rollover_minimo) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            rollover_liberado: true
          }
        });
        updatedUser.rollover_liberado = true;
      }

      // Atualizar carteira
      await prisma.wallet.update({
        where: { user_id: userId },
        data: {
          saldo_reais: updatedUser.saldo_reais
        }
      });

      // Criar transação
      await prisma.transaction.create({
        data: {
          user_id: userId,
          tipo: 'deposito',
          valor: parseFloat(amount),
          status: 'concluido',
          descricao: `Saldo de teste adicionado pela administração - R$ ${amount}`
        }
      });

      // Criar log da ação
      await createAdminLog(
        req.user.id,
        'ADICIONAR_SALDO_TESTE',
        `Saldo de teste de R$ ${amount} adicionado ao usuário ${user.nome}`,
        userId,
        { 
          valor: amount,
          novo_saldo: updatedUser.saldo_reais,
          total_giros: updatedUser.total_giros,
          rollover_liberado: updatedUser.rollover_liberado
        },
        null,
        req
      );

      res.json({
        success: true,
        message: `Saldo de R$ ${amount} adicionado com sucesso`,
        data: {
          novo_saldo: updatedUser.saldo_reais,
          total_giros: updatedUser.total_giros,
          rollover_liberado: updatedUser.rollover_liberado,
          rollover_minimo: updatedUser.rollover_minimo
        }
      });
    } catch (error) {
      console.error('Erro ao adicionar saldo de teste:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Obter logs de auditoria de prêmios bloqueados
  async getAuditLogs(req, res) {
    try {
      const { limit = 50, offset = 0 } = req.query;
      
      const auditLogs = await prisma.transaction.findMany({
        where: {
          tipo: 'auditoria_premio_bloqueado'
        },
        orderBy: {
          criado_em: 'desc'
        },
        take: parseInt(limit),
        skip: parseInt(offset)
      });

      const totalLogs = await prisma.transaction.count({
        where: {
          tipo: 'auditoria_premio_bloqueado'
        }
      });

      res.json({
        success: true,
        logs: auditLogs,
        total: totalLogs,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

    } catch (error) {
      console.error('Erro ao obter logs de auditoria:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Erro interno do servidor' 
      });
    }
  }

  // Obter estatísticas de proteção RTP
  async getRTPProtectionStats(req, res) {
    try {
      const caixaData = await cashFlowService.calcularCaixaLiquido();
      const rtpConfig = await prizeCalculationService.getCurrentRTP();
      
      const limiteMaxPremio = caixaData.caixaLiquido * (rtpConfig / 100);
      
      // Contar prêmios bloqueados nas últimas 24h
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const premiosBloqueados24h = await prisma.transaction.count({
        where: {
          tipo: 'auditoria_premio_bloqueado',
          criado_em: {
            gte: yesterday
          }
        }
      });

      // Contar total de prêmios bloqueados
      const totalPremiosBloqueados = await prisma.transaction.count({
        where: {
          tipo: 'auditoria_premio_bloqueado'
        }
      });

      res.json({
        success: true,
        stats: {
          caixaLiquido: caixaData.caixaLiquido,
          rtpConfig: rtpConfig,
          limiteMaxPremio: limiteMaxPremio,
          premiosBloqueados24h: premiosBloqueados24h,
          totalPremiosBloqueados: totalPremiosBloqueados,
          timestamp: new Date()
        }
      });

    } catch (error) {
      console.error('Erro ao obter estatísticas de proteção RTP:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Erro interno do servidor' 
      });
    }
  }

  // Sincronizar prêmios e imagens
  async syncPrizesAndImages(req, res) {
    try {
      console.log('[ADMIN] Iniciando sincronização de prêmios e imagens...');
      
      // Executar sincronização
      const report = await prizeImageSyncService.syncAll();
      
      // Log da ação administrativa
      await createAdminLog(req.user.id, 'sync_prizes_images', {
        casesProcessed: report.casesProcessed,
        prizesProcessed: report.prizesProcessed,
        inconsistencies: report.inconsistencies.length,
        actions: report.actions.length
      });
      
      res.json({
        success: true,
        message: 'Sincronização concluída com sucesso',
        report: {
          timestamp: report.timestamp,
          casesProcessed: report.casesProcessed,
          prizesProcessed: report.prizesProcessed,
          imagesFound: report.imagesFound,
          imagesMissing: report.imagesMissing,
          prizesWithoutImages: report.prizesWithoutImages,
          inconsistencies: report.inconsistencies.length,
          actions: report.actions.length,
          summary: {
            totalIssues: report.inconsistencies.length,
            criticalIssues: report.inconsistencies.filter(inc => 
              inc.type === 'negative_value' || 
              inc.type === 'case_sync_error' ||
              inc.type === 'prize_sync_error'
            ).length
          }
        }
      });

    } catch (error) {
      console.error('[ADMIN] Erro ao sincronizar prêmios e imagens:', error);
      
      // Log do erro
      await createAdminLog(req.user.id, 'sync_prizes_images_error', {
        error: error.message
      });
      
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }

  // Obter relatório de consistência de prêmios
  async getPrizeConsistencyReport(req, res) {
    try {
      // Buscar prêmios sem imagens
      const prizesWithoutImages = await prisma.prize.findMany({
        where: {
          ativo: true,
          imagem: null
        },
        include: { case: true },
        take: 50
      });

      // Buscar prêmios com valores inconsistentes
      const inconsistentPrizes = await prisma.prize.findMany({
        where: {
          ativo: true,
          OR: [
            { valor: { lt: 0 } },
            { valor: { gt: 10000 } }
          ]
        },
        include: { case: true },
        take: 50
      });

      // Estatísticas gerais
      const stats = await Promise.all([
        prisma.case.count({ where: { ativo: true } }),
        prisma.prize.count({ where: { ativo: true } }),
        prisma.prize.count({ where: { ativo: true, imagem: null } }),
        prisma.prize.count({ where: { ativo: true, valor: { lt: 0 } } })
      ]);

      res.json({
        success: true,
        report: {
          timestamp: new Date().toISOString(),
          stats: {
            totalCases: stats[0],
            totalPrizes: stats[1],
            prizesWithoutImages: stats[2],
            prizesWithNegativeValue: stats[3]
          },
          issues: {
            prizesWithoutImages: prizesWithoutImages.map(p => ({
              id: p.id,
              nome: p.nome,
              case: p.case.nome,
              valor: p.valor
            })),
            inconsistentPrizes: inconsistentPrizes.map(p => ({
              id: p.id,
              nome: p.nome,
              case: p.case.nome,
              valor: p.valor,
              issue: p.valor < 0 ? 'negative_value' : 'high_value'
            }))
          }
        }
      });

    } catch (error) {
      console.error('[ADMIN] Erro ao obter relatório de consistência:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Executar seed de auditoria
  async runAuditSeed(req, res) {
    try {
      console.log('[ADMIN] Executando seed de auditoria...');
      
      const { seedAuditAccounts } = require('../../prisma/seed-audit');
      await seedAuditAccounts();
      
      // Log da ação administrativa
      await createAdminLog(req.user.id, 'run_audit_seed', {
        message: 'Seed de auditoria executado com sucesso'
      });
      
      res.json({
        success: true,
        message: 'Seed de auditoria executado com sucesso'
      });

    } catch (error) {
      console.error('[ADMIN] Erro ao executar seed de auditoria:', error);
      
      // Log do erro
      await createAdminLog(req.user.id, 'run_audit_seed_error', {
        error: error.message
      });
      
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }

  // Obter status das migrações
  async getMigrationStatus(req, res) {
    try {
      const { execSync } = require('child_process');
      const path = require('path');
      
      // Executar prisma migrate status
      const output = execSync('npx prisma migrate status', { 
        cwd: path.join(__dirname, '../../'),
        encoding: 'utf8'
      });
      
      // Parsear output
      const lines = output.split('\n');
      const migrations = [];
      let pendingCount = 0;
      
      for (const line of lines) {
        if (line.includes('Pending') || line.includes('pending')) {
          pendingCount++;
          const migrationName = line.split(' ')[0];
          if (migrationName && migrationName !== '') {
            migrations.push({
              name: migrationName,
              status: 'pending'
            });
          }
        } else if (line.includes('Applied') || line.includes('applied')) {
          const migrationName = line.split(' ')[0];
          if (migrationName && migrationName !== '') {
            migrations.push({
              name: migrationName,
              status: 'applied'
            });
          }
        }
      }
      
      res.json({
        success: true,
        status: {
          pendingCount,
          totalMigrations: migrations.length,
          migrations: migrations.slice(-10) // Últimas 10 migrações
        }
      });

    } catch (error) {
      console.error('[ADMIN] Erro ao obter status das migrações:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }
}

module.exports = AdminController;
