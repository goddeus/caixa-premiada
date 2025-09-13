const prisma = require('../utils/prisma');
const walletService = require('./walletService');
const prizeCalculationService = require('./prizeCalculationService');
const prizeValidationService = require('./prizeValidationService');
const { isValidUUID } = require('../utils/validation');

class CasesService {
  // Listar todas as caixas ativas
  async getAllCases() {
    const cases = await prisma.case.findMany({
      where: { ativo: true },
      include: {
        prizes: {
          select: {
            id: true,
            nome: true,
            valor: true,
            probabilidade: true,
            imagem_url: true
          }
        },
        _count: {
          select: {
            prizes: true
          }
        }
      },
      orderBy: { criado_em: 'desc' }
    });

    return cases.map(caseItem => ({
      ...caseItem,
      total_prizes: caseItem._count.prizes,
      prizes: caseItem.prizes.map(prize => ({
        ...prize,
        probabilidade_percentual: (prize.probabilidade * 100).toFixed(2)
      }))
    }));
  }

  // Buscar caixa específica
  async getCaseById(caseId) {
    if (!isValidUUID(caseId)) {
      throw new Error('ID da caixa inválido');
    }

    const caseItem = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        prizes: {
          select: {
            id: true,
            nome: true,
            valor: true,
            probabilidade: true,
            imagem_url: true
          }
        }
      }
    });

    if (!caseItem) {
      throw new Error('Caixa não encontrada');
    }

    if (!caseItem.ativo) {
      throw new Error('Caixa não está disponível');
    }

    return {
      ...caseItem,
      prizes: caseItem.prizes.map(prize => ({
        ...prize,
        probabilidade_percentual: (prize.probabilidade * 100).toFixed(2)
      }))
    };
  }

  // DEPRECATED: Algoritmo de sorteio local removido
  // Todas as caixas agora devem usar o sistema global de sorteio
  // através da função globalDrawService.sortearPremio(caixa_id, user_id)
  
  selectPrize(prizes) {
    throw new Error('Método deprecado. Use globalDrawService.sortearPremio(caixa_id, user_id) para sorteios centralizados.');
  }

  // Abrir caixa com novo sistema de prêmios inteligente
  async openCase(userId, caseId) {
    if (!isValidUUID(caseId)) {
      throw new Error('ID da caixa inválido');
    }

    // Buscar caixa e prêmios
    const caseItem = await this.getCaseById(caseId);
    
    if (!caseItem) {
      throw new Error('Caixa não encontrada');
    }

    // Verificar se tem saldo suficiente (funciona para contas normais e demo)
    const hasBalance = await walletService.hasEnoughBalance(userId, parseFloat(caseItem.preco));
    if (!hasBalance) {
      throw new Error('Saldo insuficiente para abrir esta caixa');
    }

    // CORREÇÃO: Usar sistema de sorteio centralizado que respeita preços originais
    const centralizedDrawService = require('./centralizedDrawService');
    const drawResult = await centralizedDrawService.sortearPremio(caseId, userId);
    
    if (!drawResult.success) {
      throw new Error(`Erro no sorteio: ${drawResult.message}`);
    }
    
    const prizeData = drawResult.prize;

    // FAILSAFE CRÍTICO: Validar consistência do prêmio antes de processar
    console.log('🔒 Executando failsafe de sincronização...');
    const validationResult = await prizeValidationService.validatePrizeBeforeCredit(prizeData.id);
    
    if (!validationResult.valid) {
      console.error('❌ FAILSAFE ATIVADO: Prêmio inconsistente detectado!');
      console.error('❌ Detalhes:', validationResult.error);
      
      // Registrar falha crítica no sistema
      await prisma.transaction.create({
        data: {
          user_id: userId,
          tipo: 'failsafe_ativado',
          valor: parseFloat(prizeData.valor),
          status: 'falhou',
          descricao: `FAILSAFE: Prêmio inconsistente detectado - ${validationResult.error}`,
          case_id: caseId,
          prize_id: prizeData.id
        }
      });

      throw new Error(`Failsafe ativado: Prêmio inconsistente detectado. ${validationResult.error}`);
    }

    // Buscar dados oficiais do prêmio diretamente do banco (fonte única da verdade)
    const officialPrizeData = await prisma.prize.findUnique({
      where: { id: prizeData.id },
      include: {
        case: {
          select: {
            nome: true,
            preco: true
          }
        }
      }
    });

    if (!officialPrizeData) {
      throw new Error('Prêmio não encontrado no banco de dados');
    }

    // Garantir que os dados exibidos são exatamente os do banco
    const finalPrizeData = {
      id: officialPrizeData.id,
      nome: officialPrizeData.nome,
      valor: parseFloat(officialPrizeData.valor),
      probabilidade: parseFloat(officialPrizeData.probabilidade),
      imagem_url: officialPrizeData.imagem_url,
      case_nome: officialPrizeData.case.nome,
      case_preco: parseFloat(officialPrizeData.case.preco)
    };

    console.log('✅ FAILSAFE: Dados oficiais confirmados');
    console.log('✅ Prêmio ID:', finalPrizeData.id);
    console.log('✅ Valor oficial:', finalPrizeData.valor);
    console.log('✅ Imagem oficial:', finalPrizeData.imagem_url);

    // Iniciar transação do banco
    const result = await prisma.$transaction(async (tx) => {
      // Buscar tipo de conta do usuário
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { tipo_conta: true }
      });

      const isDemoAccount = user && user.tipo_conta === 'afiliado_demo';

      // Deduzir valor da caixa do saldo correto
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: isDemoAccount ? {
          saldo_demo: { decrement: caseItem.preco }
        } : {
          saldo_reais: { decrement: caseItem.preco }
        },
        select: {
          id: true,
          nome: true,
          saldo_reais: true,
          saldo_demo: true,
          tipo_conta: true
        }
      });

      // Atualizar carteira
      await tx.wallet.update({
        where: { user_id: userId },
        data: {
          saldo_reais: updatedUser.saldo_reais,
          saldo_demo: updatedUser.saldo_demo
        }
      });

      // Registrar transação de abertura da caixa
      const caseTransaction = await tx.transaction.create({
        data: {
          user_id: userId,
          tipo: 'abertura_caixa',
          valor: caseItem.preco,
          status: 'concluido',
          descricao: `Abertura da caixa: ${caseItem.nome}`,
          case_id: caseId
        }
      });

      // Adicionar valor do prêmio ao saldo correto (usando dados oficiais)
      const finalUser = await tx.user.update({
        where: { id: userId },
        data: isDemoAccount ? {
          saldo_demo: { increment: finalPrizeData.valor }
        } : {
          saldo_reais: { increment: finalPrizeData.valor }
        },
        select: {
          id: true,
          nome: true,
          saldo_reais: true,
          saldo_demo: true,
          tipo_conta: true
        }
      });

      // Atualizar carteira novamente
      await tx.wallet.update({
        where: { user_id: userId },
        data: {
          saldo_reais: finalUser.saldo_reais,
          saldo_demo: finalUser.saldo_demo
        }
      });

      // Registrar transação do prêmio usando dados oficiais (FAILSAFE)
      const prizeTransaction = await tx.transaction.create({
        data: {
          user_id: userId,
          tipo: 'premio',
          valor: finalPrizeData.valor,
          status: 'concluido',
          descricao: `Prêmio: ${finalPrizeData.nome} - R$ ${finalPrizeData.valor.toFixed(2)}`,
          case_id: caseId,
          prize_id: finalPrizeData.id
        }
      });

      return {
        case: caseItem,
        prize: finalPrizeData,
        caseTransaction,
        prizeTransaction,
        finalBalance: finalUser.saldo,
        userName: finalUser.nome
      };
    });

    return {
      success: true,
      case: result.case,
      prize: {
        id: result.prize.id,
        nome: result.prize.nome,
        valor: result.prize.valor,
        probabilidade: result.prize.probabilidade,
        imagem_url: result.prize.imagem_url,
        case_nome: result.prize.case_nome,
        case_preco: result.prize.case_preco
      },
      transactions: {
        case: result.caseTransaction,
        prize: result.prizeTransaction
      },
      novo_saldo: result.finalBalance,
      message: `Parabéns! Você ganhou R$ ${result.prize.valor.toFixed(2)}!`,
      failsafe_applied: true,
      validation_passed: true
    };
  }

  // Buscar histórico de aberturas do usuário
  async getUserHistory(userId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const transactions = await prisma.transaction.findMany({
      where: {
        user_id: userId,
        tipo: {
          in: ['abertura_caixa', 'premio']
        }
      },
      include: {
        user: {
          select: {
            nome: true
          }
        }
      },
      orderBy: { criado_em: 'desc' },
      skip: offset,
      take: limit
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
        data: caseTrans.criado_em,
        case_id: caseTrans.case_id,
        valor_caixa: caseTrans.valor,
        valor_premio: prizeTrans ? prizeTrans.valor : 0,
        lucro: prizeTrans ? parseFloat(prizeTrans.valor) - parseFloat(caseTrans.valor) : -parseFloat(caseTrans.valor),
        descricao_caixa: caseTrans.descricao,
        descricao_premio: prizeTrans ? prizeTrans.descricao : null
      });
    });

    return {
      transactions: groupedTransactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Buscar ganhadores recentes (para feed em tempo real)
  async getRecentWinners(limit = 10) {
    const winners = await prisma.transaction.findMany({
      where: {
        tipo: 'premio',
        status: 'concluido',
        valor: {
          gt: 0
        }
      },
      include: {
        user: {
          select: {
            nome: true
          }
        }
      },
      orderBy: { criado_em: 'desc' },
      take: limit
    });

    return winners.map(winner => ({
      id: winner.id,
      nome: this.maskUserName(winner.user.nome),
      valor: winner.valor,
      data: winner.criado_em,
      descricao: winner.descricao
    }));
  }

  // Mascarar nome do usuário para privacidade
  maskUserName(name) {
    if (!name) return 'Usuário';
    const parts = name.split(' ');
    if (parts.length === 1) {
      return parts[0].charAt(0) + '*'.repeat(parts[0].length - 1);
    }
    return parts[0].charAt(0) + '*'.repeat(parts[0].length - 1) + ' ' + 
           parts[parts.length - 1].charAt(0) + '*'.repeat(parts[parts.length - 1].length - 1);
  }
}

module.exports = new CasesService();
