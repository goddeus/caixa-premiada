const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedGatewayConfig() {
  try {
    console.log('🌱 Iniciando seed de configuração de gateway...');

    // Verificar se já existe configuração do VizzionPay
    const existingConfig = await prisma.gatewayConfig.findUnique({
      where: { gateway_name: 'vizzionpay' }
    });

    if (existingConfig) {
      console.log('✅ Configuração do VizzionPay já existe');
      return;
    }

    // Criar configuração padrão do VizzionPay
    const vizzionPayConfig = await prisma.gatewayConfig.create({
      data: {
        gateway_name: 'vizzionpay',
        is_active: false, // Inativo por padrão
        api_key: null,
        public_key: null,
        webhook_secret: null,
        base_url: 'https://api.vizzionpay.com',
        pix_key: 'teste@caixapremiada.com',
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
        supported_methods: JSON.stringify(['pix']),
        config_data: null,
        updated_by: 'system'
      }
    });

    console.log('✅ Configuração padrão do VizzionPay criada:', vizzionPayConfig.id);

    // Criar configurações padrão para outros gateways
    const otherGateways = [
      {
        gateway_name: 'mercadopago',
        base_url: 'https://api.mercadopago.com',
        supported_methods: ['pix', 'boleto', 'cartao']
      },
      {
        gateway_name: 'pagseguro',
        base_url: 'https://ws.pagseguro.uol.com.br',
        supported_methods: ['pix', 'boleto', 'cartao']
      }
    ];

    for (const gateway of otherGateways) {
      const existing = await prisma.gatewayConfig.findUnique({
        where: { gateway_name: gateway.gateway_name }
      });

      if (!existing) {
        await prisma.gatewayConfig.create({
          data: {
            gateway_name: gateway.gateway_name,
            is_active: false,
            api_key: null,
            public_key: null,
            webhook_secret: null,
            base_url: gateway.base_url,
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
            supported_methods: JSON.stringify(gateway.supported_methods),
            config_data: null,
            updated_by: 'system'
          }
        });
        console.log(`✅ Configuração padrão do ${gateway.gateway_name} criada`);
      }
    }

    console.log('🎉 Seed de configuração de gateway concluído!');
  } catch (error) {
    console.error('❌ Erro no seed de configuração de gateway:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  seedGatewayConfig()
    .then(() => {
      console.log('✅ Seed concluído com sucesso');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro no seed:', error);
      process.exit(1);
    });
}

module.exports = seedGatewayConfig;
