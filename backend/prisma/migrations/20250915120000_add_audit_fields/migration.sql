-- Add audit and metadata fields for enhanced tracking
-- Migration: 20250915120000_add_audit_fields

-- Add metadata field to Transaction table for storing additional data
ALTER TABLE "Transaction" ADD COLUMN "metadata" JSONB;

-- Add metadata field to Prize table for storing additional data
ALTER TABLE "Prize" ADD COLUMN "metadata" JSONB;

-- Add metadata field to Case table for storing additional data
ALTER TABLE "Case" ADD COLUMN "metadata" JSONB;

-- Add metadata field to Payment table for storing additional data
ALTER TABLE "Payment" ADD COLUMN "metadata" JSONB;

-- Add audit fields to User table
ALTER TABLE "User" ADD COLUMN "last_audit_check" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "audit_notes" TEXT;

-- Add audit fields to Case table
ALTER TABLE "Case" ADD COLUMN "last_sync" TIMESTAMP(3);
ALTER TABLE "Case" ADD COLUMN "sync_status" TEXT DEFAULT 'pending';

-- Add audit fields to Prize table
ALTER TABLE "Prize" ADD COLUMN "last_sync" TIMESTAMP(3);
ALTER TABLE "Prize" ADD COLUMN "sync_status" TEXT DEFAULT 'pending';
ALTER TABLE "Prize" ADD COLUMN "sorteavel" BOOLEAN DEFAULT true;

-- Add index for better performance on audit queries
CREATE INDEX "Transaction_metadata_idx" ON "Transaction" USING GIN ("metadata");
CREATE INDEX "Prize_metadata_idx" ON "Prize" USING GIN ("metadata");
CREATE INDEX "Case_metadata_idx" ON "Case" USING GIN ("metadata");
CREATE INDEX "Payment_metadata_idx" ON "Payment" USING GIN ("metadata");

-- Add index for sync status queries
CREATE INDEX "Case_sync_status_idx" ON "Case" ("sync_status");
CREATE INDEX "Prize_sync_status_idx" ON "Prize" ("sync_status");
CREATE INDEX "Prize_sorteavel_idx" ON "Prize" ("sorteavel");

-- Add index for audit queries
CREATE INDEX "User_last_audit_check_idx" ON "User" ("last_audit_check");
CREATE INDEX "Case_last_sync_idx" ON "Case" ("last_sync");
CREATE INDEX "Prize_last_sync_idx" ON "Prize" ("last_sync");
