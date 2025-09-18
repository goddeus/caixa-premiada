-- SCRIPT SQL PARA VERIFICAR E CORRIGIR SALDO DO USUÁRIO
-- Execute este script no PostgreSQL em produção

-- 1. Verificar dados atuais do usuário
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

-- 2. Verificar transações de depósito do usuário
SELECT 
    t.id,
    t.tipo,
    t.valor,
    t.status,
    t.identifier,
    t.saldo_antes,
    t.saldo_depois,
    t.criado_em,
    t.descricao
FROM "Transaction" t
JOIN "User" u ON u.id = t.user_id
WHERE u.email = 'paulotest@gmail.com'
AND t.tipo = 'deposito'
ORDER BY t.criado_em DESC;

-- 3. Calcular total depositado
SELECT 
    u.email,
    COUNT(*) as total_depositos,
    SUM(CASE WHEN t.status = 'concluido' THEN t.valor ELSE 0 END) as total_depositado,
    u.saldo_reais as saldo_atual,
    (SUM(CASE WHEN t.status = 'concluido' THEN t.valor ELSE 0 END) - u.saldo_reais) as diferenca
FROM "User" u
LEFT JOIN "Transaction" t ON t.user_id = u.id AND t.tipo = 'deposito'
WHERE u.email = 'paulotest@gmail.com'
GROUP BY u.id, u.email, u.saldo_reais;

-- 4. Verificar transação específica
SELECT 
    t.id,
    t.tipo,
    t.valor,
    t.status,
    t.identifier,
    t.saldo_antes,
    t.saldo_depois,
    t.criado_em
FROM "Transaction" t
WHERE t.identifier = 'deposit_6f73f55f-f9d6-4108-8838-ab76407d7e63_1758208348757'
AND t.tipo = 'deposito';

-- 5. Corrigir saldo se necessário (descomente se precisar)
-- UPDATE "User" 
-- SET saldo_reais = (
--     SELECT SUM(t.valor) 
--     FROM "Transaction" t 
--     WHERE t.user_id = "User".id 
--     AND t.tipo = 'deposito' 
--     AND t.status = 'concluido'
-- )
-- WHERE email = 'paulotest@gmail.com';

-- 6. Sincronizar carteira se necessário (descomente se precisar)
-- UPDATE "Wallet" 
-- SET saldo_reais = (
--     SELECT saldo_reais 
--     FROM "User" 
--     WHERE id = "Wallet".user_id
-- )
-- WHERE user_id = (
--     SELECT id 
--     FROM "User" 
--     WHERE email = 'paulotest@gmail.com'
-- );

-- 7. Verificar dados finais
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
    w.saldo_demo as wallet_demo,
    (u.saldo_reais - w.saldo_reais) as diferenca_sincronizacao
FROM "User" u
LEFT JOIN "Wallet" w ON w.user_id = u.id
WHERE u.email = 'paulotest@gmail.com';
