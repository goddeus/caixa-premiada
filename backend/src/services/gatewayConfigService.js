const prisma = require('../utils/prisma');

class GatewayConfigService {
  // Obter configuração de um gateway específico
  async getGatewayConfig(gatewayName) {
    try {
      const config = await prisma.gatewayConfig.findUnique({
        where: { gateway_name: gatewayName }
      });

      if (!config) {
        // Retornar configuração padrão se não existir
        return this.getDefaultConfig(gatewayName);
      }

      return {
        success: true,
        config: this.sanitizeConfig(config)
      };
    } catch (error) {
      console.error('Erro ao obter configuração do gateway:', error);
      return {
        success: false,
        error: 'Erro ao obter configuração do gateway'
      };
    }
  }

  // Obter configuração ativa (primeiro gateway ativo)
  async getActiveGatewayConfig() {
    try {
      const config = await prisma.gatewayConfig.findFirst({
        where: { is_active: true }
      });

      return {
        success: true,
        config: config ? this.sanitizeConfig(config) : null
      };
    } catch (error) {
      console.error('Erro ao obter gateway ativo:', error);
      return {
        success: false,
        error: 'Erro ao obter gateway ativo'
      };
    }
  }

  // Salvar/atualizar configuração de gateway
  async saveGatewayConfig(gatewayName, configData, adminId = null) {
    try {
      // Validar dados obrigatórios
      const validation = this.validateConfigData(configData);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error
        };
      }

      // Verificar se já existe configuração
      const existingConfig = await prisma.gatewayConfig.findUnique({
        where: { gateway_name: gatewayName }
      });

      const configToSave = {
        gateway_name: gatewayName,
        is_active: configData.is_active || false,
        api_key: configData.api_key || null,
        public_key: configData.public_key || null,
        webhook_secret: configData.webhook_secret || null,
        base_url: configData.base_url || null,
        pix_key: configData.pix_key || null,
        pix_key_type: configData.pix_key_type || 'email',
        webhook_url: configData.webhook_url || null,
        redirect_url: configData.redirect_url || null,
        sandbox_mode: configData.sandbox_mode !== undefined ? configData.sandbox_mode : true,
        min_deposit: parseFloat(configData.min_deposit) || 20.00,
        max_deposit: parseFloat(configData.max_deposit) || 10000.00,
        min_withdraw: parseFloat(configData.min_withdraw) || 50.00,
        max_withdraw: parseFloat(configData.max_withdraw) || 5000.00,
        deposit_fee: parseFloat(configData.deposit_fee) || 0.00,
        withdraw_fee: parseFloat(configData.withdraw_fee) || 0.00,
        deposit_timeout: parseInt(configData.deposit_timeout) || 3600,
        withdraw_timeout: parseInt(configData.withdraw_timeout) || 86400,
        supported_methods: JSON.stringify(configData.supported_methods || ['pix']),
        config_data: configData.config_data ? JSON.stringify(configData.config_data) : null,
        updated_by: adminId
      };

      let savedConfig;
      if (existingConfig) {
        // Atualizar configuração existente
        savedConfig = await prisma.gatewayConfig.update({
          where: { gateway_name: gatewayName },
          data: configToSave
        });
      } else {
        // Criar nova configuração
        savedConfig = await prisma.gatewayConfig.create({
          data: configToSave
        });
      }

      // Se este gateway está sendo ativado, desativar outros
      if (configData.is_active) {
        await prisma.gatewayConfig.updateMany({
          where: {
            gateway_name: { not: gatewayName },
            is_active: true
          },
          data: { is_active: false }
        });
      }

