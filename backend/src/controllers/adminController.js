const prisma = require('../utils/prisma');
const bcrypt = require('bcryptjs');
const { createAdminLog } = require('../middleware/auth');
const prizeCalculationService = require('../services/prizeCalculationService');
const cashFlowService = require('../services/cashFlowService');

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
          where: { saldo_reais: { gt: 0 } }
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
          ativo: true,
          banido_em: true,
          motivo_ban: true,
          criado_em: true,
          ultimo_login: true
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
      
      const where = { tipo: 'deposito' };
      
      if (status !== 'all') {
        where.status = status;
      }
      
      if (start_date) {
        where.criado_em = { ...where.criado_em, gte: new Date(start_date) };
      }
      
      if (end_date) {
        where.criado_em = { ...where.criado_em, lte: new Date(end_date) };
      }
      
      if (min_value) {
        where.valor = { ...where.valor, gte: parseFloat(min_value) };
      }
      
      if (max_value) {
        where.valor = { ...where.valor, lte: parseFloat(max_value) };
      }

      const [deposits, total] = await Promise.all([
        prisma.payment.findMany({
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
        prisma.payment.count({ where })
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
      
      const where = { tipo: 'saque' };
      
      if (status !== 'all') {
        where.status = status;
      }
      
      if (start_date) {
        where.criado_em = { ...where.criado_em, gte: new Date(start_date) };
      }
      
      if (end_date) {
        where.criado_em = { ...where.criado_em, lte: new Date(end_date) };
      }
      
      if (min_value) {
        where.valor = { ...where.valor, gte: parseFloat(min_value) };
      }
      
      if (max_value) {
        where.valor = { ...where.valor, lte: parseFloat(max_value) };
      }

      const [withdrawals, total] = await Promise.all([
        prisma.payment.findMany({
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
        prisma.payment.count({ where })
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

      const withdrawal = await prisma.payment.findUnique({
        where: { id: withdrawalId },
        include: {
          user: {
            select: { id: true, nome: true, email: true, saldo: true }
          }
        }
      });

      if (!withdrawal) {
        return res.status(404).json({
          success: false,
          error: 'Saque não encontrado'
        });
      }

      if (withdrawal.tipo !== 'saque') {
        return res.status(400).json({
          success: false,
          error: 'Transação não é um saque'
        });
      }

      // Se está aprovando o saque
      if (status === 'concluido') {
        // Verificar se o usuário tem saldo suficiente
        if (withdrawal.user.saldo < withdrawal.valor) {
          return res.status(400).json({
            success: false,
            error: 'Usuário não possui saldo suficiente'
          });
        }

        // Atualizar status e processar saque
        await prisma.$transaction(async (tx) => {
          // Atualizar status do saque
          await tx.payment.update({
            where: { id: withdrawalId },
            data: { 
              status: 'concluido',
              processado_em: new Date()
            }
          });

          // Debitar saldo do usuário
          await tx.user.update({
            where: { id: withdrawal.user.id },
            data: {
              saldo: {
                decrement: withdrawal.valor
              }
            }
          });

          // Criar transação de débito
          await tx.transaction.create({
            data: {
              user_id: withdrawal.user.id,
              tipo: 'saque',
              valor: withdrawal.valor,
              status: 'concluido',
              descricao: `Saque aprovado - ${motivo || 'Aprovado por administrador'}`
            }
          });
        });

        // Criar log da ação
        await createAdminLog(
          req.user.id,
          'APROVAR_SAQUE',
          `Saque de R$ ${withdrawal.valor} aprovado para ${withdrawal.user.nome}`,
          { status: withdrawal.status },
          { status: 'concluido', valor: withdrawal.valor },
          withdrawal.user.id,
          req
        );

      } else if (status === 'cancelado') {
        // Apenas atualizar status para cancelado
        await prisma.payment.update({
          where: { id: withdrawalId },
          data: { 
            status: 'cancelado',
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
            },
            affiliate_history: {
              select: { 
                id: true,
                valor_deposito: true,
                comissao_gerada: true,
                status: true,
                data: true,
                indicado: {
                  select: { nome: true, email: true }
                }
              }
            },
            withdrawals: {
              select: {
                id: true,
                valor: true,
                status: true,
                criado_em: true
              }
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
            saldo: {
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
            saldo: {
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
          saldo: { gt: 0 }
        },
        data: {
          saldo: 10.00 // Saldo inicial para testes
        }
      });

      // Atualizar carteiras correspondentes
      const updatedWallets = await prisma.wallet.updateMany({
        where: {
          user: {
            is_admin: false
          },
          saldo: { gt: 0 }
        },
        data: {
          saldo: 10.00
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
          saldo: {
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
          saldo: updatedUser.saldo
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
          novo_saldo: updatedUser.saldo,
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
          novo_saldo: updatedUser.saldo,
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
}

module.exports = new AdminController();
