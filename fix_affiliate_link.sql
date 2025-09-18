-- SCRIPT SQL PARA CORRIGIR VINCULAÇÃO DE AFILIADO
-- Execute este script no PostgreSQL em produção

-- 1. Verificar se o código de indicação existe
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

-- 2. Verificar dados atuais do usuário paulotest@gmail.com
SELECT 
    id,
    nome,
    email,
    affiliate_id,
    codigo_indicacao_usado,
    saldo_reais,
    tipo_conta
FROM "User" 
WHERE email = 'paulotest@gmail.com';

-- 3. Corrigir vinculação do usuário ao afiliado
UPDATE "User" 
SET 
    affiliate_id = (
        SELECT user_id 
        FROM "Affiliate" 
        WHERE codigo_indicacao = 'AFFJUVGKTUTSYCQ'
    ),
    codigo_indicacao_usado = 'AFFJUVGKTUTSYCQ'
WHERE email = 'paulotest@gmail.com';

-- 4. Verificar se a correção foi aplicada
SELECT 
    id,
    nome,
    email,
    affiliate_id,
    codigo_indicacao_usado,
    saldo_reais,
    tipo_conta
FROM "User" 
WHERE email = 'paulotest@gmail.com';

-- 5. Verificar dados do afiliado após correção
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

-- 6. Verificar se já existe comissão processada
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

-- 7. Se não existe comissão, criar uma (R$ 10,00)
-- NOTA: Esta parte deve ser executada via código Node.js usando o AffiliateService
-- pois envolve lógica de negócio complexa e atualização de múltiplas tabelas

-- 8. Verificar histórico de afiliados
SELECT 
    ah.id,
    ah.affiliate_id,
    ah.indicado_id,
    ah.deposito_valido,
    ah.valor_deposito,
    ah.comissao,
    ah.status,
    ah.criado_em
FROM "AffiliateHistory" ah
JOIN "User" u ON u.id = ah.indicado_id
WHERE u.email = 'paulotest@gmail.com';
