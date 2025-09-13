const { PrismaClient } = require('@prisma/client');
const prizeCalculationService = require('./prizeCalculationService');
const cashFlowService = require('./cashFlowService');
const rtpService = require('./rtpService');
const userRTPService = require('./userRTPService');
const auditLogService = require('./auditLogService');
const safetyService = require('./safetyService');
const centralizedDrawService = require('./centralizedDrawService');
const userSessionService = require('./userSessionService');

const prisma = new PrismaClient();

/**
 * Serviço Global de Sorteio Centralizado
 * 
 * Esta função é responsável por centralizar toda a lógica de sorteio da plataforma,
 * respeitando o RTP configurado no painel administrador e o caixa líquido da plataforma.
 * 
 * Nenhuma caixa deve ter autonomia de sorteio - todas devem obrigatoriamente chamar
 * esta função central para decidir o resultado.
 */
class GlobalDrawService {

  /**
   * Função principal de sorteio centralizado
   * @param {string} caixa_id - ID da caixa sendo aberta
   * @param {string} user_id - ID do usuário que está abrindo a caixa
   * @returns {Object} Resultado do sorteio com prêmio selecionado
   */
  async sortearPremio(caixa_id, user_id) {
    const startTime = Date.now();
    
    try {
      console.log(`🎲 INICIANDO SORTEIO GLOBAL - Caixa: ${caixa_id}, Usuário: ${user_id}`);

      // 1. VALIDAÇÕES INICIAIS E SEGURANÇA
      console.log('🔍 Validando requisição...');
      await this.validateDrawRequest(caixa_id, user_id);
      console.log('✅ Validação de requisição concluída');
      
      // Verificar modo de emergência
      console.log('🔍 Verificando modo de emergência...');
      const emergencyMode = await safetyService.isEmergencyMode();
      console.log('✅ Modo de emergência verificado:', emergencyMode);
      if (emergencyMode) {
        throw new Error('Sistema em modo de emergência - sorteios suspensos');
      }
      
      // Validar operação do usuário
      console.log('🔍 Validando operação do usuário...');
      const userValidation = await safetyService.validateUserOperation(user_id, 'abrir_caixa');
      console.log('✅ Validação do usuário:', userValidation);
      if (!userValidation.isValid) {
        throw new Error(`Usuário não autorizado: ${userValidation.motivo}`);
      }
      
      // Validar operação da caixa
      console.log('🔍 Validando operação da caixa...');
      const caseValidation = await safetyService.validateCaseOperation(caixa_id);
      console.log('✅ Validação da caixa:', caseValidation);
      if (!caseValidation.isValid) {
        throw new Error(`Caixa não autorizada: ${caseValidation.motivo}`);
      }

      // 2. OBTER OU CRIAR SESSÃO ATIVA
      console.log('🔍 Obtendo/criando sessão ativa...');
      const session = await userSessionService.getOrCreateActiveSession(user_id);
      console.log('✅ Sessão obtida:', session.id);

      // 3. CHAMAR SISTEMA CENTRALIZADO
      console.log('🔍 Chamando sistema centralizado...');
      const result = await centralizedDrawService.sortearPremio(caixa_id, user_id, session.id);

      console.log('✅ SORTEIO CONCLUÍDO COM SUCESSO:');
      console.log('- Resultado:', result.result);
      console.log('- Prêmio:', result.prize.nome);
      console.log('- Valor:', result.prize.valor);
      console.log('- Tempo de Processamento:', (Date.now() - startTime) + 'ms');

      return {
        success: result.success,
        prize: result.prize,
        message: result.message,
        audit_data: {
          result_type: result.result,
          processing_time_ms: Date.now() - startTime
        }
      };

    } catch (error) {
      console.error('❌ ERRO NO SORTEIO GLOBAL:', error);
      
      // Retornar prêmio mínimo em caso de erro
      const minPrize = {
        id: 'erro_minimo',
        nome: 'Prêmio Mínimo',
        valor: 1.00,
        tipo: 'cash',
        imagem_url: null
      };
      
      return {
        success: false,
        prize: minPrize,
        message: 'Erro no sorteio - prêmio mínimo aplicado',
        audit_data: {
          result_type: 'ERROR',
          processing_time_ms: Date.now() - startTime,
          error: error.message
        }
      };
    }
  }

