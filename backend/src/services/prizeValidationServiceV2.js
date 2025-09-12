const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');
const prizeUtils = require('../utils/prizeUtils');

const prisma = new PrismaClient();

/**
 * Serviço de Validação de Prêmios V2
 * Sistema definitivo com regras por tipo de prêmio
 */
class PrizeValidationServiceV2 {
  
  constructor() {
    this.logPath = path.join(__dirname, '../../logs');
    this.ensureLogDirectory();
  }

  /**
   * Garante que o diretório de logs existe
   */
  async ensureLogDirectory() {
    try {
      await fs.mkdir(this.logPath, { recursive: true });
    } catch (error) {
      console.error('Erro ao criar diretório de logs:', error);
    }
  }

  /**
   * Registra inconsistência no log
   */
  async logInconsistency(inconsistency) {
    try {
      const logEntry = {
        timestamp: new Date().toISOString(),
        ...inconsistency
      };

      const logFile = path.join(this.logPath, 'inconsistencias-premios-v2.log');
      const logLine = JSON.stringify(logEntry) + '\n';
      
      await fs.appendFile(logFile, logLine);
      console.log('📝 Inconsistência registrada:', inconsistency);
    } catch (error) {
      console.error('Erro ao registrar inconsistência:', error);
    }
  }

  /**
   * Valida prêmio individual com regras por tipo
   */
  async validateSinglePrize(prize) {
    const inconsistencies = [];

    try {
      // Normalizar prêmio
      const normalizedPrize = prizeUtils.normalizarPremio(prize);
      
      // Validar estrutura básica
      const validation = prizeUtils.validarPremio(normalizedPrize);
      if (!validation.valid) {
        inconsistencies.push(...validation.errors.map(error => ({
          type: 'validation_error',
          message: error,
          prize_id: prize.id,
          case_id: prize.case_id
        })));
      }

      // Aplicar regras específicas por tipo
      switch (normalizedPrize.tipo) {
        case 'cash':
          inconsistencies.push(...this.validateCashPrize(prize, normalizedPrize));
          break;
          
        case 'produto':
          inconsistencies.push(...this.validateProdutoPrize(prize, normalizedPrize));
          break;
          
        case 'ilustrativo':
          inconsistencies.push(...this.validateIlustrativoPrize(prize, normalizedPrize));
          break;
      }

      return inconsistencies;

    } catch (error) {
      console.error(`Erro ao validar prêmio ${prize.id}:`, error);
      inconsistencies.push({
        type: 'validation_error',
        message: `Erro interno na validação: ${error.message}`,
        prize_id: prize.id,
        case_id: prize.case_id
      });
      return inconsistencies;
    }
  }

  /**
   * Valida prêmios de dinheiro (cash)
   */
  validateCashPrize(originalPrize, normalizedPrize) {
    const inconsistencies = [];
    const valorCentavos = normalizedPrize.valor_centavos;

    // Regra 1: Nome deve ser igual ao label formatado
    const expectedLabel = prizeUtils.formatarBRL(valorCentavos);
    if (originalPrize.nome !== expectedLabel) {
      inconsistencies.push({
        type: 'cash_nome_inconsistente',
        message: `Prêmio cash: nome "${originalPrize.nome}" deveria ser "${expectedLabel}"`,
        prize_id: originalPrize.id,
        case_id: originalPrize.case_id,
        expected_name: expectedLabel,
        actual_name: originalPrize.nome
      });
    }

    // Regra 2: Label deve ser formatado corretamente
    if (originalPrize.label !== expectedLabel) {
      inconsistencies.push({
        type: 'cash_label_inconsistente',
        message: `Prêmio cash: label "${originalPrize.label}" deveria ser "${expectedLabel}"`,
        prize_id: originalPrize.id,
        case_id: originalPrize.case_id,
        expected_label: expectedLabel,
        actual_label: originalPrize.label
      });
    }

    // Regra 3: Imagem deve seguir padrão cash
    const expectedImagem = prizeUtils.assetKeyCash(valorCentavos);
    if (originalPrize.imagem_id !== expectedImagem) {
      inconsistencies.push({
        type: 'cash_imagem_inconsistente',
        message: `Prêmio cash: imagem "${originalPrize.imagem_id}" deveria ser "${expectedImagem}"`,
        prize_id: originalPrize.id,
        case_id: originalPrize.case_id,
        expected_imagem: expectedImagem,
        actual_imagem: originalPrize.imagem_id
      });
    }

    // Regra 4: Tipo deve ser cash
    if (originalPrize.tipo !== 'cash') {
      inconsistencies.push({
        type: 'cash_tipo_inconsistente',
        message: `Prêmio com nome monetário deveria ser tipo "cash", mas é "${originalPrize.tipo}"`,
        prize_id: originalPrize.id,
        case_id: originalPrize.case_id,
        expected_tipo: 'cash',
        actual_tipo: originalPrize.tipo
      });
    }

    return inconsistencies;
  }

