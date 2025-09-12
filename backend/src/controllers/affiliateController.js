const { PrismaClient } = require('@prisma/client');
const AffiliateService = require('../services/affiliateService');

const prisma = new PrismaClient();

class AffiliateController {
  
  /**
   * POST /api/affiliate/create
   * Criar conta de afiliado
   */
  static async create(req, res) {
    try {
      const userId = req.user.id;
      
      // Verificar se usuário já é afiliado
      const existingAffiliate = await prisma.affiliate.findUnique({
        where: { user_id: userId }
      });
      
      if (existingAffiliate) {
        return res.status(400).json({
          success: false,
          message: 'Usuário já é afiliado',
          data: {
            codigo_indicacao: existingAffiliate.codigo_indicacao
          }
        });
      }
      
      // Criar afiliado
      const affiliate = await AffiliateService.createAffiliate(userId);
      
      res.json({
        success: true,
        message: 'Conta de afiliado criada com sucesso',
        data: {
          id: affiliate.id,
          codigo_indicacao: affiliate.codigo_indicacao,
          link_referencia: `https://slotbox.shop/?ref=${affiliate.codigo_indicacao}`,
          ganhos: affiliate.ganhos,
          saldo_disponivel: affiliate.saldo_disponivel
        }
      });
      
    } catch (error) {
      console.error('Erro ao criar afiliado:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }
  
  /**
   * GET /api/affiliate/me
   * Obter dados do afiliado logado
   */
  static async me(req, res) {
    try {
      const userId = req.user.id;
      
      const affiliateData = await AffiliateService.getAffiliateData(userId);
      
      if (!affiliateData) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não é afiliado'
        });
      }
      
      res.json({
        success: true,
        data: affiliateData
      });
      
    } catch (error) {
      console.error('Erro ao buscar dados do afiliado:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
  
  /**
   * GET /api/affiliate/stats
   * Estatísticas do afiliado
   */
  static async stats(req, res) {
    try {
      const userId = req.user.id;
      
      const affiliate = await prisma.affiliate.findUnique({
        where: { user_id: userId }
      });
      
      if (!affiliate) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não é afiliado'
        });
      }
      
      // Buscar estatísticas detalhadas
      const [
        totalIndicados,
        indicadosComDeposito,
        totalComissoes,
        comissoesUltimos30Dias,
        indicadosUltimos30Dias
      ] = await Promise.all([
        // Total de indicados
        prisma.affiliateHistory.count({
          where: { affiliate_id: affiliate.id }
        }),
        
        // Indicados que fizeram depósito
        prisma.affiliateHistory.count({
          where: { 
            affiliate_id: affiliate.id,
            deposito_valido: true
          }
        }),
        
        // Total de comissões
        prisma.affiliateCommission.aggregate({
          where: { affiliate_id: affiliate.id },
          _sum: { valor: true }
        }),
        
        // Comissões dos últimos 30 dias
        prisma.affiliateCommission.aggregate({
          where: { 
            affiliate_id: affiliate.id,
            criado_em: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          },
          _sum: { valor: true },
          _count: { id: true }
        }),
        
        // Indicados dos últimos 30 dias
        prisma.affiliateHistory.count({
          where: { 
            affiliate_id: affiliate.id,
            criado_em: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          }
        })
      ]);
      
      const taxaConversao = totalIndicados > 0 
        ? ((indicadosComDeposito / totalIndicados) * 100).toFixed(1)
        : '0.0';
      
      res.json({
        success: true,
        data: {
          codigo_indicacao: affiliate.codigo_indicacao,
          link_referencia: `https://slotbox.shop/?ref=${affiliate.codigo_indicacao}`,
          saldo_disponivel: Number(affiliate.saldo_disponivel),
          total_ganhos: Number(affiliate.ganhos),
          total_sacado: Number(affiliate.total_sacado),
          estatisticas: {
            total_indicados: totalIndicados,
            indicados_com_deposito: indicadosComDeposito,
            taxa_conversao: `${taxaConversao}%`,
            total_comissoes: Number(totalComissoes._sum.valor || 0),
            ultimos_30_dias: {
              indicados: indicadosUltimos30Dias,
              comissoes: Number(comissoesUltimos30Dias._sum.valor || 0),
              quantidade_comissoes: comissoesUltimos30Dias._count.id || 0
            }
          }
        }
      });
      
    } catch (error) {
      console.error('Erro ao buscar estatísticas do afiliado:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
  
  /**
   * GET /api/affiliate/referrals
   * Lista de indicados do afiliado
   */
  static async referrals(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20 } = req.query;
      
      const affiliate = await prisma.affiliate.findUnique({
        where: { user_id: userId }
      });
      
      if (!affiliate) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não é afiliado'
        });
      }
      
      const skip = (Number(page) - 1) * Number(limit);
      
      const [referrals, total] = await Promise.all([
        prisma.affiliateHistory.findMany({
          where: { affiliate_id: affiliate.id },
          include: {
            indicado: {
              select: {
                nome: true,
                email: true,
                criado_em: true,
                primeiro_deposito_feito: true
              }
            }
          },
          orderBy: { criado_em: 'desc' },
          skip,
          take: Number(limit)
        }),
        
        prisma.affiliateHistory.count({
          where: { affiliate_id: affiliate.id }
        })
      ]);
      
