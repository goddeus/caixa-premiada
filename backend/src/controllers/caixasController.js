const { PrismaClient } = require('@prisma/client');
const BuyCaseService = require('../services/buyCaseService');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

class CaixasController {
  
  /**
   * GET /api/caixas
   * Listar todas as caixas ativas
   */
  static async list(req, res) {
    try {
      const caixas = await prisma.case.findMany({
        where: { ativo: true },
        include: {
          prizes: {
            where: { ativo: true },
            select: {
              id: true,
              nome: true,
              valor: true,
              valor_reais: true,
              probabilidade: true,
              imagem_url: true,
              tipo: true,
              ilustrativo: true,
              sorteavel: true
            }
          }
        },
        orderBy: { criado_em: 'desc' }
      });
      
      // Formatar dados para o frontend
      const caixasFormatadas = caixas.map(caixa => ({
        id: caixa.id,
        nome: caixa.nome,
        preco: Number(caixa.preco),
        imagem: caixa.imagem_url,
        prizes: caixa.prizes.map(prize => ({
          id: prize.id,
          nome: prize.nome,
          valor: Number(prize.valor),
          valor_reais: Number(prize.valor_reais || prize.valor),
          probabilidade: Number(prize.probabilidade),
          imagem: prize.imagem_url,
          tipo: prize.tipo,
          ilustrativo: prize.ilustrativo,
          sorteavel: prize.sorteavel
        })),
        totalPrizes: caixa.prizes.length,
        sorteavelPrizes: caixa.prizes.filter(p => p.sorteavel).length
      }));
      
      res.json({
        success: true,
        data: caixasFormatadas
      });
      
    } catch (error) {
      console.error('Erro ao listar caixas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
  
  /**
   * GET /api/caixas/:id
   * Obter detalhes de uma caixa específica
   */
  static async getById(req, res) {
    try {
      const { id } = req.params;
      
      const caixa = await prisma.case.findUnique({
        where: { id },
        include: {
          prizes: {
            where: { ativo: true },
            select: {
              id: true,
              nome: true,
              valor: true,
              valor_reais: true,
              probabilidade: true,
              imagem_url: true,
              tipo: true,
              ilustrativo: true,
              sorteavel: true,
              label: true
            },
            orderBy: [
              { tipo: 'asc' },
              { valor: 'desc' }
            ]
          }
        }
      });
      
      if (!caixa || !caixa.ativo) {
        return res.status(404).json({
          success: false,
          message: 'Caixa não encontrada'
        });
      }
      
      // Calcular estatísticas dos prêmios
      const prizes = caixa.prizes;
      const sorteavelPrizes = prizes.filter(p => p.sorteavel);
      const cashPrizes = sorteavelPrizes.filter(p => p.tipo === 'cash');
      
      let expectedValue = 0;
      let totalProbability = 0;
      
      sorteavelPrizes.forEach(prize => {
        const prob = Number(prize.probabilidade || (1 / sorteavelPrizes.length));
        const valor = Number(prize.valor_reais || prize.valor);
        expectedValue += prob * valor;
        totalProbability += prob;
      });
      
      const caixaFormatada = {
        id: caixa.id,
        nome: caixa.nome,
        preco: Number(caixa.preco),
        imagem: caixa.imagem_url,
        prizes: prizes.map(prize => ({
          id: prize.id,
          nome: prize.nome,
          valor: Number(prize.valor),
          valor_reais: Number(prize.valor_reais || prize.valor),
          probabilidade: Number(prize.probabilidade),
          imagem: prize.imagem_url,
          tipo: prize.tipo,
          ilustrativo: prize.ilustrativo,
          sorteavel: prize.sorteavel,
          label: prize.label
        })),
        stats: {
          totalPrizes: prizes.length,
          sorteavelPrizes: sorteavelPrizes.length,
          cashPrizes: cashPrizes.length,
          expectedValue: Number(expectedValue.toFixed(2)),
          totalProbability: Number(totalProbability.toFixed(4))
        }
      };
      
      res.json({
        success: true,
        data: caixaFormatada
      });
      
    } catch (error) {
      console.error('Erro ao buscar caixa:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
  
  /**
   * POST /api/caixas/:id/abrir
   * Abrir caixa(s) - fluxo transacional completo
   */
  static async abrir(req, res) {
    try {
      const { id: caixaId } = req.params;
      const { quantidade = 1, purchaseId } = req.body;
      const userId = req.user.userId;
      
      // Validações básicas
      if (!caixaId) {
        return res.status(400).json({
          success: false,
          message: 'ID da caixa é obrigatório'
        });
      }
      
      const quantidadeNum = Number(quantidade);
      if (!quantidadeNum || quantidadeNum < 1 || quantidadeNum > 100) {
        return res.status(400).json({
          success: false,
          message: 'Quantidade deve ser entre 1 e 100'
        });
      }
      
      // Verificar se usuário pode fazer compras
      const canPurchase = await BuyCaseService.canUserPurchase(userId);
      if (!canPurchase.can) {
        return res.status(403).json({
          success: false,
          message: canPurchase.reason
        });
      }
      
      // Gerar purchaseId único se não fornecido
      const finalPurchaseId = purchaseId || `purchase_${userId}_${caixaId}_${Date.now()}_${uuidv4().substring(0, 8)}`;
      
      console.log(`🎲 Iniciando compra: ${finalPurchaseId} - User: ${userId} - Caixa: ${caixaId} - Qtd: ${quantidadeNum}`);
      
      // Executar compra através do serviço
      const resultado = await BuyCaseService.buyCase({
        userId,
        caixaId,
        quantidade: quantidadeNum,
        purchaseId: finalPurchaseId
      });
      
      // Buscar saldo atualizado do usuário
      const userAtualizado = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          saldo_reais: true,
          saldo_demo: true,
          tipo_conta: true
        }
      });
      
      res.json({
        success: true,
        message: `${quantidadeNum} caixa(s) aberta(s) com sucesso!`,
        data: {
          purchaseId: finalPurchaseId,
          quantidade: quantidadeNum,
          totalDebitado: resultado.totalDebitado,
          somaPremios: resultado.somaPremios,
          premios: resultado.premiosDetalhe,
          saldoAtual: userAtualizado?.tipo_conta === 'afiliado_demo' 
            ? userAtualizado.saldo_demo 
            : userAtualizado?.saldo_reais || 0,
          isIdempotent: resultado.isIdempotent || false
        }
      });
      
    } catch (error) {
      console.error('Erro ao abrir caixa:', error);
      
      // Erros específicos com mensagens amigáveis
      let message = 'Erro interno do servidor';
      let statusCode = 500;
      
      if (error.message.includes('Saldo insuficiente') || error.message.includes('Saldo demo insuficiente')) {
        message = error.message;
        statusCode = 400;
      } else if (error.message.includes('Caixa não encontrada')) {
        message = 'Caixa não encontrada ou inativa';
        statusCode = 404;
      } else if (error.message.includes('Usuário não encontrado')) {
        message = 'Usuário não encontrado';
        statusCode = 404;
      }
      
      res.status(statusCode).json({
        success: false,
        message
      });
    }
  }
  
  /**
   * GET /api/caixas/:id/historico
   * Obter histórico de aberturas de uma caixa específica (últimas 50)
   */
  static async historico(req, res) {
    try {
      const { id: caixaId } = req.params;
      
      // Buscar histórico de compras desta caixa
      const historico = await prisma.purchaseAudit.findMany({
        where: {
          caixas_compradas: {
            contains: caixaId
          },
          status: 'concluido'
        },
        include: {
          user: {
            select: {
              nome: true,
              email: true
            }
          }
        },
        orderBy: { criado_em: 'desc' },
        take: 50
      });
      
      const historicoFormatado = historico.map(audit => {
        let premios = [];
        try {
          premios = JSON.parse(audit.premios_detalhados || '[]');
        } catch (e) {
          premios = [];
        }
        
        return {
          id: audit.id,
          usuario: audit.user.nome,
          totalGasto: Number(audit.total_preco),
          totalPremios: Number(audit.soma_premios),
          premios: premios.filter(p => p.tipo === 'paid'), // Só prêmios pagos
          data: audit.criado_em
        };
      });
      
      res.json({
        success: true,
        data: historicoFormatado
      });
      
    } catch (error) {
      console.error('Erro ao buscar histórico da caixa:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
  
  /**
   * GET /api/caixas/stats
   * Estatísticas gerais das caixas
   */
  static async stats(req, res) {
    try {
      // Buscar estatísticas das últimas 24 horas
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const stats = await prisma.purchaseAudit.aggregate({
        where: {
          criado_em: { gte: oneDayAgo },
          status: 'concluido'
        },
        _sum: {
          total_preco: true,
          soma_premios: true
        },
        _count: {
          id: true
        }
      });
      
      const totalCaixas = await prisma.case.count({
        where: { ativo: true }
      });
      
      const totalUsuarios = await prisma.user.count({
        where: { ativo: true }
      });
      
      res.json({
        success: true,
        data: {
          caixasAtivas: totalCaixas,
          usuariosAtivos: totalUsuarios,
          ultimasVinteEQuatroHoras: {
            totalCompras: stats._count.id || 0,
            totalArrecadado: Number(stats._sum.total_preco || 0),
            totalPremiosPagos: Number(stats._sum.soma_premios || 0),
            rtpObservado: stats._sum.total_preco > 0 
              ? ((stats._sum.soma_premios / stats._sum.total_preco) * 100).toFixed(2)
              : '0.00'
          }
        }
      });
      
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = CaixasController;


