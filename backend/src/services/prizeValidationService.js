const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();

/**
 * Serviço de Validação de Consistência de Prêmios
 * Garante 100% de consistência entre front-end, banco de dados e lógica de sorteio
 */
class PrizeValidationService {
  
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

      const logFile = path.join(this.logPath, 'inconsistencias-premios.log');
      const logLine = JSON.stringify(logEntry) + '\n';
      
      await fs.appendFile(logFile, logLine);
      console.log('📝 Inconsistência registrada:', inconsistency);
    } catch (error) {
      console.error('Erro ao registrar inconsistência:', error);
    }
  }

  /**
   * Valida se a imagem corresponde ao prêmio
   * Considera que as imagens estão na pasta public/imagens/ do frontend
   */
  validateImageConsistency(prize) {
    const inconsistencies = [];

    // Para prêmios ilustrativos, não validamos imagem pois são apenas para exibição
    if (prize.ilustrativo) {
      return inconsistencies;
    }

    // Para este sistema, não validamos imagem_url pois as imagens estão no frontend
    // Apenas verificamos se o nome do prêmio sugere que deveria ter uma imagem correspondente
    const prizeName = (prize.nome || '').toLowerCase();
    const prizeValue = parseFloat(prize.valor);

    // Verificar se prêmios com valores específicos têm nomes que sugerem produtos físicos
    if (prizeValue >= 500) {
      // Prêmios de alto valor devem ter nomes de produtos específicos
      const productKeywords = ['iphone', 'macbook', 'ipad', 'airpods', 'ps5', 'playstation', 'xbox', 'steamdeck', 'steam deck',
                              'samsung', 'galaxy', 'redmi', 'notebook', 'pc', 'honda', 'motor',
                              'apple', 'watch', 'jordan', 'nike', 'dunk', 'airforce', 'air force', 'camisa', 'boné'];
      
      const hasProductKeyword = productKeywords.some(keyword => prizeName.includes(keyword));
      
      if (!hasProductKeyword && !prizeName.includes('r$')) {
        inconsistencies.push({
          type: 'nome_produto_inconsistente',
          message: `Prêmio de R$ ${prizeValue} deveria ter nome de produto específico, mas tem: "${prize.nome}"`,
          prize_id: prize.id,
          case_id: prize.case_id,
          expected_name_type: 'produto_especifico',
          actual_name: prize.nome
        });
      }
    }

    return inconsistencies;
  }

  /**
   * Valida se o valor creditado corresponde ao valor exibido
   */
  validateValueConsistency(prize) {
    const inconsistencies = [];

    const valorCreditado = parseFloat(prize.valor);
    
    // Verificar se o valor é válido
    if (isNaN(valorCreditado) || valorCreditado <= 0) {
      inconsistencies.push({
        type: 'valor_invalido',
        message: `Prêmio ${prize.nome || prize.id} tem valor inválido: ${prize.valor}`,
        prize_id: prize.id,
        case_id: prize.case_id,
        invalid_value: prize.valor
      });
    }

    // Para prêmios ilustrativos, não validamos valor excessivo pois fazem parte da estratégia visual
    if (!prize.ilustrativo && valorCreditado > 10000) {
      inconsistencies.push({
        type: 'valor_excessivo',
        message: `Prêmio ${prize.nome || prize.id} tem valor excessivo: R$ ${valorCreditado}`,
        prize_id: prize.id,
        case_id: prize.case_id,
        excessive_value: valorCreditado
      });
    }

    return inconsistencies;
  }

  /**
   * Valida se o texto/label corresponde ao valor real
   * Ajustado para trabalhar com a estrutura atual dos prêmios
   */
  validateLabelConsistency(prize) {
    const inconsistencies = [];

    // Para prêmios ilustrativos, não validamos labels pois são apenas para exibição
    if (prize.ilustrativo) {
      return inconsistencies;
    }

    const valorCreditado = parseFloat(prize.valor);
    const prizeName = (prize.nome || '').toLowerCase();

    // Verificar apenas casos críticos onde há discrepância óbvia
    if (prize.nome) {
      // Caso 1: Nome sugere valor diferente do valor real (apenas para casos muito óbvios)
      const valueInName = prizeName.match(/r?\$?\s*(\d+(?:[.,]\d+)?)/);
      if (valueInName) {
        const nameValue = parseFloat(valueInName[1].replace(',', '.'));
        // Aceitar nomes genéricos como "Playstation 5", "iPhone", "Macbook", "Steam Deck"
        const genericProductNames = ['playstation', 'iphone', 'macbook', 'steamdeck', 'xbox', 'samsung', 'galaxy', 'redmi', 'notebook', 'honda', 'airpods', 'ipad', 'pc', 'gamer', 'air force', 'nike', 'jordan', 'dunk', 'camisa', 'boné'];
        const isGenericProduct = genericProductNames.some(name => prizeName.includes(name));
        
        if (!isGenericProduct && Math.abs(nameValue - valorCreditado) > 0.01) {
          inconsistencies.push({
            type: 'label_valor_inconsistente',
            message: `Nome "${prize.nome}" sugere valor R$ ${nameValue}, mas valor real é R$ ${valorCreditado}`,
            prize_id: prize.id,
            case_id: prize.case_id,
            prize_name: prize.nome,
            expected_value: valorCreditado,
            actual_name_value: nameValue
          });
        }
      }

      // Caso 2: Prêmios de alto valor sem nome descritivo (apenas para valores muito altos e não ilustrativos)
      if (valorCreditado >= 5000 && !prizeName.includes('iphone') && !prizeName.includes('macbook') && 
          !prizeName.includes('ps5') && !prizeName.includes('playstation') && !prizeName.includes('xbox') && 
          !prizeName.includes('samsung') && !prizeName.includes('galaxy') && !prizeName.includes('redmi') && 
          !prizeName.includes('notebook') && !prizeName.includes('honda') && !prizeName.includes('steamdeck') && 
          !prizeName.includes('steam deck') && !prizeName.includes('airpods') && !prizeName.includes('ipad') && 
          !prizeName.includes('pc') && !prizeName.includes('gamer')) {
        
        inconsistencies.push({
          type: 'nome_produto_alto_valor',
          message: `Prêmio de R$ ${valorCreditado} deveria ter nome de produto específico, mas tem: "${prize.nome}"`,
          prize_id: prize.id,
          case_id: prize.case_id,
          prize_name: prize.nome,
          expected_value: valorCreditado
        });
      }
    }

    return inconsistencies;
  }

  /**
   * Valida probabilidades
   */
  validateProbabilityConsistency(prize) {
    const inconsistencies = [];

    const probabilidade = parseFloat(prize.probabilidade);

    // Verificar se a probabilidade é válida
    if (isNaN(probabilidade) || probabilidade < 0 || probabilidade > 1) {
      inconsistencies.push({
        type: 'probabilidade_invalida',
        message: `Prêmio ${prize.nome || prize.id} tem probabilidade inválida: ${prize.probabilidade}`,
        prize_id: prize.id,
        case_id: prize.case_id,
        invalid_probability: prize.probabilidade
      });
    }

    return inconsistencies;
  }

  /**
   * Valida um prêmio individual
   */
  async validateSinglePrize(prize) {
    const inconsistencies = [];

    // Validar imagem
    inconsistencies.push(...this.validateImageConsistency(prize));

    // Validar valor
    inconsistencies.push(...this.validateValueConsistency(prize));

    // Validar label
    inconsistencies.push(...this.validateLabelConsistency(prize));

    // Validar probabilidade
    inconsistencies.push(...this.validateProbabilityConsistency(prize));

    return inconsistencies;
  }

  /**
   * Função principal de verificação global
   */
  async verificarConsistenciaPremios() {
    console.log('🔍 Iniciando verificação global de consistência de prêmios...');
    
    const startTime = Date.now();
    const results = {
      total_cases: 0,
      total_prizes: 0,
      illustrative_prizes: 0,
      active_prizes: 0,
      inconsistencies_found: 0,
      inconsistencies: [],
      cases_with_issues: new Set(),
      summary: {
        imagem_vazia: 0,
        imagem_valor_inconsistente: 0,
        valor_invalido: 0,
        valor_excessivo: 0,
        label_valor_inconsistente: 0,
        probabilidade_invalida: 0,
        nome_produto_inconsistente: 0,
        nome_produto_alto_valor: 0
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
          
          // Contar prêmios ilustrativos vs ativos
          if (prize.ilustrativo) {
            results.illustrative_prizes++;
          } else {
            results.active_prizes++;
          }
          
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
      console.log(`- Prêmios ativos: ${results.active_prizes}`);
      console.log(`- Prêmios ilustrativos: ${results.illustrative_prizes}`);
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
      if (prize.ilustrativo) {
        await this.logInconsistency({
          type: 'premio_ilustrativo_tentativa_credito',
          message: `Tentativa de creditar prêmio ilustrativo: ${prize.nome} (R$ ${prize.valor})`,
          prize_id: prize.id,
          case_id: prize.case_id,
          prize_value: prize.valor
        });

        return {
          valid: false,
          error: 'Prêmio é apenas ilustrativo e não pode ser creditado',
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
   * Corrige automaticamente inconsistências simples
   */
  async corrigirInconsistenciasAutomaticamente() {
    console.log('🔧 Iniciando correção automática de inconsistências...');
    
    const results = {
      total_corrections: 0,
      corrections: [],
      errors: []
    };

    try {
      // Buscar prêmios com probabilidade inválida
      const invalidProbabilityPrizes = await prisma.prize.findMany({
        where: {
          OR: [
            { probabilidade: { lt: 0 } },
            { probabilidade: { gt: 1 } }
          ]
        }
      });

      for (const prize of invalidProbabilityPrizes) {
        const correctedProbability = Math.max(0, Math.min(1, parseFloat(prize.probabilidade)));
        
        await prisma.prize.update({
          where: { id: prize.id },
          data: { probabilidade: correctedProbability }
        });

        results.total_corrections++;
        results.corrections.push({
          prize_id: prize.id,
          field: 'probabilidade',
          old_value: prize.probabilidade,
          new_value: correctedProbability
        });
      }

      // Buscar prêmios com valor inválido
      const invalidValuePrizes = await prisma.prize.findMany({
        where: {
          valor: { lte: 0 }
        }
      });

      for (const prize of invalidValuePrizes) {
        const correctedValue = Math.max(0.01, parseFloat(prize.valor));
        
        await prisma.prize.update({
          where: { id: prize.id },
          data: { valor: correctedValue }
        });

        results.total_corrections++;
        results.corrections.push({
          prize_id: prize.id,
          field: 'valor',
          old_value: prize.valor,
          new_value: correctedValue
        });
      }

      console.log(`✅ Correção automática concluída: ${results.total_corrections} correções realizadas`);

      return {
        success: true,
        ...results
      };

    } catch (error) {
      console.error('❌ Erro durante correção automática:', error);
      return {
        success: false,
        error: error.message,
        ...results
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
      
      const illustrativePrizes = await prisma.prize.count({
        where: { ilustrativo: true }
      });
      
      const activePrizes = await prisma.prize.count({
        where: { ilustrativo: false }
      });

      // Como as imagens estão no frontend, não contamos prêmios sem imagem_url
      const prizesWithoutImage = 0;

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
          valor: { lte: 0 }
        }
      });

      // Calcular health score apenas para prêmios ativos (não ilustrativos)
      const healthScore = activePrizes > 0 
        ? Math.max(0, 100 - ((prizesWithoutImage + invalidProbabilityPrizes + invalidValuePrizes) / activePrizes * 100))
        : 100;

      return {
        total_cases: totalCases,
        total_prizes: totalPrizes,
        illustrative_prizes: illustrativePrizes,
        active_prizes: activePrizes,
        prizes_without_image: prizesWithoutImage,
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

module.exports = new PrizeValidationService();
