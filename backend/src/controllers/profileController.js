const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class ProfileController {
  // Buscar dados do perfil do usuário
  async getProfile(req, res) {
    try {
      const { id: userId } = req.user;
      
      // Buscar dados do usuário com estatísticas
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          nome: true,
          email: true,
          cpf: true,
          criado_em: true,
          saldo_reais: true,
          saldo_demo: true,
          tipo_conta: true,
          wallet: {
            select: {
              saldo_reais: true,
              saldo_demo: true,
              atualizado_em: true
            }
          }
        }
      });

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      // Calcular estatísticas de transações
      const [deposits, withdrawals, gameTransactions] = await Promise.all([
        // Total depositado
        prisma.transaction.aggregate({
          where: {
            user_id: userId,
            tipo: 'deposito'
          },
          _sum: {
            valor: true
          }
        }),
        // Total retirado
        prisma.transaction.aggregate({
          where: {
            user_id: userId,
            tipo: 'saque'
          },
          _sum: {
            valor: true
          }
        }),
        // Transações de jogos (abertura de caixas)
        prisma.transaction.findMany({
          where: {
            user_id: userId,
            tipo: 'abertura_caixa'
          },
          select: {
            valor: true
          }
        })
      ]);

      // Calcular ganho em cashback (prêmios ganhos)
      const prizes = await prisma.transaction.aggregate({
        where: {
          user_id: userId,
          tipo: 'premio'
        },
        _sum: {
          valor: true
        }
      });

      const totalDepositado = deposits._sum.valor || 0;
      const totalRetirado = withdrawals._sum.valor || 0;
      const totalGastoEmJogos = gameTransactions.reduce((sum, t) => sum + parseFloat(t.valor), 0);
      const totalGanhoEmPremios = prizes._sum.valor || 0;
      const ganhoCashback = totalGanhoEmPremios - totalGastoEmJogos;

      // Determinar saldo correto baseado no tipo de conta
      const saldoAtual = user.tipo_conta === 'afiliado_demo' ? user.saldo_demo : user.saldo_reais;

      res.json({
        success: true,
        data: {
          email: user.email,
          username: user.nome,
          telefone: '', // Campo não existe no schema atual
          documento: user.cpf,
          dataEntrada: user.criado_em,
          totalDepositado,
          totalRetirado,
          ganhoCashback: Math.max(0, ganhoCashback), // Não pode ser negativo
          saldoAtual: saldoAtual,
          tipoConta: user.tipo_conta
        }
      });
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Atualizar dados do perfil
  async updateProfile(req, res) {
    try {
      const { id: userId } = req.user;
      const updateData = req.body;

      // Campos permitidos para atualização
      const allowedFields = ['nome', 'email', 'cpf'];
      const filteredData = {};

      for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
          filteredData[field] = updateData[field];
        }
      }

      if (Object.keys(filteredData).length === 0) {
        return res.status(400).json({ error: 'Nenhum campo válido para atualização' });
      }

      // Atualizar usuário
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: filteredData,
        select: {
          id: true,
          nome: true,
          email: true,
          cpf: true,
          criado_em: true
        }
      });

      res.json({
        success: true,
        message: 'Perfil atualizado com sucesso',
        data: updatedUser
      });
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Buscar histórico de jogos do usuário
  async getGameHistory(req, res) {
    try {
      const { id: userId } = req.user;
      const { page = 1, limit = 20 } = req.query;
      
      const skip = (page - 1) * limit;
      
      // Buscar transações de abertura de caixas e prêmios
      const transactions = await prisma.transaction.findMany({
        where: {
          user_id: userId,
          tipo: {
            in: ['abertura_caixa', 'premio']
          }
        },
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
        },
        orderBy: {
          criado_em: 'desc'
        },
        skip: parseInt(skip),
        take: parseInt(limit)
      });
      
      const total = await prisma.transaction.count({
        where: {
          user_id: userId,
          tipo: {
            in: ['abertura_caixa', 'premio']
          }
        }
      });

      // Agrupar transações de abertura e prêmio
      const groupedTransactions = [];
      const caseTransactions = transactions.filter(t => t.tipo === 'abertura_caixa');
      const prizeTransactions = transactions.filter(t => t.tipo === 'premio');

      caseTransactions.forEach(caseTrans => {
        const prizeTrans = prizeTransactions.find(p => 
          p.case_id === caseTrans.case_id && 
          Math.abs(new Date(p.criado_em) - new Date(caseTrans.criado_em)) < 1000
        );

        groupedTransactions.push({
          id: caseTrans.id,
          caseName: caseTrans.case?.nome || 'Caixa Desconhecida',
          prize: prizeTrans ? `R$ ${parseFloat(prizeTrans.valor).toFixed(2).replace('.', ',')}` : 'Nenhum prêmio',
          date: caseTrans.criado_em,
          status: prizeTrans ? 'won' : 'lost',
          caseImage: caseTrans.case?.imagem_url || null
        });
      });

      res.json({
        success: true,
        data: groupedTransactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Erro ao buscar histórico de jogos:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

module.exports = ProfileController;
