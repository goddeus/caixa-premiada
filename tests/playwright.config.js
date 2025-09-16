/**
 * Configuração do Playwright para testes E2E
 */

const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  // Diretório de teste
  testDir: './e2e',
  
  // Timeout global para testes
  timeout: 60000,
  
  // Timeout para cada expect
  expect: {
    timeout: 10000
  },
  
  // Configurações de retry
  retries: process.env.CI ? 2 : 0,
  
  // Workers para execução paralela
  workers: process.env.CI ? 1 : undefined,
  
  // Configurações de relatório
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }]
  ],
  
  // Configurações globais
  use: {
    // URL base da aplicação
    baseURL: process.env.FRONTEND_URL || 'http://localhost:3000',
    
    // Timeout para ações
    actionTimeout: 15000,
    
    // Screenshots em caso de falha
    screenshot: 'only-on-failure',
    
    // Vídeo em caso de falha
    video: 'retain-on-failure',
    
    // Trace para debug
    trace: 'on-first-retry'
  },
  
  // Configurações de projetos (diferentes navegadores)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] }
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] }
    }
  ],
  
  // Servidor de desenvolvimento
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000
  }
});