  /**
   * Valida se a requisição de sorteio é válida
   */
  async validateDrawRequest(caixa_id, user_id) {
    if (!caixa_id || !user_id) {
      throw new Error('ID da caixa e ID do usuário são obrigatórios');
    }

    // Verificar se a caixa existe e está ativa
    const caseExists = await prisma.case.findFirst({
      where: { 
        id: caixa_id, 
        ativo: true 
      },
      include: {
        prizes: {
          where: {
            ativo: true,
            sorteavel: true
          }
        }
      }
    });

    if (!caseExists) {
      throw new Error('Caixa não encontrada ou inativa');
    }

    if (!caseExists.prizes || caseExists.prizes.length === 0) {
      throw new Error('Caixa sem prêmios configurados');
    }

    // Verificar se o usuário existe e está ativo
    const userExists = await prisma.user.findFirst({
      where: { 
        id: user_id, 
        ativo: true 
      }
    });

    if (!userExists) {
      throw new Error('Usuário não encontrado ou inativo');
    }
  }

  /**
   * Obtém a configuração atual de RTP
   */
  async getCurrentRTPConfig() {
    try {
      const config = await rtpService.getRTPConfig();
      return {
        rtp_target: config.rtp_target,
        rtp_recommended: config.rtp_recommended,
        updated_at: config.updated_at
      };
    } catch (error) {
      console.error('Erro ao obter configuração RTP:', error);
      return {
        rtp_target: 50.0, // Fallback para 50%
        rtp_recommended: null,
        updated_at: new Date()
      };
    }
  }

  /**
   * Obtém dados atualizados do caixa líquido
   */
  async getCaixaLiquido() {
    try {
      return await cashFlowService.calcularCaixaLiquido();
    } catch (error) {
      console.error('Erro ao obter caixa líquido:', error);
      throw new Error('Falha ao obter dados do caixa líquido');
    }
  }

  /**
   * Obtém prêmios da caixa específica
   */
  async getCasePrizes(caixa_id) {
    const caseData = await prisma.case.findUnique({
      where: { id: caixa_id },
      include: {
        prizes: {
          select: {
            id: true,
            nome: true,
            valor: true,
            probabilidade: true,
            imagem_url: true,
            tipo: true,
            ilustrativo: true,
            ativo: true,
            sorteavel: true
          }
        }
      }
    });

    if (!caseData) {
      throw new Error('Caixa não encontrada');
    }

    if (!caseData.prizes || caseData.prizes.length === 0) {
      throw new Error('Caixa não possui prêmios configurados');
    }

    return caseData;
  }

  /**
   * Calcula o limite máximo de prêmio baseado no RTP e caixa líquido
   */
  async calculateMaxPrizeLimit(caixaData, rtpConfig, casePrice) {
    const rtpDecimal = rtpConfig.rtp_target / 100;
    const margemSeguranca = Math.max(casePrice * 10, 50); // Mínimo R$ 50 de margem
    
    // Limite baseado no RTP do caixa líquido
    const limiteRTP = caixaData.caixaLiquido * rtpDecimal;
    
    // Limite baseado na margem de segurança
    const limiteMargem = margemSeguranca;
    
    // Usar o menor entre os dois limites
    const limiteMaximo = Math.min(limiteRTP, limiteMargem);
    
    // Garantir que nunca seja menor que o preço da caixa
    return Math.max(limiteMaximo, casePrice);
  }

  /**
   * Filtra prêmios que respeitam o limite de segurança
   */
  async filterSafePrizes(prizes, maxPrizeLimit, casePrice) {
    return prizes.filter(prize => {
      // VALIDAÇÃO CRÍTICA: Excluir prêmios não sortáveis
      if (prize.sorteavel === false) {
        console.log(`🚫 Prêmio não sortável excluído: ${prize.nome} (R$ ${prize.valor})`);
        return false;
      }

      // VALIDAÇÃO CRÍTICA: Excluir prêmios ilustrativos do sorteio
      if (prize.ilustrativo || prize.tipo === 'ilustrativo') {
        console.log(`🚫 Prêmio ilustrativo excluído do sorteio: ${prize.nome} (R$ ${prize.valor})`);
        return false;
      }

      // VALIDAÇÃO CRÍTICA: Excluir prêmios inativos
      if (prize.ativo === false) {
        console.log(`🚫 Prêmio inativo excluído: ${prize.nome} (R$ ${prize.valor})`);
        return false;
      }

      // VALIDAÇÃO CRÍTICA: Excluir prêmios com valor > R$ 1.000 (ilustrativos)
      const valorPremio = parseFloat(prize.valor);
      if (valorPremio > 1000) {
        console.log(`🚫 Prêmio de alto valor excluído (ilustrativo): ${prize.nome} (R$ ${prize.valor})`);
        return false;
      }

      const multiplicadorCaixa = valorPremio / casePrice;
      
      // Lógica inteligente de segurança
      if (multiplicadorCaixa <= 5) {
        // Prêmios pequenos: sempre permitidos
        return true;
      } else if (multiplicadorCaixa <= 20) {
        // Prêmios médios: permitidos se não excederem muito o limite
        return valorPremio <= (maxPrizeLimit * 1.5);
      } else {
        // Prêmios grandes: limite rigoroso
        return valorPremio <= maxPrizeLimit;
      }
    });
  }

