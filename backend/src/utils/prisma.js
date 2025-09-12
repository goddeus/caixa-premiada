const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: 'pretty',
  transactionOptions: {
    timeout: 30000, // 30 segundos
    maxWait: 10000, // 10 segundos
  },
});

// Middleware para logging de queries (apenas em desenvolvimento)
if (process.env.NODE_ENV === 'development') {
  prisma.$use(async (params, next) => {
    const before = Date.now();
    const result = await next(params);
    const after = Date.now();
    console.log(`Query ${params.model}.${params.action} took ${after - before}ms`);
    return result;
  });
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = prisma;
