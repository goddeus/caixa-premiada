-- Migrações para reconstrução completa da plataforma
-- Aplicar com cuidado após backup

-- 1. Adicionar campos necessários se não existirem
-- (Verificar se já existem no schema atual)

-- Adicionar campos de saldo separados para demo vs reais
ALTER TABLE users ADD COLUMN saldo_reais DECIMAL(14,2) DEFAULT 0.00;

-- Atualizar saldo_reais com valores atuais do saldo (migração de dados)
UPDATE users SET saldo_reais = saldo WHERE saldo_reais = 0.00;

-- 2. Criar tabela para transações demo (isoladas)
CREATE TABLE IF NOT EXISTS transactions_demo (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL,
  tipo VARCHAR(50),
  valor DECIMAL(14,2),
  nota TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_transactions_demo_user_id ON transactions_demo(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_demo_created_at ON transactions_demo(created_at);
CREATE INDEX IF NOT EXISTS idx_users_tipo_conta ON users(tipo_conta);
CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_affiliate_id ON affiliate_commissions(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_purchase_audit_user_id ON purchase_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_purchase_audit_created_at ON purchase_audit(created_at);

-- 4. Adicionar campo valor_reais nos prizes se não existir
-- (Para separar valor visual do valor real creditado)
ALTER TABLE prizes ADD COLUMN valor_reais DECIMAL(10,2) DEFAULT 0.00;

-- Atualizar valor_reais baseado no tipo de prêmio
UPDATE prizes SET valor_reais = CASE 
  WHEN tipo = 'cash' THEN valor
  WHEN tipo = 'produto' AND valor <= 1000.00 THEN valor
  ELSE 0.00
END WHERE valor_reais = 0.00;

-- 5. Criar tabela para configuração global de RTP
CREATE TABLE IF NOT EXISTS global_rtp_config (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  rtp_global DECIMAL(5,2) DEFAULT 10.00, -- RTP global em % (ex: 10%)
  rtp_demo DECIMAL(5,2) DEFAULT 70.00,   -- RTP para contas demo (70%)
  limite_sessao_demo DECIMAL(10,2) DEFAULT 100.00, -- Limite por sessão demo
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_by TEXT
);

-- Inserir configuração padrão se não existir
INSERT OR IGNORE INTO global_rtp_config (id, rtp_global, rtp_demo) 
VALUES ('default', 10.00, 70.00);

-- 6. Criar tabela para logs de sorteio detalhados
CREATE TABLE IF NOT EXISTS draw_detailed_logs (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL,
  case_id TEXT NOT NULL,
  session_id TEXT,
  purchase_id TEXT,
  rtp_config DECIMAL(5,2),
  expected_value DECIMAL(10,2),
  scaling_factor DECIMAL(8,6),
  random_value DECIMAL(8,6),
  result_type TEXT, -- 'PAID' ou 'ILLUSTRATIVE'
  prize_id TEXT,
  prize_value DECIMAL(10,2) DEFAULT 0.00,
  session_remaining_before DECIMAL(10,2),
  session_remaining_after DECIMAL(10,2),
  processing_time_ms INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 7. Adicionar campos de controle de idempotência
ALTER TABLE purchase_audit ADD COLUMN idempotency_key TEXT UNIQUE;

-- 8. Criar tabela para configuração do Bullspay
CREATE TABLE IF NOT EXISTS bullspay_config (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  api_key TEXT NOT NULL,
  base_url TEXT NOT NULL,
  webhook_secret TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  sandbox_mode BOOLEAN DEFAULT false,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 9. Adicionar campos específicos para Bullspay nos payments
ALTER TABLE payments ADD COLUMN bullspay_transaction_id TEXT;
ALTER TABLE payments ADD COLUMN bullspay_status TEXT;
ALTER TABLE payments ADD COLUMN bullspay_callback_data TEXT;

-- 10. Criar view para relatórios admin
CREATE VIEW IF NOT EXISTS admin_dashboard_stats AS
SELECT 
  (SELECT COUNT(*) FROM users WHERE tipo_conta = 'normal') as usuarios_normais,
  (SELECT COUNT(*) FROM users WHERE tipo_conta = 'afiliado_demo') as usuarios_demo,
  (SELECT SUM(saldo_reais) FROM users WHERE tipo_conta = 'normal') as saldo_total_real,
  (SELECT SUM(saldo_demo) FROM users WHERE tipo_conta = 'afiliado_demo') as saldo_total_demo,
  (SELECT COUNT(*) FROM purchase_audit WHERE created_at >= date('now', '-1 day')) as compras_24h,
  (SELECT SUM(total_preco) FROM purchase_audit WHERE created_at >= date('now', '-1 day')) as revenue_24h,
  (SELECT SUM(soma_premios) FROM purchase_audit WHERE created_at >= date('now', '-1 day')) as premios_pagos_24h;

-- 11. Trigger para atualizar updated_at automaticamente
CREATE TRIGGER IF NOT EXISTS update_global_rtp_config_updated_at 
  AFTER UPDATE ON global_rtp_config
  BEGIN
    UPDATE global_rtp_config SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

-- 12. Garantir dados consistentes
-- Atualizar users sem tipo_conta definido
UPDATE users SET tipo_conta = 'normal' WHERE tipo_conta IS NULL OR tipo_conta = '';

-- Garantir que todos os prizes tenham tipo definido
UPDATE prizes SET tipo = 'cash' WHERE tipo IS NULL OR tipo = '';
UPDATE prizes SET tipo = 'ilustrativo' WHERE valor > 5000.00 AND tipo != 'ilustrativo';

COMMIT;


