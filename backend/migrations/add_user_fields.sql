-- Migração para adicionar campos username e telefone ao modelo User
-- Execute este script no banco de dados PostgreSQL

-- Adicionar coluna username
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "username" TEXT;

-- Adicionar coluna telefone  
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "telefone" TEXT;

-- Atualizar usuários existentes para ter username baseado no nome
UPDATE "User" SET "username" = LOWER(REPLACE("nome", ' ', '_')) WHERE "username" IS NULL;

-- Criar índice para username (opcional, para melhor performance)
CREATE INDEX IF NOT EXISTS "User_username_idx" ON "User"("username");

-- Comentários para documentação
COMMENT ON COLUMN "User"."username" IS 'Nome de usuário personalizado';
COMMENT ON COLUMN "User"."telefone" IS 'Telefone do usuário';
