const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Serviço de Segurança e Failsafes
 * 
 * Este serviço implementa todas as travas e validações de segurança
 * para garantir que o sistema nunca permita operações que possam
 * comprometer a integridade financeira da plataforma.
 */
class SafetyService {

  /**
   * Valida se o caixa líquido nunca ficará negativo
   * @param {number} premioValor - Valor do prêmio a ser pago
   * @param {number} caixaLiquidoAtual - Caixa líquido atual
   * @returns {boolean} Se a operação é segura
   */
  async validateCaixaLiquidoSafety(premioValor, caixaLiquidoAtual) {
    const caixaLiquidoFinal = caixaLiquidoAtual - premioValor;
    
    if (caixaLiquidoFinal < 0) {
      console.error('🚨 FALHA DE SEGURANÇA: Caixa líquido ficaria negativo!');
      console.error(`- Caixa Atual: R$ ${caixaLiquidoAtual}`);
      console.error(`- Prêmio: R$ ${premioValor}`);
      console.error(`- Caixa Final: R$ ${caixaLiquidoFinal}`);
      
      await this.logSafetyViolation('caixa_liquido_negative', {
        caixa_atual: caixaLiquidoAtual,
        premio_valor: premioValor,
        caixa_final: caixaLiquidoFinal
      });
      
      return false;
    }
    
    return true;
  }

  /**
   * Valida se o prêmio não excede limites de segurança
   * @param {number} premioValor - Valor do prêmio
   * @param {number} casePrice - Preço da caixa
   * @param {number} rtpConfig - RTP configurado
   * @param {number} caixaLiquido - Caixa líquido atual
   * @returns {Object} Resultado da validação
   */
  async validatePrizeLimits(premioValor, casePrice, rtpConfig, caixaLiquido) {
    const multiplicadorCaixa = premioValor / casePrice;
    const limiteRTP = caixaLiquido * (rtpConfig / 100);
    
    // Limite máximo baseado no preço da caixa (50x o preço)
    const limiteMaximoMultiplicador = 50;
    const limiteMaximoValor = casePrice * limiteMaximoMultiplicador;
    
    // Limite baseado no RTP
    const limiteRTPValor = limiteRTP;
    
    // Usar o menor limite
    const limiteFinal = Math.min(limiteMaximoValor, limiteRTPValor);
    
    const isValid = premioValor <= limiteFinal;
    
    if (!isValid) {
      console.error('🚨 FALHA DE SEGURANÇA: Prêmio excede limites!');
      console.error(`- Prêmio: R$ ${premioValor}`);
      console.error(`- Preço Caixa: R$ ${casePrice}`);
      console.error(`- Multiplicador: ${multiplicadorCaixa.toFixed(1)}x`);
      console.error(`- Limite Final: R$ ${limiteFinal}`);
      console.error(`- RTP Config: ${rtpConfig}%`);
      
      await this.logSafetyViolation('premio_exceeds_limits', {
        premio_valor: premioValor,
        case_price: casePrice,
        multiplicador: multiplicadorCaixa,
        limite_final: limiteFinal,
        rtp_config: rtpConfig,
        caixa_liquido: caixaLiquido
      });
    }
    
    return {
      isValid,
      limiteFinal,
      multiplicadorCaixa,
      limiteRTP,
      motivo: isValid ? 'Prêmio dentro dos limites' : 'Prêmio excede limites de segurança'
    };
  }

