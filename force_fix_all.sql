-- SCRIPT SQL PARA FORÇAR CORREÇÃO COMPLETA
-- Execute este script no PostgreSQL em produção

-- 1. Verificar dados atuais
SELECT 
    u.id,
    u.nome,
    u.email,
    u.tipo_conta,
    u.saldo_reais,
    u.saldo_demo,
    u.affiliate_id,
    u.codigo_indicacao_usado,
    w.saldo_reais as wallet_reais,
    w.saldo_demo as wallet_demo
FROM "User" u
LEFT JOIN "Wallet" w ON w.user_id = u.id
WHERE u.email = 'paulotest@gmail.com';

-- 2. Verificar afiliado
SELECT 
    a.id as affiliate_id,
    a.user_id as affiliate_user_id,
    a.codigo_indicacao,
    u.nome as affiliate_nome,
    u.email as affiliate_email,
    a.ganhos,
    a.saldo_disponivel
FROM "Affiliate" a
JOIN "User" u ON u.id = a.user_id
WHERE a.codigo_indicacao = 'AFFJUVGKTUTSYCQ';

-- 3. FORÇAR SALDO CORRETO
UPDATE "User" 
SET 
    saldo_reais = 20.00,
    primeiro_deposito_feito = true
WHERE email = 'paulotest@gmail.com';

-- 4. FORÇAR CARTEIRA CORRETA
INSERT INTO "Wallet" (id, user_id, saldo_reais, saldo_demo, criado_em, atualizado_em)
VALUES (
    gen_random_uuid(),
    (SELECT id FROM "User" WHERE email = 'paulotest@gmail.com'),
    20.00,
    0,
    NOW(),
    NOW()
)
ON CONFLICT (user_id) 
DO UPDATE SET 
    saldo_reais = 20.00,
    saldo_demo = 0,
    atualizado_em = NOW();

-- 5. FORÇAR VINCULAÇÃO DO AFILIADO
UPDATE "User" 
SET 
    affiliate_id = (
        SELECT user_id 
        FROM "Affiliate" 
        WHERE codigo_indicacao = 'AFFJUVGKTUTSYCQ'
    ),
    codigo_indicacao_usado = 'AFFJUVGKTUTSYCQ'
WHERE email = 'paulotest@gmail.com';

-- 6. VERIFICAR SE COMISSÃO JÁ EXISTE
SELECT 
    ac.id,
    ac.affiliate_id,
    ac.user_id,
    ac.valor,
    ac.status,
    ac.criado_em
FROM "AffiliateCommission" ac
JOIN "User" u ON u.id = ac.user_id
WHERE u.email = 'paulotest@gmail.com';

-- 7. CRIAR COMISSÃO SE NÃO EXISTIR
INSERT INTO "AffiliateCommission" (id, affiliate_id, user_id, valor, status, criado_em)
SELECT 
    gen_random_uuid(),
    a.id,
    u.id,
    10.00,
    'creditado',
    NOW()
FROM "User" u
JOIN "Affiliate" a ON a.user_id = u.affiliate_id
WHERE u.email = 'paulotest@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM "AffiliateCommission" ac 
    WHERE ac.affiliate_id = a.id 
    AND ac.user_id = u.id
);

-- 8. CREDITAR SALDO DO AFILIADO
UPDATE "User" 
SET saldo_reais = saldo_reais + 10.00
WHERE id = (
    SELECT user_id 
    FROM "Affiliate" 
    WHERE codigo_indicacao = 'AFFJUVGKTUTSYCQ'
);

-- 9. SINCRONIZAR CARTEIRA DO AFILIADO
INSERT INTO "Wallet" (id, user_id, saldo_reais, saldo_demo, criado_em, atualizado_em)
VALUES (
    gen_random_uuid(),
    (SELECT user_id FROM "Affiliate" WHERE codigo_indicacao = 'AFFJUVGKTUTSYCQ'),
    10.00,
    0,
    NOW(),
    NOW()
)
ON CONFLICT (user_id) 
DO UPDATE SET 
    saldo_reais = saldo_reais + 10.00,
    atualizado_em = NOW();

-- 10. ATUALIZAR DADOS DO AFILIADO
UPDATE "Affiliate" 
SET 
    ganhos = ganhos + 10.00,
    saldo_disponivel = saldo_disponivel + 10.00
WHERE codigo_indicacao = 'AFFJUVGKTUTSYCQ';

-- 11. REGISTRAR TRANSAÇÃO DE COMISSÃO
INSERT INTO "Transaction" (id, user_id, tipo, valor, status, descricao, criado_em)
VALUES (
    gen_random_uuid(),
    (SELECT user_id FROM "Affiliate" WHERE codigo_indicacao = 'AFFJUVGKTUTSYCQ'),
    'affiliate_credit',
    10.00,
    'concluido',
    'Comissão por indicação - paulotest@gmail.com',
    NOW()
);

-- 12. REGISTRAR HISTÓRICO DE AFILIADO
INSERT INTO "AffiliateHistory" (id, affiliate_id, indicado_id, deposito_valido, valor_deposito, comissao, status, criado_em)
VALUES (
    gen_random_uuid(),
    (SELECT id FROM "Affiliate" WHERE codigo_indicacao = 'AFFJUVGKTUTSYCQ'),
    (SELECT id FROM "User" WHERE email = 'paulotest@gmail.com'),
    true,
    20.00,
    10.00,
    'pago',
    NOW()
);

-- 13. VERIFICAR DADOS FINAIS
SELECT 
    u.id,
    u.nome,
    u.email,
    u.tipo_conta,
    u.saldo_reais,
    u.saldo_demo,
    u.affiliate_id,
    u.codigo_indicacao_usado,
    w.saldo_reais as wallet_reais,
    w.saldo_demo as wallet_demo
FROM "User" u
LEFT JOIN "Wallet" w ON w.user_id = u.id
WHERE u.email = 'paulotest@gmail.com';

-- 14. VERIFICAR DADOS DO AFILIADO
SELECT 
    a.id as affiliate_id,
    a.user_id as affiliate_user_id,
    a.codigo_indicacao,
    u.nome as affiliate_nome,
    u.email as affiliate_email,
    a.ganhos,
    a.saldo_disponivel,
    u.saldo_reais as affiliate_saldo
FROM "Affiliate" a
JOIN "User" u ON u.id = a.user_id
WHERE a.codigo_indicacao = 'AFFJUVGKTUTSYCQ';

-- 15. VERIFICAR COMISSÃO CRIADA
SELECT 
    ac.id,
    ac.affiliate_id,
    ac.user_id,
    ac.valor,
    ac.status,
    ac.criado_em
FROM "AffiliateCommission" ac
JOIN "User" u ON u.id = ac.user_id
WHERE u.email = 'paulotest@gmail.com';