  /**
   * Ajusta probabilidades dinamicamente para respeitar o RTP
   */
  async adjustProbabilitiesForRTP(prizes, rtpConfig, casePrice) {
    const rtpDecimal = rtpConfig.rtp_target / 100;
    const totalCurrentProbability = prizes.reduce((acc, p) => acc + parseFloat(p.probabilidade), 0);
    
    // Calcular o valor esperado atual dos prêmios
    const currentExpectedValue = prizes.reduce((acc, p) => {
      return acc + (parseFloat(p.valor) * parseFloat(p.probabilidade));
    }, 0);
    
    // Calcular o valor esperado desejado baseado no RTP
    const targetExpectedValue = casePrice * rtpDecimal;
    
    console.log(`🎯 Ajustando RTP: Valor esperado atual: R$ ${currentExpectedValue.toFixed(2)}, Alvo: R$ ${targetExpectedValue.toFixed(2)}`);
    
    // Se o valor esperado atual já está próximo do alvo, apenas normalizar
    if (Math.abs(currentExpectedValue - targetExpectedValue) < 0.01) {
      return prizes.map(prize => ({
        ...prize,
        probabilidade: parseFloat(prize.probabilidade) / totalCurrentProbability
      }));
    }
    
    // Ajustar probabilidades para atingir o RTP desejado
    const adjustmentFactor = targetExpectedValue / currentExpectedValue;
    
    const adjustedPrizes = prizes.map(prize => {
      const newProbability = parseFloat(prize.probabilidade) * adjustmentFactor;
      return {
        ...prize,
        probabilidade: Math.max(0.001, newProbability) // Mínimo de 0.1% de chance
      };
    });
    
    // Normalizar para somar 1.0
    const totalAdjustedProbability = adjustedPrizes.reduce((acc, p) => acc + p.probabilidade, 0);
    
    return adjustedPrizes.map(prize => ({
      ...prize,
      probabilidade: prize.probabilidade / totalAdjustedProbability
    }));
  }

  /**
   * Realiza sorteio ponderado baseado nas probabilidades
   */
  async performWeightedDraw(prizes) {
    const totalProbability = prizes.reduce((acc, p) => acc + parseFloat(p.probabilidade), 0);
    let random = Math.random() * totalProbability;
    
    for (const prize of prizes) {
      random -= parseFloat(prize.probabilidade);
      if (random <= 0) {
        return prize;
      }
    }
    
    // Fallback: primeiro prêmio
    return prizes[0];
  }

  /**
   * Valida se o prêmio é compatível com o caixa líquido atual
   */
  async validatePrizeCompatibility(prize, caixaData, rtpConfig) {
    const valorPremio = parseFloat(prize.valor);
    const rtpDecimal = rtpConfig.rtp_target / 100;
    
    // Verificar se o prêmio não excede o limite de segurança
    const limiteMaximo = caixaData.caixaLiquido * rtpDecimal;
    
    return valorPremio <= limiteMaximo;
  }

  /**
   * Cria prêmio mínimo quando não há prêmios seguros
   */
  async createMinimalPrize(casePrice) {
    return {
      id: 'minimo',
      nome: 'Prêmio Mínimo',
      valor: Math.max(casePrice * 0.5, 1.00), // Mínimo 50% do preço da caixa ou R$ 1,00
      probabilidade: 1.0,
      imagem_url: null
    };
  }

  /**
   * Aplica proteção final ao prêmio selecionado
   */
  async applyFinalProtection(prize, maxPrizeLimit) {
    const valorOriginal = parseFloat(prize.valor);
    const valorFinal = Math.min(valorOriginal, maxPrizeLimit);
    
    return {
      ...prize,
      valor: valorFinal,
      protection_applied: valorFinal < valorOriginal
    };
  }

  /**
   * Atualiza o caixa líquido após o sorteio
   */
  async updateCaixaLiquido(premioValor) {
    // O caixa líquido será atualizado automaticamente quando a transação for registrada
    // Aqui apenas retornamos os dados atualizados
    return await this.getCaixaLiquido();
  }

