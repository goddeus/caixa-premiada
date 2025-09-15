/**
 * Setup global para testes
 */

// Configurar variáveis de ambiente para testes
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/slotbox_test';
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.VIZZION_PUBLIC_KEY = 'test-public-key';
process.env.VIZZION_SECRET_KEY = 'test-secret-key';

// Configurar timeout global
jest.setTimeout(30000);

// Mock do console para reduzir output durante testes
const originalConsole = global.console;
global.console = {
  ...originalConsole,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Cleanup após cada teste
afterEach(() => {
  jest.clearAllMocks();
});

// Cleanup global
afterAll(() => {
  // Restaurar console original
  global.console = originalConsole;
});
