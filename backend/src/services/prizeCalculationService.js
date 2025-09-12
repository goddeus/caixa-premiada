const { PrismaClient } = require('@prisma/client');
const rtpService = require('./rtpService');
const cashFlowService = require('./cashFlowService');
const prizeValidationService = require('./prizeValidationService');

const prisma = new PrismaClient();

/**
 * Serviço de Cálculo de Prêmios Inteligente
 * Implementa o algoritmo RTP (Return to Player) baseado no Caixa Líquido
 */
class PrizeCalculationService {
  
  /**
   * Calcula o Caixa Líquido da plataforma usando serviço centralizado
   * CaixaLiquido = TotalDepositos + FundosTeste - TotalSaques - TotalComissoes
   */
  async calculateCaixaLiquido() {
    try {
      // Usar serviço centralizado de fluxo de caixa
      const caixaData = await cashFlowService.calcularCaixaLiquido();
      
      return {
        totalDepositos: caixaData.totalDepositos,
        fundosTeste: caixaData.fundosTeste,
        totalSaques: caixaData.totalSaques,
        totalComissoes: caixaData.totalComissoesAfiliados,
        caixaLiquido: caixaData.caixaLiquido,
        numeroNovosUsuarios: caixaData.totalComissoesAfiliados / 10, // Cada comissão é R$ 10
        timestamp: caixaData.timestamp
      };
    } catch (error) {
      console.error('Erro ao calcular caixa líquido:', error);
      throw new Error('Falha no cálculo do caixa líquido');
    }
  }

  /**
   * Calcula o lucro das caixas (valor gasto pelos usuários - prêmios pagos)
   */
  async calculateLucroCaixas() {
    try {
      // Buscar total gasto em abertura de caixas
      const totalGastoCaixas = await prisma.transaction.aggregate({
        where: {
          tipo: 'abertura_caixa',
          status: 'concluido'
        },
        _sum: {
          valor: true
        }
      });

      // Buscar total de prêmios pagos
      const totalPremiosPagos = await prisma.transaction.aggregate({
        where: {
          tipo: 'premio',
          status: 'concluido'
        },
        _sum: {
          valor: true
        }
      });

      const gastoTotal = totalGastoCaixas._sum.valor || 0;
      const premiosTotal = totalPremiosPagos._sum.valor || 0;
      const lucroCaixas = gastoTotal - premiosTotal;

      return lucroCaixas;
    } catch (error) {
      console.error('Erro ao calcular lucro das caixas:', error);
      return 0;
    }
  }

  /**
   * Obtém o RTP atual configurado no sistema centralizado
   */
  async getCurrentRTP() {
    try {
      const config = await rtpService.getRTPConfig();
      return config.rtp_target / 100; // Converter de % para decimal
    } catch (error) {
      console.error('Erro ao obter RTP atual:', error);
      return 0.15; // Fallback para 15% se houver erro
    }
  }

  /**
   * Calcula o Fundo de Prêmios disponível
   * FundoPremios = CaixaLiquido * RTP
   */
  async calculateFundoPremios() {
    const caixaData = await this.calculateCaixaLiquido();
    const rtp = await this.getCurrentRTP();
    const fundoPremios = caixaData.caixaLiquido * rtp;

    // Buscar total de prêmios já pagos
    const premiosPagos = await prisma.transaction.aggregate({
      where: {
        tipo: 'premio',
        status: 'concluido'
      },
      _sum: {
        valor: true
      }
    });

    const totalPremiosPagos = premiosPagos._sum.valor || 0;
    const fundoRestante = Math.max(0, fundoPremios - totalPremiosPagos);

    return {
      caixaLiquido: caixaData.caixaLiquido,
      rtp: rtp,
      fundoPremiosTotal: fundoPremios,
      premiosPagos: totalPremiosPagos,
      fundoRestante: fundoRestante,
      caixaData: caixaData
    };
  }

