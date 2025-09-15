const express = require('express');
const router = express.Router();
const PrizeSyncController = require('../controllers/prizeSyncController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Criar instância do controller
const prizeSyncController = new PrizeSyncController();

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

// Middleware para verificar se é admin
router.use(requireAdmin);

/**
 * @route POST /admin/sync-prizes-from-folders
 * @desc Sincroniza prêmios com base nas pastas de imagens
 * @access Admin
 */
router.post('/sync-prizes-from-folders', (req, res) => prizeSyncController.syncPrizes(req, res));

/**
 * @route GET /admin/sync-report/:timestamp
 * @desc Obtém relatório de sincronização
 * @access Admin
 */
router.get('/sync-report/:timestamp', (req, res) => prizeSyncController.getSyncReport(req, res));

/**
 * @route GET /admin/backups
 * @desc Lista backups disponíveis
 * @access Admin
 */
router.get('/backups', (req, res) => prizeSyncController.listBackups(req, res));

/**
 * @route POST /admin/restore-database
 * @desc Restaura backup do banco de dados
 * @access Admin
 */
router.post('/restore-database', (req, res) => prizeSyncController.restoreDatabase(req, res));

/**
 * @route POST /admin/restore-images
 * @desc Restaura backup das imagens
 * @access Admin
 */
router.post('/restore-images', (req, res) => prizeSyncController.restoreImages(req, res));

/**
 * @route GET /admin/audit-prizes
 * @desc Executa auditoria de prêmios
 * @access Admin
 */
router.get('/audit-prizes', (req, res) => prizeSyncController.auditPrizes(req, res));

module.exports = router;
