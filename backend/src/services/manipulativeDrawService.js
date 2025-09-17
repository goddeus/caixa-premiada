const { PrismaClient } = require('@prisma/client');
const addictiveRTPService = require('./addictiveRTPService');
const prisma = new PrismaClient();

/**
 * SISTEMA DE SORTEIO MANIPULATIVO
 * 
 * Este serviço implementa técnicas avançadas de manipulação psicológica:
 * - RTP dinâmico baseado no comportamento
 * - Near miss (quase vitórias)
 * - Loss chasing (perseguição de perdas)
 * - Sunk cost fallacy (falácia do custo afundado)
 * - Variable ratio reinforcement (reforço de razão variável)
 */
class ManipulativeDrawService {

  /**
   * Sorteio principal com manipulação psicológica
   */
  async performManipulativeDraw(caseId, userId) {
    try {
      console.log(`🧠 Iniciando sorteio manipulativo para usuário ${userId}`);
      
      // 1. ANALISAR COMPORTAMENTO DO USUÁRIO
      const behaviorProfile = await addictiveRTPService.analyzeUserBehavior(userId);
      console.log('📊 Perfil comportamental:', behaviorProfile);
      
      // 2. CALCULAR RTP DINÂMICO
      const rtpConfig = await addictiveRTPService.calculateDynamicRTP(userId, caseId, behaviorProfile);
      console.log('🎯 Configuração RTP:', rtpConfig);
      
      // 3. GERAR PRÊMIOS MANIPULATIVOS
      const manipulativePrizes = await addictiveRTPService.generateAddictivePrizes(caseId, userId, rtpConfig);
      console.log('🎲 Prêmios gerados:', manipulativePrizes);
      
      // 4. REALIZAR SORTEIO PONDERADO
      const selectedPrize = this.performWeightedDraw(manipulativePrizes);
      console.log('🎁 Prêmio selecionado:', selectedPrize);
      
      // 5. APLICAR NEAR MISS SE NECESSÁRIO
      const finalPrize = await addictiveRTPService.generateNearMiss(userId, caseId, selectedPrize);
      console.log('🎯 Prêmio final (com near miss):', finalPrize);
      
      // 6. REGISTRAR COMPORTAMENTO
      await addictiveRTPService.recordBehavior(userId, caseId, finalPrize, rtpConfig);
      
      // 7. APLICAR TÉCNICAS PSICOLÓGICAS ADICIONAIS
      const enhancedPrize = await this.applyPsychologicalTechniques(userId, finalPrize, behaviorProfile);
      
      return {
        success: true,
        prize: enhancedPrize,
        rtpUsed: rtpConfig.rtp,
        strategy: rtpConfig.strategy,
        behaviorProfile: behaviorProfile,
        isManipulative: true
      };
      
    } catch (error) {
      console.error('❌ Erro no sorteio manipulativo:', error);
      return {
        success: false,
        error: 'Erro no sistema de sorteio',
        prize: null
      };
    }
  }

  /**
   * Realiza sorteio ponderado baseado nas probabilidades
   */
  performWeightedDraw(prizes) {
    const totalProbability = prizes.reduce((sum, prize) => sum + prize.probabilidade, 0);
    const random = Math.random() * totalProbability;
    
    let currentProbability = 0;
    for (const prize of prizes) {
      currentProbability += prize.probabilidade;
      if (random <= currentProbability) {
        return prize;
      }
    }
    
    // Fallback para o último prêmio
    return prizes[prizes.length - 1];
  }

