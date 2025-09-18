const { PrismaClient } = require('@prisma/client');
// Sistema de sorteio simplificado implementado diretamente no controller
const prisma = new PrismaClient();

class CasesController {
  // Dados estáticos das caixas (fallback quando banco não está disponível)
  getStaticCaseData(caseId) {
    const staticCases = {
      '1abd77cf-472b-473d-9af0-6cd47f9f1452': {
        id: '1abd77cf-472b-473d-9af0-6cd47f9f1452',
        nome: 'CAIXA FINAL DE SEMANA',
        preco: 1.5,
        ativo: true,
        prizes: [
          { id: '1', nome: 'R$ 0,50', valor: 0.5, probabilidade: 0.3 },
          { id: '2', nome: 'R$ 1,00', valor: 1.0, probabilidade: 0.2 },
          { id: '3', nome: 'R$ 2,00', valor: 2.0, probabilidade: 0.1 },
          { id: '4', nome: 'R$ 5,00', valor: 5.0, probabilidade: 0.05 },
          { id: '5', nome: 'R$ 10,00', valor: 10.0, probabilidade: 0.02 },
          { id: '6', nome: 'Nada', valor: 0, probabilidade: 0.33 }
        ]
      },
      '0b5e9b8a-9d56-4769-a45a-55a3025640f4': {
        id: '0b5e9b8a-9d56-4769-a45a-55a3025640f4',
        nome: 'CAIXA KIT NIKE',
        preco: 2.5,
        ativo: true,
        prizes: [
          { id: 'nike_1', nome: 'R$ 1,00', valor: 1.0, probabilidade: 0.25 },
          { id: 'nike_2', nome: 'R$ 2,00', valor: 2.0, probabilidade: 0.2 },
          { id: 'nike_3', nome: 'R$ 5,00', valor: 5.0, probabilidade: 0.15 },
          { id: 'nike_4', nome: 'R$ 10,00', valor: 10.0, probabilidade: 0.1 },
          { id: 'nike_5', nome: 'AIR FORCE 1', valor: 500.0, probabilidade: 0.001, tipo: 'ilustrativo' },
          { id: 'nike_6', nome: 'BONÉ NIKE', valor: 50.0, probabilidade: 0.001, tipo: 'ilustrativo' },
          { id: 'nike_7', nome: 'CAMISA NIKE', valor: 100.0, probabilidade: 0.001, tipo: 'ilustrativo' },
          { id: 'nike_8', nome: 'JORDAN', valor: 1500.0, probabilidade: 0.001, tipo: 'ilustrativo' },
          { id: 'nike_9', nome: 'NIKE DUNK', valor: 600.0, probabilidade: 0.001, tipo: 'ilustrativo' },
          { id: 'nike_10', nome: 'Nada', valor: 0, probabilidade: 0.243 }
        ]
      },
      '3f2a9f7a-cb4d-47e7-991a-0e72c0e0f415': {
        id: '3f2a9f7a-cb4d-47e7-991a-0e72c0e0f415',
        nome: 'CAIXA SAMSUNG',
        preco: 3.0,
        ativo: true,
        prizes: [
          { id: 'samsung_1', nome: 'R$ 1,00', valor: 1.0, probabilidade: 0.3 },
          { id: 'samsung_2', nome: 'R$ 2,00', valor: 2.0, probabilidade: 0.25 },
          { id: 'samsung_3', nome: 'R$ 5,00', valor: 5.0, probabilidade: 0.2 },
          { id: 'samsung_4', nome: 'R$ 10,00', valor: 10.0, probabilidade: 0.15 },
          { id: 'samsung_5', nome: 'R$ 100,00', valor: 100.0, probabilidade: 0.05 },
          { id: 'samsung_6', nome: 'R$ 500,00', valor: 500.0, probabilidade: 0.02 },
          { id: 'samsung_7', nome: 'FONE SAMSUNG', valor: 200.0, probabilidade: 0.001, tipo: 'ilustrativo' },
          { id: 'samsung_8', nome: 'NOTEBOOK SAMSUNG', valor: 3000.0, probabilidade: 0.001, tipo: 'ilustrativo' },
          { id: 'samsung_9', nome: 'S25', valor: 4000.0, probabilidade: 0.001, tipo: 'ilustrativo' },
          { id: 'samsung_10', nome: 'Nada', valor: 0, probabilidade: 0.013 }
        ]
      },
      'fb0c0175-b478-4fd5-9750-d673c0f374fd': {
        id: 'fb0c0175-b478-4fd5-9750-d673c0f374fd',
        nome: 'CAIXA CONSOLE DOS SONHOS',
        preco: 3.5,
        ativo: true,
        prizes: [
          { id: 'console_1', nome: 'R$ 1,00', valor: 1.0, probabilidade: 0.3 },
          { id: 'console_2', nome: 'R$ 2,00', valor: 2.0, probabilidade: 0.25 },
          { id: 'console_3', nome: 'R$ 5,00', valor: 5.0, probabilidade: 0.2 },
          { id: 'console_4', nome: 'R$ 10,00', valor: 10.0, probabilidade: 0.15 },
          { id: 'console_5', nome: 'R$ 100,00', valor: 100.0, probabilidade: 0.05 },
          { id: 'console_6', nome: 'PLAYSTATION 5', valor: 5000.0, probabilidade: 0.001, tipo: 'ilustrativo' },
          { id: 'console_7', nome: 'STEAM DECK', valor: 3000.0, probabilidade: 0.001, tipo: 'ilustrativo' },
          { id: 'console_8', nome: 'XBOX ONE X', valor: 3500.0, probabilidade: 0.001, tipo: 'ilustrativo' },
          { id: 'console_9', nome: 'Nada', valor: 0, probabilidade: 0.043 }
        ]
      },
      '61a19df9-d011-429e-a9b5-d2c837551150': {
        id: '61a19df9-d011-429e-a9b5-d2c837551150',
        nome: 'CAIXA APPLE',
        preco: 7.0,
        ativo: true,
        prizes: [
          { id: 'apple_1', nome: 'R$ 1,00', valor: 1.0, probabilidade: 0.3 },
          { id: 'apple_2', nome: 'R$ 2,00', valor: 2.0, probabilidade: 0.25 },
          { id: 'apple_3', nome: 'R$ 5,00', valor: 5.0, probabilidade: 0.2 },
          { id: 'apple_4', nome: 'R$ 10,00', valor: 10.0, probabilidade: 0.15 },
          { id: 'apple_5', nome: 'R$ 500,00', valor: 500.0, probabilidade: 0.05 },
          { id: 'apple_6', nome: 'AIR PODS', valor: 2500.0, probabilidade: 0.001, tipo: 'ilustrativo' },
          { id: 'apple_7', nome: 'IPHONE 16 PRO MAX', valor: 10000.0, probabilidade: 0.001, tipo: 'ilustrativo' },
          { id: 'apple_8', nome: 'MACBOOK', valor: 15000.0, probabilidade: 0.001, tipo: 'ilustrativo' },
          { id: 'apple_9', nome: 'Nada', valor: 0, probabilidade: 0.043 }
        ]
      },
      'db95bb2b-9b3e-444b-964f-547330010a59': {
        id: 'db95bb2b-9b3e-444b-964f-547330010a59',
        nome: 'CAIXA PREMIUM MASTER',
        preco: 15.0,
        ativo: true,
        prizes: [
          { id: 'premium_1', nome: 'R$ 2,00', valor: 2.0, probabilidade: 0.25 },
          { id: 'premium_2', nome: 'R$ 5,00', valor: 5.0, probabilidade: 0.2 },
          { id: 'premium_3', nome: 'R$ 10,00', valor: 10.0, probabilidade: 0.15 },
          { id: 'premium_4', nome: 'R$ 20,00', valor: 20.0, probabilidade: 0.1 },
          { id: 'premium_5', nome: 'R$ 500,00', valor: 500.0, probabilidade: 0.05 },
          { id: 'premium_6', nome: 'AIRPODS', valor: 2500.0, probabilidade: 0.001, tipo: 'ilustrativo' },
          { id: 'premium_7', nome: 'HONDA CG FAN', valor: 8000.0, probabilidade: 0.001, tipo: 'ilustrativo' },
          { id: 'premium_8', nome: 'IPAD', valor: 5000.0, probabilidade: 0.001, tipo: 'ilustrativo' },
          { id: 'premium_9', nome: 'IPHONE 16 PRO MAX', valor: 10000.0, probabilidade: 0.001, tipo: 'ilustrativo' },
          { id: 'premium_10', nome: 'MACBOOK', valor: 15000.0, probabilidade: 0.001, tipo: 'ilustrativo' },
          { id: 'premium_11', nome: 'SAMSUNG S25', valor: 4000.0, probabilidade: 0.001, tipo: 'ilustrativo' },
          { id: 'premium_12', nome: 'Nada', valor: 0, probabilidade: 0.23 }
        ]
      }
    };
    
    return staticCases[caseId] || null;
  }