  /**
   * Gera prêmios dinâmicos baseados no fundo disponível e RTP atual
   * Sistema inteligente que ajusta probabilidades baseado no RTP configurado
   */
  async generateDynamicPrizes(fundoRestante) {
    const rtp = await this.getCurrentRTP();
    const premios = [];

    // Ajustar distribuição baseada no RTP
    let pequenosPercent, mediosPercent, grandesPercent;
    
    if (rtp <= 0.30) {
      // RTP baixo (≤30%) - muito restritivo
      pequenosPercent = 0.98;
      mediosPercent = 0.015;
      grandesPercent = 0.005;
    } else if (rtp <= 0.50) {
      // RTP médio (30-50%) - equilibrado
      pequenosPercent = 0.90;
      mediosPercent = 0.08;
      grandesPercent = 0.02;
    } else {
      // RTP alto (>50%) - mais generoso
      pequenosPercent = 0.80;
      mediosPercent = 0.15;
      grandesPercent = 0.05;
    }

    // Pequenos prêmios - MAIORIA DOS CASOS
    const fundoPequenos = fundoRestante * pequenosPercent;
    const numPequenos = Math.max(1, Math.floor(fundoPequenos / 1.5));
    
    for (let i = 0; i < numPequenos; i++) {
      const valor = this.getRandomValue(0.5, 3);
      premios.push({
        valor: valor,
        categoria: 'pequeno',
        probabilidade: pequenosPercent / numPequenos
      });
    }

    // Médios prêmios - OCASIONAIS
    const fundoMedios = fundoRestante * mediosPercent;
    const numMedios = Math.max(1, Math.floor(fundoMedios / 5));
    
    for (let i = 0; i < numMedios; i++) {
      const valor = this.getRandomValue(3, 15);
      premios.push({
        valor: valor,
        categoria: 'medio',
        probabilidade: mediosPercent / numMedios
      });
    }

    // Grandes prêmios - RAROS
    const fundoGrandes = fundoRestante * grandesPercent;
    const numGrandes = Math.max(1, Math.floor(fundoGrandes / 25));
    
    for (let i = 0; i < numGrandes; i++) {
      const valor = this.getRandomValue(15, Math.min(100, fundoGrandes));
      premios.push({
        valor: valor,
        categoria: 'grande',
        probabilidade: grandesPercent / numGrandes
      });
    }

    return premios;
  }

  /**
   * Gera valor aleatório dentro de um range
   */
  getRandomValue(min, max) {
    return Math.round((Math.random() * (max - min) + min) * 100) / 100;
  }

