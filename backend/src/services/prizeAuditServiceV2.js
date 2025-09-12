const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');
const prizeUtils = require('../utils/prizeUtils');

const prisma = new PrismaClient();

/**
 * Serviço de Auditoria de Prêmios V2
 * Sistema definitivo para correção de inconsistências e auto-reparo
 */
class PrizeAuditServiceV2 {
  
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
   * Registra ação de auditoria no log
   */
  async logAuditAction(action, details) {
    try {
      const logEntry = {
        timestamp: new Date().toISOString(),
        action,
        ...details
      };

      const logFile = path.join(this.logPath, 'auditoria-premios-v2.log');
      const logLine = JSON.stringify(logEntry) + '\n';
      
      await fs.appendFile(logFile, logLine);
      console.log('📝 Ação de auditoria registrada:', action, details);
    } catch (error) {
      console.error('Erro ao registrar ação de auditoria:', error);
    }
  }

  /**
   * Executa auditoria completa de prêmios com opção de auto-reparo
   * @param {Object} options - Opções da auditoria
   * @param {boolean} options.fix - Se deve aplicar correções automaticamente
   * @param {boolean} options.force - Se deve forçar correções mesmo com warnings
   * @returns {Object} Resultado da auditoria
   */
  async auditarPremios(options = {}) {
    const { fix = false, force = false } = options;
    
    console.log(`🔍 Iniciando auditoria de prêmios V2 (fix: ${fix}, force: ${force})...`);
    
    const startTime = Date.now();
    const results = {
      success: true,
      total_cases: 0,
      total_prizes: 0,
      prizes_by_type: {
        cash: 0,
        produto: 0,
        ilustrativo: 0
      },
      corrections_applied: 0,
      corrections: [],
      errors: [],
      warnings: [],
      processing_time_ms: 0
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
        console.log(`📦 Processando caixa: ${caseItem.nome} (${caseItem.prizes.length} prêmios)`);
        
        for (const prize of caseItem.prizes) {
          results.total_prizes++;
          
          try {
            const auditResult = await this.auditarPremioIndividual(prize, { fix, force });
            
            // Contar por tipo
            const tipo = auditResult.normalized.tipo;
            results.prizes_by_type[tipo]++;
            
            // Processar correções
            if (auditResult.corrections.length > 0) {
              results.corrections_applied += auditResult.corrections.length;
              results.corrections.push(...auditResult.corrections);
              
              // Aplicar correções se solicitado
              if (fix) {
                await this.aplicarCorrecoes(prize.id, auditResult.corrections);
              }
            }
            
            // Processar erros
            if (auditResult.errors.length > 0) {
              results.errors.push(...auditResult.errors);
            }
            
            // Processar warnings
            if (auditResult.warnings.length > 0) {
              results.warnings.push(...auditResult.warnings);
            }
            
          } catch (error) {
            console.error(`❌ Erro ao auditar prêmio ${prize.id}:`, error);
            results.errors.push({
              prize_id: prize.id,
              case_id: prize.case_id,
              error: error.message,
              type: 'audit_error'
            });
          }
        }
      }

      const endTime = Date.now();
      results.processing_time_ms = endTime - startTime;

      // Determinar sucesso geral
      results.success = results.errors.length === 0 && (force || results.warnings.length === 0);

      // Log do resultado
      await this.logAuditAction('auditoria_completa', {
        success: results.success,
        total_corrections: results.corrections_applied,
        processing_time_ms: results.processing_time_ms,
        errors_count: results.errors.length,
        warnings_count: results.warnings.length
      });

      console.log('✅ Auditoria concluída!');
      console.log(`📊 Resumo:`);
      console.log(`- Caixas processadas: ${results.total_cases}`);
      console.log(`- Prêmios processados: ${results.total_prizes}`);
      console.log(`- Correções aplicadas: ${results.corrections_applied}`);
      console.log(`- Erros: ${results.errors.length}`);
      console.log(`- Warnings: ${results.warnings.length}`);
      console.log(`- Tempo de processamento: ${results.processing_time_ms}ms`);

      return results;

    } catch (error) {
      console.error('❌ Erro durante auditoria:', error);
      results.success = false;
      results.errors.push({
        type: 'audit_fatal_error',
        error: error.message
      });
      return results;
    }
  }

  /**
   * Audita um prêmio individual
   * @param {Object} prize - Prêmio para auditar
   * @param {Object} options - Opções da auditoria
   * @returns {Object} Resultado da auditoria individual
   */
  async auditarPremioIndividual(prize, options = {}) {
    const { fix = false, force = false } = options;
    
    const result = {
      prize_id: prize.id,
      case_id: prize.case_id,
      normalized: null,
      corrections: [],
      errors: [],
      warnings: []
    };

    try {
      // Normalizar prêmio
      result.normalized = prizeUtils.normalizarPremio(prize);
      
      // Validar prêmio
      const validation = prizeUtils.validarPremio(result.normalized);
      
      if (!validation.valid) {
        result.errors.push(...validation.errors.map(error => ({
          type: 'validation_error',
          message: error,
          prize_id: prize.id,
          case_id: prize.case_id
        })));
      }

      // Aplicar regras específicas por tipo
      await this.aplicarRegrasPorTipo(prize, result.normalized, result, options);

      return result;

    } catch (error) {
      result.errors.push({
        type: 'audit_error',
        message: error.message,
        prize_id: prize.id,
        case_id: prize.case_id
      });
      return result;
    }
  }

  /**
   * Aplica regras específicas por tipo de prêmio
   */
  async aplicarRegrasPorTipo(originalPrize, normalizedPrize, result, options) {
    const { fix = false } = options;
    const tipo = normalizedPrize.tipo;

    switch (tipo) {
      case 'cash':
        await this.aplicarRegrasCash(originalPrize, normalizedPrize, result, options);
        break;
        
      case 'produto':
        await this.aplicarRegrasProduto(originalPrize, normalizedPrize, result, options);
        break;
        
      case 'ilustrativo':
        await this.aplicarRegrasIlustrativo(originalPrize, normalizedPrize, result, options);
        break;
    }
  }

  /**
   * Aplica regras para prêmios de dinheiro
   */
  async aplicarRegrasCash(originalPrize, normalizedPrize, result, options) {
    const { fix = false } = options;
    const valorCentavos = normalizedPrize.valor_centavos;
    
    // Regra 1: Nome deve ser igual ao label formatado
    const expectedLabel = prizeUtils.formatarBRL(valorCentavos);
    if (originalPrize.nome !== expectedLabel) {
      result.corrections.push({
        field: 'nome',
        old_value: originalPrize.nome,
        new_value: expectedLabel,
        reason: 'Nome de prêmio cash deve ser igual ao label formatado'
      });
    }
    
    // Regra 2: Label deve ser formatado corretamente
    if (originalPrize.label !== expectedLabel) {
      result.corrections.push({
        field: 'label',
        old_value: originalPrize.label,
        new_value: expectedLabel,
        reason: 'Label de prêmio cash deve ser formatado em BRL'
      });
    }
    
    // Regra 3: Imagem deve seguir padrão cash
    const expectedImagem = prizeUtils.assetKeyCash(valorCentavos);
    if (originalPrize.imagem_id !== expectedImagem) {
      result.corrections.push({
        field: 'imagem_id',
        old_value: originalPrize.imagem_id,
        new_value: expectedImagem,
        reason: 'Imagem de prêmio cash deve seguir padrão cash/valor.png'
      });
    }
    
    // Regra 4: Tipo deve ser cash
    if (originalPrize.tipo !== 'cash') {
      result.corrections.push({
        field: 'tipo',
        old_value: originalPrize.tipo,
        new_value: 'cash',
        reason: 'Prêmio com nome monetário deve ser tipo cash'
      });
    }
  }

  /**
   * Aplica regras para prêmios de produto
   */
  async aplicarRegrasProduto(originalPrize, normalizedPrize, result, options) {
    const { fix = false } = options;
    
    // Regra 1: Não deve inferir valor a partir de números no nome
    // Esta regra é aplicada automaticamente - não geramos correções para isso
    
    // Regra 2: Validar se imagem existe (implementação futura)
    // Por enquanto, apenas verificamos se imagem_id está definido
    if (!originalPrize.imagem_id || originalPrize.imagem_id === '') {
      result.warnings.push({
        type: 'missing_image',
        message: 'Prêmio produto sem imagem_id definido',
        prize_id: originalPrize.id,
        case_id: originalPrize.case_id
      });
    }
    
    // Regra 3: Se valor > 500000 centavos, deve ser ilustrativo
    if (normalizedPrize.valor_centavos > 500000) {
      result.corrections.push({
        field: 'tipo',
        old_value: originalPrize.tipo,
        new_value: 'ilustrativo',
        reason: 'Prêmio com valor > R$ 5000 deve ser ilustrativo'
      });
    }
  }

  /**
   * Aplica regras para prêmios ilustrativos
   */
  async aplicarRegrasIlustrativo(originalPrize, normalizedPrize, result, options) {
    const { fix = false } = options;
    
    // Regra 1: Prêmios ilustrativos não devem ser sorteados
    // Esta regra é aplicada automaticamente no sistema de sorteio
    
    // Regra 2: Validar integridade visual (implementação futura)
    if (!originalPrize.imagem_id || originalPrize.imagem_id === '') {
      result.warnings.push({
        type: 'missing_image',
        message: 'Prêmio ilustrativo sem imagem_id definido',
        prize_id: originalPrize.id,
        case_id: originalPrize.case_id
      });
    }
  }

  /**
   * Aplica correções no banco de dados
   */
  async aplicarCorrecoes(prizeId, corrections) {
    try {
      const updateData = {};
      
      for (const correction of corrections) {
        updateData[correction.field] = correction.new_value;
      }
      
      if (Object.keys(updateData).length > 0) {
        await prisma.prize.update({
          where: { id: prizeId },
          data: updateData
        });
        
        console.log(`✅ Correções aplicadas para prêmio ${prizeId}:`, updateData);
        
        // Log da correção
        await this.logAuditAction('correcao_aplicada', {
          prize_id: prizeId,
          corrections: corrections
        });
      }
      
    } catch (error) {
      console.error(`❌ Erro ao aplicar correções para prêmio ${prizeId}:`, error);
      throw error;
    }
  }

  /**
   * Corrige caso específico reportado
   */
  async corrigirCasoEspecifico(prizeId) {
    console.log(`🔧 Corrigindo caso específico: prêmio ${prizeId}`);
    
    try {
      const prize = await prisma.prize.findUnique({
        where: { id: prizeId }
      });
      
      if (!prize) {
        throw new Error(`Prêmio ${prizeId} não encontrado`);
      }
      
      // Aplicar auditoria com correção
      const auditResult = await this.auditarPremioIndividual(prize, { fix: true, force: true });
      
      if (auditResult.corrections.length > 0) {
        await this.aplicarCorrecoes(prizeId, auditResult.corrections);
        
        console.log(`✅ Caso específico corrigido: ${auditResult.corrections.length} correções aplicadas`);
        
        return {
          success: true,
          corrections_applied: auditResult.corrections.length,
          corrections: auditResult.corrections
        };
      } else {
        console.log(`ℹ️ Caso específico já estava correto`);
        return {
          success: true,
          corrections_applied: 0,
          corrections: []
        };
      }
      
    } catch (error) {
      console.error(`❌ Erro ao corrigir caso específico:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obtém estatísticas de auditoria
   */
  async getAuditStats() {
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
      
      const prizesByStatus = await prisma.prize.groupBy({
        by: ['ativo'],
        _count: {
          ativo: true
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

      return {
        total_cases: totalCases,
        total_prizes: totalPrizes,
        prizes_by_type: prizesByType.reduce((acc, item) => {
          acc[item.tipo] = item._count.tipo;
          return acc;
        }, {}),
        prizes_by_status: prizesByStatus.reduce((acc, item) => {
          acc[item.ativo ? 'ativo' : 'inativo'] = item._count.ativo;
          return acc;
        }, {}),
        illustrative_prizes: illustrativePrizes,
        active_prizes: activePrizes,
        health_score: totalPrizes > 0 ? Math.round((activePrizes / totalPrizes) * 100) : 100
      };

    } catch (error) {
      console.error('Erro ao obter estatísticas de auditoria:', error);
      throw error;
    }
  }
}

module.exports = new PrizeAuditServiceV2();