  // NOVO SISTEMA DE PRÊMIOS - Diferencia contas normais e demo
  getPrizeSystemForUser(caseId, isDemo = false) {
    const caseData = this.getStaticCaseData(caseId);
    if (!caseData) return null;

    // Se for conta demo, usar prêmios específicos para demo (acima de R$50,00)
    if (isDemo) {
      const demoPrizeSystem = {
        ...caseData,
        prizes: this.getDemoPrizes(caseId)
      };
      return demoPrizeSystem;
    }

    // Para contas normais, aplicar novo sistema de prêmios controlados
    const newPrizeSystem = {
      ...caseData,
      prizes: this.getControlledPrizes(caseId)
    };

    return newPrizeSystem;
  }

  // Prêmios específicos para contas demo (apenas acima de R$50,00)
  getDemoPrizes(caseId) {
    console.log(`🔍 Buscando prêmios demo para caseId: ${caseId}`);
    
    const demoPrizes = {
      '1abd77cf-472b-473d-9af0-6cd47f9f1452': [ // CAIXA WEEKEND (R$1,50)
        { id: 'weekend_demo_1', nome: 'R$ 50,00', valor: 50.0, probabilidade: 0.3 },
        { id: 'weekend_demo_2', nome: 'R$ 100,00', valor: 100.0, probabilidade: 0.2 },
        { id: 'weekend_demo_3', nome: 'R$ 200,00', valor: 200.0, probabilidade: 0.1 },
        { id: 'weekend_demo_4', nome: 'R$ 500,00', valor: 500.0, probabilidade: 0.05 },
        { id: 'weekend_demo_5', nome: 'R$ 1000,00', valor: 1000.0, probabilidade: 0.02 },
        { id: 'weekend_demo_6', nome: 'Nada', valor: 0, probabilidade: 0.33 }
      ],
      '0b5e9b8a-9d56-4769-a45a-55a3025640f4': [ // CAIXA NIKE (R$2,50)
        { id: 'nike_demo_1', nome: 'R$ 50,00', valor: 50.0, probabilidade: 0.25 },
        { id: 'nike_demo_2', nome: 'R$ 100,00', valor: 100.0, probabilidade: 0.2 },
        { id: 'nike_demo_3', nome: 'R$ 250,00', valor: 250.0, probabilidade: 0.15 },
        { id: 'nike_demo_4', nome: 'R$ 500,00', valor: 500.0, probabilidade: 0.1 },
        { id: 'nike_demo_5', nome: 'R$ 1000,00', valor: 1000.0, probabilidade: 0.05 },
        { id: 'nike_demo_6', nome: 'Nada', valor: 0, probabilidade: 0.25 }
      ],
      '3f2a9f7a-cb4d-47e7-991a-0e72c0e0f415': [ // CAIXA SAMSUNG (R$3,00)
        { id: 'samsung_demo_1', nome: 'R$ 50,00', valor: 50.0, probabilidade: 0.3 },
        { id: 'samsung_demo_2', nome: 'R$ 100,00', valor: 100.0, probabilidade: 0.2 },
        { id: 'samsung_demo_3', nome: 'R$ 300,00', valor: 300.0, probabilidade: 0.15 },
        { id: 'samsung_demo_4', nome: 'R$ 500,00', valor: 500.0, probabilidade: 0.1 },
        { id: 'samsung_demo_5', nome: 'R$ 1000,00', valor: 1000.0, probabilidade: 0.05 },
        { id: 'samsung_demo_6', nome: 'Nada', valor: 0, probabilidade: 0.2 }
      ],
      'fb0c0175-b478-4fd5-9750-d673c0f374fd': [ // CAIXA CONSOLE (R$3,50)
        { id: 'console_demo_1', nome: 'R$ 50,00', valor: 50.0, probabilidade: 0.25 },
        { id: 'console_demo_2', nome: 'R$ 100,00', valor: 100.0, probabilidade: 0.2 },
        { id: 'console_demo_3', nome: 'R$ 350,00', valor: 350.0, probabilidade: 0.15 },
        { id: 'console_demo_4', nome: 'R$ 500,00', valor: 500.0, probabilidade: 0.1 },
        { id: 'console_demo_5', nome: 'R$ 1000,00', valor: 1000.0, probabilidade: 0.05 },
        { id: 'console_demo_6', nome: 'Nada', valor: 0, probabilidade: 0.25 }
      ],
      '61a19df9-d011-429e-a9b5-d2c837551150': [ // CAIXA APPLE (R$7,00)
        { id: 'apple_demo_1', nome: 'R$ 50,00', valor: 50.0, probabilidade: 0.3 },
        { id: 'apple_demo_2', nome: 'R$ 100,00', valor: 100.0, probabilidade: 0.2 },
        { id: 'apple_demo_3', nome: 'R$ 500,00', valor: 500.0, probabilidade: 0.15 },
        { id: 'apple_demo_4', nome: 'R$ 1000,00', valor: 1000.0, probabilidade: 0.1 },
        { id: 'apple_demo_5', nome: 'R$ 2000,00', valor: 2000.0, probabilidade: 0.05 },
        { id: 'apple_demo_6', nome: 'Nada', valor: 0, probabilidade: 0.2 }
      ],
      'db95bb2b-9b3e-444b-964f-547330010a59': [ // CAIXA PREMIUM MASTER (R$15,00)
        { id: 'premium_demo_1', nome: 'R$ 50,00', valor: 50.0, probabilidade: 0.25 },
        { id: 'premium_demo_2', nome: 'R$ 100,00', valor: 100.0, probabilidade: 0.2 },
        { id: 'premium_demo_3', nome: 'R$ 500,00', valor: 500.0, probabilidade: 0.15 },
        { id: 'premium_demo_4', nome: 'R$ 1000,00', valor: 1000.0, probabilidade: 0.1 },
        { id: 'premium_demo_5', nome: 'R$ 2000,00', valor: 2000.0, probabilidade: 0.05 },
        { id: 'premium_demo_6', nome: 'Nada', valor: 0, probabilidade: 0.25 }
      ]
    };

    const prizes = demoPrizes[caseId];
    console.log(`🎯 Prêmios demo encontrados para ${caseId}:`, prizes ? prizes.length : 0);
    
    if (!prizes) {
      console.log(`⚠️ Nenhum prêmio demo encontrado para ${caseId}, usando fallback`);
      const fallbackPrizes = this.getStaticCaseData(caseId)?.prizes || [];
      console.log(`🔄 Prêmios fallback:`, fallbackPrizes.length);
      
      // Filtrar apenas prêmios acima de R$50,00 para contas demo
      const filteredPrizes = fallbackPrizes.filter(prize => prize.valor >= 50.0);
      console.log(`🎯 Prêmios filtrados (>= R$50,00):`, filteredPrizes.length);
      
      // Se não houver prêmios acima de R$50,00, criar prêmios padrão para demo
      if (filteredPrizes.length === 0) {
        console.log(`⚠️ Nenhum prêmio >= R$50,00 encontrado, criando prêmios padrão para demo`);
        return [
          { id: 'demo_default_1', nome: 'R$ 50,00', valor: 50.0, probabilidade: 0.4 },
          { id: 'demo_default_2', nome: 'R$ 100,00', valor: 100.0, probabilidade: 0.3 },
          { id: 'demo_default_3', nome: 'R$ 200,00', valor: 200.0, probabilidade: 0.2 },
          { id: 'demo_default_4', nome: 'Nada', valor: 0, probabilidade: 0.1 }
        ];
      }
      
      return filteredPrizes;
    }
    
    return prizes;
  }

