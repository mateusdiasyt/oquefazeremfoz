-- ============================================
-- APROVAR GUIA MANUALMENTE
-- ============================================
-- Execute este script no SQL Editor do Neon.tech
-- Para aprovar um guia específico

-- ============================================
-- OPÇÃO 1: Aprovar TODOS os guias pendentes
-- ============================================
UPDATE "guide" 
SET "isApproved" = true, "approvedAt" = NOW()
WHERE "isApproved" = false;

-- ============================================
-- OPÇÃO 2: Aprovar guia específico por nome
-- ============================================
-- Substitua 'NOME_DO_GUIA' pelo nome do guia
-- UPDATE "guide" 
-- SET "isApproved" = true, "approvedAt" = NOW()
-- WHERE name ILIKE '%NOME_DO_GUIA%';

-- ============================================
-- OPÇÃO 3: Aprovar guia específico por ID
-- ============================================
-- Substitua 'guide_xxxxx' pelo ID do guia
-- UPDATE "guide" 
-- SET "isApproved" = true, "approvedAt" = NOW()
-- WHERE id = 'guide_xxxxx';

-- ============================================
-- VERIFICAR GUIAS PENDENTES
-- ============================================
SELECT id, name, "isApproved", "createdAt"
FROM "guide"
ORDER BY "createdAt" DESC;

-- ============================================
-- VERIFICAR GUIAS APROVADOS
-- ============================================
SELECT id, name, "isApproved", "approvedAt"
FROM "guide"
WHERE "isApproved" = true
ORDER BY "approvedAt" DESC;
