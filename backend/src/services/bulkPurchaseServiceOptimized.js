const { PrismaClient } = require('@prisma/client');
const userSessionService = require('./userSessionService');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

/**
 * Serviço de Compras Múltiplas Otimizado
 * 
 * Esta versão otimizada não usa globalDrawService dentro da transação
 * para evitar timeouts. O sorteio é feito fora da transação.
 */
class BulkPurchaseServiceOptimized {

  /**
   * Processa compra múltipla de caixas com transação atômica otimizada
   */
  async processBulkPurchase(userId, sessionId, caixaItems, purchaseId = null) {
    const startTime = Date.now();
    
    if (!purchaseId) {
      purchaseId = uuidv4();
    }

    console.log(`🛒 INICIANDO COMPRA MÚLTIPLA OTIMIZADA - Purchase ID: ${purchaseId}`);

    try {
      // 1. VALIDAÇÕES INICIAIS
      await this.validateBulkPurchaseRequest(userId, sessionId, caixaItems);

      // 2. VERIFICAR IDEMPOTÊNCIA
      const existingPurchase = await this.checkIdempotency(purchaseId);
      if (existingPurchase) {
        return {
          success: true,
          alreadyProcessed: true,
          purchaseId: existingPurchase.purchase_id,
          totalDebitado: existingPurchase.total_preco,
          somaPremios: existingPurchase.soma_premios,
          saldoFinal: existingPurchase.saldo_depois
        };
      }

      // 3. CALCULAR TOTAL E VALIDAR CAIXAS
      const { totalPreco, caixasValidadas } = await this.calculateAndValidateTotal(caixaItems);

      // 4. SORTEAR PRÊMIOS FORA DA TRANSAÇÃO (para evitar timeout)
      console.log('🎲 Sorteando prêmios fora da transação...');
      const premiosSorteados = await this.sortearPremiosForaTransacao(caixasValidadas, userId);

      // 5. PROCESSAR TRANSAÇÃO ATÔMICA (apenas operações de banco)
      const result = await prisma.$transaction(async (tx) => {
        // 5.1. Buscar usuário
        const user = await tx.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            nome: true,
            saldo: true,
            saldo_demo: true,
            tipo_conta: true,
            ativo: true
          }
        });

        if (!user) {
          throw new Error('Usuário não encontrado');
        }

        if (!user.ativo) {
          throw new Error('Usuário inativo');
        }

        // 5.2. Verificar saldo suficiente
        const isDemoAccount = user.tipo_conta === 'afiliado_demo';
        const saldoAtual = isDemoAccount ? (user.saldo_demo || 0) : user.saldo;
        
        if (saldoAtual < totalPreco) {
          throw new Error(`Saldo insuficiente. Disponível: R$ ${saldoAtual.toFixed(2)}, Necessário: R$ ${totalPreco.toFixed(2)}`);
        }

        // 5.3. Obter ou criar sessão ativa
        let activeSession;
        if (sessionId) {
          activeSession = await tx.userSession.findUnique({
            where: { id: sessionId }
          });
        }
        
        if (!activeSession) {
          activeSession = await tx.userSession.create({
            data: {
              user_id: userId,
              deposito_inicial: 20.00,
              limite_retorno: 10.00,
              valor_gasto_caixas: 0,
              valor_premios_recebidos: 0,
              rtp_configurado: 50.0,
              ativo: true
            }
          });
        }

        // 5.4. Debitar valor total
        const saldoAntes = saldoAtual;
        const saldoAposDebito = saldoAntes - totalPreco;

        if (isDemoAccount) {
          await tx.user.update({
            where: { id: userId },
            data: { saldo_demo: saldoAposDebito }
          });
        } else {
          await tx.user.update({
            where: { id: userId },
            data: { saldo: saldoAposDebito }
          });
        }

        // 5.5. Registrar transação de abertura de caixas
        await tx.transaction.create({
          data: {
            user_id: userId,
            session_id: activeSession.id,
            tipo: 'abertura_caixa_multipla',
            valor: -totalPreco,
            status: 'concluido',
            descricao: `Compra múltipla de ${caixasValidadas.length} tipos de caixas - Total: R$ ${totalPreco.toFixed(2)}`
          }
        });

        // 5.6. Registrar transações dos prêmios (já sorteados)
        let somaPremios = 0;
        const premiosDetalhados = [];

        for (const premio of premiosSorteados) {
          if (!premio.isIllustrative) {
            somaPremios += premio.valor;
          }

          await tx.transaction.create({
            data: {
              user_id: userId,
              session_id: activeSession.id,
              tipo: premio.isIllustrative ? 'premio_visual' : 'premio',
              valor: premio.valor,
              status: 'concluido',
              descricao: premio.isIllustrative 
                ? `Prêmio ilustrativo: ${premio.nome} (R$ ${premio.valor.toFixed(2)})`
                : `Prêmio sorteado: ${premio.nome} - R$ ${premio.valor.toFixed(2)}`,
              case_id: premio.caixaId,
              prize_id: premio.prizeId
            }
          });

          premiosDetalhados.push({
            caixaId: premio.caixaId,
            caixaNome: premio.caixaNome,
            boxNumber: premio.boxNumber,
            prizeId: premio.prizeId,
            prizeNome: premio.nome,
            valor: premio.valor,
            isIllustrative: premio.isIllustrative,
            sorteavel: premio.sorteavel
          });
        }

        // 5.7. Creditar prêmios no saldo final
        const saldoFinal = saldoAposDebito + somaPremios;

        if (isDemoAccount) {
          await tx.user.update({
            where: { id: userId },
            data: { saldo_demo: saldoFinal }
          });
        } else {
          await tx.user.update({
            where: { id: userId },
            data: { saldo: saldoFinal }
          });
        }

        // 5.8. Registrar auditoria da compra
        const auditData = {
          purchase_id: purchaseId,
          user_id: userId,
          session_id: activeSession.id,
          caixas_compradas: JSON.stringify(caixasValidadas),
          total_preco: totalPreco,
          soma_premios: somaPremios,
          saldo_antes: saldoAntes,
          saldo_depois: saldoFinal,
          status: 'concluido',
          tipo_conta: user.tipo_conta,
          premios_detalhados: JSON.stringify(premiosDetalhados)
        };

        await tx.purchaseAudit.create({
          data: auditData
        });

        // 5.9. Atualizar sessão do usuário
        await tx.userSession.update({
          where: { id: activeSession.id },
          data: {
            valor_gasto_caixas: { increment: totalPreco },
            valor_premios_recebidos: { increment: somaPremios }
          }
        });

        return {
          purchaseId,
          totalDebitado: totalPreco,
          somaPremios,
          saldoFinal,
          premiosDetalhados,
          isDemoAccount,
          processingTimeMs: Date.now() - startTime
        };
      });

      console.log('✅ COMPRA MÚLTIPLA OTIMIZADA CONCLUÍDA');
      console.log(`💰 Total debitado: R$ ${result.totalDebitado.toFixed(2)}`);
      console.log(`🎁 Total de prêmios: R$ ${result.somaPremios.toFixed(2)}`);
      console.log(`💳 Saldo final: R$ ${result.saldoFinal.toFixed(2)}`);

      return {
        success: true,
        purchaseId: result.purchaseId,
        totalDebitado: result.totalDebitado,
        somaPremios: result.somaPremios,
        saldoFinal: result.saldoFinal,
        premios: result.premiosDetalhados,
        isDemoAccount: result.isDemoAccount,
        processingTimeMs: result.processingTimeMs
      };

    } catch (error) {
      console.error('❌ ERRO NA COMPRA MÚLTIPLA OTIMIZADA:', error);
      
      try {
        await this.logPurchaseError(purchaseId, userId, sessionId, caixaItems, error);
      } catch (logError) {
        console.error('❌ Erro ao registrar falha na auditoria:', logError);
      }

      return {
        success: false,
        error: error.message,
        purchaseId,
        processingTimeMs: Date.now() - startTime
      };
    }
  }

  /**
   * Sorteia prêmios fora da transação para evitar timeout
   */
  async sortearPremiosForaTransacao(caixasValidadas, userId) {
    const premiosSorteados = [];

    for (const item of caixasValidadas) {
      const { caixaId, quantidade, nome } = item;
      
      for (let i = 0; i < quantidade; i++) {
        try {
          // Simular sorteio simples (sem globalDrawService para evitar timeout)
          const premioSimulado = await this.simularSorteio(caixaId, nome, i + 1);
          premiosSorteados.push(premioSimulado);
        } catch (error) {
          console.error(`❌ Erro ao sortear prêmio ${i + 1}:`, error);
          // Adicionar prêmio mínimo em caso de erro
          premiosSorteados.push({
            caixaId,
            caixaNome: nome,
            boxNumber: i + 1,
            prizeId: 'erro_minimo',
            nome: 'Prêmio Mínimo',
            valor: 1.00,
            isIllustrative: false,
            sorteavel: true
          });
        }
      }
    }

    return premiosSorteados;
  }

  /**
   * Simula sorteio de prêmio (versão simplificada)
   */
  async simularSorteio(caixaId, caixaNome, boxNumber) {
    // Buscar prêmios da caixa
    const prizes = await prisma.prize.findMany({
      where: {
        case_id: caixaId,
        ativo: true,
        sorteavel: true
      }
    });

    if (prizes.length === 0) {
      // Prêmio mínimo se não houver prêmios
      return {
        caixaId,
        caixaNome,
        boxNumber,
        prizeId: 'minimo',
        nome: 'Prêmio Mínimo',
        valor: 1.00,
        isIllustrative: false,
        sorteavel: true
      };
    }

    // Sorteio simples baseado em probabilidade
    const totalProbability = prizes.reduce((acc, p) => acc + parseFloat(p.probabilidade), 0);
    let random = Math.random() * totalProbability;
    
    for (const prize of prizes) {
      random -= parseFloat(prize.probabilidade);
      if (random <= 0) {
        const valorPremio = parseFloat(prize.valor) || 0;
        const isIllustrative = valorPremio === 0 || prize.ilustrativo || !prize.sorteavel;
        
        return {
          caixaId,
          caixaNome,
          boxNumber,
          prizeId: prize.id,
          nome: prize.nome || 'Prêmio',
          valor: valorPremio,
          isIllustrative,
          sorteavel: prize.sorteavel !== false
        };
      }
    }

    // Fallback: primeiro prêmio
    const prize = prizes[0];
    const valorPremio = parseFloat(prize.valor) || 0;
    const isIllustrative = valorPremio === 0 || prize.ilustrativo || !prize.sorteavel;
    
    return {
      caixaId,
      caixaNome,
      boxNumber,
      prizeId: prize.id,
      nome: prize.nome || 'Prêmio',
      valor: valorPremio,
      isIllustrative,
      sorteavel: prize.sorteavel !== false
    };
  }

  /**
   * Valida a requisição de compra múltipla
   */
  async validateBulkPurchaseRequest(userId, sessionId, caixaItems) {
    if (!userId) {
      throw new Error('ID do usuário é obrigatório');
    }

    if (!caixaItems || !Array.isArray(caixaItems) || caixaItems.length === 0) {
      throw new Error('Lista de caixas é obrigatória');
    }

    if (caixaItems.length > 50) {
      throw new Error('Máximo de 50 tipos de caixas por compra');
    }

    for (const item of caixaItems) {
      if (!item.caixaId || !item.quantidade) {
        throw new Error('Cada item deve ter caixaId e quantidade');
      }

      if (item.quantidade < 1 || item.quantidade > 100) {
        throw new Error('Quantidade deve estar entre 1 e 100 por tipo de caixa');
      }
    }
  }

  /**
   * Verifica idempotência da compra
   */
  async checkIdempotency(purchaseId) {
    return await prisma.purchaseAudit.findUnique({
      where: { purchase_id: purchaseId }
    });
  }

  /**
   * Calcula total e valida caixas
   */
  async calculateAndValidateTotal(caixaItems) {
    let totalPreco = 0;
    const caixasValidadas = [];

    for (const item of caixaItems) {
      const caixa = await prisma.case.findUnique({
        where: { id: item.caixaId },
        select: {
          id: true,
          nome: true,
          preco: true,
          ativo: true
        }
      });

      if (!caixa) {
        throw new Error(`Caixa não encontrada: ${item.caixaId}`);
      }

      if (!caixa.ativo) {
        throw new Error(`Caixa inativa: ${caixa.nome}`);
      }

      const precoItem = parseFloat(caixa.preco) * item.quantidade;
      totalPreco += precoItem;

      caixasValidadas.push({
        caixaId: caixa.id,
        nome: caixa.nome,
        preco: parseFloat(caixa.preco),
        quantidade: item.quantidade,
        totalItem: precoItem
      });
    }

    return { totalPreco, caixasValidadas };
  }

  /**
   * Registra erro na auditoria
   */
  async logPurchaseError(purchaseId, userId, sessionId, caixaItems, error) {
    try {
      await prisma.purchaseAudit.create({
        data: {
          purchase_id: purchaseId,
          user_id: userId,
          session_id: sessionId,
          caixas_compradas: JSON.stringify(caixaItems),
          total_preco: 0,
          soma_premios: 0,
          saldo_antes: 0,
          saldo_depois: 0,
          status: 'erro',
          erro_detalhes: error.message,
          tipo_conta: 'normal'
        }
      });
    } catch (logError) {
      console.error('Erro ao registrar falha:', logError);
    }
  }
}

module.exports = new BulkPurchaseServiceOptimized();



