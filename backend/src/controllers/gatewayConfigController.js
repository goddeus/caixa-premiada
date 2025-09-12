const gatewayConfigService = require('../services/gatewayConfigService');
const prisma = require('../utils/prisma');

class GatewayConfigController {
  // Listar todas as configurações de gateway
  async listConfigs(req, res) {
    try {
      const result = await gatewayConfigService.listGatewayConfigs();
      
      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json({
        success: true,
        configs: result.configs
      });
    } catch (error) {
      console.error('Erro ao listar configurações de gateway:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Obter configuração de um gateway específico
  async getConfig(req, res) {
    try {
      const { gatewayName } = req.params;
      
      if (!gatewayName) {
        return res.status(400).json({
          success: false,
          error: 'Nome do gateway é obrigatório'
        });
      }

      const result = await gatewayConfigService.getGatewayConfig(gatewayName);
      
      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json({
        success: true,
        config: result.config
      });
    } catch (error) {
      console.error('Erro ao obter configuração do gateway:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Salvar/atualizar configuração de gateway
  async saveConfig(req, res) {
    try {
      const { gatewayName } = req.params;
      const configData = req.body;
      const adminId = req.user?.id;

      if (!gatewayName) {
        return res.status(400).json({
          success: false,
          error: 'Nome do gateway é obrigatório'
        });
      }

      // Adicionar nome do gateway aos dados
      configData.gateway_name = gatewayName;

      const result = await gatewayConfigService.saveGatewayConfig(gatewayName, configData, adminId);
      
      if (!result.success) {
        return res.status(400).json(result);
      }

      // Log da ação administrativa
      try {
        await prisma.adminLog.create({
          data: {
            admin_id: adminId || 'system',
            acao: 'gateway_config_save',
            descricao: `Configuração do gateway ${gatewayName} salva`,
            dados_depois: JSON.stringify(result.config),
            ip_address: req.ip,
            user_agent: req.get('User-Agent')
          }
        });
      } catch (logError) {
        console.error('Erro ao salvar log administrativo:', logError);
      }

      res.json({
        success: true,
        message: 'Configuração salva com sucesso',
        config: result.config
      });
    } catch (error) {
      console.error('Erro ao salvar configuração do gateway:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Ativar/desativar gateway
  async toggleGateway(req, res) {
    try {
      const { gatewayName } = req.params;
      const { is_active } = req.body;
      const adminId = req.user?.id;

      if (!gatewayName) {
        return res.status(400).json({
          success: false,
          error: 'Nome do gateway é obrigatório'
        });
      }

      if (typeof is_active !== 'boolean') {
        return res.status(400).json({
          success: false,
          error: 'Status is_active deve ser boolean'
        });
      }

      const result = await gatewayConfigService.toggleGateway(gatewayName, is_active, adminId);
      
      if (!result.success) {
        return res.status(400).json(result);
      }

      // Log da ação administrativa
      try {
        await prisma.adminLog.create({
          data: {
            admin_id: adminId || 'system',
            acao: 'gateway_toggle',
            descricao: `Gateway ${gatewayName} ${is_active ? 'ativado' : 'desativado'}`,
            dados_depois: JSON.stringify({ is_active }),
            ip_address: req.ip,
            user_agent: req.get('User-Agent')
          }
        });
      } catch (logError) {
        console.error('Erro ao salvar log administrativo:', logError);
      }

      res.json({
        success: true,
        message: `Gateway ${is_active ? 'ativado' : 'desativado'} com sucesso`,
        config: result.config
      });
    } catch (error) {
      console.error('Erro ao alterar status do gateway:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Testar conexão com gateway
  async testConnection(req, res) {
    try {
      const { gatewayName } = req.params;

      if (!gatewayName) {
        return res.status(400).json({
          success: false,
          error: 'Nome do gateway é obrigatório'
        });
      }

      const result = await gatewayConfigService.testGatewayConnection(gatewayName);
      
      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json({
        success: true,
        message: result.message,
        response: result.response
      });
    } catch (error) {
      console.error('Erro ao testar conexão do gateway:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Deletar configuração de gateway
  async deleteConfig(req, res) {
    try {
      const { gatewayName } = req.params;
      const adminId = req.user?.id;

      if (!gatewayName) {
        return res.status(400).json({
          success: false,
          error: 'Nome do gateway é obrigatório'
        });
      }

      const result = await gatewayConfigService.deleteGatewayConfig(gatewayName);
      
      if (!result.success) {
        return res.status(400).json(result);
      }

      // Log da ação administrativa
      try {
        await prisma.adminLog.create({
          data: {
            admin_id: adminId || 'system',
            acao: 'gateway_config_delete',
            descricao: `Configuração do gateway ${gatewayName} deletada`,
            ip_address: req.ip,
            user_agent: req.get('User-Agent')
          }
        });
      } catch (logError) {
        console.error('Erro ao salvar log administrativo:', logError);
      }

      res.json({
        success: true,
        message: 'Configuração deletada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao deletar configuração do gateway:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Obter configuração ativa
  async getActiveConfig(req, res) {
    try {
      const result = await gatewayConfigService.getActiveGatewayConfig();
      
      if (!result.success) {
        return res.status(500).json(result);
      }

      res.json({
        success: true,
        config: result.config
      });
    } catch (error) {
      console.error('Erro ao obter gateway ativo:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Obter lista de gateways suportados
  async getSupportedGateways(req, res) {
    try {
      const supportedGateways = [
        {
          name: 'vizzionpay',
          display_name: 'VizzionPay',
          description: 'Gateway de pagamento brasileiro com suporte a PIX',
          features: ['PIX', 'Boleto', 'Cartão'],
          website: 'https://vizzionpay.com',
          documentation: 'https://docs.vizzionpay.com'
        },
        {
          name: 'mercadopago',
          display_name: 'Mercado Pago',
          description: 'Gateway de pagamento do Mercado Livre',
          features: ['PIX', 'Boleto', 'Cartão', 'Parcelamento'],
          website: 'https://www.mercadopago.com.br',
          documentation: 'https://www.mercadopago.com.br/developers'
        },
        {
          name: 'pagseguro',
          display_name: 'PagSeguro',
          description: 'Gateway de pagamento da UOL',
          features: ['PIX', 'Boleto', 'Cartão', 'Débito'],
          website: 'https://pagseguro.uol.com.br',
          documentation: 'https://dev.pagseguro.uol.com.br'
        }
      ];

      res.json({
        success: true,
        gateways: supportedGateways
      });
    } catch (error) {
      console.error('Erro ao obter gateways suportados:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Validar configuração antes de salvar
  async validateConfig(req, res) {
    try {
      const { gatewayName } = req.params;
      const configData = req.body;

      if (!gatewayName) {
        return res.status(400).json({
          success: false,
          error: 'Nome do gateway é obrigatório'
        });
      }

      // Adicionar nome do gateway aos dados
      configData.gateway_name = gatewayName;

      const validation = gatewayConfigService.validateConfigData(configData);
      
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          error: validation.error
        });
      }

      res.json({
        success: true,
        message: 'Configuração válida'
      });
    } catch (error) {
      console.error('Erro ao validar configuração:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = new GatewayConfigController();
