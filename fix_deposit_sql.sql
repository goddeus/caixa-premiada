-- SCRIPT SQL PARA CORRIGIR O DEPÓSITO DIRETAMENTE NO BANCO
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

-- 2. Verificar se o depósito existe
SELECT 
    id,
    user_id,
    tipo,
    valor,
    status,
    identifier,
    criado_em
FROM "Transaction" 
WHERE identifier = 'deposit_6f73f55f-f9d6-4108-8838-ab76407d7e63_1758208348757';

-- 3. Verificar dados do usuário
SELECT 
    id,
    email,
    tipo_conta,
    saldo_reais,
    saldo_demo,
    affiliate_id,
    primeiro_deposito_feito
FROM "User" 
WHERE id = '6f73f55f-f9d6-4108-8838-ab76407d7e63';

-- 4. Atualizar status da transação para concluído
UPDATE "Transaction" 
SET 
    status = 'concluido',
    processado_em = NOW(),
    descricao = 'Depósito PIX confirmado - Corrigido via SQL',
    saldo_antes = (
        SELECT CASE 
            WHEN tipo_conta = 'afiliado_demo' THEN saldo_demo 
            ELSE saldo_reais 
        END 
        FROM "User" 
        WHERE id = '6f73f55f-f9d6-4108-8838-ab76407d7e63'
    ),
    saldo_depois = (
        SELECT CASE 
            WHEN tipo_conta = 'afiliado_demo' THEN saldo_demo + 20.00
            ELSE saldo_reais + 20.00 
        END 
        FROM "User" 
        WHERE id = '6f73f55f-f9d6-4108-8838-ab76407d7e63'
    )
WHERE identifier = 'deposit_6f73f55f-f9d6-4108-8838-ab76407d7e63_1758208348757';

-- 5. Creditar saldo do usuário (conta normal)
UPDATE "User" 
SET 
    saldo_reais = saldo_reais + 20.00,
    primeiro_deposito_feito = true
WHERE id = '6f73f55f-f9d6-4108-8838-ab76407d7e63'
AND tipo_conta != 'afiliado_demo';

-- 6. Creditar saldo do usuário (conta demo)
UPDATE "User" 
SET 
    saldo_demo = saldo_demo + 20.00,
    primeiro_deposito_feito = true
WHERE id = '6f73f55f-f9d6-4108-8838-ab76407d7e63'
AND tipo_conta = 'afiliado_demo';

-- 7. Sincronizar carteira (conta normal)
INSERT INTO "Wallet" (id, user_id, saldo_reais, saldo_demo, criado_em, atualizado_em)
VALUES (
    gen_random_uuid(),
    '6f73f55f-f9d6-4108-8838-ab76407d7e63',
    20.00,
    0,
    NOW(),
    NOW()
)
ON CONFLICT (user_id) 
DO UPDATE SET 
    saldo_reais = "Wallet".saldo_reais + 20.00,
    atualizado_em = NOW()
WHERE "Wallet".user_id = '6f73f55f-f9d6-4108-8838-ab76407d7e63';

-- 8. Sincronizar carteira (conta demo)
INSERT INTO "Wallet" (id, user_id, saldo_reais, saldo_demo, criado_em, atualizado_em)
VALUES (
    gen_random_uuid(),
    '6f73f55f-f9d6-4108-8838-ab76407d7e63',
    0,
    20.00,
    NOW(),
    NOW()
)
ON CONFLICT (user_id) 
DO UPDATE SET 
    saldo_demo = "Wallet".saldo_demo + 20.00,
    atualizado_em = NOW()
WHERE "Wallet".user_id = '6f73f55f-f9d6-4108-8838-ab76407d7e63';

-- 9. Verificar resultado final
SELECT 
    u.email,
    u.tipo_conta,
    u.saldo_reais,
    u.saldo_demo,
    u.primeiro_deposito_feito,
    w.saldo_reais as wallet_reais,
    w.saldo_demo as wallet_demo,
    t.status as transaction_status,
    t.valor as transaction_valor
FROM "User" u
LEFT JOIN "Wallet" w ON w.user_id = u.id
LEFT JOIN "Transaction" t ON t.user_id = u.id 
    AND t.identifier = 'deposit_6f73f55f-f9d6-4108-8838-ab76407d7e63_1758208348757'
WHERE u.id = '6f73f55f-f9d6-4108-8838-ab76407d7e63';

-- 10. Processar comissão de afiliado (se aplicável)
-- Nota: Esta parte deve ser executada via código Node.js usando o AffiliateService
-- pois envolve lógica de negócio complexa