  // Prêmios controlados para contas normais (proteção do caixa)
  getControlledPrizes(caseId) {
    console.log(`🔍 Buscando prêmios controlados para caseId: ${caseId}`);
    
    const controlledPrizes = {
      '1abd77cf-472b-473d-9af0-6cd47f9f1452': [ // CAIXA WEEKEND (R$1,50)
        { id: 'weekend_1', nome: 'R$ 1,00', valor: 1.0, probabilidade: 1.0 }
      ],
      '0b5e9b8a-9d56-4769-a45a-55a3025640f4': [ // CAIXA NIKE (R$2,50)
        { id: 'nike_1', nome: 'R$ 1,00', valor: 1.0, probabilidade: 0.6 },
        { id: 'nike_2', nome: 'R$ 2,00', valor: 2.0, probabilidade: 0.4 }
      ],
      '3f2a9f7a-cb4d-47e7-991a-0e72c0e0f415': [ // CAIXA SAMSUNG (R$3,00)
        { id: 'samsung_1', nome: 'R$ 1,00', valor: 1.0, probabilidade: 0.6 },
        { id: 'samsung_2', nome: 'R$ 2,00', valor: 2.0, probabilidade: 0.4 }
      ],
      'fb0c0175-b478-4fd5-9750-d673c0f374fd': [ // CAIXA CONSOLE (R$3,50)
        { id: 'console_1', nome: 'R$ 1,00', valor: 1.0, probabilidade: 0.6 },
        { id: 'console_2', nome: 'R$ 2,00', valor: 2.0, probabilidade: 0.4 }
      ],
      '61a19df9-d011-429e-a9b5-d2c837551150': [ // CAIXA APPLE (R$7,00)
        { id: 'apple_1', nome: 'R$ 5,00', valor: 5.0, probabilidade: 1.0 }
      ],
      'db95bb2b-9b3e-444b-964f-547330010a59': [ // CAIXA PREMIUM MASTER (R$15,00)
        { id: 'premium_1', nome: 'R$ 2,00', valor: 2.0, probabilidade: 0.4 },
        { id: 'premium_2', nome: 'R$ 5,00', valor: 5.0, probabilidade: 0.4 },
        { id: 'premium_3', nome: 'R$ 10,00', valor: 10.0, probabilidade: 0.2 }
      ]
    };

    const prizes = controlledPrizes[caseId];
    console.log(`🎯 Prêmios encontrados para ${caseId}:`, prizes ? prizes.length : 0);
    
    if (!prizes) {
      console.log(`⚠️ Nenhum prêmio controlado encontrado para ${caseId}, usando fallback`);
      const fallbackPrizes = this.getStaticCaseData(caseId)?.prizes || [];
      console.log(`🔄 Prêmios fallback:`, fallbackPrizes.length);
      return fallbackPrizes;
    }
    
    return prizes;
  }