  /**
   * Valida prêmios de produto
   */
  validateProdutoPrize(originalPrize, normalizedPrize) {
    const inconsistencies = [];

    // Regra 1: NÃO inferir valor a partir de números no nome
    // Esta regra é aplicada automaticamente - não geramos inconsistências para isso

    // Regra 2: Validar se imagem existe
    if (!originalPrize.imagem_id || originalPrize.imagem_id === '') {
      inconsistencies.push({
        type: 'produto_sem_imagem',
        message: `Prêmio produto "${originalPrize.nome}" sem imagem_id definido`,
        prize_id: originalPrize.id,
        case_id: originalPrize.case_id,
        prize_name: originalPrize.nome
      });
    }

    // Regra 3: Se valor > 500000 centavos, deve ser ilustrativo
    if (normalizedPrize.valor_centavos > 500000) {
      inconsistencies.push({
        type: 'produto_valor_excessivo',
        message: `Prêmio produto com valor R$ ${normalizedPrize.valor_centavos / 100} deveria ser ilustrativo`,
        prize_id: originalPrize.id,
        case_id: originalPrize.case_id,
        prize_value: normalizedPrize.valor_centavos / 100
      });
    }

    // Regra 4: Validar probabilidade
    if (originalPrize.probabilidade < 0 || originalPrize.probabilidade > 1) {
      inconsistencies.push({
        type: 'probabilidade_invalida',
        message: `Prêmio "${originalPrize.nome}" tem probabilidade inválida: ${originalPrize.probabilidade}`,
        prize_id: originalPrize.id,
        case_id: originalPrize.case_id,
        invalid_probability: originalPrize.probabilidade
      });
    }

    return inconsistencies;
  }

  /**
   * Valida prêmios ilustrativos
   */
  validateIlustrativoPrize(originalPrize, normalizedPrize) {
    const inconsistencies = [];

    // Regra 1: Prêmios ilustrativos não devem ser sorteados
    // Esta regra é aplicada automaticamente no sistema de sorteio

    // Regra 2: Validar integridade visual
    if (!originalPrize.imagem_id || originalPrize.imagem_id === '') {
      inconsistencies.push({
        type: 'ilustrativo_sem_imagem',
        message: `Prêmio ilustrativo "${originalPrize.nome}" sem imagem_id definido`,
        prize_id: originalPrize.id,
        case_id: originalPrize.case_id,
        prize_name: originalPrize.nome
      });
    }

    // Regra 3: Validar se realmente deveria ser ilustrativo
    if (normalizedPrize.valor_centavos <= 500000) {
      inconsistencies.push({
        type: 'ilustrativo_valor_baixo',
        message: `Prêmio ilustrativo com valor R$ ${normalizedPrize.valor_centavos / 100} deveria ser produto`,
        prize_id: originalPrize.id,
        case_id: originalPrize.case_id,
        prize_value: normalizedPrize.valor_centavos / 100
      });
    }

    return inconsistencies;
  }

  /**
   * Função principal de verificação global
   */
  async verificarConsistenciaPremios() {
    console.log('🔍 Iniciando verificação global de consistência de prêmios V2...');
    
    const startTime = Date.now();
    const results = {
      total_cases: 0,
      total_prizes: 0,
      prizes_by_type: {
        cash: 0,
        produto: 0,
        ilustrativo: 0
      },
      inconsistencies_found: 0,
      inconsistencies: [],
      cases_with_issues: new Set(),
      summary: {
        validation_error: 0,
        cash_nome_inconsistente: 0,
        cash_label_inconsistente: 0,
        cash_imagem_inconsistente: 0,
        cash_tipo_inconsistente: 0,
        produto_sem_imagem: 0,
        produto_valor_excessivo: 0,
        ilustrativo_sem_imagem: 0,
        ilustrativo_valor_baixo: 0,
        probabilidade_invalida: 0
      }
    };

    try {
      // Buscar todas as caixas com seus prêmios
      const cases = await prisma.case.findMany({
        include: {
          prizes: true
        },
        where: {
          ativo: true
        }
      });

      results.total_cases = cases.length;

      for (const caseItem of cases) {
        console.log(`📦 Verificando caixa: ${caseItem.nome} (${caseItem.prizes.length} prêmios)`);
        
        for (const prize of caseItem.prizes) {
          results.total_prizes++;
          
          // Contar por tipo
          const tipo = prize.tipo || prizeUtils.determinarTipoPremio(prize);
          results.prizes_by_type[tipo]++;
          
          const inconsistencies = await this.validateSinglePrize(prize);
          
          if (inconsistencies.length > 0) {
            results.inconsistencies_found += inconsistencies.length;
            results.cases_with_issues.add(caseItem.id);
            
            for (const inconsistency of inconsistencies) {
              results.inconsistencies.push(inconsistency);
              results.summary[inconsistency.type]++;
              
              // Registrar no log
              await this.logInconsistency(inconsistency);
            }
          }
        }
      }

      const endTime = Date.now();
      const processingTime = endTime - startTime;

      console.log('✅ Verificação concluída!');
      console.log(`📊 Resumo:`);
      console.log(`- Caixas verificadas: ${results.total_cases}`);
      console.log(`- Prêmios verificados: ${results.total_prizes}`);
      console.log(`- Prêmios cash: ${results.prizes_by_type.cash}`);
      console.log(`- Prêmios produto: ${results.prizes_by_type.produto}`);
      console.log(`- Prêmios ilustrativo: ${results.prizes_by_type.ilustrativo}`);
      console.log(`- Inconsistências encontradas: ${results.inconsistencies_found}`);
      console.log(`- Caixas com problemas: ${results.cases_with_issues.size}`);
      console.log(`- Tempo de processamento: ${processingTime}ms`);

      if (results.inconsistencies_found > 0) {
        console.log('⚠️ Tipos de inconsistências encontradas:');
        Object.entries(results.summary).forEach(([type, count]) => {
          if (count > 0) {
            console.log(`  - ${type}: ${count}`);
          }
        });
      }

      return {
        success: true,
        ...results,
        processing_time_ms: processingTime,
        has_inconsistencies: results.inconsistencies_found > 0
      };

    } catch (error) {
      console.error('❌ Erro durante verificação de consistência:', error);
      return {
        success: false,
        error: error.message,
        ...results
      };
    }
  }

