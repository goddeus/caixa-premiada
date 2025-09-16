-- Rollback script for adding missing tables
-- Execute this if you need to revert the migration

-- Drop foreign key constraints first
ALTER TABLE "purchase_audit" DROP CONSTRAINT IF EXISTS "purchase_audit_case_id_fkey";
ALTER TABLE "purchase_audit" DROP CONSTRAINT IF EXISTS "purchase_audit_user_id_fkey";
ALTER TABLE "withdrawals" DROP CONSTRAINT IF EXISTS "withdrawals_user_id_fkey";
ALTER TABLE "deposits" DROP CONSTRAINT IF EXISTS "deposits_user_id_fkey";

-- Drop indexes
DROP INDEX IF EXISTS "purchase_audit_purchase_id_idx";
DROP INDEX IF EXISTS "purchase_audit_user_id_idx";
DROP INDEX IF EXISTS "withdrawals_status_idx";
DROP INDEX IF EXISTS "withdrawals_user_id_idx";
DROP INDEX IF EXISTS "deposits_status_idx";
DROP INDEX IF EXISTS "deposits_user_id_idx";
DROP INDEX IF EXISTS "deposits_identifier_key";

-- Drop tables
DROP TABLE IF EXISTS "purchase_audit";
DROP TABLE IF EXISTS "withdrawals";
DROP TABLE IF EXISTS "deposits";
