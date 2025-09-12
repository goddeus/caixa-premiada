const { PrismaClient } = require('@prisma/client');
const config = require('../config/index');

const prisma = new PrismaClient();

/**
 * Motor de sorteio seguro com RTP global e controle por sessão
 * Implementação exata conforme especificação do prompt
 */
class SorteioEngine {
  
  /**
   * Função central de sorteio - roda dentro da mesma transação tx
   * @param {Object} params - { tx, caixaId, userId, sessionId }
   * @returns {Object} - { result: 'PAID'|'ILLUSTRATIVE', prize?, uiPrize? }
   */
  static async sortearPremioTx({ tx, caixaId, userId, sessionId }) {
    const startTime = Date.now();
    
    try {
      // 1. Carregar todos os prêmios da caixa
      const allPrizes = await tx.prize.findMany({
        where: { 
          case_id: caixaId, 
          ativo: true 
        }
      });
      
      if (!allPrizes.length) {
        throw new Error(`Nenhum prêmio encontrado para caixa ${caixaId}`);
      }
      
      // 2. Filtrar somente prêmios sorteáveis (excluir ilustrativos)
      const basePool = allPrizes.filter(p => p.sorteavel && p.tipo !== 'ilustrativo');
      
      if (!basePool.length) {
        // Se não há prêmios sorteáveis, retornar ilustrativo
        return {
          result: 'ILLUSTRATIVE',
          uiPrize: this.chooseIllustrative(allPrizes)
        };
      }
      
      // 3. Buscar configuração da caixa e RTP
      const caixa = await tx.case.findUnique({
        where: { id: caixaId }
      });
      
      if (!caixa) {
        throw new Error(`Caixa ${caixaId} não encontrada`);
      }
      
      // 4. Buscar configuração global de RTP
      const rtpConfig = await tx.globalRTPConfig.findFirst({
        where: { id: 'default' }
      });
      
      const user = await tx.user.findUnique({
        where: { id: userId }
      });
      
      // 5. Determinar RTP baseado no tipo de conta
      let rtpGlobal;
      if (user?.tipo_conta === 'afiliado_demo') {
        rtpGlobal = rtpConfig?.rtp_demo || config.rtp.demo;
      } else {
        rtpGlobal = rtpConfig?.rtp_global || config.rtp.global;
      }
      
      // 6. Calcular valor esperado por abertura
      const desiredPerOpen = Number(caixa.preco) * (rtpGlobal / 100);
      
      // 7. Calcular valor esperado base dos prêmios
      let E_base = 0;
      for (const prize of basePool) {
        const baseProb = prize.probabilidade || (1 / basePool.length); // heurística se não definido
        const valor = Number(prize.valor_reais || prize.valor);
        E_base += baseProb * valor;
      }
      
      if (E_base <= 0) {
        // Se valor esperado é zero, retornar ilustrativo
        return {
          result: 'ILLUSTRATIVE',
          uiPrize: this.chooseIllustrative(allPrizes)
        };
      }
      
      // 8. Calcular fator de escala
      const scaling = Math.min(1, desiredPerOpen / E_base);
      
      // 9. Gerar número aleatório
      const r = Math.random();
      
      // 10. Decidir se paga prêmio ou mostra ilustrativo
      if (r > scaling) {
        // Não paga - retorna ilustrativo
        await this.logDetalhado({
          tx,
          userId,
          caseId: caixaId,
          sessionId,
          rtpConfig: rtpGlobal,
          expectedValue: desiredPerOpen,
          scalingFactor: scaling,
          randomValue: r,
          resultType: 'ILLUSTRATIVE',
          processingTimeMs: Date.now() - startTime
        });
        
        return {
          result: 'ILLUSTRATIVE',
          uiPrize: this.chooseIllustrative(allPrizes)
        };
      }
      
      // 11. Paga prêmio - sortear usando distribuição de probabilidade
      const chosenPrize = this.samplePrizeFromPool(basePool);
      
      // 12. Verificar controle de sessão (se aplicável)
      if (sessionId) {
        const session = await tx.userSession.findUnique({
          where: { id: sessionId },
          include: { user: true }
        });
        
        if (session) {
          const restanteSessao = session.limite_retorno - session.valor_premios_recebidos;
          const valorPremio = Number(chosenPrize.valor_reais || chosenPrize.valor);
          
          if (valorPremio > restanteSessao) {
            // Excederia limite da sessão - retornar ilustrativo
            await this.logDetalhado({
              tx,
              userId,
              caseId: caixaId,
              sessionId,
              rtpConfig: rtpGlobal,
              expectedValue: desiredPerOpen,
              scalingFactor: scaling,
              randomValue: r,
              resultType: 'ILLUSTRATIVE',
              sessionRemainingBefore: restanteSessao,
              sessionRemainingAfter: restanteSessao,
              processingTimeMs: Date.now() - startTime
            });
            
            return {
              result: 'ILLUSTRATIVE',
              uiPrize: this.chooseIllustrative(allPrizes)
            };
          }
        }
      }
      
      // 13. Log detalhado e retornar prêmio pago
      await this.logDetalhado({
        tx,
        userId,
        caseId: caixaId,
        sessionId,
        rtpConfig: rtpGlobal,
        expectedValue: desiredPerOpen,
        scalingFactor: scaling,
        randomValue: r,
        resultType: 'PAID',
        prizeId: chosenPrize.id,
        prizeValue: Number(chosenPrize.valor_reais || chosenPrize.valor),
        processingTimeMs: Date.now() - startTime
      });
      
      return {
        result: 'PAID',
        prize: chosenPrize
      };
      
    } catch (error) {
      console.error('Erro no motor de sorteio:', error);
      
      // Em caso de erro, retornar ilustrativo como fallback
      return {
        result: 'ILLUSTRATIVE',
        uiPrize: this.chooseIllustrative(allPrizes || [])
      };
    }
  }
  
