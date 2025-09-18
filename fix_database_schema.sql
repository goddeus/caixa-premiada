-- SCRIPT PARA CORRIGIR O SCHEMA DO BANCO DE DADOS
-- Execute este script no PostgreSQL em produção

-- 1. Adicionar coluna related_id se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Transaction' 
        AND column_name = 'related_id'
    ) THEN
        ALTER TABLE "Transaction" ADD COLUMN "related_id" TEXT;
        RAISE NOTICE 'Coluna related_id adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna related_id já existe.';
    END IF;
END $$;

-- 2. Adicionar coluna metadata se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Transaction' 
        AND column_name = 'metadata'
    ) THEN
        ALTER TABLE "Transaction" ADD COLUMN "metadata" JSONB;
        RAISE NOTICE 'Coluna metadata adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna metadata já existe.';
    END IF;
END $$;

-- 3. Verificar estrutura final da tabela
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'Transaction' 
ORDER BY ordinal_position;
