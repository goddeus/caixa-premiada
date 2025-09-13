require('dotenv').config();

module.exports = {
  // Configurações do servidor
  port: process.env.PORT || 65002,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Configurações do banco
  database: {
    url: process.env.DATABASE_URL || 'file:./dev.db'
  },
  
  // Configurações JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'sua_chave_jwt_super_secreta_aqui_2024',
    expiresIn: '7d'
  },
  
  // Configurações RTP
  rtp: {
    global: parseFloat(process.env.RTP_GLOBAL) || 10.0,
    demo: parseFloat(process.env.RTP_DEMO) || 70.0,
    demoPurchasesEnabled: process.env.DEMO_PURCHASES_ENABLED === 'true'
  },
  
  // Configurações VizzionPay
  vizzionpay: {
    apiKey: process.env.VIZZIONPAY_API_KEY || '',
    baseUrl: process.env.VIZZIONPAY_BASE_URL || 'https://app.vizzionpay.com/api/v1',
    webhookSecret: process.env.VIZZIONPAY_WEBHOOK_SECRET || '',
    pixKey: process.env.VIZZIONPAY_PIX_KEY || '',
    pixKeyType: process.env.VIZZIONPAY_PIX_KEY_TYPE || 'email'
  },
  
  // URLs
  frontend: {
    url: process.env.FRONTEND_URL || 'https://slotbox.shop'
  },
  
  api: {
    baseUrl: process.env.API_BASE_URL || 'https://slotbox.shop'
  },
  
  // Logs
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  }
};