  /**
   * Seleciona um prêmio baseado no RTP e fundo disponível com proteção completa
   */
  async selectPrize(caseId) {
    try {
      // 1. Obter dados atualizados do caixa líquido e RTP
      const caixaData = await this.calculateCaixaLiquido();
      const rtpConfig = await this.getCurrentRTP();
      
      console.log('🔍 Dados de proteção RTP:');
      console.log('- Caixa Líquido:', caixaData.caixaLiquido);
      console.log('- RTP Configurado:', rtpConfig);
      
      // 2. Buscar prêmios da caixa específica primeiro
      const caseData = await prisma.case.findUnique({
        where: { id: caseId },
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
      
      if (!caseData || !caseData.prizes || caseData.prizes.length === 0) {
        throw new Error('Caixa não encontrada ou sem prêmios');
      }

      // 3. Calcular limite máximo de prêmio baseado no RTP e caixa líquido
      // Fórmula mais inteligente: considerar o preço da caixa e margem de segurança
      const casePrice = parseFloat(caseData.preco);
      const margemSeguranca = Math.max(casePrice * 10, 50); // Mínimo R$ 50 de margem
      const limiteMaxPremio = Math.max(
        caixaData.caixaLiquido * (rtpConfig / 100),
        margemSeguranca
      );
      console.log('- Preço da Caixa:', casePrice);
      console.log('- Margem de Segurança:', margemSeguranca);
      console.log('- Limite Máximo de Prêmio:', limiteMaxPremio);
      
      // 4. Filtrar prêmios que respeitam o limite de segurança
      const premiosSeguros = caseData.prizes.filter(prize => {
        const valorPremio = parseFloat(prize.valor);
        
        // Lógica mais inteligente:
        // - Prêmios pequenos (até 5x o preço da caixa) são sempre permitidos
        // - Prêmios médios (5x a 20x) são permitidos se não excederem muito o limite
        // - Prêmios grandes (acima de 20x) seguem o limite rigoroso
        const multiplicadorCaixa = valorPremio / casePrice;
        let isSeguro = false;
        
        if (multiplicadorCaixa <= 5) {
          // Prêmios pequenos: sempre permitidos
          isSeguro = true;
        } else if (multiplicadorCaixa <= 20) {
          // Prêmios médios: permitidos se não excederem muito o limite
          isSeguro = valorPremio <= (limiteMaxPremio * 1.5);
        } else {
          // Prêmios grandes: limite rigoroso
          isSeguro = valorPremio <= limiteMaxPremio;
        }
        
        if (!isSeguro) {
          console.log(`🛡️ Prêmio bloqueado por segurança: ${prize.nome} (R$ ${valorPremio}) > Limite (R$ ${limiteMaxPremio}) - Multiplicador: ${multiplicadorCaixa.toFixed(1)}x`);
          this.logPrizeBlocked(prize, limiteMaxPremio, rtpConfig, caixaData.caixaLiquido);
        }
        
        return isSeguro;
      });
      
      // 5. Se não há prêmios seguros, usar prêmio mínimo
      if (premiosSeguros.length === 0) {
        console.log('⚠️ Nenhum prêmio seguro disponível. Usando prêmio mínimo.');
        return {
          success: true,
          prize: {
            id: 'minimo',
            nome: 'Prêmio Mínimo',
            valor: Math.max(casePrice * 0.5, 1.00), // Mínimo 50% do preço da caixa ou R$ 1,00
            probabilidade: 1.0
          },
          protectionApplied: true,
          reason: 'Nenhum prêmio seguro disponível',
          limiteMaxPremio: limiteMaxPremio,
          rtpConfig: rtpConfig,
          caixaLiquido: caixaData.caixaLiquido
        };
      }
      
      // 6. Seleção ponderada por probabilidade (apenas prêmios seguros)
      const totalProbabilidade = premiosSeguros.reduce((acc, p) => acc + parseFloat(p.probabilidade), 0);
      let random = Math.random() * totalProbabilidade;
      
      let selectedPrize = null;
      for (const premio of premiosSeguros) {
        random -= parseFloat(premio.probabilidade);
        if (random <= 0) {
          selectedPrize = premio;
          break;
        }
      }
      
      // Fallback: primeiro prêmio seguro
      if (!selectedPrize) {
        selectedPrize = premiosSeguros[0];
      }
      
      // 7. Verificação final de segurança
      const premioFinal = Math.min(parseFloat(selectedPrize.valor), limiteMaxPremio);
      
      // 8. VALIDAÇÃO CRÍTICA: Verificar consistência antes de creditar
      console.log('🔍 Validando consistência do prêmio antes do crédito...');
      const validationResult = await prizeValidationService.validatePrizeBeforeCredit(selectedPrize.id);
      
      if (!validationResult.valid) {
        console.error('❌ VALIDAÇÃO FALHOU - Prêmio não será creditado:', validationResult.error);
        
        // Registrar falha crítica
        await prisma.transaction.create({
          data: {
            user_id: null,
            tipo: 'validacao_premio_falhou',
            valor: premioFinal,
            status: 'falhou',
            descricao: `Falha na validação do prêmio ${selectedPrize.nome}: ${validationResult.error}`,
            case_id: caseId
          }
        });

        return {
          success: false,
          error: 'Falha na validação de consistência do prêmio',
          validation_error: validationResult.error,
          prize: null
        };
      }
      
      console.log('✅ Validação de consistência aprovada!');
      console.log('✅ Prêmio selecionado com proteção:');
      console.log('- Prêmio:', selectedPrize.nome);
      console.log('- Valor Original:', selectedPrize.valor);
      console.log('- Valor Final:', premioFinal);
      console.log('- Proteção Aplicada:', premioFinal < parseFloat(selectedPrize.valor));
      
      return {
        success: true,
        prize: {
          id: selectedPrize.id,
          nome: selectedPrize.nome,
          valor: premioFinal,
          probabilidade: selectedPrize.probabilidade,
          imagem_url: selectedPrize.imagem_url
        },
        protectionApplied: premioFinal < parseFloat(selectedPrize.valor),
        reason: premioFinal < parseFloat(selectedPrize.valor) ? 'Valor limitado por proteção RTP' : 'Prêmio dentro do limite seguro',
        limiteMaxPremio: limiteMaxPremio,
        rtpConfig: rtpConfig,
        caixaLiquido: caixaData.caixaLiquido,
        premiosBloqueados: caseData.prizes.length - premiosSeguros.length,
        validation_passed: true
      };

    } catch (error) {
      console.error('❌ Erro ao selecionar prêmio:', error);
      return {
        success: false,
        error: error.message,
        prize: null
      };
    }
  }

  /**
   * Registra prêmio bloqueado por segurança no log de auditoria
   */
  async logPrizeBlocked(prize, limiteMaxPremio, rtpConfig, caixaLiquido) {
    try {
      const logData = {
        timestamp: new Date(),
        tipo: 'premio_bloqueado',
        premio: {
          id: prize.id,
          nome: prize.nome,
          valor: parseFloat(prize.valor)
        },
        limiteMaxPremio: limiteMaxPremio,
        rtpConfig: rtpConfig,
        caixaLiquido: caixaLiquido,
        motivo: `Prêmio excede limite de segurança (R$ ${parseFloat(prize.valor)} > R$ ${limiteMaxPremio})`
      };
      
      console.log('📝 LOG DE AUDITORIA - Prêmio Bloqueado:', logData);
      
      // Salvar no banco de dados para auditoria (sem foreign key para evitar erro)
      try {
        await prisma.transaction.create({
          data: {
            user_id: null, // Sem foreign key para logs do sistema
            tipo: 'auditoria_premio_bloqueado',
            valor: parseFloat(prize.valor),
            status: 'concluido',
            descricao: `Prêmio bloqueado: ${prize.nome} (R$ ${parseFloat(prize.valor)}) - Limite: R$ ${limiteMaxPremio} (RTP: ${rtpConfig}%)`
          }
        });
      } catch (dbError) {
        // Se falhar, apenas log no console (não crítico)
        console.log('⚠️ Não foi possível salvar log no banco:', dbError.message);
      }
      
    } catch (error) {
      console.error('Erro ao registrar log de prêmio bloqueado:', error);
    }
  }

  /**
   * Registra o prêmio pago no banco de dados
   */
  async registerPrizePayment(userId, caseId, prizeData) {
    try {
      await prisma.transaction.create({
        data: {
          user_id: userId,
          case_id: caseId,
          tipo: 'premio',
          valor: prizeData.premio,
          status: 'concluido',
          descricao: `Prêmio ${prizeData.categoria}: R$ ${prizeData.premio.toFixed(2)}`
        }
      });

      return true;
    } catch (error) {
      console.error('Erro ao registrar pagamento do prêmio:', error);
      throw new Error('Falha ao registrar prêmio');
    }
  }

  /**
   * Obtém estatísticas detalhadas do sistema de prêmios
   */
  async getPrizeStats() {
    try {
      const fundoData = await this.calculateFundoPremios();
      
      // Estatísticas por categoria de prêmio
      const premiosPorCategoria = await prisma.transaction.groupBy({
        by: ['descricao'],
        where: {
          tipo: 'premio',
          status: 'concluido'
        },
        _sum: {
          valor: true
        },
        _count: {
          valor: true
        }
      });

      return {
        caixaLiquido: fundoData.caixaLiquido,
        rtp: fundoData.rtp,
        fundoPremiosTotal: fundoData.fundoPremiosTotal,
        premiosPagos: fundoData.premiosPagos,
        fundoRestante: fundoData.fundoRestante,
        utilizacaoFundo: (fundoData.premiosPagos / fundoData.fundoPremiosTotal * 100).toFixed(2) + '%',
        premiosPorCategoria: premiosPorCategoria,
        caixaData: fundoData.caixaData
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas de prêmios:', error);
      throw new Error('Falha ao obter estatísticas');
    }
  }
}

module.exports = new PrizeCalculationService();