  /**
   * Registra a transação do prêmio no banco
   */
  async registerPrizeTransaction(user_id, case_id, prize) {
    try {
      // Buscar tipo de conta do usuário
      const user = await prisma.user.findUnique({
        where: { id: user_id },
        select: { tipo_conta: true }
      });

      const isDemoAccount = user && user.tipo_conta === 'afiliado_demo';

      // 1. Creditar o valor do prêmio no saldo correto do usuário
      await prisma.user.update({
        where: { id: user_id },
        data: isDemoAccount ? {
          saldo_demo: { increment: prize.valor }
        } : {
          saldo_reais: { increment: prize.valor }
        }
      });

      // Sincronizar com Wallet
      await prisma.wallet.update({
        where: { user_id: user_id },
        data: isDemoAccount ? {
          saldo_demo: { increment: prize.valor }
        } : {
          saldo_reais: { increment: prize.valor }
        }
      });

      // 2. Registrar a transação do prêmio
      await prisma.transaction.create({
        data: {
          user_id: user_id,
          case_id: case_id,
          tipo: 'premio',
          valor: prize.valor,
          status: 'concluido',
          descricao: `Prêmio sorteado: ${prize.nome} - R$ ${prize.valor.toFixed(2)}`
        }
      });
    } catch (error) {
      console.error('Erro ao registrar transação do prêmio:', error);
      throw new Error('Falha ao registrar prêmio');
    }
  }

  /**
   * Registra o resultado do sorteio no log de auditoria
   */
  async logDrawResult(logData) {
    try {
      // Log detalhado no console
      console.log('📝 LOG DE AUDITORIA - Sorteio Global:', {
        timestamp: logData.timestamp,
        user_id: logData.user_id,
        case_id: logData.case_id,
        success: logData.success,
        prize: logData.prize_selected,
        rtp_config: logData.rtp_config,
        caixa_liquido_before: logData.caixa_liquido_before,
        caixa_liquido_after: logData.caixa_liquido_after,
        retry_count: logData.retry_count,
        processing_time_ms: logData.processing_time_ms,
        error: logData.error
      });

      // Salvar no banco de dados para auditoria
      await prisma.transaction.create({
        data: {
          user_id: logData.user_id,
          case_id: logData.case_id,
          tipo: 'auditoria_sorteio_global',
          valor: 0, // Transações de auditoria não têm valor monetário
          status: 'concluido',
          descricao: `Sorteio Global - Sucesso: ${logData.success} - Prêmio: ${logData.prize_selected?.nome || 'N/A'} - RTP: ${logData.rtp_config?.rtp_target || 'N/A'}% - Tempo: ${logData.processing_time_ms}ms`
        }
      });
    } catch (error) {
      console.error('Erro ao registrar log de auditoria:', error);
    }
  }

  /**
   * Formata o resultado do sorteio para retorno
   */
  formatDrawResult(prize, success, message, logData) {
    return {
      success: success,
      prize: {
        id: prize.id,
        nome: prize.nome,
        valor: prize.valor,
        probabilidade: prize.probabilidade,
        imagem_url: prize.imagem_url
      },
      message: message,
      audit_data: {
        rtp_config: logData.rtp_config,
        caixa_liquido_before: logData.caixa_liquido_before,
        caixa_liquido_after: logData.caixa_liquido_after,
        protection_applied: logData.protection_applied,
        retry_count: logData.retry_count,
        processing_time_ms: logData.processing_time_ms
      }
    };
  }

  /**
   * Obtém estatísticas do sistema de sorteio global
   */
  async getDrawStats() {
    try {
      const stats = await prisma.transaction.groupBy({
        by: ['tipo'],
        where: {
          tipo: {
            in: ['premio', 'auditoria_sorteio_global']
          },
          status: 'concluido'
        },
        _sum: {
          valor: true
        },
        _count: {
          valor: true
        }
      });

      const rtpConfig = await this.getCurrentRTPConfig();
      const caixaData = await this.getCaixaLiquido();

      return {
        rtp_config: rtpConfig,
        caixa_liquido: caixaData.caixaLiquido,
        total_premios_pagos: stats.find(s => s.tipo === 'premio')?._sum.valor || 0,
        total_sorteios_realizados: stats.find(s => s.tipo === 'auditoria_sorteio_global')?._count.valor || 0,
        stats_by_type: stats
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas do sorteio:', error);
      throw new Error('Falha ao obter estatísticas');
    }
  }
}

module.exports = new GlobalDrawService();