      const referralsFormatados = referrals.map(ref => ({
        id: ref.id,
        usuario: {
          nome: ref.indicado.nome,
          email: ref.indicado.email.replace(/(.{2}).*(@.*)/, '$1***$2'), // Mascarar email
          cadastrado_em: ref.indicado.criado_em
        },
        deposito_valido: ref.deposito_valido,
        valor_deposito: ref.valor_deposito ? Number(ref.valor_deposito) : null,
        comissao_gerada: ref.comissao_gerada ? Number(ref.comissao_gerada) : null,
        status: ref.status,
        data_indicacao: ref.data
      }));
      
      res.json({
        success: true,
        data: {
          referrals: referralsFormatados,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        }
      });
      
    } catch (error) {
      console.error('Erro ao buscar indicados:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
  
  /**
   * GET /api/affiliate/commissions
   * Histórico de comissões do afiliado
   */
  static async commissions(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20 } = req.query;
      
      const affiliate = await prisma.affiliate.findUnique({
        where: { user_id: userId }
      });
      
      if (!affiliate) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não é afiliado'
        });
      }
      
      const skip = (Number(page) - 1) * Number(limit);
      
      const [commissions, total] = await Promise.all([
        prisma.affiliateCommission.findMany({
          where: { affiliate_id: affiliate.id },
          include: {
            user: {
              select: {
                nome: true,
                email: true
              }
            }
          },
          orderBy: { criado_em: 'desc' },
          skip,
          take: Number(limit)
        }),
        
        prisma.affiliateCommission.count({
          where: { affiliate_id: affiliate.id }
        })
      ]);
      
      const commissionsFormatadas = commissions.map(comm => ({
        id: comm.id,
        valor: Number(comm.valor),
        status: comm.status,
        usuario_indicado: {
          nome: comm.user.nome,
          email: comm.user.email.replace(/(.{2}).*(@.*)/, '$1***$2')
        },
        data: comm.criado_em
      }));
      
      res.json({
        success: true,
        data: {
          commissions: commissionsFormatadas,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        }
      });
      
    } catch (error) {
      console.error('Erro ao buscar comissões:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
  
  /**
   * POST /api/affiliate/withdraw
   * Solicitar saque de comissões
   */
  static async withdraw(req, res) {
    try {
      const userId = req.user.id;
      const { valor, pix_key, pix_key_type } = req.body;
      
      if (!valor || Number(valor) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Valor deve ser maior que zero'
        });
      }
      
      if (!pix_key || pix_key.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Chave PIX é obrigatória'
        });
      }
      
      const affiliate = await prisma.affiliate.findUnique({
        where: { user_id: userId }
      });
      
      if (!affiliate) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não é afiliado'
        });
      }
      
      const valorNumerico = Number(valor);
      
      if (valorNumerico < 50.00) {
        return res.status(400).json({
          success: false,
          message: 'Valor mínimo para saque é R$ 50,00'
        });
      }
      
      if (valorNumerico > affiliate.saldo_disponivel) {
        return res.status(400).json({
          success: false,
          message: 'Saldo insuficiente'
        });
      }
      
      // Processar saque
      const withdrawal = await AffiliateService.processAffiliateWithdrawal({
        affiliateId: affiliate.id,
        valor: valorNumerico,
        pixKey: pix_key.trim(),
        pixKeyType: pix_key_type || 'unknown'
      });
      
      res.json({
        success: true,
        message: 'Saque solicitado com sucesso',
        data: {
          withdrawal_id: withdrawal.id,
          valor: Number(withdrawal.valor),
          pix_key: withdrawal.pix_key,
          status: withdrawal.status
        }
      });
      
    } catch (error) {
      console.error('Erro ao solicitar saque de afiliado:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }
  
  /**
   * GET /api/affiliate/withdrawals
   * Histórico de saques do afiliado
   */
  static async withdrawals(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20 } = req.query;
      
      const affiliate = await prisma.affiliate.findUnique({
        where: { user_id: userId }
      });
      
      if (!affiliate) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não é afiliado'
        });
      }
      
      const skip = (Number(page) - 1) * Number(limit);
      
      const [withdrawals, total] = await Promise.all([
        prisma.affiliateWithdrawal.findMany({
          where: { affiliate_id: affiliate.id },
          orderBy: { criado_em: 'desc' },
          skip,
          take: Number(limit)
        }),
        
        prisma.affiliateWithdrawal.count({
          where: { affiliate_id: affiliate.id }
        })
      ]);
      
      const withdrawalsFormatados = withdrawals.map(w => ({
        id: w.id,
        valor: Number(w.valor),
        pix_key: w.pix_key,
        status: w.status,
        criado_em: w.criado_em,
        processado_em: w.processado_em
      }));
      
      res.json({
        success: true,
        data: {
          withdrawals: withdrawalsFormatados,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        }
      });
      
    } catch (error) {
      console.error('Erro ao buscar saques do afiliado:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
  
  /**
   * GET /api/affiliate/validate/:code
   * Validar código de indicação
   */
  static async validateCode(req, res) {
    try {
      const { code } = req.params;
      
      if (!code || code.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Código é obrigatório'
        });
      }
      
      const affiliate = await AffiliateService.validateReferralCode(code);
      
      if (!affiliate) {
        return res.status(404).json({
          success: false,
          message: 'Código de indicação inválido'
        });
      }
      
      res.json({
        success: true,
        message: 'Código de indicação válido',
        data: {
          affiliate_name: affiliate.user.nome,
          codigo_indicacao: affiliate.codigo_indicacao
        }
      });
      
    } catch (error) {
      console.error('Erro ao validar código:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = AffiliateController;