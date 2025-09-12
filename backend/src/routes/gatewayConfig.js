const express = require('express');
const router = express.Router();
const gatewayConfigController = require('../controllers/gatewayConfigController');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

// Middleware de autenticação para todas as rotas
router.use(authMiddleware.authenticateToken);

// Middleware de admin para operações de configuração
router.use(adminMiddleware);

// Listar todas as configurações de gateway
router.get('/', gatewayConfigController.listConfigs);

// Obter lista de gateways suportados
router.get('/supported', gatewayConfigController.getSupportedGateways);

// Obter configuração ativa
router.get('/active', gatewayConfigController.getActiveConfig);

// Obter configuração de um gateway específico
router.get('/:gatewayName', gatewayConfigController.getConfig);

// Salvar/atualizar configuração de gateway
router.post('/:gatewayName', gatewayConfigController.saveConfig);

// Ativar/desativar gateway
router.patch('/:gatewayName/toggle', gatewayConfigController.toggleGateway);

// Testar conexão com gateway
router.post('/:gatewayName/test', gatewayConfigController.testConnection);

// Validar configuração
router.post('/:gatewayName/validate', gatewayConfigController.validateConfig);

// Deletar configuração de gateway
router.delete('/:gatewayName', gatewayConfigController.deleteConfig);

module.exports = router;