  // Sistema de sorteio simples SEM creditar (apenas sorteia o prêmio)
  async simpleDrawWithoutCredit(caseData, userId, userBalance, isDemo = false) {
    try {
      console.log(`🎲 Executando sorteio simples (sem crédito)... (${isDemo ? 'DEMO' : 'NORMAL'})`);
      
      // Aplicar novo sistema de prêmios baseado no tipo de conta
      const prizeSystem = this.getPrizeSystemForUser(caseData.id, isDemo);
      if (!prizeSystem || !prizeSystem.prizes || prizeSystem.prizes.length === 0) {
        return {
          success: false,
          message: 'Caixa não possui prêmios configurados'
        };
      }

      // Calcular probabilidades usando o sistema de prêmios correto
      const totalProbability = prizeSystem.prizes.reduce((sum, prize) => sum + prize.probabilidade, 0);
      const random = Math.random() * totalProbability;
      
      let currentProbability = 0;
      let selectedPrize = null;
      
      for (const prize of prizeSystem.prizes) {
        currentProbability += prize.probabilidade;
        if (random <= currentProbability) {
          selectedPrize = prize;
          break;
        }
      }
      
      if (!selectedPrize) {
        selectedPrize = prizeSystem.prizes[prizeSystem.prizes.length - 1]; // Fallback
      }
      
      console.log(`🎁 Prêmio selecionado: ${selectedPrize.nome} - R$ ${selectedPrize.valor} (${isDemo ? 'DEMO' : 'NORMAL'})`);
      
      return {
        success: true,
        prize: {
          id: selectedPrize.id,
          nome: selectedPrize.nome,
          valor: selectedPrize.valor,
          tipo: 'cash',
          imagem: null,
          sem_imagem: false
        },
        message: selectedPrize.valor > 0 ? 
          `Parabéns! Você ganhou R$ ${selectedPrize.valor.toFixed(2)}!` : 
          'Tente novamente na próxima!',
        is_demo: isDemo,
        userBalance: userBalance
      };
      
    } catch (error) {
      console.error('❌ Erro no sorteio simples:', error.message);
      return {
        success: false,
        message: 'Erro no sistema de sorteio'
      };
    }
  }

  // Sistema de sorteio simples com transações (fallback quando banco não está disponível)
  async simpleDraw(caseData, userId, userBalance, isDemo = false) {
    try {
      console.log(`🎲 Executando sorteio simples com transações... (${isDemo ? 'DEMO' : 'NORMAL'})`);
      
      // Aplicar novo sistema de prêmios baseado no tipo de conta
      const prizeSystem = this.getPrizeSystemForUser(caseData.id, isDemo);
      if (!prizeSystem || !prizeSystem.prizes || prizeSystem.prizes.length === 0) {
        return {
          success: false,
          message: 'Caixa não possui prêmios configurados'
        };
      }

      // Calcular probabilidades usando o sistema de prêmios correto
      const totalProbability = prizeSystem.prizes.reduce((sum, prize) => sum + prize.probabilidade, 0);
      const random = Math.random() * totalProbability;
      
      let currentProbability = 0;
      let selectedPrize = null;
      
      for (const prize of prizeSystem.prizes) {
        currentProbability += prize.probabilidade;
        if (random <= currentProbability) {
          selectedPrize = prize;
          break;
        }
      }
      
      if (!selectedPrize) {
        selectedPrize = prizeSystem.prizes[prizeSystem.prizes.length - 1]; // Fallback
      }
      
      console.log(`🎁 Prêmio selecionado: ${selectedPrize.nome} - R$ ${selectedPrize.valor} (${isDemo ? 'DEMO' : 'NORMAL'})`);
      
      // Processar transações
      const casePrice = parseFloat(caseData.preco);
      const prizeValue = parseFloat(selectedPrize.valor);
      
      // Debitar valor da caixa
      const newBalance = userBalance - casePrice;
      console.log(`💸 Debitando R$ ${casePrice.toFixed(2)} - Saldo: R$ ${userBalance.toFixed(2)} → R$ ${newBalance.toFixed(2)}`);
      
      // Creditar prêmio (se valor > 0)
      const finalBalance = newBalance + prizeValue;
      if (prizeValue > 0) {
        console.log(`💰 Creditando R$ ${prizeValue.toFixed(2)} - Saldo: R$ ${newBalance.toFixed(2)} → R$ ${finalBalance.toFixed(2)}`);
      }
      
      // Tentar atualizar no banco (se disponível)
      try {
        await prisma.user.update({
          where: { id: userId },
          data: { 
            saldo_reais: finalBalance 
          }
        });
        console.log('✅ Saldo atualizado no banco de dados');
      } catch (dbError) {
        console.log('⚠️ Banco não disponível - usando saldo local');
      }
      
      return {
        success: true,
        prize: {
          id: selectedPrize.id,
          nome: selectedPrize.nome,
          valor: selectedPrize.valor,
          tipo: 'cash',
          imagem: null,
          sem_imagem: false
        },
        message: selectedPrize.valor > 0 ? 
          `Parabéns! Você ganhou R$ ${selectedPrize.valor.toFixed(2)}!` : 
          'Tente novamente na próxima!',
        is_demo: isDemo,
        userBalance: finalBalance,
        transaction: {
          debited: casePrice,
          credited: prizeValue,
          balanceBefore: userBalance,
          balanceAfter: finalBalance
        }
      };
      
    } catch (error) {
      console.error('❌ Erro no sorteio simples:', error.message);
      return {
        success: false,
        message: 'Erro no sistema de sorteio'
      };
    }
  }

