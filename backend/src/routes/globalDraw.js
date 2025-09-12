const express = require('express');
const router = express.Router();
const globalDrawService = require('../services/globalDrawService');
const safetyService = require('../services/safetyService');
const auditLogService = require('../services/auditLogService');
const { authenticateToken } = require('../middleware/auth');

/**
 * Rota para sorteio global centralizado
 * POST /api/global-draw/sortear/:caseId
 */
router.post('/sortear/:caseId', authenticateToken, async (req, res) => {
  try {
    const { caseId } = req.params;
    const userId = req.user.id;

    console.log(`🎲 Requisição de sorteio global - Caixa: ${caseId}, Usuário: ${userId}`);

    // Realizar sorteio global
    const result = await globalDrawService.sortearPremio(caseId, userId);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.message,
        audit_data: result.audit_data
      });
    }

    res.json({
      success: true,
      prize: result.prize,
      message: result.message,
      audit_data: result.audit_data
    });

  } catch (error) {
    console.error('❌ Erro na rota de sorteio global:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno no sistema de sorteio',
      details: error.message
    });
  }
});

/**
 * Rota para obter estatísticas do sistema de sorteio
 * GET /api/global-draw/stats
 */
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    // Verificar se é admin
    if (!req.user.is_admin) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const stats = await globalDrawService.getDrawStats();
    res.json(stats);

  } catch (error) {
    console.error('❌ Erro ao obter estatísticas:', error);
    res.status(500).json({
      error: 'Erro ao obter estatísticas',
      details: error.message
    });
  }
});

/**
 * Rota para obter logs de auditoria
 * GET /api/global-draw/logs
 */
router.get('/logs', authenticateToken, async (req, res) => {
  try {
    // Verificar se é admin
    if (!req.user.is_admin) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const filters = {
      user_id: req.query.user_id,
      case_id: req.query.case_id,
      success: req.query.success === 'true' ? true : req.query.success === 'false' ? false : undefined,
      date_from: req.query.date_from,
      date_to: req.query.date_to,
      limit: parseInt(req.query.limit) || 100
    };

    const logs = await auditLogService.getDrawLogs(filters);
    res.json(logs);

  } catch (error) {
    console.error('❌ Erro ao obter logs:', error);
    res.status(500).json({
      error: 'Erro ao obter logs',
      details: error.message
    });
  }
});

/**
 * Rota para obter relatório de segurança
 * GET /api/global-draw/security-report
 */
router.get('/security-report', authenticateToken, async (req, res) => {
  try {
    // Verificar se é admin
    if (!req.user.is_admin) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const report = await safetyService.getSecurityReport();
    res.json(report);

  } catch (error) {
    console.error('❌ Erro ao obter relatório de segurança:', error);
    res.status(500).json({
      error: 'Erro ao obter relatório de segurança',
      details: error.message
    });
  }
});

/**
 * Rota para ativar modo de emergência
 * POST /api/global-draw/emergency-mode/activate
 */
router.post('/emergency-mode/activate', authenticateToken, async (req, res) => {
  try {
    // Verificar se é admin
    if (!req.user.is_admin) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ error: 'Motivo é obrigatório' });
    }

    await safetyService.activateEmergencyMode(req.user.id, reason);
    
    res.json({
      success: true,
      message: 'Modo de emergência ativado com sucesso',
      reason: reason
    });

  } catch (error) {
    console.error('❌ Erro ao ativar modo de emergência:', error);
    res.status(500).json({
      error: 'Erro ao ativar modo de emergência',
      details: error.message
    });
  }
});

/**
 * Rota para desativar modo de emergência
 * POST /api/global-draw/emergency-mode/deactivate
 */
router.post('/emergency-mode/deactivate', authenticateToken, async (req, res) => {
  try {
    // Verificar se é admin
    if (!req.user.is_admin) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    await safetyService.deactivateEmergencyMode(req.user.id);
    
    res.json({
      success: true,
      message: 'Modo de emergência desativado com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao desativar modo de emergência:', error);
    res.status(500).json({
      error: 'Erro ao desativar modo de emergência',
      details: error.message
    });
  }
});

/**
 * Rota para obter estatísticas de auditoria
 * GET /api/global-draw/audit-stats
 */
router.get('/audit-stats', authenticateToken, async (req, res) => {
  try {
    // Verificar se é admin
    if (!req.user.is_admin) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const stats = await auditLogService.getAuditStats();
    res.json(stats);

  } catch (error) {
    console.error('❌ Erro ao obter estatísticas de auditoria:', error);
    res.status(500).json({
      error: 'Erro ao obter estatísticas de auditoria',
      details: error.message
    });
  }
});

module.exports = router;
