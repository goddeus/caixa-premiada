// Configurações de Produção para o Backend
module.exports = {
  // Configurações do servidor
  port: process.env.PORT || 3001,
  nodeEnv: 'production',
  
  // JWT
  jwtSecret: process.env.JWT_SECRET || 'sua_chave_jwt_super_secreta_para_producao_2024',
  
  // CORS
  corsOrigin: 'https://slotbox.shop',
  
  // Rate Limiting
  rateLimit: {
    windowMs: 60000, // 1 minuto
    maxRequests: 1000
  },
  
  // Database
  databaseUrl: process.env.DATABASE_URL || 'file:./prisma/prod.db',
  
  // Logs
  logLevel: 'info'
};
