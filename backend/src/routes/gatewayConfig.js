const express = require('express');
const router = express.Router();
const GatewayConfigController = require('../controllers/gatewayConfigController');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

// Criar instância do controller
const gatewayConfigController = new GatewayConfigController();

// Middleware de autenticação para todas as rotas
router.use(authMiddleware.authenticateToken);

// Middleware de admin para operações de configuração
router.use(adminMiddleware);

// Listar todas as configurações de gateway
router.get('/', gatewayConfigController.listConfigs.bind(gatewayConfigController));

// Obter lista de gateways suportados
router.get('/supported', gatewayConfigController.getSupportedGateways.bind(gatewayConfigController));

// Obter configuração ativa
router.get('/active', gatewayConfigController.getActiveConfig.bind(gatewayConfigController));

// Obter configuração de um gateway específico
router.get('/:gatewayName', gatewayConfigController.getConfig.bind(gatewayConfigController));

// Salvar/atualizar configuração de gateway
router.post('/:gatewayName', gatewayConfigController.saveConfig.bind(gatewayConfigController));

// Ativar/desativar gateway
router.patch('/:gatewayName/toggle', gatewayConfigController.toggleGateway.bind(gatewayConfigController));

// Testar conexão com gateway
router.post('/:gatewayName/test', gatewayConfigController.testConnection.bind(gatewayConfigController));

// Validar configuração
router.post('/:gatewayName/validate', gatewayConfigController.validateConfig.bind(gatewayConfigController));

// Deletar configuração de gateway
router.delete('/:gatewayName', gatewayConfigController.deleteConfig.bind(gatewayConfigController));

module.exports = router;