  // Listar todas as caixas disponíveis
  async getCases(req, res) {
    try {
      const cases = await prisma.case.findMany({
        where: { ativo: true },
        include: {
          prizes: {
            where: {
              ativo: true
            },
            select: {
              id: true,
              nome: true,
              valor: true,
              probabilidade: true,
              imagem: true
            }
          }
        },
        orderBy: { preco: 'asc' }
      });

      res.json({ 
        success: true,
        data: cases 
      });
    } catch (error) {
      console.error('Erro ao buscar caixas:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Buscar detalhes de uma caixa específica
  async getCaseById(req, res) {
    try {
      const { id } = req.params;

      const caseData = await prisma.case.findUnique({
        where: { id: id },
        include: {
          prizes: {
            select: {
              id: true,
              nome: true,
              valor: true,
              probabilidade: true
            },
            orderBy: { valor: 'desc' }
          }
        }
      });

      if (!caseData) {
        return res.status(404).json({ error: 'Caixa não encontrada' });
      }

      if (!caseData.ativo) {
        return res.status(400).json({ error: 'Esta caixa não está disponível' });
      }

      res.json({
        success: true,
        data: caseData
      });
    } catch (error) {
      console.error('Erro ao buscar caixa:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }


  // Comprar e abrir múltiplas caixas
  async buyMultipleCases(req, res) {
    try {
      const { id } = req.params;
      const { quantity } = req.body;
      const userId = req.user.id;
      
      console.log('🔍 Debug buyMultipleCases:');
      console.log('- Case ID:', id);
      console.log('- Quantity:', quantity);
      console.log('- User ID:', userId);

      // Validação robusta de ID
      if (!id || id.trim() === '') {
        return res.status(400).json({ error: 'ID da caixa é obrigatório' });
      }

      // Validação robusta de quantidade
      if (!quantity || quantity === '' || quantity === null || quantity === undefined) {
        return res.status(400).json({ error: 'Quantidade é obrigatória' });
      }

      const numericQuantity = parseInt(quantity);
      if (isNaN(numericQuantity) || !isFinite(numericQuantity)) {
        return res.status(400).json({ error: 'Quantidade deve ser um número válido' });
      }

      if (numericQuantity < 1 || numericQuantity > 10) {
        return res.status(400).json({ error: 'Quantidade deve ser entre 1 e 10' });
      }

      // Usar dados estáticos para o sistema de prêmios controlado
      const caseData = this.getStaticCaseData(id);

      if (!caseData) {
        return res.status(404).json({ error: 'Caixa não encontrada' });
      }

      if (!caseData.ativo) {
        return res.status(400).json({ error: 'Esta caixa não está disponível' });
      }

      // CORREÇÃO: Sempre buscar o preço diretamente da database
      const precoUnitario = Number(caseData.preco);
      const totalCost = +(precoUnitario * quantity).toFixed(2);

      console.log('💰 Preço unitário da caixa (DB):', precoUnitario);
      console.log('💰 Quantidade:', quantity);
      console.log('💰 Total a ser cobrado:', totalCost);
      
      // Verificar saldo baseado no tipo de conta
      const isDemoAccount = req.user.tipo_conta === 'afiliado_demo';
      const saldoAtual = isDemoAccount ? req.user.saldo_demo : req.user.saldo_reais;
      
      if (parseFloat(saldoAtual) < totalCost) {
        return res.status(400).json({ error: 'Saldo insuficiente' });
      }

      // Registrar saldo antes da compra para auditoria
      const saldoAntes = parseFloat(req.user.saldo_reais);

      const results = [];
      let totalWon = 0;

      // Processar cada caixa
      for (let i = 0; i < quantity; i++) {
        try {
          console.log(`🎲 Processando caixa ${i + 1}/${quantity}...`);
          
          // Sistema de sorteio implementado diretamente
          const drawResult = await this.simpleDraw(caseData, userId, saldoAposDebito, isDemoAccount);
          
          if (!drawResult.success) {
            console.error(`❌ Erro no sorteio da caixa ${i + 1}:`, drawResult.message);
            results.push({
              boxNumber: i + 1,
              success: false,
              error: drawResult.message,
              prize: null
            });
            continue;
          }
          
          const wonPrize = drawResult.prize;
          console.log(`🎁 Caixa ${i + 1} - Prêmio:`, wonPrize.nome, 'R$', wonPrize.valor);

          // Se for prêmio real, somar ao total
          if (wonPrize.valor > 0) {
            totalWon += parseFloat(wonPrize.valor);
          }

          results.push({
            boxNumber: i + 1,
            success: true,
            prize: {
              id: wonPrize.id,
              nome: wonPrize.nome,
              valor: wonPrize.valor,
              imagem: wonPrize.imagem,
              sem_imagem: wonPrize.sem_imagem || false,
              is_illustrative: wonPrize.valor === 0,
              message: wonPrize.message || (wonPrize.valor === 0 ? 'Quem sabe na próxima!' : `Parabéns! Você ganhou R$ ${parseFloat(wonPrize.valor).toFixed(2)}!`)
            }
          });

        } catch (error) {
          console.error(`❌ Erro ao processar caixa ${i + 1}:`, error);
          results.push({
            boxNumber: i + 1,
            success: false,
            error: error.message,
            prize: null
          });
        }
      }

      // Atualizar saldo do usuário (já foi debitado pelo centralizedDrawService)
      const updatedUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { saldo_reais: true, saldo_demo: true, tipo_conta: true }
      });

      // SISTEMA DE AUDITORIA: Registrar compra múltipla
      const saldoDepois = updatedUser.tipo_conta === 'afiliado_demo' ? parseFloat(updatedUser.saldo_demo) : parseFloat(updatedUser.saldo_reais);
      const discrepanciaDetectada = Math.abs(totalCost - (precoUnitario * quantity)) > 0.01;
      
      // ERRO: Modelo não existe no schema
      // await prisma.purchaseAudit.create({
      //   data: {
      //     purchase_id: `buy_multiple_${userId}_${caseData.id}_${Date.now()}`,
      //     user_id: userId,
      //     caixas_compradas: JSON.stringify([{
      //       caixaId: caseData.id,
      //       quantidade: quantity,
      //       preco: precoUnitario
      //     }]),
      //     total_preco: totalCost,
      //     saldo_antes: saldoAntes,
      //     saldo_depois: saldoDepois,
      //     status: discrepanciaDetectada ? 'investigar' : 'concluido'
      //   }
      // });

      // Verificar discrepância e registrar anomalia se necessário
      if (discrepanciaDetectada) {
        const diferenca = Math.abs(totalCost - (precoUnitario * quantity));
        // ERRO: Modelo não existe no schema
        // await prisma.purchaseAnomaly.create({
        //   data: {
        //     user_id: userId,
        //     caixa_id: caseData.id,
        //     quantidade: quantity,
        //     preco_esperado: precoUnitario * quantity,
        //     preco_cobrado: totalCost,
        //     diferenca: diferenca,
        //     descricao: `Caixa ${caseData.nome} (${quantity}x) deveria custar ${precoUnitario * quantity} mas foi cobrado ${totalCost}`
        //   }
        // });
        console.log(`⚠️ Discrepância detectada: Caixa ${caseData.nome} (${quantity}x) deveria custar ${precoUnitario * quantity} mas foi cobrado ${totalCost}`);
      }

      console.log('✅ Compra múltipla concluída');
      console.log('💰 Total gasto:', totalCost);
      console.log('🎁 Total ganho:', totalWon);
      console.log('📊 Resultados:', results.length);

      res.json({
        success: true,
        message: `Você abriu ${quantity} caixas!`,
        totalCost: totalCost,
        totalWon: totalWon,
        netResult: totalWon - totalCost,
        results: results,
        userBalance: updatedUser.saldo
      });

    } catch (error) {
      console.error('❌ Erro em buyMultipleCases:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Debitar valor da caixa (primeira etapa)
  async debitCase(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      console.log('🔍 Debug debitCase:');
      console.log('- Case ID:', id);
      console.log('- User ID:', userId);

      // Usar dados estáticos para o sistema de prêmios controlado
      const caseData = this.getStaticCaseData(id);

      if (!caseData) {
        return res.status(404).json({ error: 'Caixa não encontrada' });
      }

      if (!caseData.ativo) {
        return res.status(400).json({ error: 'Esta caixa não está disponível' });
      }

      // CORREÇÃO: Sempre buscar o preço diretamente da database
      const precoUnitario = Number(caseData.preco);
      const totalPreco = +(precoUnitario * 1).toFixed(2); // 1 caixa

      console.log('💰 Preço unitário da caixa (DB):', precoUnitario);
      console.log('💰 Total a ser cobrado:', totalPreco);
      // Verificar saldo baseado no tipo de conta
      const isDemoAccount = req.user.tipo_conta === 'afiliado_demo';
      const saldoAtual = isDemoAccount ? req.user.saldo_demo : req.user.saldo_reais;
      
      console.log('💰 Saldo atual do usuário:', saldoAtual);
      console.log('💰 Tipo de conta:', req.user.tipo_conta);
      
      if (parseFloat(saldoAtual) < totalPreco) {
        return res.status(400).json({ error: 'Saldo insuficiente' });
      }

      // Registrar saldo antes da compra para auditoria
      const saldoAntes = parseFloat(saldoAtual);

      // Debitar valor da caixa imediatamente
      await prisma.$transaction(async (tx) => {
        if (isDemoAccount) {
          await tx.user.update({
            where: { id: userId },
            data: { saldo_demo: { decrement: totalPreco } }
          });
        } else {
          await tx.user.update({
            where: { id: userId },
            data: { saldo_reais: { decrement: totalPreco } }
          });
        }

        // Sincronizar com Wallet
        await tx.wallet.update({
          where: { user_id: userId },
          data: isDemoAccount ? {
            saldo_demo: { decrement: totalPreco }
          } : {
            saldo_reais: { decrement: totalPreco }
          }
        });

        await tx.transaction.create({
          data: {
            user_id: userId,
            tipo: 'abertura_caixa',
            valor: -totalPreco,
            status: 'concluido',
            descricao: `Abertura de caixa ${caseData.nome}`
          }
        });
      });

      // SISTEMA DE AUDITORIA: Registrar compra
      const updatedUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { saldo_reais: true, saldo_demo: true, tipo_conta: true }
      });
      
      const saldoDepois = updatedUser.tipo_conta === 'afiliado_demo' ? parseFloat(updatedUser.saldo_demo) : parseFloat(updatedUser.saldo_reais);
      const discrepanciaDetectada = Math.abs(totalPreco - precoUnitario) > 0.01;
      
      // ERRO: Modelo não existe no schema
      // await prisma.purchaseAudit.create({
      //   data: {
      //     purchase_id: `debit_${userId}_${caseData.id}_${Date.now()}`,
      //     user_id: userId,
      //     caixas_compradas: JSON.stringify([{
      //       caixaId: caseData.id,
      //       quantidade: 1,
      //       preco: precoUnitario
      //     }]),
      //     total_preco: totalPreco,
      //     saldo_antes: saldoAntes,
      //     saldo_depois: saldoDepois,
      //     status: discrepanciaDetectada ? 'investigar' : 'concluido'
      //   }
      // });

      // Verificar discrepância e registrar anomalia se necessário
      if (discrepanciaDetectada) {
        const diferenca = Math.abs(totalPreco - precoUnitario);
        // ERRO: Modelo não existe no schema
        // await prisma.purchaseAnomaly.create({
        //   data: {
        //     user_id: userId,
        //     caixa_id: caseData.id,
        //     quantidade: 1,
        //     preco_esperado: precoUnitario,
        //     preco_cobrado: totalPreco,
        //     diferenca: diferenca,
        //     descricao: `Caixa ${caseData.nome} deveria custar ${precoUnitario} mas foi cobrado ${totalPreco}`
        //   }
        // });
        console.log(`⚠️ Discrepância detectada: Caixa ${caseData.nome} deveria custar ${precoUnitario} mas foi cobrado ${totalPreco}`);
      }

      console.log('✅ Valor debitado com sucesso');

      // Retornar dados da caixa para o frontend fazer o sorteio
      return res.json({
        success: true,
        case: {
          id: caseData.id,
          nome: caseData.nome,
          preco: totalPreco, // Usar o preço calculado corretamente
          prizes: caseData.prizes
        }
      });

    } catch (error) {
      console.error('❌ Erro ao debitar caixa:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Fazer sorteio e creditar prêmio (segunda etapa)
  async drawPrize(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      console.log('🔍 Debug drawPrize:');
      console.log('- Case ID:', id);
      console.log('- User ID:', userId);

      // Sistema de sorteio implementado diretamente
      console.log('🎯 Fazendo sorteio...');
      const drawResult = await this.simpleDrawWithoutCredit(caseData, userId, saldoAposDebito, isDemoAccount);
      
      if (!drawResult.success) {
        console.error('❌ Erro no sorteio:', drawResult.message);
        return res.status(400).json({ error: drawResult.message });
      }

      // Retornar resultado do sorteio
      return res.json({
        success: true,
        prize: drawResult.prize,
        message: drawResult.message
      });

    } catch (error) {
      console.error('❌ Erro ao sortear prêmio:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Comprar e abrir uma caixa (método antigo - manter para compatibilidade)
  async buyCase(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      console.log('🔍 Debug buyCase:');
      console.log('- Case ID:', id);
      console.log('- User ID:', userId);
      console.log('- User object:', req.user);

      // Usar dados estáticos para o sistema de prêmios controlado
      const caseData = this.getStaticCaseData(id);

      if (!caseData) {
        return res.status(404).json({ error: 'Caixa não encontrada' });
      }

      if (!caseData.ativo) {
        return res.status(400).json({ error: 'Esta caixa não está disponível' });
      }

      // CORREÇÃO: Sempre buscar o preço diretamente da database
      const precoUnitario = Number(caseData.preco);
      const totalPreco = +(precoUnitario * 1).toFixed(2); // 1 caixa

      console.log('💰 Preço unitário da caixa (DB):', precoUnitario);
      console.log('💰 Total a ser cobrado:', totalPreco);

      // Verificar saldo baseado no tipo de conta
      const isDemoAccount = req.user.tipo_conta === 'afiliado_demo';
      const saldoAtual = isDemoAccount ? req.user.saldo_demo : req.user.saldo_reais;
      
      if (parseFloat(saldoAtual) < totalPreco) {
        return res.status(400).json({ error: 'Saldo insuficiente' });
      }

      // 1. DEBITAR VALOR DA CAIXA IMEDIATAMENTE
      console.log('💸 DEBITANDO valor da caixa imediatamente...');
      const saldoAposDebito = parseFloat(saldoAtual) - totalPreco;
      
      // Tentar atualizar saldo no banco
      try {
        if (isDemoAccount) {
          await prisma.user.update({
          where: { id: userId },
            data: { saldo_demo: saldoAposDebito }
          });
        } else {
        await prisma.user.update({
          where: { id: userId },
            data: { saldo_reais: saldoAposDebito }
          });
        }
        console.log('✅ Saldo debitado no banco de dados');
      } catch (dbError) {
        console.log('⚠️ Banco não disponível - debitando localmente');
      }

      // 2. FAZER SORTEIO (sem creditar ainda)
      console.log('🎯 Fazendo sorteio...');
      const drawResult = await this.simpleDrawWithoutCredit(caseData, userId, saldoAposDebito, isDemoAccount);
      
      if (!drawResult || !drawResult.success) {
        console.error('❌ Erro no sistema de sorteio:', drawResult?.message || 'Resultado inválido');
        return res.status(500).json({ error: 'Erro no sistema de sorteio' });
      }
      
      const wonPrize = drawResult.prize;
      console.log('🎲 Prêmio sorteado:', wonPrize);
      console.log('🎲 Prêmio ID:', wonPrize.id);
      console.log('🎲 Prêmio Nome:', wonPrize.nome);
      console.log('🎲 Prêmio Valor:', wonPrize.valor);

      // 3. RETORNAR RESPOSTA (sem creditar ainda)
      console.log('📤 Enviando resposta (prêmio será creditado depois)...');
      
      res.json({
        success: true,
        data: {
          ganhou: wonPrize.valor > 0,
          premio: wonPrize.valor > 0 ? {
            id: wonPrize.id,
            nome: wonPrize.nome,
            valor: wonPrize.valor,
            imagem: wonPrize.imagem,
            sem_imagem: wonPrize.sem_imagem || false
          } : null,
          saldo_restante: saldoAposDebito, // Saldo após débito (sem crédito ainda)
          transacao: {
            valor_debitado: totalPreco,
            valor_creditado: 0, // Será creditado depois
            saldo_antes: parseFloat(saldoAtual),
            saldo_depois: saldoAposDebito
          }
        }
      });
      return;

    } catch (error) {
      console.error('❌ Erro ao comprar caixa:', error.message);
      console.error('📊 Stack trace:', error.stack);
      
      // Retornar erro específico para debug
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async creditPrize(req, res) {
    try {
      console.log('🚀 [CREDIT] Iniciando creditPrize...');
      console.log('🚀 [CREDIT] Request body:', req.body);
      console.log('🚀 [CREDIT] Request params:', req.params);
      console.log('🚀 [CREDIT] Request user:', req.user);
      
      const { id } = req.params;
      const { prizeId, prizeValue } = req.body; // Receber dados do prêmio
      const userId = req.user.id;

      console.log('🔍 Debug creditPrize:');
      console.log('- Case ID:', id);
      console.log('- Prize ID:', prizeId);
      console.log('- Prize Value:', prizeValue);
      console.log('- User ID:', userId);

      // Usar dados estáticos para o sistema de prêmios controlado
      const caseData = this.getStaticCaseData(id);

      if (!caseData) {
        console.log('❌ Caixa não encontrada');
        return res.status(404).json({ error: 'Caixa não encontrada' });
      }

      // Buscar o prêmio específico
      console.log('🔍 Buscando prêmio com ID:', prizeId);
      console.log('🔍 Tipo do prizeId:', typeof prizeId);
      console.log('🔍 Prêmios disponíveis:', caseData.prizes.map(p => ({ id: p.id, nome: p.nome, tipo_id: typeof p.id })));
      
      // Tentar encontrar o prêmio com diferentes comparações
      let wonPrize = caseData.prizes.find(p => p.id === prizeId);
      if (!wonPrize) {
        console.log('🔍 Tentando comparação com String...');
        wonPrize = caseData.prizes.find(p => p.id === String(prizeId));
      }
      if (!wonPrize) {
        console.log('🔍 Tentando comparação com toString...');
        wonPrize = caseData.prizes.find(p => String(p.id) === String(prizeId));
      }
      
      // Log adicional para debug
      console.log('🔍 Resultado da busca:');
      console.log('- Prêmio encontrado:', !!wonPrize);
      if (wonPrize) {
        console.log('- Prêmio encontrado ID:', wonPrize.id);
        console.log('- Prêmio encontrado Nome:', wonPrize.nome);
        console.log('- Prêmio encontrado Valor:', wonPrize.valor);
      }
      
      // Se não encontrou no banco, verificar se é prêmio demo
      if (!wonPrize) {
        console.log('🔍 Prêmio não encontrado no banco, verificando se é prêmio demo...');
        
        // Verificar se é prêmio demo baseado no ID
        if (prizeId.includes('_demo_') || prizeId.includes('demo_default_')) {
          console.log('🎯 Prêmio demo detectado, creditando valor diretamente');
          
          // Para prêmios demo, usar o valor passado no request
          const prizeValue = parseFloat(req.body.prizeValue) || 0;
          if (prizeValue > 0) {
            console.log(`💰 Creditando prêmio demo: R$ ${prizeValue}`);
            
            // Verificar se é conta demo
            const isDemoAccount = req.user.tipo_conta === 'afiliado_demo';
            const saldoField = isDemoAccount ? 'saldo_demo' : 'saldo_reais';
            
            // Creditar prêmio ao saldo correto do usuário
            const updatedUser = await prisma.user.update({
              where: { id: userId },
              data: {
                [saldoField]: {
                  increment: prizeValue
                }
              },
              select: {
                saldo_reais: true,
                saldo_demo: true,
                tipo_conta: true
              }
            });
            
            // Sincronizar com a tabela wallet
            await prisma.wallet.update({
              where: { user_id: userId },
              data: {
                saldo_reais: updatedUser.saldo_reais,
                saldo_demo: updatedUser.saldo_demo
              }
            });
            
            console.log('✅ Prêmio demo creditado com sucesso');
            
            return res.json({
              success: true,
              credited: true,
              message: `Prêmio de R$ ${prizeValue.toFixed(2)} creditado com sucesso`,
              prizeValue: prizeValue,
              isDemo: true
            });
          }
        }
        
        console.log('🎭 Prêmio ilustrativo detectado - não precisa creditar');
        return res.json({
          success: true,
          message: 'Prêmio ilustrativo - sem valor monetário',
          needsPrizeCredit: false
        });
      }
      
      console.log('🎲 Prêmio para crédito:', wonPrize);

      // Verificar se é conta demo
      const isDemoAccount = req.user.tipo_conta === 'afiliado_demo';
      const saldoField = isDemoAccount ? 'saldo_demo' : 'saldo_reais';
      
      // Creditar prêmio ao saldo correto do usuário
      console.log('🎁 Creditando prêmio...');
      console.log(`🎯 Tipo de conta: ${isDemoAccount ? 'DEMO' : 'NORMAL'}`);
      console.log(`💰 Creditando em: ${saldoField}`);
      
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          [saldoField]: {
            increment: parseFloat(wonPrize.valor)
          }
        },
        select: {
          saldo_reais: true,
          saldo_demo: true,
          tipo_conta: true
        }
      });
      
      // Sincronizar com a tabela wallet
      await prisma.wallet.update({
        where: { user_id: userId },
        data: {
          saldo_reais: updatedUser.saldo_reais,
          saldo_demo: updatedUser.saldo_demo
        }
      });
      console.log('✅ Prêmio creditado com sucesso');

      // Registrar transação do prêmio (temporariamente desabilitado)
      // await prisma.transaction.create({
      //   data: {
      //     user_id: userId,
      //     tipo: 'premio',
      //     valor: parseFloat(wonPrize.valor),
      //     status: 'concluido',
      //     descricao: `Prêmio ganho na caixa ${caseData.nome}: ${wonPrize.nome}`
      //   }
      // });

      // Verificar saldo após crédito
      const userAfterCredit = await prisma.user.findUnique({
        where: { id: userId },
        select: { saldo_reais: true, saldo_demo: true, tipo_conta: true }
      });
      const saldoAtualizado = isDemoAccount ? userAfterCredit.saldo_demo : userAfterCredit.saldo_reais;
      console.log('💰 Saldo após crédito:', saldoAtualizado);
      console.log(`💰 Saldo demo: ${userAfterCredit.saldo_demo}, Saldo real: ${userAfterCredit.saldo_reais}`);

      res.json({
        prizes: caseData.prizes,
        wonPrize: wonPrize,
        message: `Prêmio de R$ ${parseFloat(wonPrize.valor).toFixed(2)} creditado com sucesso!`,
        credited: true
      });

    } catch (error) {
      console.error('❌ [CREDIT] Erro ao creditar prêmio:', error);
      console.error('❌ [CREDIT] Stack trace:', error.stack);
      console.error('❌ [CREDIT] Error message:', error.message);
      console.error('❌ [CREDIT] Error name:', error.name);
      
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  // Função de sorteio ponderado

  // Histórico de aberturas do usuário
  async getUserHistory(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20 } = req.query;
      
      const skip = (page - 1) * limit;
      
      const transactions = await prisma.transaction.findMany({
        where: {
          user_id: userId,
          tipo: 'premio'
        },
        include: {
          case: {
            select: {
              nome: true,
              imagem: true
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
          tipo: 'premio'
        }
      });
      
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
      console.error('Erro ao buscar histórico:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Listar prêmios de todas as caixas (para debug)
  async getPremios(req, res) {
    try {
      const caixas = await prisma.case.findMany({
        where: { ativo: true },
        include: {
          prizes: {
            select: {
              id: true,
              nome: true,
              valor: true,
              probabilidade: true
            }
          }
        },
        orderBy: { preco: 'asc' }
      });

      const resultado = caixas.map(caixa => ({
        nome: caixa.nome,
        preco: caixa.preco,
        premios: caixa.prizes.map(premio => ({
          nome: premio.nome,
          valor: premio.valor,
          probabilidade: `${(premio.probabilidade * 100).toFixed(2)}%`
        }))
      }));

      res.json({
        success: true,
        caixas: resultado
      });

    } catch (error) {
      console.error('Erro ao listar prêmios:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Mapear ID do frontend para ID real do banco
  async mapFrontendId(req, res) {
    try {
      const { frontendId } = req.params;
      
      const mapping = {
        'weekend-case': 'b39feef0-d72f-4423-a561-da5fd543b15e',
        'nike-case': 'f6e19259-443b-484c-b7a1-9f670ad2e0b8',
        'samsung-case': 'f6db398c-0c14-403a-bb88-76e11c0bdcaa',
        'console-case': '605b9275-c22b-4e73-a290-95ff7997baf5',
        'apple-case': '34776309-0312-4c18-aba6-577823331d52',
        'premium-master-case': 'ef8d6aee-d210-4567-9029-bde0280d396e'
      };
      
      const realId = mapping[frontendId];
      if (!realId) {
        return res.status(404).json({ error: 'Caixa não encontrada' });
      }
      
      // Verificar se a caixa existe no banco
      const caseData = await prisma.case.findUnique({
        where: { id: realId },
        select: { id: true, nome: true, preco: true, ativo: true }
      });
      
      if (!caseData) {
        return res.status(404).json({ error: 'Caixa não encontrada no banco de dados' });
      }
      
      res.json({ 
        success: true,
        frontendId, 
        realId,
        caseData
      });
      
    } catch (error) {
      console.error('Erro ao mapear ID da caixa:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Obter estatísticas de RTP do usuário
  async getUserRTPStats(req, res) {
    try {
      const userId = req.user.id;
      const { caseId } = req.params;

      if (caseId) {
        // Estatísticas para uma caixa específica
        const sessionStats = await userRTPService.getSessionStats(userId, caseId);
        res.json({ success: true, data: sessionStats });
      } else {
        // Estatísticas gerais do usuário
        const userStats = await userRTPService.getUserRTPStats(userId);
        res.json({ success: true, data: userStats });
      }
    } catch (error) {
      console.error('Erro ao obter estatísticas RTP:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Finalizar sessão RTP do usuário
  async endRTPSession(req, res) {
    try {
      const userId = req.user.id;
      const { caseId } = req.params;

      const session = await userRTPService.getOrCreateRTPSession(userId, caseId);
      await userRTPService.endSession(session.id);

      res.json({ 
        success: true, 
        message: 'Sessão RTP finalizada com sucesso',
        session_stats: {
          total_gasto: session.total_gasto,
          total_premios: session.total_premios,
          rtp_final: session.rtp_atual
        }
      });
    } catch (error) {
      console.error('Erro ao finalizar sessão RTP:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

module.exports = CasesController;

