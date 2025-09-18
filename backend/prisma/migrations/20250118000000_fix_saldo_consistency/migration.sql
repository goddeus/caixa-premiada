-- Fix saldo field consistency
-- Remove old 'saldo' field if it exists and ensure consistency

-- Check if 'saldo' column exists in users table and remove it
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'users' AND column_name = 'saldo') THEN
        ALTER TABLE "users" DROP COLUMN "saldo";
    END IF;
END $$;

-- Check if 'saldo' column exists in wallets table and remove it
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'wallets' AND column_name = 'saldo') THEN
        ALTER TABLE "wallets" DROP COLUMN "saldo";
    END IF;
END $$;

-- Ensure saldo_reais and saldo_demo columns exist
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "saldo_reais" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "saldo_demo" DOUBLE PRECISION NOT NULL DEFAULT 0;

ALTER TABLE "wallets" ADD COLUMN IF NOT EXISTS "saldo_reais" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "wallets" ADD COLUMN IF NOT EXISTS "saldo_demo" DOUBLE PRECISION NOT NULL DEFAULT 0;
