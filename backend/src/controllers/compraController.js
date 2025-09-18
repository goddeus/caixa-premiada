const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class CompraController {
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

    return controlledPrizes[caseId] || this.getStaticCaseData(caseId)?.prizes || []; // Fallback para prêmios originais
  }

  // Sistema de sorteio com filtro por tipo de conta
  async simpleDraw(caseData, userId, userBalance, userType = 'normal') {
    try {
      console.log(`🎲 Executando sorteio para conta ${userType}...`);
      
      // Aplicar novo sistema de prêmios baseado no tipo de conta
      const prizeSystem = this.getPrizeSystemForUser(caseData.id, userType === 'demo');
      if (!prizeSystem || !prizeSystem.prizes || prizeSystem.prizes.length === 0) {
        return {
          success: false,
          message: 'Caixa não possui prêmios configurados'
        };
      }

      const availablePrizes = prizeSystem.prizes;
      console.log(`🎯 [${userType.toUpperCase()}] Sistema de prêmios aplicado. Prêmios disponíveis: ${availablePrizes.length}`);

      // Calcular probabilidades dos prêmios filtrados
      const totalProbability = availablePrizes.reduce((sum, prize) => sum + prize.probabilidade, 0);
      const random = Math.random() * totalProbability;
      
      let currentProbability = 0;
      let selectedPrize = null;
      
      for (const prize of availablePrizes) {
        currentProbability += prize.probabilidade;
        if (random <= currentProbability) {
          selectedPrize = prize;
          break;
        }
      }
      
      if (!selectedPrize) {
        selectedPrize = availablePrizes[availablePrizes.length - 1]; // Fallback
      }
      
      console.log(`🎁 Prêmio selecionado para conta ${userType}: ${selectedPrize.nome} - R$ ${selectedPrize.valor}`);
      console.log('🔍 Dados do prêmio selecionado:', selectedPrize);
      
      const prizeReturn = {
        id: selectedPrize.id,
        nome: selectedPrize.nome,
        valor: parseFloat(selectedPrize.valor), // Garantir que é número
        tipo: 'cash',
        imagem: null
      };
      
      console.log('📤 Retornando prêmio:', prizeReturn);
      
      return {
        success: true,
        prize: prizeReturn,
        message: selectedPrize.valor > 0 ? 
          `Parabéns! Você ganhou R$ ${selectedPrize.valor.toFixed(2)}!` : 
          'Tente novamente na próxima!',
        is_demo: userType === 'demo',
        userBalance: userBalance,
        accountType: userType
      };
      
    } catch (error) {
      console.error('❌ Erro no sorteio simples:', error.message);
      return {
        success: false,
        message: 'Erro no sistema de sorteio'
      };
    }
  }

  // Comprar e abrir uma caixa - SISTEMA SIMPLES
  async buyCase(req, res) {
    try {
      const { caseId } = req.params;
      const userId = req.user.id;

      console.log(`🎲 Compra de caixa - Usuário: ${userId}, Caixa: ${caseId}`);

      // Verificar se a caixa existe
      const caseData = await prisma.case.findUnique({
        where: { id: caseId },
        include: { prizes: { where: { ativo: true } } }
      });

      if (!caseData) {
        return res.status(404).json({
          success: false,
          error: 'Caixa não encontrada'
        });
      }

      if (!caseData.ativo) {
        return res.status(400).json({
          success: false,
          error: 'Caixa inativa'
        });
      }

      // Verificar saldo do usuário
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'Usuário não encontrado'
        });
      }

      const casePrice = parseFloat(caseData.preco);
      const userBalance = user.tipo_conta === 'afiliado_demo' ? (user.saldo_demo || 0) : (user.saldo_reais || 0);

      if (userBalance < casePrice) {
        return res.status(400).json({
          success: false,
          error: 'Saldo insuficiente'
        });
      }

      // Determinar tipo de conta
      const accountType = user.tipo_conta === 'afiliado_demo' ? 'demo' : 'normal';
      console.log(`👤 Tipo de conta detectado: ${accountType} (${user.tipo_conta})`);

      // Realizar sorteio com filtro por tipo de conta
      const drawResult = await this.simpleDraw(caseData, userId, userBalance, accountType);

      if (!drawResult.success) {
        return res.status(500).json({
          success: false,
          error: drawResult.error
        });
      }

      // Atualizar saldo do usuário
      const newBalance = userBalance - casePrice + drawResult.prize.valor;
      
      if (user.tipo_conta === 'afiliado_demo') {
        await prisma.user.update({
          where: { id: userId },
          data: { saldo_demo: newBalance }
        });
      } else {
        await prisma.user.update({
          where: { id: userId },
          data: { saldo_reais: newBalance }
        });
      }

      // Registrar transações
      await prisma.transaction.create({
        data: {
          user_id: userId,
          tipo: 'abertura_caixa',
          valor: -casePrice,
          saldo_antes: userBalance,
          saldo_depois: userBalance - casePrice,
          descricao: `Compra da caixa ${caseData.nome}`,
          status: 'concluido'
        }
      });

      if (drawResult.prize.valor > 0) {
        await prisma.transaction.create({
          data: {
            user_id: userId,
            tipo: 'premio',
            valor: drawResult.prize.valor,
            saldo_antes: userBalance - casePrice,
            saldo_depois: newBalance,
            descricao: `Prêmio: ${drawResult.prize.nome}`,
            status: 'concluido'
          }
        });
      }

      res.json({
        success: true,
        prize: drawResult.prize,
        newBalance: newBalance,
        message: 'Caixa aberta com sucesso!'
      });

    } catch (error) {
      console.error('❌ Erro ao comprar caixa:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Compra de caixa (método antigo - mantido para compatibilidade)
  async buyCaseOld(req, res) {
    const startTime = Date.now();
    let purchaseId = null;
    
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      console.log('[BUY] Iniciando compra de caixa:', { caseId: id, userId });
      
      // Gerar ID de compra para idempotência
      purchaseId = `purchase_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Buscar a caixa
      let caseData;
      try {
        caseData = await prisma.case.findUnique({
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
      } catch (dbError) {
        console.error('[BUY] Erro ao buscar caixa no banco:', dbError.message);
        caseData = this.getStaticCaseData(id);
      }

      if (!caseData) {
        return res.status(404).json({ 
          success: false,
          error: 'Caixa não encontrada' 
        });
      }

      if (!caseData.ativo) {
        return res.status(400).json({ 
          success: false,
          error: 'Esta caixa não está disponível' 
        });
      }

      // Validar se há prêmios
      if (!caseData.prizes || caseData.prizes.length === 0) {
        return res.status(400).json({ 
          success: false,
          error: 'Caixa não possui prêmios configurados' 
        });
      }

      // Obter preço da caixa
      const precoUnitario = Number(caseData.preco);
      const totalPreco = +(precoUnitario * 1).toFixed(2);

      console.log('[BUY] Preço da caixa:', { precoUnitario, totalPreco });

      // Verificar se é conta demo
      const isDemoAccount = req.user.tipo_conta === 'afiliado_demo';
      const saldoField = isDemoAccount ? 'saldo_demo' : 'saldo_reais';
      
      // OPERAÇÃO ATOMICA: Debitar saldo e fazer sorteio
      const result = await prisma.$transaction(async (tx) => {
        // 1. Buscar usuário com lock para evitar race conditions
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

        console.log('[BUY] Saldo debitado:', { saldoAntes: saldoAtual, saldoDepois: saldoAposDebito });

        // 4. Fazer sorteio
        console.log('[BUY] Dados da caixa para sorteio:', { 
          nome: caseData.nome, 
          prizes: caseData.prizes?.length || 0 
        });
        
        const drawResult = await this.simpleDraw(caseData, userId, saldoAposDebito);
        
        if (!drawResult || !drawResult.success) {
          console.error('[BUY] Erro no sorteio:', drawResult);
          throw new Error('Erro no sistema de sorteio');
        }
        
        const wonPrize = drawResult.prize;
        console.log('[BUY] Prêmio sorteado:', wonPrize);
        console.log('[BUY] Valor do prêmio:', typeof wonPrize.valor, wonPrize.valor);

        // 5. Creditar prêmio se valor > 0
        let saldoFinal = saldoAposDebito;
        console.log('[BUY] Verificando se deve creditar prêmio:', { 
          valor: wonPrize.valor, 
          tipo: typeof wonPrize.valor,
          condicao: wonPrize.valor > 0 
        });
        
        if (wonPrize.valor > 0) {
          saldoFinal = saldoAposDebito + parseFloat(wonPrize.valor);
          
          console.log('[BUY] Creditando prêmio:', { 
            saldoAntes: saldoAposDebito, 
            valorPremio: wonPrize.valor,
            saldoDepois: saldoFinal,
            campo: saldoField
          });
          
          await tx.user.update({
            where: { id: userId },
            data: { [saldoField]: saldoFinal }
          });
          
          console.log('[BUY] Prêmio creditado com sucesso!');
        } else {
          console.log('[BUY] Prêmio sem valor, não creditando');
        }

        // 6. Registrar auditoria de compra
        await tx.purchaseAudit.create({
          data: {
            user_id: userId,
            case_id: id,
            saldo_before: saldoAtual,
            saldo_after: saldoFinal,
            prize_id: wonPrize.id,
            prize_value: wonPrize.valor,
            purchase_id: purchaseId,
            created_at: new Date()
          }
        });

        // 7. Registrar transações
        // Transação de débito
        await tx.transaction.create({
          data: {
            user_id: userId,
            tipo: 'abertura_caixa',
            valor: -totalPreco,
            saldo_antes: saldoAtual,
            saldo_depois: saldoAposDebito,
            descricao: `Abertura de caixa ${caseData.nome}`,
            status: 'processado',
            // related_id: purchaseId, // Temporariamente removido
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
              descricao: `Prêmio ganho na caixa ${caseData.nome}: ${wonPrize.nome}`,
              status: 'processado',
              // related_id: purchaseId, // Temporariamente removido
              created_at: new Date()
            }
          });
        }

        return {
          success: true,
          ganhou: wonPrize.valor > 0,
          premio: wonPrize.valor > 0 ? {
            id: wonPrize.id,
            nome: wonPrize.nome,
            valor: wonPrize.valor,
            imagem: wonPrize.imagem
          } : null,
          saldo_restante: saldoFinal,
          transacao: {
            valor_debitado: totalPreco,
            valor_creditado: wonPrize.valor,
            saldo_antes: saldoAtual,
            saldo_depois: saldoFinal
          },
          purchaseId
        };
      });

      const processingTime = Date.now() - startTime;
      console.log(`[BUY] Compra concluída em ${processingTime}ms:`, result);

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('[BUY] Erro ao comprar caixa:', error);
      
      // Se a transação falhou, tentar reverter se possível
      if (purchaseId) {
        try {
          // Log do erro para auditoria
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
          console.error('[BUY] Erro ao registrar auditoria:', auditError);
        }
      }
      
      res.status(500).json({ 
        success: false,
        error: error.message || 'Erro interno do servidor',
        purchaseId
      });
    }
  }

  // Comprar múltiplas caixas - SISTEMA SIMPLES
  async buyMultipleCases(req, res) {
    try {
      const { caseId, quantity } = req.body;
      const userId = req.user.id;

      console.log(`🎲 Compra múltipla - Usuário: ${userId}, Caixa: ${caseId}, Quantidade: ${quantity}`);

      if (!quantity || quantity < 1 || quantity > 10) {
        return res.status(400).json({
          success: false,
          error: 'Quantidade deve ser entre 1 e 10'
        });
      }

      // Verificar se a caixa existe
      const caseData = await prisma.case.findUnique({
        where: { id: caseId },
        include: { prizes: { where: { ativo: true } } }
      });

      if (!caseData) {
        return res.status(404).json({
          success: false,
          error: 'Caixa não encontrada'
        });
      }

      if (!caseData.ativo) {
        return res.status(400).json({
          success: false,
          error: 'Caixa inativa'
        });
      }

      // Verificar saldo do usuário
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'Usuário não encontrado'
        });
      }

      const casePrice = parseFloat(caseData.preco);
      const totalPrice = casePrice * quantity;
      const userBalance = user.tipo_conta === 'afiliado_demo' ? (user.saldo_demo || 0) : (user.saldo_reais || 0);

      if (userBalance < totalPrice) {
        return res.status(400).json({
          success: false,
          error: 'Saldo insuficiente'
        });
      }

      // Determinar tipo de conta
      const accountType = user.tipo_conta === 'afiliado_demo' ? 'demo' : 'normal';
      console.log(`👤 Tipo de conta detectado: ${accountType} (${user.tipo_conta})`);

      // Realizar múltiplos sorteios com filtro por tipo de conta
      const results = [];
      let totalWinnings = 0;

      for (let i = 0; i < quantity; i++) {
        const drawResult = await this.simpleDraw(caseData, userId, userBalance, accountType);
        if (drawResult.success) {
          results.push(drawResult.prize);
          totalWinnings += drawResult.prize.valor;
        }
      }

      // Atualizar saldo do usuário
      const newBalance = userBalance - totalPrice + totalWinnings;
      
      if (user.tipo_conta === 'afiliado_demo') {
        await prisma.user.update({
          where: { id: userId },
          data: { saldo_demo: newBalance }
        });
      } else {
        await prisma.user.update({
          where: { id: userId },
          data: { saldo_reais: newBalance }
        });
      }

      // Registrar transações
      await prisma.transaction.create({
        data: {
          user_id: userId,
          tipo: 'abertura_caixa',
          valor: -totalPrice,
          saldo_antes: userBalance,
          saldo_depois: userBalance - totalPrice,
          descricao: `Compra múltipla: ${quantity}x ${caseData.nome}`,
          status: 'concluido'
        }
      });

      if (totalWinnings > 0) {
        await prisma.transaction.create({
          data: {
            user_id: userId,
            tipo: 'premio',
            valor: totalWinnings,
            saldo_antes: userBalance - totalPrice,
            saldo_depois: newBalance,
            descricao: `Prêmios múltiplos: R$ ${totalWinnings.toFixed(2)}`,
            status: 'concluido'
          }
        });
      }

      res.json({
        success: true,
        prizes: results,
        totalWinnings: totalWinnings,
        newBalance: newBalance,
        message: `${quantity} caixas abertas com sucesso!`
      });

    } catch (error) {
      console.error('❌ Erro ao comprar múltiplas caixas:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Compra múltipla de caixas (método antigo - mantido para compatibilidade)
  async buyMultipleCasesOld(req, res) {
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

      // Buscar a caixa
      let caseData;
      try {
        caseData = await prisma.case.findUnique({
          where: { id: id },
          include: {
            prizes: {
              select: {
                id: true,
                nome: true,
                valor: true,
                probabilidade: true
              }
            }
          }
        });
      } catch (dbError) {
        console.error('❌ Erro ao buscar caixa no banco:', dbError.message);
        caseData = this.getStaticCaseData(id);
      }

      if (!caseData) {
        return res.status(404).json({ error: 'Caixa não encontrada' });
      }

      if (!caseData.ativo) {
        return res.status(400).json({ error: 'Esta caixa não está disponível' });
      }

      // Calcular custo total
      const precoUnitario = Number(caseData.preco);
      const totalCost = +(precoUnitario * quantity).toFixed(2);

      console.log('💰 Preço unitário da caixa:', precoUnitario);
      console.log('💰 Quantidade:', quantity);
      console.log('💰 Total a ser cobrado:', totalCost);
      
      // Verificar saldo baseado no tipo de conta
      const isDemoAccount = req.user.tipo_conta === 'afiliado_demo';
      const saldoAtual = isDemoAccount ? req.user.saldo_demo : req.user.saldo_reais;
      
      if (parseFloat(saldoAtual) < totalCost) {
        return res.status(400).json({ error: 'Saldo insuficiente' });
      }

      // Registrar saldo antes da compra para auditoria
      const saldoAntes = parseFloat(saldoAtual);

      const results = [];
      let totalWon = 0;
      let saldoAtualizado = saldoAntes;

      // Processar cada caixa
      for (let i = 0; i < quantity; i++) {
        try {
          console.log(`🎲 Processando caixa ${i + 1}/${quantity}...`);
          
          // Fazer sorteio
          const drawResult = await this.simpleDraw(caseData, userId, saldoAtualizado);
          
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
            saldoAtualizado += parseFloat(wonPrize.valor);
          }

          results.push({
            boxNumber: i + 1,
            success: true,
            prize: {
              id: wonPrize.id,
              nome: wonPrize.nome,
              valor: wonPrize.valor,
              imagem: wonPrize.imagem,
              sem_imagem: wonPrize.valor === 0,
              is_illustrative: wonPrize.valor === 0,
              message: wonPrize.valor === 0 ? 'Quem sabe na próxima!' : `Parabéns! Você ganhou R$ ${parseFloat(wonPrize.valor).toFixed(2)}!`
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

      // Atualizar saldo final do usuário
      const saldoFinal = saldoAntes - totalCost + totalWon;
      
      try {
        if (isDemoAccount) {
          await prisma.user.update({
            where: { id: userId },
            data: { saldo_demo: saldoFinal }
          });
        } else {
          await prisma.user.update({
            where: { id: userId },
            data: { saldo_reais: saldoFinal }
          });
        }
        console.log('✅ Saldo final atualizado no banco de dados');
      } catch (dbError) {
        console.log('⚠️ Erro ao atualizar saldo final:', dbError.message);
      }

      // Registrar transações
      try {
        // Transação de débito total
        await prisma.transaction.create({
          data: {
            user_id: userId,
            tipo: 'abertura_caixa',
            valor: -totalCost,
            status: 'concluido',
            descricao: `Abertura de ${quantity} caixas ${caseData.nome}`
          }
        });

        // Transação de crédito total (se houver prêmios)
        if (totalWon > 0) {
          await prisma.transaction.create({
            data: {
              user_id: userId,
              tipo: 'premio',
              valor: totalWon,
              status: 'concluido',
              descricao: `Prêmios ganhos em ${quantity} caixas ${caseData.nome}`
            }
          });
        }
        console.log('✅ Transações registradas');
      } catch (dbError) {
        console.log('⚠️ Erro ao registrar transações:', dbError.message);
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
        userBalance: saldoFinal
      });

    } catch (error) {
      console.error('❌ Erro em buyMultipleCases:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
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
}

module.exports = CompraController;
