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
router.get('/', (req, res) => gatewayConfigController.listConfigs(req, res));

// Obter lista de gateways suportados
router.get('/supported', (req, res) => gatewayConfigController.getSupportedGateways(req, res));

// Obter configuração ativa
router.get('/active', (req, res) => gatewayConfigController.getActiveConfig(req, res));

// Obter configuração de um gateway específico
router.get('/:gatewayName', (req, res) => gatewayConfigController.getConfig(req, res));

// Salvar/atualizar configuração de gateway
router.post('/:gatewayName', (req, res) => gatewayConfigController.saveConfig(req, res));

// Ativar/desativar gateway
router.patch('/:gatewayName/toggle', (req, res) => gatewayConfigController.toggleGateway(req, res));

// Testar conexão com gateway
router.post('/:gatewayName/test', (req, res) => gatewayConfigController.testConnection(req, res));

// Validar configuração
router.post('/:gatewayName/validate', (req, res) => gatewayConfigController.validateConfig(req, res));

// Deletar configuração de gateway
router.delete('/:gatewayName', (req, res) => gatewayConfigController.deleteConfig(req, res));

module.exports = router;
