-- Rollback for audit fields migration
-- Migration: 20250915120000_add_audit_fields

-- Remove indexes first
DROP INDEX IF EXISTS "Transaction_metadata_idx";
DROP INDEX IF EXISTS "Prize_metadata_idx";
DROP INDEX IF EXISTS "Case_metadata_idx";
DROP INDEX IF EXISTS "Payment_metadata_idx";
DROP INDEX IF EXISTS "Case_sync_status_idx";
DROP INDEX IF EXISTS "Prize_sync_status_idx";
DROP INDEX IF EXISTS "Prize_sorteavel_idx";
DROP INDEX IF EXISTS "User_last_audit_check_idx";
DROP INDEX IF EXISTS "Case_last_sync_idx";
DROP INDEX IF EXISTS "Prize_last_sync_idx";

-- Remove audit fields from User table
ALTER TABLE "User" DROP COLUMN IF EXISTS "last_audit_check";
ALTER TABLE "User" DROP COLUMN IF EXISTS "audit_notes";

-- Remove audit fields from Case table
ALTER TABLE "Case" DROP COLUMN IF EXISTS "last_sync";
ALTER TABLE "Case" DROP COLUMN IF EXISTS "sync_status";

-- Remove audit fields from Prize table
ALTER TABLE "Prize" DROP COLUMN IF EXISTS "last_sync";
ALTER TABLE "Prize" DROP COLUMN IF EXISTS "sync_status";
ALTER TABLE "Prize" DROP COLUMN IF EXISTS "sorteavel";

-- Remove metadata fields
ALTER TABLE "Transaction" DROP COLUMN IF EXISTS "metadata";
ALTER TABLE "Prize" DROP COLUMN IF EXISTS "metadata";
ALTER TABLE "Case" DROP COLUMN IF EXISTS "metadata";
ALTER TABLE "Payment" DROP COLUMN IF EXISTS "metadata";