  /**
   * Validação rápida antes de creditar prêmio
   */
  async validatePrizeBeforeCredit(prizeId) {
    try {
      const prize = await prisma.prize.findUnique({
        where: { id: prizeId },
        include: {
          case: true
        }
      });

      if (!prize) {
        return {
          valid: false,
          error: 'Prêmio não encontrado'
        };
      }

      // VALIDAÇÃO CRÍTICA: Verificar se é prêmio ilustrativo
      if (prize.tipo === 'ilustrativo') {
        await this.logInconsistency({
          type: 'premio_ilustrativo_tentativa_credito',
          message: `Tentativa de creditar prêmio ilustrativo: ${prize.nome} (R$ ${prize.valor_centavos / 100})`,
          prize_id: prize.id,
          case_id: prize.case_id,
          prize_value: prize.valor_centavos / 100
        });

        return {
          valid: false,
          error: 'Prêmio é apenas ilustrativo e não pode ser creditado',
          prize: prize
        };
      }

      // VALIDAÇÃO CRÍTICA: Verificar se está ativo
      if (!prize.ativo) {
        await this.logInconsistency({
          type: 'premio_inativo_tentativa_credito',
          message: `Tentativa de creditar prêmio inativo: ${prize.nome}`,
          prize_id: prize.id,
          case_id: prize.case_id
        });

        return {
          valid: false,
          error: 'Prêmio está inativo e não pode ser creditado',
          prize: prize
        };
      }

      const inconsistencies = await this.validateSinglePrize(prize);

      if (inconsistencies.length > 0) {
        // Registrar erro crítico
        await this.logInconsistency({
          type: 'validacao_pre_credito_falhou',
          message: `Validação pré-crédito falhou para prêmio ${prize.nome}`,
          prize_id: prize.id,
          case_id: prize.case_id,
          inconsistencies: inconsistencies
        });

        return {
          valid: false,
          error: 'Prêmio possui inconsistências',
          inconsistencies: inconsistencies
        };
      }

      return {
        valid: true,
        prize: prize
      };

    } catch (error) {
      console.error('Erro na validação pré-crédito:', error);
      return {
        valid: false,
        error: error.message
      };
    }
  }

  /**
   * Obtém estatísticas de validação
   */
  async getValidationStats() {
    try {
      const totalCases = await prisma.case.count({
        where: { ativo: true }
      });

      const totalPrizes = await prisma.prize.count();
      
      const prizesByType = await prisma.prize.groupBy({
        by: ['tipo'],
        _count: {
          tipo: true
        }
      });
      
      const illustrativePrizes = await prisma.prize.count({
        where: { tipo: 'ilustrativo' }
      });
      
      const activePrizes = await prisma.prize.count({
        where: { 
          tipo: { not: 'ilustrativo' },
          ativo: true 
        }
      });

      const invalidProbabilityPrizes = await prisma.prize.count({
        where: {
          OR: [
            { probabilidade: { lt: 0 } },
            { probabilidade: { gt: 1 } }
          ]
        }
      });

      const invalidValuePrizes = await prisma.prize.count({
        where: {
          valor_centavos: { lte: 0 }
        }
      });

      // Calcular health score apenas para prêmios ativos (não ilustrativos)
      const healthScore = activePrizes > 0 
        ? Math.max(0, 100 - ((invalidProbabilityPrizes + invalidValuePrizes) / activePrizes * 100))
        : 100;

      return {
        total_cases: totalCases,
        total_prizes: totalPrizes,
        prizes_by_type: prizesByType.reduce((acc, item) => {
          acc[item.tipo] = item._count.tipo;
          return acc;
        }, {}),
        illustrative_prizes: illustrativePrizes,
        active_prizes: activePrizes,
        invalid_probability_prizes: invalidProbabilityPrizes,
        invalid_value_prizes: invalidValuePrizes,
        health_score: healthScore
      };

    } catch (error) {
      console.error('Erro ao obter estatísticas de validação:', error);
      throw error;
    }
  }
}

module.exports = new PrizeValidationServiceV2();
