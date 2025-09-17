const { PrismaClient } = require('@prisma/client');
const cashFlowService = require('./cashFlowService');
const prisma = new PrismaClient();

/**
 * SISTEMA RTP VICIANTE E MANIPULATIVO
 * 
 * Este sistema implementa técnicas psicológicas avançadas para maximizar
 * a retenção e os lucros, baseado em:
 * - Recompensas intermitentes (dopamina)
 * - Loss chasing (perseguição de perdas)
 * - Near miss (quase vitórias)
 * - RTP dinâmico baseado no comportamento
 * - Sunk cost fallacy (falácia do custo afundado)
 */
class AddictiveRTPService {

  /**
   * Calcula RTP dinâmico baseado no perfil comportamental do usuário
   */
  async calculateDynamicRTP(userId, caseId, userBehavior) {
    try {
      // 1. ANALISAR COMPORTAMENTO DO USUÁRIO
      const behaviorProfile = await this.analyzeUserBehavior(userId);
      
      // 2. CALCULAR RTP BASEADO NO PERFIL
      let baseRTP = 0.15; // RTP base muito baixo (15%)
      
      // Ajustar RTP baseado no comportamento
      if (behaviorProfile.isNewUser) {
        // Usuários novos: RTP alto para criar vício
        baseRTP = 0.45; // 45% para os primeiros jogos
      } else if (behaviorProfile.isLossChasing) {
        // Usuário perseguindo perdas: RTP baixo para maximizar lucro
        baseRTP = 0.08; // 8% - quase impossível ganhar
      } else if (behaviorProfile.isHighFrequency) {
        // Usuário frequente: RTP médio para manter engajamento
        baseRTP = 0.20; // 20%
      } else if (behaviorProfile.isAboutToQuit) {
        // Usuário prestes a desistir: RTP alto para reter
        baseRTP = 0.60; // 60% - "sorte" para não sair
      }
      
      // 3. APLICAR MULTIPLICADORES PSICOLÓGICOS
      const psychologicalMultipliers = this.calculatePsychologicalMultipliers(behaviorProfile);
      
      // 4. RTP FINAL (com cap mínimo de 5% e máximo de 80%)
      const finalRTP = Math.max(0.05, Math.min(0.80, baseRTP * psychologicalMultipliers));
      
      console.log(`🧠 RTP Dinâmico para usuário ${userId}:`);
      console.log(`   - RTP Base: ${(baseRTP * 100).toFixed(1)}%`);
      console.log(`   - Multiplicador Psicológico: ${psychologicalMultipliers.toFixed(2)}x`);
      console.log(`   - RTP Final: ${(finalRTP * 100).toFixed(1)}%`);
      
      return {
        rtp: finalRTP,
        behaviorProfile,
        psychologicalMultipliers,
        strategy: this.getStrategy(behaviorProfile)
      };
      
    } catch (error) {
      console.error('Erro ao calcular RTP dinâmico:', error);
      return { rtp: 0.15, behaviorProfile: {}, psychologicalMultipliers: 1, strategy: 'default' };
    }
  }

