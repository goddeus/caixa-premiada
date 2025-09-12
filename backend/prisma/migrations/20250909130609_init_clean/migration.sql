-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "saldo" REAL NOT NULL DEFAULT 0,
    "codigo_indicacao_usado" TEXT,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "banido_em" DATETIME,
    "motivo_ban" TEXT,
    "ultimo_login" DATETIME,
    "total_giros" REAL NOT NULL DEFAULT 0,
    "rollover_liberado" BOOLEAN NOT NULL DEFAULT false,
    "rollover_minimo" REAL NOT NULL DEFAULT 20.00,
    "primeiro_deposito_feito" BOOLEAN NOT NULL DEFAULT false,
    "tipo_conta" TEXT NOT NULL DEFAULT 'normal',
    "affiliate_id" TEXT
);

-- CreateTable
CREATE TABLE "wallets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "saldo" REAL NOT NULL DEFAULT 0,
    "atualizado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "wallets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "cases" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "preco" REAL NOT NULL,
    "imagem_url" TEXT NOT NULL,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ativo" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "prizes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "case_id" TEXT NOT NULL,
    "valor" REAL NOT NULL,
    "probabilidade" REAL NOT NULL,
    "nome" TEXT,
    "imagem_url" TEXT,
    "ilustrativo" BOOLEAN NOT NULL DEFAULT false,
    "tipo" TEXT NOT NULL DEFAULT 'produto',
    "label" TEXT NOT NULL DEFAULT '',
    "imagem_id" TEXT NOT NULL DEFAULT '',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "sorteavel" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "prizes_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "cases" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "session_id" TEXT,
    "tipo" TEXT NOT NULL,
    "valor" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "descricao" TEXT,
    "case_id" TEXT,
    "prize_id" TEXT,
    CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "transactions_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "user_sessions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "affiliates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "codigo_indicacao" TEXT NOT NULL,
    "ganhos" REAL NOT NULL DEFAULT 0,
    "saldo_disponivel" REAL NOT NULL DEFAULT 0,
    "total_sacado" REAL NOT NULL DEFAULT 0,
    "atualizado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "affiliates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "affiliate_history" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "affiliate_id" TEXT NOT NULL,
    "indicado_id" TEXT NOT NULL,
    "deposito_valido" BOOLEAN NOT NULL DEFAULT false,
    "valor_deposito" REAL,
    "comissao_gerada" REAL,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "affiliate_history_affiliate_id_fkey" FOREIGN KEY ("affiliate_id") REFERENCES "affiliates" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "affiliate_history_indicado_id_fkey" FOREIGN KEY ("indicado_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "rtp_config" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rtp_target" REAL NOT NULL DEFAULT 50.0,
    "rtp_recommended" REAL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT
);

-- CreateTable
CREATE TABLE "caixa_liquido" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "total_depositos" REAL NOT NULL DEFAULT 0,
    "fundos_teste" REAL NOT NULL DEFAULT 0,
    "total_saques" REAL NOT NULL DEFAULT 0,
    "total_comissoes" REAL NOT NULL DEFAULT 0,
    "caixa_liquido" REAL NOT NULL DEFAULT 0,
    "ultima_atualizacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "draw_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "case_id" TEXT NOT NULL,
    "rtp_config" REAL NOT NULL,
    "caixa_liquido_before" REAL NOT NULL,
    "caixa_liquido_after" REAL NOT NULL,
    "prize_selected_id" TEXT,
    "prize_value" REAL NOT NULL,
    "protection_applied" BOOLEAN NOT NULL DEFAULT false,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "processing_time_ms" INTEGER NOT NULL,
    "success" BOOLEAN NOT NULL DEFAULT false,
    "error_message" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "rtp_history" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rtp_config_id" TEXT NOT NULL,
    "old_rtp" REAL NOT NULL,
    "new_rtp" REAL NOT NULL,
    "change_type" TEXT NOT NULL,
    "reason" TEXT,
    "changed_by" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "rtp_history_rtp_config_id_fkey" FOREIGN KEY ("rtp_config_id") REFERENCES "rtp_config" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "affiliate_withdrawals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "affiliate_id" TEXT NOT NULL,
    "valor" REAL NOT NULL,
    "pix_key" TEXT NOT NULL,
    "pix_key_type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processado_em" DATETIME,
    CONSTRAINT "affiliate_withdrawals_affiliate_id_fkey" FOREIGN KEY ("affiliate_id") REFERENCES "affiliates" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "affiliate_commissions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "affiliate_id" TEXT NOT NULL,
    "referred_user_id" TEXT NOT NULL,
    "valor" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'creditado',
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "affiliate_commissions_affiliate_id_fkey" FOREIGN KEY ("affiliate_id") REFERENCES "affiliates" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "affiliate_commissions_referred_user_id_fkey" FOREIGN KEY ("referred_user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "valor" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "metodo_pagamento" TEXT NOT NULL,
    "gateway_id" TEXT,
    "gateway_response" TEXT,
    "pix_key" TEXT,
    "pix_key_type" TEXT,
    "qr_code" TEXT,
    "pix_copy_paste" TEXT,
    "boleto_url" TEXT,
    "boleto_barcode" TEXT,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processado_em" DATETIME,
    "expira_em" DATETIME,
    CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "admin_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "admin_id" TEXT NOT NULL,
    "acao" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "dados_antes" TEXT,
    "dados_depois" TEXT,
    "usuario_afetado_id" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "system_configs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "descricao" TEXT,
    "tipo" TEXT NOT NULL DEFAULT 'string',
    "atualizado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "banners" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "imagem_url" TEXT NOT NULL,
    "link_url" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "login_history" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "ip_address" TEXT NOT NULL,
    "user_agent" TEXT,
    "sucesso" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "login_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_rtp_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "case_id" TEXT NOT NULL,
    "session_start" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "session_end" DATETIME,
    "total_gasto" REAL NOT NULL DEFAULT 0,
    "total_premios" REAL NOT NULL DEFAULT 0,
    "rtp_atual" REAL NOT NULL DEFAULT 0,
    "rtp_limite" REAL NOT NULL DEFAULT 50.0,
    "limite_atingido" BOOLEAN NOT NULL DEFAULT false,
    "ultima_atualizacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_rtp_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_rtp_sessions_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "cases" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "illustrative_prizes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "case_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "valor" REAL NOT NULL,
    "imagem_url" TEXT,
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "illustrative_prizes_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "cases" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "deposito_inicial" REAL NOT NULL,
    "limite_retorno" REAL NOT NULL,
    "valor_premios_recebidos" REAL NOT NULL DEFAULT 0,
    "valor_gasto_caixas" REAL NOT NULL DEFAULT 0,
    "rtp_configurado" REAL NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finalizado_em" DATETIME,
    CONSTRAINT "user_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_cpf_key" ON "users"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "wallets_user_id_key" ON "wallets"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "affiliates_user_id_key" ON "affiliates"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "affiliates_codigo_indicacao_key" ON "affiliates"("codigo_indicacao");

-- CreateIndex
CREATE UNIQUE INDEX "system_configs_chave_key" ON "system_configs"("chave");
