const { PrismaClient } = require('@prisma/client');
const manipulativeDrawService = require('../services/manipulativeDrawService');
const addictiveRTPService = require('../services/addictiveRTPService');
const prisma = new PrismaClient();

/**
 * CONTROLLER DE COMPRA MANIPULATIVO
 * 
 * Este controller implementa o sistema de compra mais agressivo e viciante,
 * baseado em técnicas psicológicas avançadas para maximizar retenção e lucros.
 */
class ManipulativeCompraController {

  /**
   * Compra de caixa com sistema manipulativo
   */
  async buyCaseManipulative(req, res) {
    const startTime = Date.now();
    let purchaseId = null;
    
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      console.log(`🧠 [MANIPULATIVE] Iniciando compra manipulativa para usuário ${userId}`);
      
      // Gerar ID de compra para idempotência
      purchaseId = `manipulative_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Buscar a caixa
      const caseData = await prisma.case.findUnique({
        where: { id: id },
        include: {
          prizes: {
            where: { ativo: true },
            select: {
              id: true,
              nome: true,
              valor: true,
              probabilidade: true,
              imagem: true
            }
          }
        }
      });

      if (!caseData || !caseData.ativo) {
        return res.status(404).json({ 
          success: false,
          error: 'Caixa não encontrada ou inativa' 
        });
      }

      // Verificar se é conta demo
      const isDemoAccount = req.user.tipo_conta === 'afiliado_demo';
      const saldoField = isDemoAccount ? 'saldo_demo' : 'saldo_reais';
      
      // OPERAÇÃO ATOMICA: Debitar saldo e fazer sorteio manipulativo
      const result = await prisma.$transaction(async (tx) => {
        // 1. Buscar usuário com lock
        const user = await tx.user.findUnique({
          where: { id: userId },
          select: { 
            id: true, 
            [saldoField]: true, 
            tipo_conta: true,
            nome: true,
            email: true
          }
        });

        if (!user) {
          throw new Error('Usuário não encontrado');
        }

        const saldoAtual = parseFloat(user[saldoField] || 0);
        const precoUnitario = Number(caseData.preco);
        const totalPreco = +(precoUnitario * 1).toFixed(2);
        
        // 2. Verificar saldo suficiente
        if (saldoAtual < totalPreco) {
          throw new Error('Saldo insuficiente');
        }

        // 3. Debitar saldo de forma atômica
        const saldoAposDebito = saldoAtual - totalPreco;
        
        await tx.user.update({
          where: { id: userId },
          data: { [saldoField]: saldoAposDebito }
        });

        console.log(`💸 [MANIPULATIVE] Saldo debitado: R$ ${saldoAtual.toFixed(2)} → R$ ${saldoAposDebito.toFixed(2)}`);

        // 4. VERIFICAR SE DEVE DAR PRÊMIO DE RETENÇÃO
        const shouldGiveRetention = await manipulativeDrawService.shouldGiveRetentionPrize(userId);
        let drawResult;
        
        if (shouldGiveRetention) {
          console.log(`🎯 [MANIPULATIVE] Aplicando estratégia de retenção para usuário ${userId}`);
          const retentionPrize = await manipulativeDrawService.generateRetentionPrize(id, userId);
          drawResult = {
            success: true,
            prize: retentionPrize,
            rtpUsed: 0.8, // RTP alto para retenção
            strategy: 'retention',
            isManipulative: true
          };
        } else {
          // 5. Fazer sorteio manipulativo
          drawResult = await manipulativeDrawService.performManipulativeDraw(id, userId);
        }
        
        if (!drawResult || !drawResult.success) {
          console.error('[MANIPULATIVE] Erro no sorteio manipulativo:', drawResult);
          throw new Error('Erro no sistema de sorteio manipulativo');
        }
        
        const wonPrize = drawResult.prize;
        console.log(`🎁 [MANIPULATIVE] Prêmio sorteado: ${wonPrize.nome} - R$ ${wonPrize.valor}`);

        // 6. Creditar prêmio se valor > 0
        let saldoFinal = saldoAposDebito;
        
        if (wonPrize.valor > 0) {
          saldoFinal = saldoAposDebito + parseFloat(wonPrize.valor);
          
          console.log(`💰 [MANIPULATIVE] Creditando prêmio: R$ ${wonPrize.valor.toFixed(2)}`);
          
          await tx.user.update({
            where: { id: userId },
            data: { [saldoField]: saldoFinal }
          });
        }

        // 7. Registrar auditoria de compra manipulativa
        await tx.purchaseAudit.create({
          data: {
            user_id: userId,
            case_id: id,
            saldo_before: saldoAtual,
            saldo_after: saldoFinal,
            prize_id: wonPrize.id || 'manipulative_prize',
            prize_value: wonPrize.valor,
            purchase_id: purchaseId,
            error_message: `Strategy: ${drawResult.strategy}, RTP: ${drawResult.rtpUsed}`,
            created_at: new Date()
          }
        });

        // 8. Registrar transações
        // Transação de débito
        await tx.transaction.create({
          data: {
            user_id: userId,
            tipo: 'abertura_caixa',
            valor: -totalPreco,
            saldo_antes: saldoAtual,
            saldo_depois: saldoAposDebito,
            descricao: `Abertura manipulativa de caixa ${caseData.nome}`,
            status: 'processado',
            created_at: new Date()
          }
        });

        // Transação de crédito (se prêmio > 0)
        if (wonPrize.valor > 0) {
          await tx.transaction.create({
            data: {
              user_id: userId,
              tipo: 'premio',
              valor: parseFloat(wonPrize.valor),
              saldo_antes: saldoAposDebito,
              saldo_depois: saldoFinal,
              descricao: `Prêmio manipulativo: ${wonPrize.nome}`,
              status: 'processado',
              created_at: new Date()
            }
          });
        }

        return {
          success: true,
          prize: {
            id: wonPrize.id || 'manipulative',
            nome: wonPrize.nome,
            valor: wonPrize.valor,
            tipo: wonPrize.tipo || 'cash',
            imagem: wonPrize.imagem || null,
            sem_imagem: wonPrize.valor === 0,
            psychologicalMessage: wonPrize.psychologicalMessage || null,
            isManipulative: true,
            strategy: drawResult.strategy,
            rtpUsed: drawResult.rtpUsed
          },
          message: wonPrize.valor > 0 ? 
            `Parabéns! Você ganhou R$ ${wonPrize.valor.toFixed(2)}!` : 
            (wonPrize.psychologicalMessage || 'Tente novamente na próxima!'),
          is_demo: isDemoAccount,
          userBalance: saldoFinal,
          transaction: {
            debited: totalPreco,
            credited: wonPrize.valor,
            balanceBefore: saldoAtual,
            balanceAfter: saldoFinal
          },
          manipulativeData: {
            strategy: drawResult.strategy,
            rtpUsed: drawResult.rtpUsed,
            behaviorProfile: drawResult.behaviorProfile,
            isRetentionPrize: shouldGiveRetention
          }
        };
      });

      const duration = Date.now() - startTime;
      console.log(`✅ [MANIPULATIVE] Compra manipulativa concluída em ${duration}ms`);

      res.json(result);

    } catch (error) {
      console.error('❌ [MANIPULATIVE] Erro na compra manipulativa:', error);
      
      // Registrar erro na auditoria
      try {
        await prisma.purchaseAudit.create({
          data: {
            user_id: req.user.id,
            case_id: req.params.id,
            saldo_before: 0,
            saldo_after: 0,
            prize_id: null,
            prize_value: 0,
            purchase_id: purchaseId,
            error_message: error.message,
            created_at: new Date()
          }
        });
      } catch (auditError) {
        console.error('Erro ao registrar auditoria:', auditError);
      }

      res.status(500).json({
        success: false,
        error: 'Erro interno no sistema de compra manipulativo',
        message: error.message
      });
    }
  }

  /**
   * Compra múltipla com sistema manipulativo
   */
  async buyMultipleCasesManipulative(req, res) {
    const startTime = Date.now();
    
    try {
      const { id } = req.params;
      const { quantity = 1 } = req.body;
      const userId = req.user.id;
      
      console.log(`🧠 [MANIPULATIVE] Iniciando compra múltipla manipulativa: ${quantity} caixas`);
      
      // Buscar a caixa
      const caseData = await prisma.case.findUnique({
        where: { id: id },
        include: {
          prizes: {
            where: { ativo: true },
            select: {
              id: true,
              nome: true,
              valor: true,
              probabilidade: true
            }
          }
        }
      });

      if (!caseData || !caseData.ativo) {
        return res.status(404).json({ error: 'Caixa não encontrada ou inativa' });
      }

      // Calcular custo total
      const precoUnitario = Number(caseData.preco);
      const totalCost = +(precoUnitario * quantity).toFixed(2);
      
      // Verificar saldo
      const isDemoAccount = req.user.tipo_conta === 'afiliado_demo';
      const saldoAtual = isDemoAccount ? req.user.saldo_demo : req.user.saldo_reais;
      
      if (parseFloat(saldoAtual) < totalCost) {
        return res.status(400).json({ error: 'Saldo insuficiente' });
      }

      const results = [];
      let totalWon = 0;
      let saldoAtualizado = parseFloat(saldoAtual);

      // Processar cada caixa com sistema manipulativo
      for (let i = 0; i < quantity; i++) {
        try {
          console.log(`🎲 [MANIPULATIVE] Processando caixa ${i + 1}/${quantity}...`);
          
          // Fazer sorteio manipulativo
          const drawResult = await manipulativeDrawService.performManipulativeDraw(id, userId);
          
          if (!drawResult.success) {
            console.error(`❌ [MANIPULATIVE] Erro no sorteio da caixa ${i + 1}:`, drawResult.message);
            results.push({
              boxNumber: i + 1,
              success: false,
              error: drawResult.message,
              prize: null
            });
            continue;
          }
          
          const wonPrize = drawResult.prize;
          console.log(`🎁 [MANIPULATIVE] Caixa ${i + 1} - Prêmio:`, wonPrize.nome, 'R$', wonPrize.valor);

          // Se for prêmio real, somar ao total
          if (wonPrize.valor > 0) {
            totalWon += parseFloat(wonPrize.valor);
            saldoAtualizado += parseFloat(wonPrize.valor);
          }

          results.push({
            boxNumber: i + 1,
            success: true,
            prize: {
              id: wonPrize.id || 'manipulative',
              nome: wonPrize.nome,
              valor: wonPrize.valor,
              imagem: wonPrize.imagem || null,
              sem_imagem: wonPrize.valor === 0,
              psychologicalMessage: wonPrize.psychologicalMessage || null,
              isManipulative: true,
              strategy: drawResult.strategy,
              rtpUsed: drawResult.rtpUsed
            }
          });

        } catch (error) {
          console.error(`❌ [MANIPULATIVE] Erro ao processar caixa ${i + 1}:`, error);
          results.push({
            boxNumber: i + 1,
            success: false,
            error: error.message,
            prize: null
          });
        }
      }

      // Atualizar saldo final do usuário
      const saldoFinal = parseFloat(saldoAtual) - totalCost + totalWon;
      
      try {
        const saldoField = isDemoAccount ? 'saldo_demo' : 'saldo_reais';
        await prisma.user.update({
          where: { id: userId },
          data: { [saldoField]: saldoFinal }
        });
        console.log(`✅ [MANIPULATIVE] Saldo atualizado: R$ ${saldoFinal.toFixed(2)}`);
      } catch (dbError) {
        console.error('❌ [MANIPULATIVE] Erro ao atualizar saldo:', dbError);
      }

      const duration = Date.now() - startTime;
      console.log(`✅ [MANIPULATIVE] Compra múltipla manipulativa concluída em ${duration}ms`);

      res.json({
        success: true,
        results: results,
        summary: {
          totalBoxes: quantity,
          totalCost: totalCost,
          totalWon: totalWon,
          netResult: totalWon - totalCost,
          finalBalance: saldoFinal,
          isManipulative: true
        }
      });

    } catch (error) {
      console.error('❌ [MANIPULATIVE] Erro na compra múltipla manipulativa:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno no sistema de compra múltipla manipulativa',
        message: error.message
      });
    }
  }

  /**
   * Obter estatísticas manipulativas do usuário
   */
  async getUserManipulativeStats(req, res) {
    try {
      const userId = req.user.id;
      
      console.log(`📊 [MANIPULATIVE] Obtendo estatísticas manipulativas para usuário ${userId}`);
      
      // Analisar comportamento do usuário
      const behaviorProfile = await addictiveRTPService.analyzeUserBehavior(userId);
      
      // Verificar streaks
      const hotStreak = await manipulativeDrawService.checkHotStreak(userId);
      const coldStreak = await manipulativeDrawService.checkColdStreak(userId);
      
      // Calcular timing de prêmio
      const prizeTiming = await manipulativeDrawService.calculateOptimalPrizeTiming(userId);
      
      res.json({
        success: true,
        data: {
          behaviorProfile,
          hotStreak,
          coldStreak,
          prizeTiming,
          recommendations: this.generateRecommendations(behaviorProfile, hotStreak, coldStreak)
        }
      });
      
    } catch (error) {
      console.error('❌ [MANIPULATIVE] Erro ao obter estatísticas:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao obter estatísticas manipulativas',
        message: error.message
      });
    }
  }

  /**
   * Gera recomendações baseadas no comportamento
   */
  generateRecommendations(behaviorProfile, hotStreak, coldStreak) {
    const recommendations = [];
    
    if (behaviorProfile.isLossChasing) {
      recommendations.push({
        type: 'extraction',
        message: 'Usuário perseguindo perdas - maximizar extração',
        action: 'Reduzir RTP para 5-10%'
      });
    }
    
    if (behaviorProfile.isAboutToQuit) {
      recommendations.push({
        type: 'retention',
        message: 'Usuário prestes a desistir - aplicar retenção',
        action: 'Dar prêmio de retenção (RTP 60-80%)'
      });
    }
    
    if (hotStreak.isHotStreak) {
      recommendations.push({
        type: 'streak_break',
        message: 'Usuário em hot streak - quebrar sequência',
        action: 'Reduzir RTP para quebrar a sequência'
      });
    }
    
    if (coldStreak.isColdStreak) {
      recommendations.push({
        type: 'streak_break',
        message: 'Usuário em cold streak - dar prêmio',
        action: 'Aumentar RTP para quebrar a sequência'
      });
    }
    
    return recommendations;
  }
}

module.exports = new ManipulativeCompraController();