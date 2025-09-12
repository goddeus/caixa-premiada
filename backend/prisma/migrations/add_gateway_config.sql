-- CreateTable
CREATE TABLE "gateway_configs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gateway_name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "api_key" TEXT,
    "public_key" TEXT,
    "webhook_secret" TEXT,
    "base_url" TEXT,
    "pix_key" TEXT,
    "pix_key_type" TEXT,
    "webhook_url" TEXT,
    "redirect_url" TEXT,
    "sandbox_mode" BOOLEAN NOT NULL DEFAULT true,
    "min_deposit" REAL NOT NULL DEFAULT 20.00,
    "max_deposit" REAL NOT NULL DEFAULT 10000.00,
    "min_withdraw" REAL NOT NULL DEFAULT 50.00,
    "max_withdraw" REAL NOT NULL DEFAULT 5000.00,
    "deposit_fee" REAL NOT NULL DEFAULT 0.00,
    "withdraw_fee" REAL NOT NULL DEFAULT 0.00,
    "deposit_timeout" INTEGER NOT NULL DEFAULT 3600,
    "withdraw_timeout" INTEGER NOT NULL DEFAULT 86400,
    "supported_methods" TEXT NOT NULL DEFAULT 'pix',
    "config_data" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "gateway_configs_gateway_name_key" ON "gateway_configs"("gateway_name");