  /**
   * Escolher prêmio ilustrativo aleatório
   */
  static chooseIllustrative(allPrizes) {
    if (!allPrizes.length) {
      return {
        id: 'fallback',
        nome: 'Prêmio Especial',
        valor: 1000,
        imagem_url: '/imagens/premio-especial.png'
      };
    }
    
    // Preferir prêmios ilustrativos, senão qualquer um
    const ilustrativos = allPrizes.filter(p => p.tipo === 'ilustrativo' || p.valor > 1000);
    const pool = ilustrativos.length ? ilustrativos : allPrizes;
    
    const randomIndex = Math.floor(Math.random() * pool.length);
    return pool[randomIndex];
  }
  
  /**
   * Sortear prêmio do pool baseado na distribuição de probabilidade
   */
  static samplePrizeFromPool(basePool) {
    // Calcular probabilidades normalizadas
    const totalWeight = basePool.reduce((sum, prize) => {
      return sum + (prize.probabilidade || 1);
    }, 0);
    
    if (totalWeight <= 0) {
      // Fallback: escolher aleatório
      const randomIndex = Math.floor(Math.random() * basePool.length);
      return basePool[randomIndex];
    }
    
    // Sortear baseado na probabilidade
    let random = Math.random() * totalWeight;
    
    for (const prize of basePool) {
      const weight = prize.probabilidade || 1;
      random -= weight;
      
      if (random <= 0) {
        return prize;
      }
    }
    
    // Fallback: último prêmio
    return basePool[basePool.length - 1];
  }
  
  /**
   * Log detalhado do sorteio
   */
  static async logDetalhado({
    tx,
    userId,
    caseId,
    sessionId = null,
    purchaseId = null,
    rtpConfig,
    expectedValue,
    scalingFactor,
    randomValue,
    resultType,
    prizeId = null,
    prizeValue = 0,
    sessionRemainingBefore = 0,
    sessionRemainingAfter = 0,
    processingTimeMs
  }) {
    try {
      await tx.drawDetailedLog.create({
        data: {
          user_id: userId,
          case_id: caseId,
          session_id: sessionId,
          purchase_id: purchaseId,
          rtp_config: rtpConfig,
          expected_value: expectedValue,
          scaling_factor: scalingFactor,
          random_value: randomValue,
          result_type: resultType,
          prize_id: prizeId,
          prize_value: prizeValue,
          session_remaining_before: sessionRemainingBefore,
          session_remaining_after: sessionRemainingAfter,
          processing_time_ms: processingTimeMs
        }
      });
    } catch (error) {
      console.error('Erro ao salvar log detalhado:', error);
    }
  }
}

module.exports = SorteioEngine;