  /**
   * Analisa o comportamento do usuário para determinar estratégia
   */
  async analyzeUserBehavior(userId) {
    try {
      // Buscar dados do usuário
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          transactions: {
            where: { tipo: { in: ['abertura_caixa', 'premio'] } },
            orderBy: { created_at: 'desc' },
            take: 50
          }
        }
      });

      if (!user) {
        return { isNewUser: true, isLossChasing: false, isHighFrequency: false, isAboutToQuit: false };
      }

      const transactions = user.transactions;
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Calcular métricas comportamentais
      const totalSpent = transactions
        .filter(t => t.tipo === 'abertura_caixa')
        .reduce((sum, t) => sum + Math.abs(t.valor), 0);
      
      const totalWon = transactions
        .filter(t => t.tipo === 'premio')
        .reduce((sum, t) => sum + t.valor, 0);
      
      const netLoss = totalSpent - totalWon;
      const lossPercentage = totalSpent > 0 ? (netLoss / totalSpent) * 100 : 0;
      
      const gamesLast24h = transactions
        .filter(t => t.tipo === 'abertura_caixa' && t.created_at >= oneDayAgo)
        .length;
      
      const gamesLastWeek = transactions
        .filter(t => t.tipo === 'abertura_caixa' && t.created_at >= oneWeekAgo)
        .length;

      // Determinar perfil comportamental
      const isNewUser = transactions.length < 10;
      const isLossChasing = lossPercentage > 70 && gamesLast24h > 5;
      const isHighFrequency = gamesLastWeek > 20;
      const isAboutToQuit = lossPercentage > 80 && gamesLast24h < 2;

      return {
        isNewUser,
        isLossChasing,
        isHighFrequency,
        isAboutToQuit,
        totalSpent,
        totalWon,
        netLoss,
        lossPercentage,
        gamesLast24h,
        gamesLastWeek,
        currentBalance: user.saldo_reais || 0
      };
      
    } catch (error) {
      console.error('Erro ao analisar comportamento:', error);
      return { isNewUser: true, isLossChasing: false, isHighFrequency: false, isAboutToQuit: false };
    }
  }

  /**
   * Calcula multiplicadores psicológicos baseados no comportamento
   */
  calculatePsychologicalMultipliers(behaviorProfile) {
    let multiplier = 1.0;

    // Multiplicador por perfil
    if (behaviorProfile.isNewUser) {
      multiplier *= 1.5; // 50% mais chances para novos usuários
    } else if (behaviorProfile.isLossChasing) {
      multiplier *= 0.3; // 70% menos chances para quem persegue perdas
    } else if (behaviorProfile.isAboutToQuit) {
      multiplier *= 2.0; // 100% mais chances para reter usuário
    }

    // Multiplicador por frequência
    if (behaviorProfile.gamesLast24h > 10) {
      multiplier *= 0.7; // Usuário muito ativo = menos chances
    } else if (behaviorProfile.gamesLast24h < 2) {
      multiplier *= 1.3; // Usuário inativo = mais chances para reativar
    }

    // Multiplicador por perda
    if (behaviorProfile.lossPercentage > 90) {
      multiplier *= 0.2; // Perdeu muito = quase impossível ganhar
    } else if (behaviorProfile.lossPercentage < 30) {
      multiplier *= 0.8; // Ganhou muito = reduzir chances
    }

    return Math.max(0.1, Math.min(3.0, multiplier));
  }

  /**
   * Determina estratégia baseada no perfil
   */
  getStrategy(behaviorProfile) {
    if (behaviorProfile.isNewUser) return 'honeymoon';
    if (behaviorProfile.isLossChasing) return 'extraction';
    if (behaviorProfile.isAboutToQuit) return 'retention';
    if (behaviorProfile.isHighFrequency) return 'maintenance';
    return 'default';
  }

  /**
   * Gera prêmios baseados no RTP dinâmico com verificação de caixa total
   */
  async generateAddictivePrizes(caseId, userId, rtpConfig) {
    try {
      const caseData = await prisma.case.findUnique({
        where: { id: caseId },
        include: { prizes: { where: { ativo: true } } }
      });

      if (!caseData) return [];

      // VERIFICAR CAIXA TOTAL DA PLATAFORMA
      const caixaData = await cashFlowService.calcularCaixaLiquido();
      const caixaTotal = caixaData.caixaLiquido;
      
      console.log(`💰 [MANIPULATIVE] Caixa total da plataforma: R$ ${caixaTotal.toFixed(2)}`);
      
      // Se caixa total for negativo ou muito baixo, limitar prêmios
      if (caixaTotal <= 0) {
        console.log(`⚠️ [MANIPULATIVE] Caixa total insuficiente (R$ ${caixaTotal.toFixed(2)}). Limitando prêmios.`);
        return this.generateEmergencyPrizes(caseData);
      }

      const rtp = rtpConfig.rtp;
      const strategy = rtpConfig.strategy;
      
      // Gerar prêmios baseados na estratégia
      let prizes = [];
      
      switch (strategy) {
        case 'honeymoon':
          prizes = this.generateHoneymoonPrizes(caseData, rtp, caixaTotal);
          break;
        case 'extraction':
          prizes = this.generateExtractionPrizes(caseData, rtp, caixaTotal);
          break;
        case 'retention':
          prizes = this.generateRetentionPrizes(caseData, rtp, caixaTotal);
          break;
        case 'maintenance':
          prizes = this.generateMaintenancePrizes(caseData, rtp, caixaTotal);
          break;
        default:
          prizes = this.generateDefaultPrizes(caseData, rtp, caixaTotal);
      }

      return prizes;
      
    } catch (error) {
      console.error('Erro ao gerar prêmios viciantes:', error);
      return [];
    }
  }

  /**
   * Estratégia Honeymoon: Novos usuários ganham muito (limitado pelo caixa total)
   */
  generateHoneymoonPrizes(caseData, rtp, caixaTotal) {
    const prizes = [];
    const casePrice = parseFloat(caseData.preco);
    
    // Calcular prêmio máximo baseado no caixa total (máximo 1% do caixa total)
    const maxPrize = Math.min(caixaTotal * 0.01, 50); // Máximo 1% do caixa ou R$ 50
    
    console.log(`🎯 [HONEYMOON] Prêmio máximo permitido: R$ ${maxPrize.toFixed(2)} (Caixa: R$ ${caixaTotal.toFixed(2)})`);
    
    // 60% de chance de ganhar algo (limitado pelo caixa)
    const prize1 = Math.min(1.00, maxPrize);
    const prize2 = Math.min(2.00, maxPrize);
    const prize3 = Math.min(5.00, maxPrize);
    
    if (prize1 > 0) {
      prizes.push({
        nome: `R$ ${prize1.toFixed(2)}`,
        valor: prize1,
        probabilidade: 0.3,
        tipo: 'cash'
      });
    }
    
    if (prize2 > 0) {
      prizes.push({
        nome: `R$ ${prize2.toFixed(2)}`, 
        valor: prize2,
        probabilidade: 0.2,
        tipo: 'cash'
      });
    }
    
    if (prize3 > 0) {
      prizes.push({
        nome: `R$ ${prize3.toFixed(2)}`,
        valor: prize3,
        probabilidade: 0.1,
        tipo: 'cash'
      });
    }
    
    // Ajustar probabilidade de não ganhar baseado nos prêmios disponíveis
    const totalWinProbability = prizes.reduce((sum, p) => sum + p.probabilidade, 0);
    const noWinProbability = Math.max(0.4, 1 - totalWinProbability);
    
    prizes.push({
      nome: 'Tente Novamente',
      valor: 0,
      probabilidade: noWinProbability,
      tipo: 'motivacional'
    });
    
    return prizes;
  }

  /**
   * Estratégia Extraction: Usuários perseguindo perdas perdem tudo (limitado pelo caixa total)
   */
  generateExtractionPrizes(caseData, rtp, caixaTotal) {
    const prizes = [];
    
    // Calcular prêmio máximo baseado no caixa total (máximo 0.1% do caixa total)
    const maxPrize = Math.min(caixaTotal * 0.001, 1); // Máximo 0.1% do caixa ou R$ 1
    
    console.log(`🎯 [EXTRACTION] Prêmio máximo permitido: R$ ${maxPrize.toFixed(2)} (Caixa: R$ ${caixaTotal.toFixed(2)})`);
    
    // 90% de chance de não ganhar nada
    prizes.push({
      nome: 'Quase Ganhou',
      valor: 0,
      probabilidade: 0.9,
      tipo: 'motivacional'
    });
    
    // 10% de chance de ganhar pouco (limitado pelo caixa)
    if (maxPrize > 0) {
      prizes.push({
        nome: `R$ ${maxPrize.toFixed(2)}`,
        valor: maxPrize,
        probabilidade: 0.1,
        tipo: 'cash'
      });
    } else {
      // Se não há caixa, 100% de chance de não ganhar
      prizes[0].probabilidade = 1.0;
    }
    
    return prizes;
  }

  /**
   * Estratégia Retention: Usuários prestes a sair ganham para ficar (limitado pelo caixa total)
   */
  generateRetentionPrizes(caseData, rtp, caixaTotal) {
    const prizes = [];
    const casePrice = parseFloat(caseData.preco);
    
    // Calcular prêmio máximo baseado no caixa total (máximo 2% do caixa total)
    const maxPrize = Math.min(caixaTotal * 0.02, 100); // Máximo 2% do caixa ou R$ 100
    
    console.log(`🎯 [RETENTION] Prêmio máximo permitido: R$ ${maxPrize.toFixed(2)} (Caixa: R$ ${caixaTotal.toFixed(2)})`);
    
    // 70% de chance de ganhar (limitado pelo caixa)
    const prize1 = Math.min(2.00, maxPrize);
    const prize2 = Math.min(5.00, maxPrize);
    
    if (prize1 > 0) {
      prizes.push({
        nome: `R$ ${prize1.toFixed(2)}`,
        valor: prize1,
        probabilidade: 0.4,
        tipo: 'cash'
      });
    }
    
    if (prize2 > 0) {
      prizes.push({
        nome: `R$ ${prize2.toFixed(2)}`,
        valor: prize2,
        probabilidade: 0.3,
        tipo: 'cash'
      });
    }
    
    // Ajustar probabilidade de não ganhar baseado nos prêmios disponíveis
    const totalWinProbability = prizes.reduce((sum, p) => sum + p.probabilidade, 0);
    const noWinProbability = Math.max(0.3, 1 - totalWinProbability);
    
    prizes.push({
      nome: 'Continue Tentando',
      valor: 0,
      probabilidade: noWinProbability,
      tipo: 'motivacional'
    });
    
    return prizes;
  }

  /**
   * Estratégia Maintenance: Usuários frequentes mantêm engajamento (limitado pelo caixa total)
   */
  generateMaintenancePrizes(caseData, rtp, caixaTotal) {
    const prizes = [];
    
    // Calcular prêmio máximo baseado no caixa total (máximo 0.5% do caixa total)
    const maxPrize = Math.min(caixaTotal * 0.005, 5); // Máximo 0.5% do caixa ou R$ 5
    
    console.log(`🎯 [MAINTENANCE] Prêmio máximo permitido: R$ ${maxPrize.toFixed(2)} (Caixa: R$ ${caixaTotal.toFixed(2)})`);
    
    // 50% de chance de ganhar pouco (limitado pelo caixa)
    if (maxPrize > 0) {
      prizes.push({
        nome: `R$ ${maxPrize.toFixed(2)}`,
        valor: maxPrize,
        probabilidade: 0.5,
        tipo: 'cash'
      });
    }
    
    // Ajustar probabilidade de não ganhar baseado no prêmio disponível
    const noWinProbability = maxPrize > 0 ? 0.5 : 1.0;
    
    prizes.push({
      nome: 'A Sorte Vem',
      valor: 0,
      probabilidade: noWinProbability,
      tipo: 'motivacional'
    });
    
    return prizes;
  }

  /**
   * Estratégia Default: RTP baixo padrão (limitado pelo caixa total)
   */
  generateDefaultPrizes(caseData, rtp, caixaTotal) {
    const prizes = [];
    
    // Calcular prêmio máximo baseado no caixa total (máximo 0.1% do caixa total)
    const maxPrize = Math.min(caixaTotal * 0.001, 1); // Máximo 0.1% do caixa ou R$ 1
    
    console.log(`🎯 [DEFAULT] Prêmio máximo permitido: R$ ${maxPrize.toFixed(2)} (Caixa: R$ ${caixaTotal.toFixed(2)})`);
    
    // 80% de chance de não ganhar
    prizes.push({
      nome: 'Tente Novamente',
      valor: 0,
      probabilidade: 0.8,
      tipo: 'motivacional'
    });
    
    // 20% de chance de ganhar pouco (limitado pelo caixa)
    if (maxPrize > 0) {
      prizes.push({
        nome: `R$ ${maxPrize.toFixed(2)}`,
        valor: maxPrize,
        probabilidade: 0.2,
        tipo: 'cash'
      });
    } else {
      // Se não há caixa, 100% de chance de não ganhar
      prizes[0].probabilidade = 1.0;
    }
    
    return prizes;
  }

  /**
   * Estratégia Emergency: Quando caixa total é insuficiente
   */
  generateEmergencyPrizes(caseData) {
    console.log(`🚨 [EMERGENCY] Caixa total insuficiente. Apenas prêmios motivacionais.`);
    
    return [{
      nome: 'Sistema em Manutenção',
      valor: 0,
      probabilidade: 1.0,
      tipo: 'motivacional'
    }];
  }

  /**
   * Implementa sistema de Near Miss (quase vitórias)
   */
  async generateNearMiss(userId, caseId, selectedPrize) {
    try {
      const behaviorProfile = await this.analyzeUserBehavior(userId);
      
      // Se usuário está perseguindo perdas, mostrar quase vitórias
      if (behaviorProfile.isLossChasing && selectedPrize.valor === 0) {
        const nearMissMessages = [
          'Quase ganhou o prêmio principal!',
          'Foi por pouco! Tente novamente!',
          'Você estava tão perto!',
          'A sorte está chegando!',
          'Mais uma tentativa e você ganha!'
        ];
        
        const randomMessage = nearMissMessages[Math.floor(Math.random() * nearMissMessages.length)];
        
        return {
          ...selectedPrize,
          nome: randomMessage,
          isNearMiss: true
        };
      }
      
      return selectedPrize;
      
    } catch (error) {
      console.error('Erro ao gerar near miss:', error);
      return selectedPrize;
    }
  }

  /**
   * Registra comportamento para análise futura
   */
  async recordBehavior(userId, caseId, prize, rtpConfig) {
    try {
      await prisma.userBehavior.create({
        data: {
          user_id: userId,
          case_id: caseId,
          prize_value: prize.valor,
          rtp_used: rtpConfig.rtp,
          strategy: rtpConfig.strategy,
          timestamp: new Date()
        }
      });
    } catch (error) {
      console.error('Erro ao registrar comportamento:', error);
    }
  }
}

module.exports = new AddictiveRTPService();
