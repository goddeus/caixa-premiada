/**
 * Testes E2E - Fluxo do Usuário
 * Testa o fluxo completo: registro/login → depósito PIX → abrir caixa → saque
 */

const { test, expect } = require('@playwright/test');

test.describe('User Flow E2E', () => {
  let testUser = {
    email: `test-${Date.now()}@example.com`,
    senha: 'TestPassword123!',
    nome: 'Test User'
  };

  test.beforeEach(async ({ page }) => {
    // Configurar timeout maior para testes E2E
    test.setTimeout(60000);
    
    // Navegar para a aplicação
    await page.goto(process.env.FRONTEND_URL || 'http://localhost:3000');
  });

  test('deve executar fluxo completo de usuário', async ({ page }) => {
    // 1. Registro de usuário
    await test.step('Registrar novo usuário', async () => {
      await page.click('text=Registrar');
      await page.fill('input[name="nome"]', testUser.nome);
      await page.fill('input[name="email"]', testUser.email);
      await page.fill('input[name="senha"]', testUser.senha);
      await page.fill('input[name="confirmarSenha"]', testUser.senha);
      await page.click('button[type="submit"]');
      
      // Verificar se foi redirecionado para dashboard
      await expect(page).toHaveURL(/dashboard/);
      await expect(page.locator('text=Dashboard')).toBeVisible();
    });

    // 2. Verificar saldo inicial
    await test.step('Verificar saldo inicial', async () => {
      const saldoElement = page.locator('[data-testid="saldo-reais"]');
      await expect(saldoElement).toBeVisible();
      await expect(saldoElement).toContainText('R$ 0,00');
    });

    // 3. Fazer depósito PIX
    await test.step('Fazer depósito PIX', async () => {
      await page.click('text=Depositar');
      
      // Preencher valor do depósito
      await page.fill('input[name="amount"]', '100.00');
      await page.click('button:has-text("Gerar PIX")');
      
      // Verificar se QR Code foi gerado
      await expect(page.locator('[data-testid="qr-code"]')).toBeVisible();
      await expect(page.locator('[data-testid="pix-copia-cola"]')).toBeVisible();
      
      // Simular pagamento (em ambiente real, seria feito via webhook)
      // Para teste, vamos simular que o pagamento foi processado
      await page.click('button:has-text("Simular Pagamento")');
      
      // Verificar se saldo foi atualizado
      await expect(page.locator('[data-testid="saldo-reais"]')).toContainText('R$ 100,00');
    });

    // 4. Abrir caixa
    await test.step('Abrir caixa', async () => {
      // Navegar para caixas
      await page.click('text=Caixas');
      
      // Selecionar primeira caixa disponível
      const firstCase = page.locator('[data-testid="case-card"]').first();
      await expect(firstCase).toBeVisible();
      
      const casePrice = await firstCase.locator('[data-testid="case-price"]').textContent();
      await firstCase.click();
      
      // Abrir caixa
      await page.click('button:has-text("Abrir Caixa")');
      
      // Verificar se prêmio foi exibido
      await expect(page.locator('[data-testid="prize-result"]')).toBeVisible();
      
      // Verificar se saldo foi debitado
      const expectedBalance = 100.00 - parseFloat(casePrice.replace('R$ ', '').replace(',', '.'));
      await expect(page.locator('[data-testid="saldo-reais"]')).toContainText(`R$ ${expectedBalance.toFixed(2).replace('.', ',')}`);
    });

    // 5. Verificar histórico
    await test.step('Verificar histórico de transações', async () => {
      await page.click('text=Histórico');
      
      // Verificar se transações aparecem
      await expect(page.locator('[data-testid="transaction-item"]')).toHaveCount(2); // Depósito + Abertura de caixa
      
      // Verificar tipos de transação
      await expect(page.locator('text=Depósito')).toBeVisible();
      await expect(page.locator('text=Abertura de caixa')).toBeVisible();
    });

    // 6. Fazer saque
    await test.step('Fazer saque PIX', async () => {
      await page.click('text=Sacar');
      
      // Preencher dados do saque
      await page.fill('input[name="amount"]', '50.00');
      await page.fill('input[name="pixKey"]', testUser.email);
      await page.fill('input[name="pixKeyType"]', 'email');
      
      await page.click('button:has-text("Solicitar Saque")');
      
      // Verificar se saque foi solicitado
      await expect(page.locator('text=Saque solicitado com sucesso')).toBeVisible();
      
      // Verificar se saldo foi debitado
      await expect(page.locator('[data-testid="saldo-reais"]')).toContainText('R$ 50,00');
    });
  });

  test('deve testar fluxo de conta demo', async ({ page }) => {
    // 1. Login como conta demo
    await test.step('Login como conta demo', async () => {
      await page.click('text=Entrar');
      await page.fill('input[name="email"]', 'demo@example.com');
      await page.fill('input[name="senha"]', 'demo123');
      await page.click('button[type="submit"]');
      
      await expect(page).toHaveURL(/dashboard/);
    });

    // 2. Verificar saldo demo
    await test.step('Verificar saldo demo', async () => {
      const saldoDemoElement = page.locator('[data-testid="saldo-demo"]');
      await expect(saldoDemoElement).toBeVisible();
      await expect(saldoDemoElement).toContainText('R$ 100,00');
    });

    // 3. Abrir caixa com saldo demo
    await test.step('Abrir caixa com saldo demo', async () => {
      await page.click('text=Caixas');
      
      const firstCase = page.locator('[data-testid="case-card"]').first();
      await firstCase.click();
      
      await page.click('button:has-text("Abrir Caixa")');
      
      // Verificar se prêmio foi exibido
      await expect(page.locator('[data-testid="prize-result"]')).toBeVisible();
      
      // Verificar se saldo demo foi debitado
      await expect(page.locator('[data-testid="saldo-demo"]')).not.toContainText('R$ 100,00');
    });
  });

  test('deve testar responsividade mobile', async ({ page }) => {
    // Simular dispositivo mobile
    await page.setViewportSize({ width: 375, height: 667 });
    
    await test.step('Verificar layout mobile', async () => {
      // Verificar se menu hambúrguer está visível
      await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
      
      // Abrir menu mobile
      await page.click('[data-testid="mobile-menu"]');
      
      // Verificar se itens do menu estão visíveis
      await expect(page.locator('text=Dashboard')).toBeVisible();
      await expect(page.locator('text=Caixas')).toBeVisible();
      await expect(page.locator('text=Depositar')).toBeVisible();
    });
  });

  test('deve testar tratamento de erros', async ({ page }) => {
    await test.step('Testar erro de login inválido', async () => {
      await page.click('text=Entrar');
      await page.fill('input[name="email"]', 'invalid@example.com');
      await page.fill('input[name="senha"]', 'wrongpassword');
      await page.click('button[type="submit"]');
      
      // Verificar se erro é exibido
      await expect(page.locator('text=Email ou senha inválidos')).toBeVisible();
    });

    await test.step('Testar erro de saldo insuficiente', async () => {
      // Login com usuário sem saldo
      await page.fill('input[name="email"]', 'poor@example.com');
      await page.fill('input[name="senha"]', 'password123');
      await page.click('button[type="submit"]');
      
      // Tentar abrir caixa
      await page.click('text=Caixas');
      const firstCase = page.locator('[data-testid="case-card"]').first();
      await firstCase.click();
      
      await page.click('button:has-text("Abrir Caixa")');
      
      // Verificar se erro é exibido
      await expect(page.locator('text=Saldo insuficiente')).toBeVisible();
    });
  });
});