  /**
   * Valida se o usuário pode realizar a operação
   * @param {string} userId - ID do usuário
   * @param {string} operation - Tipo de operação
   * @returns {Object} Resultado da validação
   */
  async validateUserOperation(userId, operation) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          ativo: true,
          banido_em: true,
          motivo_ban: true,
          saldo_reais: true,
          saldo_demo: true,
          tipo_conta: true
        }
      });

      if (!user) {
        return {
          isValid: false,
          motivo: 'Usuário não encontrado'
        };
      }

      if (!user.ativo) {
        return {
          isValid: false,
          motivo: 'Usuário inativo'
        };
      }

      if (user.banido_em) {
        return {
          isValid: false,
          motivo: `Usuário banido: ${user.motivo_ban || 'Motivo não especificado'}`
        };
      }

      // Validações específicas por operação
      switch (operation) {
        case 'abrir_caixa':
          if (user.saldo < 0) {
            return {
              isValid: false,
              motivo: 'Saldo negativo - usuário não pode abrir caixas'
            };
          }
          break;
          
        case 'sacar':
          if (user.saldo < 10) { // Mínimo R$ 10 para saque
            return {
              isValid: false,
              motivo: 'Saldo insuficiente para saque (mínimo R$ 10)'
            };
          }
          break;
      }

      return {
        isValid: true,
        motivo: 'Usuário válido para operação'
      };

    } catch (error) {
      console.error('❌ Erro ao validar operação do usuário:', error);
      return {
        isValid: false,
        motivo: 'Erro interno na validação'
      };
    }
  }

  /**
   * Valida se a caixa pode ser aberta
   * @param {string} caseId - ID da caixa
   * @returns {Object} Resultado da validação
   */
  async validateCaseOperation(caseId) {
    try {
      const caseData = await prisma.case.findUnique({
        where: { id: caseId },
        include: {
          prizes: {
            select: {
              id: true,
              valor: true,
              probabilidade: true,
              sorteavel: true,
              ativo: true
            }
          }
        }
      });

      if (!caseData) {
        return {
          isValid: false,
          motivo: 'Caixa não encontrada'
        };
      }

      if (!caseData.ativo) {
        return {
          isValid: false,
          motivo: 'Caixa inativa'
        };
      }

      if (!caseData.prizes || caseData.prizes.length === 0) {
        return {
          isValid: false,
          motivo: 'Caixa sem prêmios configurados'
        };
      }

      // Verificar se há prêmios sortáveis
      const sortablePrizes = caseData.prizes.filter(p => p.sorteavel === true || p.sorteavel === 1 || p.sorteavel === 'true');
      if (sortablePrizes.length === 0) {
        return {
          isValid: false,
          motivo: 'Caixa sem prêmios sortáveis configurados'
        };
      }

      // Validar se as probabilidades somam aproximadamente 1.0
      const totalProbability = caseData.prizes.reduce((acc, p) => acc + parseFloat(p.probabilidade), 0);
      if (Math.abs(totalProbability - 1.0) > 0.1) {
        console.warn(`⚠️ Caixa ${caseData.nome} tem probabilidades que não somam 1.0 (${totalProbability})`);
      }

      return {
        isValid: true,
        motivo: 'Caixa válida para operação',
        caseData: caseData
      };

    } catch (error) {
      console.error('❌ Erro ao validar caixa:', error);
      return {
        isValid: false,
        motivo: 'Erro interno na validação da caixa'
      };
    }
  }

  /**
   * Valida configurações do sistema
   * @returns {Object} Resultado da validação
   */
  async validateSystemConfig() {
    try {
      const issues = [];

      // Verificar configuração de RTP
      const rtpConfig = await prisma.rTPConfig.findFirst({
        orderBy: { updated_at: 'desc' }
      });

      if (!rtpConfig) {
        issues.push('Configuração de RTP não encontrada');
      } else if (rtpConfig.rtp_target < 10 || rtpConfig.rtp_target > 90) {
        issues.push(`RTP fora do range permitido: ${rtpConfig.rtp_target}%`);
      }

      // Verificar caixa líquido
      const cashFlowService = require('./cashFlowService');
      const caixaData = await cashFlowService.calcularCaixaLiquido();
      
      if (caixaData.caixaLiquido < 0) {
        issues.push(`Caixa líquido negativo: R$ ${caixaData.caixaLiquido}`);
      }

      // Verificar se há caixas ativas
      const activeCases = await prisma.case.count({
        where: { ativo: true }
      });

      if (activeCases === 0) {
        issues.push('Nenhuma caixa ativa no sistema');
      }

      return {
        isValid: issues.length === 0,
        issues: issues,
        rtp_config: rtpConfig,
        caixa_liquido: caixaData.caixaLiquido,
        active_cases: activeCases
      };

    } catch (error) {
      console.error('❌ Erro ao validar configurações do sistema:', error);
      return {
        isValid: false,
        issues: ['Erro interno na validação do sistema'],
        error: error.message
      };
    }
  }

  /**
   * Registra violação de segurança
   * @param {string} violationType - Tipo de violação
   * @param {Object} data - Dados da violação
   */
  async logSafetyViolation(violationType, data) {
    try {
      await prisma.transaction.create({
        data: {
          user_id: null, // Log do sistema
          tipo: 'violacao_seguranca',
          valor: 0,
          status: 'concluido',
          descricao: `Violação de segurança: ${violationType} - ${JSON.stringify(data)}`
        }
      });

      console.error('🚨 VIOLAÇÃO DE SEGURANÇA REGISTRADA:', {
        type: violationType,
        data: data,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('❌ Erro ao registrar violação de segurança:', error);
    }
  }

  /**
   * Verifica se o sistema está em modo de emergência
   * @returns {boolean} Se o sistema está em modo de emergência
   */
  async isEmergencyMode() {
    try {
      const config = await prisma.systemConfig.findUnique({
        where: { chave: 'emergency_mode' }
      });

      return config && config.valor === 'true';
    } catch (error) {
      console.error('❌ Erro ao verificar modo de emergência:', error);
      return false;
    }
  }

  /**
   * Ativa modo de emergência
   * @param {string} adminId - ID do administrador
   * @param {string} reason - Motivo da ativação
   */
  async activateEmergencyMode(adminId, reason) {
    try {
      await prisma.systemConfig.upsert({
        where: { chave: 'emergency_mode' },
        update: {
          valor: 'true',
          descricao: `Modo de emergência ativado por ${adminId}: ${reason}`
        },
        create: {
          chave: 'emergency_mode',
          valor: 'true',
          descricao: `Modo de emergência ativado por ${adminId}: ${reason}`,
          tipo: 'boolean'
        }
      });

      console.error('🚨 MODO DE EMERGÊNCIA ATIVADO:', {
        admin_id: adminId,
        reason: reason,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('❌ Erro ao ativar modo de emergência:', error);
    }
  }

  /**
   * Desativa modo de emergência
   * @param {string} adminId - ID do administrador
   */
  async deactivateEmergencyMode(adminId) {
    try {
      await prisma.systemConfig.upsert({
        where: { chave: 'emergency_mode' },
        update: {
          valor: 'false',
          descricao: `Modo de emergência desativado por ${adminId}`
        },
        create: {
          chave: 'emergency_mode',
          valor: 'false',
          descricao: `Modo de emergência desativado por ${adminId}`,
          tipo: 'boolean'
        }
      });

      console.log('✅ MODO DE EMERGÊNCIA DESATIVADO:', {
        admin_id: adminId,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('❌ Erro ao desativar modo de emergência:', error);
    }
  }

  /**
   * Obtém relatório de segurança do sistema
   * @returns {Object} Relatório de segurança
   */
  async getSecurityReport() {
    try {
      const systemValidation = await this.validateSystemConfig();
      const emergencyMode = await this.isEmergencyMode();
      
      // Contar violações de segurança nas últimas 24h
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const violations = await prisma.transaction.count({
        where: {
          tipo: 'violacao_seguranca',
          criado_em: {
            gte: yesterday
          }
        }
      });

      return {
        system_validation: systemValidation,
        emergency_mode: emergencyMode,
        violations_last_24h: violations,
        report_timestamp: new Date(),
        status: emergencyMode ? 'EMERGENCY' : (systemValidation.isValid ? 'SAFE' : 'WARNING')
      };

    } catch (error) {
      console.error('❌ Erro ao gerar relatório de segurança:', error);
      return {
        error: error.message,
        status: 'ERROR',
        report_timestamp: new Date()
      };
    }
  }
}

module.exports = new SafetyService();
