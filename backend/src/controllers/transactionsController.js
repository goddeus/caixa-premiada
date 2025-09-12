const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const affiliateService = require('../services/affiliateService');

class TransactionsController {
  // Buscar histórico de transações do usuário
  async getUserTransactions(req, res) {
    try {
      const { userId } = req.user;
      const { page = 1, limit = 20, tipo } = req.query;
      
      const skip = (page - 1) * limit;
      
      const where = {
        user_id: userId
      };
      
      if (tipo) {
        where.tipo = tipo;
      }
      
      const transactions = await prisma.transaction.findMany({
        where,
        orderBy: {
          criado_em: 'desc'
        },
        skip: parseInt(skip),
        take: parseInt(limit),
        include: {
          case: {
            select: {
              nome: true,
              imagem_url: true
            }
          },
          prize: {
            select: {
              nome: true,
              valor: true
            }
          }
        }
      });
      
      const total = await prisma.transaction.count({ where });
      
      res.json({
        transactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
  
  // Buscar feed de ganhadores recentes
  async getRecentWinners(req, res) {
    try {
      // Por enquanto, retornar array vazio
      res.json({ winners: [] });
    } catch (error) {
      console.error('Erro ao buscar ganhadores recentes:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
  
  // Buscar ranking diário de ganhadores
  async getDailyWinnersRanking(req, res) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const dailyWinners = await prisma.transaction.groupBy({
        by: ['user_id'],
        where: {
          tipo: 'premio',
          status: 'concluido',
          criado_em: {
            gte: today,
            lt: tomorrow
          }
        },
        _sum: {
          valor: true
        },
        orderBy: {
          _sum: {
            valor: 'desc'
          }
        },
        take: 10
      });
      
      // Buscar dados dos usuários
      const winnersWithUserData = await Promise.all(
        dailyWinners.map(async (winner) => {
          const user = await prisma.user.findUnique({
            where: { id: winner.user_id },
            select: { nome: true }
          });
          
          return {
            user_id: winner.user_id,
            nome: user.nome,
            total_ganho: winner._sum.valor
          };
        })
      );
      
      res.json({ ranking: winnersWithUserData });
    } catch (error) {
      console.error('Erro ao buscar ranking diário:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Processar depósito e verificar comissões de afiliado
  async processDeposit(req, res) {
    try {
      const { userId } = req.user;
      const { valor } = req.body;

      if (!valor || valor < 20) {
        return res.status(400).json({ error: 'Valor mínimo para depósito é R$ 20,00' });
      }

      // Criar transação de depósito
      const transaction = await prisma.transaction.create({
        data: {
          user_id: userId,
          tipo: 'deposito',
          valor: parseFloat(valor),
          status: 'concluido',
          descricao: `Depósito de R$ ${valor}`
        }
      });

      // Atualizar saldo do usuário
      await prisma.user.update({
        where: { id: userId },
        data: {
          saldo: { increment: parseFloat(valor) }
        }
      });

      // Atualizar carteira
      await prisma.wallet.update({
        where: { user_id: userId },
        data: {
          saldo: { increment: parseFloat(valor) }
        }
      });

      // Processar comissão de afiliado se aplicável
      try {
        const commissionResult = await affiliateService.processCommissionOnDeposit(userId, valor);
        console.log('Comissão processada:', commissionResult);
      } catch (error) {
        console.log('Erro ao processar comissão (não crítico):', error.message);
        // Não falha o depósito se a comissão der erro
      }

      res.json({
        success: true,
        message: 'Depósito processado com sucesso',
        transaction,
        novo_saldo: await prisma.user.findUnique({
          where: { id: userId },
          select: { saldo: true }
        })
      });

    } catch (error) {
      console.error('Erro ao processar depósito:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

module.exports = new TransactionsController();