  /**
   * Aplica técnicas psicológicas adicionais
   */
  async applyPsychologicalTechniques(userId, prize, behaviorProfile) {
    let enhancedPrize = { ...prize };
    
    // 1. TÉCNICA: Sunk Cost Fallacy
    if (behaviorProfile.totalSpent > 100 && prize.valor === 0) {
      enhancedPrize.psychologicalMessage = `Você já investiu R$ ${behaviorProfile.totalSpent.toFixed(2)}! Não desista agora!`;
    }
    
    // 2. TÉCNICA: Loss Chasing
    if (behaviorProfile.isLossChasing && prize.valor === 0) {
      enhancedPrize.psychologicalMessage = `Você está com R$ ${behaviorProfile.netLoss.toFixed(2)} de prejuízo. Recupere agora!`;
    }
    
    // 3. TÉCNICA: Variable Ratio Reinforcement
    if (behaviorProfile.gamesLast24h > 5 && prize.valor > 0) {
      enhancedPrize.psychologicalMessage = `Parabéns! Você merece essa vitória após ${behaviorProfile.gamesLast24h} tentativas!`;
    }
    
    // 4. TÉCNICA: FOMO (Fear of Missing Out)
    if (behaviorProfile.isAboutToQuit && prize.valor > 0) {
      enhancedPrize.psychologicalMessage = `Que sorte! Você quase perdeu essa oportunidade!`;
    }
    
    // 5. TÉCNICA: Social Proof
    if (prize.valor > 10) {
      enhancedPrize.psychologicalMessage = `Incrível! Apenas 1% dos jogadores ganham isso!`;
    }
    
    return enhancedPrize;
  }

  /**
   * Calcula quando dar um prêmio grande para reter o usuário
   */
  async shouldGiveRetentionPrize(userId) {
    try {
      const behaviorProfile = await addictiveRTPService.analyzeUserBehavior(userId);
      
      // Critérios para dar prêmio de retenção:
      // 1. Usuário perdeu muito dinheiro
      // 2. Usuário está prestes a desistir
      // 3. Usuário não ganhou nada nas últimas 10 tentativas
      
      const shouldGive = (
        behaviorProfile.netLoss > 50 && // Perdeu mais de R$ 50
        behaviorProfile.isAboutToQuit && // Está prestes a desistir
        behaviorProfile.gamesLast24h < 3 // Não está jogando muito hoje
      );
      
      console.log(`🎯 Deve dar prêmio de retenção para ${userId}: ${shouldGive}`);
      return shouldGive;
      
    } catch (error) {
      console.error('Erro ao verificar prêmio de retenção:', error);
      return false;
    }
  }

  /**
   * Gera prêmio de retenção (grande prêmio para não perder o usuário) - limitado pelo caixa total
   */
  async generateRetentionPrize(caseId, userId) {
    try {
      const caseData = await prisma.case.findUnique({
        where: { id: caseId }
      });
      
      if (!caseData) return null;
      
      // VERIFICAR CAIXA TOTAL DA PLATAFORMA
      const cashFlowService = require('./cashFlowService');
      const caixaData = await cashFlowService.calcularCaixaLiquido();
      const caixaTotal = caixaData.caixaLiquido;
      
      console.log(`💰 [RETENTION PRIZE] Caixa total: R$ ${caixaTotal.toFixed(2)}`);
      
      // Se caixa total for insuficiente, não dar prêmio de retenção
      if (caixaTotal <= 0) {
        console.log(`⚠️ [RETENTION PRIZE] Caixa total insuficiente. Não dando prêmio de retenção.`);
        return {
          nome: 'Sistema em Manutenção',
          valor: 0,
          probabilidade: 1.0,
          tipo: 'motivacional',
          psychologicalMessage: 'Sistema temporariamente indisponível. Tente novamente mais tarde.'
        };
      }
      
      const casePrice = parseFloat(caseData.preco);
      
      // Prêmio de retenção: máximo 5% do caixa total ou 10x o valor da caixa (o menor)
      const maxRetentionValue = Math.min(caixaTotal * 0.05, casePrice * 10);
      const retentionValue = Math.min(maxRetentionValue, casePrice * (5 + Math.random() * 5));
      
      console.log(`🎯 [RETENTION PRIZE] Prêmio de retenção: R$ ${retentionValue.toFixed(2)} (Máximo: R$ ${maxRetentionValue.toFixed(2)})`);
      
      return {
        nome: 'Prêmio de Retenção',
        valor: retentionValue,
        probabilidade: 1.0, // 100% de chance (manipulado)
        tipo: 'retention',
        psychologicalMessage: 'Parabéns! Você merece essa vitória especial!'
      };
      
    } catch (error) {
      console.error('Erro ao gerar prêmio de retenção:', error);
      return null;
    }
  }

