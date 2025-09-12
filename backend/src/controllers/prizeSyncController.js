const prizeSyncService = require('../services/prizeSyncService');
const backupService = require('../services/backupService');

/**
 * Controller para sincronização de prêmios
 */
class PrizeSyncController {

  /**
   * Sincroniza prêmios de uma caixa específica ou todas as caixas
   * POST /admin/sync-prizes-from-folders
   */
  async syncPrizes(req, res) {
    try {
      const { caseId } = req.body;
      
      console.log('🔄 Iniciando sincronização de prêmios...');
      console.log('📦 Caixa específica:', caseId || 'Todas as caixas');
      
      // Executar sincronização
      const syncResult = await prizeSyncService.syncPrizes(caseId);
      
      if (syncResult.success) {
        res.json({
          success: true,
          message: 'Sincronização realizada com sucesso',
          data: {
            timestamp: syncResult.timestamp,
            total_cases_processed: syncResult.total_cases_processed,
            total_prizes_updated: syncResult.total_prizes_updated,
            total_prizes_inserted: syncResult.total_prizes_inserted,
            total_prizes_deactivated: syncResult.total_prizes_deactivated,
            total_images_missing: syncResult.total_images_missing,
            log_file: syncResult.log_file,
            case_results: syncResult.case_results
          }
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Erro durante a sincronização',
          errors: syncResult.errors,
          data: {
            timestamp: syncResult.timestamp,
            total_cases_processed: syncResult.total_cases_processed,
            log_file: syncResult.log_file
          }
        });
      }
      
    } catch (error) {
      console.error('❌ Erro no controller de sincronização:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtém relatório de sincronização
   * GET /admin/sync-report/:timestamp
   */
  async getSyncReport(req, res) {
    try {
      const { timestamp } = req.params;
      
      if (!timestamp) {
        return res.status(400).json({
          success: false,
          message: 'Timestamp é obrigatório'
        });
      }

      const fs = require('fs').promises;
      const path = require('path');
      
      const logFile = path.join(__dirname, '../../logs', `sync_prizes_${timestamp}.log`);
      
      try {
        const logContent = await fs.readFile(logFile, 'utf8');
        const report = JSON.parse(logContent);
        
        res.json({
          success: true,
          data: report
        });
        
      } catch (fileError) {
        res.status(404).json({
          success: false,
          message: 'Relatório não encontrado',
          error: fileError.message
        });
      }
      
    } catch (error) {
      console.error('❌ Erro ao obter relatório:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  /**
   * Lista backups disponíveis
   * GET /admin/backups
   */
  async listBackups(req, res) {
    try {
      const backups = await backupService.listBackups();
      
      res.json({
        success: true,
        data: {
          backups: backups,
          total: backups.length
        }
      });
      
    } catch (error) {
      console.error('❌ Erro ao listar backups:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  /**
   * Restaura backup do banco de dados
   * POST /admin/restore-database
   */
  async restoreDatabase(req, res) {
    try {
      const { backupFile } = req.body;
      
      if (!backupFile) {
        return res.status(400).json({
          success: false,
          message: 'Arquivo de backup é obrigatório'
        });
      }

      const restoreResult = await backupService.restoreDatabaseBackup(backupFile);
      
      res.json({
        success: true,
        message: 'Backup do banco restaurado com sucesso',
        data: restoreResult
      });
      
    } catch (error) {
      console.error('❌ Erro ao restaurar backup do banco:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  /**
   * Restaura backup das imagens
   * POST /admin/restore-images
   */
  async restoreImages(req, res) {
    try {
      const { backupPath } = req.body;
      
      if (!backupPath) {
        return res.status(400).json({
          success: false,
          message: 'Caminho do backup é obrigatório'
        });
      }

      const restoreResult = await backupService.restoreImagesBackup(backupPath);
      
      res.json({
        success: true,
        message: 'Backup das imagens restaurado com sucesso',
        data: restoreResult
      });
      
    } catch (error) {
      console.error('❌ Erro ao restaurar backup das imagens:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  /**
   * Executa auditoria de prêmios
   * GET /admin/audit-prizes
   */
  async auditPrizes(req, res) {
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      // Buscar todas as caixas com prêmios
      const cases = await prisma.case.findMany({
        where: { ativo: true },
        include: {
          prizes: {
            where: { ativo: true },
            orderBy: { valor_centavos: 'asc' }
          }
        },
        orderBy: { nome: 'asc' }
      });

      const auditResults = [];

      for (const caseData of cases) {
        const caseResult = {
          case_id: caseData.id,
          case_name: caseData.nome,
          case_price: caseData.preco,
          total_prizes: caseData.prizes.length,
          prizes_ok: 0,
          prizes_warning: 0,
          prizes_error: 0,
          prizes_illustrative: 0,
          prizes_sorteable: 0,
          total_value: 0,
          prizes: []
        };

        for (const prize of caseData.prizes) {
          const prizeStatus = this.auditPrize(prize);
          
          caseResult.prizes.push({
            id: prize.id,
            nome: prize.nome,
            valor: prize.valor,
            valor_centavos: prize.valor_centavos,
            tipo: prize.tipo,
            label: prize.label,
            imagem_url: prize.imagem_url,
            ativo: prize.ativo,
            ilustrativo: prize.ilustrativo,
            sorteavel: !prize.ilustrativo, // Prêmios não ilustrativos são sorteáveis
            probabilidade: prize.probabilidade,
            status: prizeStatus.status,
            issues: prizeStatus.issues
          });

          // Contar tipos primeiro
          if (prize.ilustrativo) caseResult.prizes_illustrative++;
          if (!prize.ilustrativo) caseResult.prizes_sorteable++;

          // Contar status
          if (prizeStatus.status === 'ok') caseResult.prizes_ok++;
          else if (prizeStatus.status === 'warning') caseResult.prizes_warning++;
          else if (prizeStatus.status === 'error') caseResult.prizes_error++;

          // Somar valor
          caseResult.total_value += prize.valor;
        }

        auditResults.push(caseResult);
      }

      res.json({
        success: true,
        data: {
          audit_results: auditResults,
          summary: {
            total_cases: auditResults.length,
            total_prizes: auditResults.reduce((sum, c) => sum + c.total_prizes, 0),
            total_ok: auditResults.reduce((sum, c) => sum + c.prizes_ok, 0),
            total_warning: auditResults.reduce((sum, c) => sum + c.prizes_warning, 0),
            total_error: auditResults.reduce((sum, c) => sum + c.prizes_error, 0),
            total_illustrative: auditResults.reduce((sum, c) => sum + c.prizes_illustrative, 0),
            total_sorteable: auditResults.reduce((sum, c) => sum + c.prizes_sorteable, 0)
          }
        }
      });

    } catch (error) {
      console.error('❌ Erro na auditoria de prêmios:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  /**
   * Audita um prêmio específico
   * @param {Object} prize - Dados do prêmio
   * @returns {Object} Resultado da auditoria
   */
  auditPrize(prize) {
    const issues = [];
    let status = 'ok';

    // Verificar se prêmio ilustrativo está marcado corretamente
    const shouldBeIllustrative = prize.valor_centavos > 100000; // R$ 1.000,00
    if (shouldBeIllustrative && !prize.ilustrativo) {
      issues.push('Deve ser marcado como ilustrativo (valor > R$ 1.000)');
      status = 'error';
    }

    // Verificar probabilidade
    if (prize.probabilidade <= 0 || prize.probabilidade > 1) {
      issues.push('Probabilidade inválida');
      status = 'error';
    }

    // Verificar valor em centavos
    const expectedCentavos = Math.round(prize.valor * 100);
    if (prize.valor_centavos !== expectedCentavos) {
      issues.push(`Valor em centavos incorreto (esperado: ${expectedCentavos}, atual: ${prize.valor_centavos})`);
      status = 'error';
    }

    return { status, issues };
  }
}

module.exports = new PrizeSyncController();
