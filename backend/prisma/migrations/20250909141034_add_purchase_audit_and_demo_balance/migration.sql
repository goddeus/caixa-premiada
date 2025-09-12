-- CreateTable
CREATE TABLE "purchase_audit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "purchase_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "session_id" TEXT,
    "caixas_compradas" TEXT NOT NULL,
    "total_preco" REAL NOT NULL,
    "soma_premios" REAL NOT NULL DEFAULT 0,
    "saldo_antes" REAL NOT NULL,
    "saldo_depois" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'concluido',
    "tipo_conta" TEXT NOT NULL DEFAULT 'normal',
    "premios_detalhados" TEXT,
    "erro_detalhes" TEXT,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "purchase_audit_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "purchase_audit_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "user_sessions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
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
    "affiliate_id" TEXT,
    "saldo_demo" REAL NOT NULL DEFAULT 0
);
INSERT INTO "new_users" ("affiliate_id", "ativo", "banido_em", "codigo_indicacao_usado", "cpf", "criado_em", "email", "id", "is_admin", "motivo_ban", "nome", "primeiro_deposito_feito", "rollover_liberado", "rollover_minimo", "saldo", "senha_hash", "tipo_conta", "total_giros", "ultimo_login") SELECT "affiliate_id", "ativo", "banido_em", "codigo_indicacao_usado", "cpf", "criado_em", "email", "id", "is_admin", "motivo_ban", "nome", "primeiro_deposito_feito", "rollover_liberado", "rollover_minimo", "saldo", "senha_hash", "tipo_conta", "total_giros", "ultimo_login" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_cpf_key" ON "users"("cpf");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "purchase_audit_purchase_id_key" ON "purchase_audit"("purchase_id");