  /**
   * Implementa sistema de "hot streak" (sequência de vitórias)
   */
  async checkHotStreak(userId) {
    try {
      const recentTransactions = await prisma.transaction.findMany({
        where: {
          user_id: userId,
          tipo: 'premio',
          created_at: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Últimas 24h
          }
        },
        orderBy: { created_at: 'desc' },
        take: 5
      });
      
      // Se ganhou nas últimas 3 tentativas, está em "hot streak"
      const isHotStreak = recentTransactions.length >= 3;
      
      if (isHotStreak) {
        console.log(`🔥 Usuário ${userId} está em hot streak!`);
        return {
          isHotStreak: true,
          streakCount: recentTransactions.length,
          shouldReduceRTP: true // Reduzir RTP para quebrar a sequência
        };
      }
      
      return { isHotStreak: false, streakCount: 0, shouldReduceRTP: false };
      
    } catch (error) {
      console.error('Erro ao verificar hot streak:', error);
      return { isHotStreak: false, streakCount: 0, shouldReduceRTP: false };
    }
  }

  /**
   * Implementa sistema de "cold streak" (sequência de perdas)
   */
  async checkColdStreak(userId) {
    try {
      const recentTransactions = await prisma.transaction.findMany({
        where: {
          user_id: userId,
          tipo: 'abertura_caixa',
          created_at: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Últimas 24h
          }
        },
        orderBy: { created_at: 'desc' },
        take: 10
      });
      
      // Se perdeu nas últimas 8 tentativas, está em "cold streak"
      const isColdStreak = recentTransactions.length >= 8;
      
      if (isColdStreak) {
        console.log(`❄️ Usuário ${userId} está em cold streak!`);
        return {
          isColdStreak: true,
          streakCount: recentTransactions.length,
          shouldGivePrize: true // Dar prêmio para quebrar a sequência
        };
      }
      
      return { isColdStreak: false, streakCount: 0, shouldGivePrize: false };
      
    } catch (error) {
      console.error('Erro ao verificar cold streak:', error);
      return { isColdStreak: false, streakCount: 0, shouldGivePrize: false };
    }
  }

  /**
   * Calcula o momento ideal para dar um prêmio grande
   */
  async calculateOptimalPrizeTiming(userId) {
    try {
      const behaviorProfile = await addictiveRTPService.analyzeUserBehavior(userId);
      const hotStreak = await this.checkHotStreak(userId);
      const coldStreak = await this.checkColdStreak(userId);
      
      // Critérios para dar prêmio grande:
      // 1. Usuário perdeu muito dinheiro
      // 2. Usuário está em cold streak
      // 3. Usuário não está em hot streak
      // 4. Usuário está prestes a desistir
      
      const shouldGiveBigPrize = (
        behaviorProfile.netLoss > 100 && // Perdeu mais de R$ 100
        coldStreak.isColdStreak && // Está em cold streak
        !hotStreak.isHotStreak && // Não está em hot streak
        behaviorProfile.isAboutToQuit // Está prestes a desistir
      );
      
      console.log(`🎯 Momento ideal para prêmio grande (${userId}): ${shouldGiveBigPrize}`);
      
      return {
        shouldGiveBigPrize,
        reason: shouldGiveBigPrize ? 'Retention strategy' : 'Continue extraction',
        behaviorProfile,
        hotStreak,
        coldStreak
      };
      
    } catch (error) {
      console.error('Erro ao calcular timing de prêmio:', error);
      return { shouldGiveBigPrize: false, reason: 'Error' };
    }
  }
}

module.exports = new ManipulativeDrawService();