      return {
        success: true,
        config: this.sanitizeConfig(savedConfig)
      };
    } catch (error) {
      console.error('Erro ao salvar configuração do gateway:', error);
      return {
        success: false,
        error: 'Erro ao salvar configuração do gateway'
      };
    }
  }

  // Listar todas as configurações de gateway
  async listGatewayConfigs() {
    try {
      const configs = await prisma.gatewayConfig.findMany({
        orderBy: { created_at: 'desc' }
      });

      return {
        success: true,
        configs: configs.map(config => this.sanitizeConfig(config))
      };
    } catch (error) {
      console.error('Erro ao listar configurações de gateway:', error);
      return {
        success: false,
        error: 'Erro ao listar configurações de gateway'
      };
    }
  }

  // Ativar/desativar gateway
  async toggleGateway(gatewayName, isActive, adminId = null) {
    try {
      const config = await prisma.gatewayConfig.findUnique({
        where: { gateway_name: gatewayName }
      });

      if (!config) {
        return {
          success: false,
          error: 'Gateway não encontrado'
        };
      }

      // Se ativando, desativar outros gateways
      if (isActive) {
        await prisma.gatewayConfig.updateMany({
          where: {
            gateway_name: { not: gatewayName },
            is_active: true
          },
          data: { is_active: false }
        });
      }

      const updatedConfig = await prisma.gatewayConfig.update({
        where: { gateway_name: gatewayName },
        data: {
          is_active: isActive,
          updated_by: adminId
        }
      });

      return {
        success: true,
        config: this.sanitizeConfig(updatedConfig)
      };
    } catch (error) {
      console.error('Erro ao alterar status do gateway:', error);
      return {
        success: false,
        error: 'Erro ao alterar status do gateway'
      };
    }
  }

  // Deletar configuração de gateway
  async deleteGatewayConfig(gatewayName) {
    try {
      await prisma.gatewayConfig.delete({
        where: { gateway_name: gatewayName }
      });

      return {
        success: true,
        message: 'Configuração do gateway deletada com sucesso'
      };
    } catch (error) {
      console.error('Erro ao deletar configuração do gateway:', error);
      return {
        success: false,
        error: 'Erro ao deletar configuração do gateway'
      };
    }
  }

  // Testar conexão com gateway
  async testGatewayConnection(gatewayName) {
    try {
      const configResult = await this.getGatewayConfig(gatewayName);
      if (!configResult.success) {
        return configResult;
      }

      const config = configResult.config;

      // Teste básico de conectividade
      if (gatewayName === 'vizzionpay') {
        return await this.testVizzionPayConnection(config);
      } else if (gatewayName === 'mercadopago') {
        return await this.testMercadoPagoConnection(config);
      } else if (gatewayName === 'pagseguro') {
        return await this.testPagSeguroConnection(config);
      }

      return {
        success: false,
        error: 'Gateway não suportado para teste'
      };
    } catch (error) {
      console.error('Erro ao testar conexão do gateway:', error);
      return {
        success: false,
        error: 'Erro ao testar conexão do gateway'
      };
    }
  }

  // Teste específico para VizzionPay
  async testVizzionPayConnection(config) {
    try {
      const axios = require('axios');
      
      if (!config.api_key || !config.base_url) {
        return {
          success: false,
          error: 'API Key e Base URL são obrigatórios para VizzionPay'
        };
      }

      const response = await axios.get(`${config.base_url}/v1/health`, {
        headers: {
          'Authorization': `Bearer ${config.api_key}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      return {
        success: true,
        message: 'Conexão com VizzionPay estabelecida com sucesso',
        response: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: `Erro ao conectar com VizzionPay: ${error.message}`
      };
    }
  }

  // Teste específico para MercadoPago
  async testMercadoPagoConnection(config) {
    try {
      const axios = require('axios');
      
      if (!config.api_key) {
        return {
          success: false,
          error: 'API Key é obrigatória para MercadoPago'
        };
      }

      const response = await axios.get('https://api.mercadopago.com/v1/payment_methods', {
        headers: {
          'Authorization': `Bearer ${config.api_key}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      return {
        success: true,
        message: 'Conexão com MercadoPago estabelecida com sucesso',
        response: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: `Erro ao conectar com MercadoPago: ${error.message}`
      };
    }
  }

  // Teste específico para PagSeguro
  async testPagSeguroConnection(config) {
    try {
      const axios = require('axios');
      
      if (!config.api_key) {
        return {
          success: false,
          error: 'API Key é obrigatória para PagSeguro'
        };
      }

      const response = await axios.get('https://ws.pagseguro.uol.com.br/v2/sessions', {
        params: {
          email: config.api_key,
          token: config.webhook_secret
        },
        timeout: 10000
      });

      return {
        success: true,
        message: 'Conexão com PagSeguro estabelecida com sucesso',
        response: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: `Erro ao conectar com PagSeguro: ${error.message}`
      };
    }
  }

  // Validar dados de configuração
  validateConfigData(configData) {
    const requiredFields = ['gateway_name'];
    
    for (const field of requiredFields) {
      if (!configData[field]) {
        return {
          valid: false,
          error: `Campo obrigatório: ${field}`
        };
      }
    }

    // Validar valores numéricos
    const numericFields = ['min_deposit', 'max_deposit', 'min_withdraw', 'max_withdraw', 'deposit_fee', 'withdraw_fee'];
    for (const field of numericFields) {
      if (configData[field] !== undefined && isNaN(parseFloat(configData[field]))) {
        return {
          valid: false,
          error: `Campo ${field} deve ser um número válido`
        };
      }
    }

    // Validar valores mínimos e máximos
    if (configData.min_deposit && configData.max_deposit && parseFloat(configData.min_deposit) >= parseFloat(configData.max_deposit)) {
      return {
        valid: false,
        error: 'Valor mínimo de depósito deve ser menor que o máximo'
      };
    }

    if (configData.min_withdraw && configData.max_withdraw && parseFloat(configData.min_withdraw) >= parseFloat(configData.max_withdraw)) {
      return {
        valid: false,
        error: 'Valor mínimo de saque deve ser menor que o máximo'
      };
    }

    return { valid: true };
  }

  // Sanitizar configuração (remover dados sensíveis)
  sanitizeConfig(config) {
    const sanitized = { ...config };
    
    // Mascarar chaves sensíveis
    if (sanitized.api_key) {
      sanitized.api_key = this.maskString(sanitized.api_key);
    }
    if (sanitized.webhook_secret) {
      sanitized.webhook_secret = this.maskString(sanitized.webhook_secret);
    }
    if (sanitized.public_key) {
      sanitized.public_key = this.maskString(sanitized.public_key);
    }

    // Parsear JSON strings
    if (sanitized.supported_methods) {
      try {
        sanitized.supported_methods = JSON.parse(sanitized.supported_methods);
      } catch (e) {
        sanitized.supported_methods = ['pix'];
      }
    }

    if (sanitized.config_data) {
      try {
        sanitized.config_data = JSON.parse(sanitized.config_data);
      } catch (e) {
        sanitized.config_data = null;
      }
    }

    return sanitized;
  }

  // Mascarar string sensível
  maskString(str) {
    if (!str || str.length < 8) return '***';
    return str.substring(0, 4) + '***' + str.substring(str.length - 4);
  }

  // Obter configuração padrão para um gateway
  getDefaultConfig(gatewayName) {
    const defaults = {
      vizzionpay: {
        gateway_name: 'vizzionpay',
        is_active: false,
        api_key: null,
        public_key: null,
        webhook_secret: null,
        base_url: 'https://api.vizzionpay.com',
        pix_key: null,
        pix_key_type: 'email',
        webhook_url: null,
        redirect_url: null,
        sandbox_mode: true,
        min_deposit: 20.00,
        max_deposit: 10000.00,
        min_withdraw: 50.00,
        max_withdraw: 5000.00,
        deposit_fee: 0.00,
        withdraw_fee: 0.00,
        deposit_timeout: 3600,
        withdraw_timeout: 86400,
        supported_methods: ['pix'],
        config_data: null
      },
      mercadopago: {
        gateway_name: 'mercadopago',
        is_active: false,
        api_key: null,
        public_key: null,
        webhook_secret: null,
        base_url: 'https://api.mercadopago.com',
        pix_key: null,
        pix_key_type: 'email',
        webhook_url: null,
        redirect_url: null,
        sandbox_mode: true,
        min_deposit: 20.00,
        max_deposit: 10000.00,
        min_withdraw: 50.00,
        max_withdraw: 5000.00,
        deposit_fee: 0.00,
        withdraw_fee: 0.00,
        deposit_timeout: 3600,
        withdraw_timeout: 86400,
        supported_methods: ['pix', 'boleto', 'cartao'],
        config_data: null
      },
      pagseguro: {
        gateway_name: 'pagseguro',
        is_active: false,
        api_key: null,
        public_key: null,
        webhook_secret: null,
        base_url: 'https://ws.pagseguro.uol.com.br',
        pix_key: null,
        pix_key_type: 'email',
        webhook_url: null,
        redirect_url: null,
        sandbox_mode: true,
        min_deposit: 20.00,
        max_deposit: 10000.00,
        min_withdraw: 50.00,
        max_withdraw: 5000.00,
        deposit_fee: 0.00,
        withdraw_fee: 0.00,
        deposit_timeout: 3600,
        withdraw_timeout: 86400,
        supported_methods: ['pix', 'boleto', 'cartao'],
        config_data: null
      }
    };

    return defaults[gatewayName] || defaults.vizzionpay;
  }
}

module.exports = new GatewayConfigService();
