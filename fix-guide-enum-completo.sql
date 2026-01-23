-- ============================================
-- CORREÇÃO COMPLETA: Adicionar GUIDE ao Enum
-- ============================================
-- Execute este script no SQL Editor do Neon.tech
-- Este script garante que GUIDE está no enum E na constraint

-- 1. Adicionar GUIDE ao enum (se ainda não tiver)
ALTER TYPE "userrole_role" ADD VALUE IF NOT EXISTS 'GUIDE';

-- 2. Verificar enum (deve mostrar 4 valores)
SELECT unnest(enum_range(NULL::userrole_role)) AS role_value;

-- 3. Remover constraint antiga (se existir)
ALTER TABLE userrole DROP CONSTRAINT IF EXISTS userrole_role_check;

-- 4. Recriar constraint com GUIDE incluído
ALTER TABLE userrole 
ADD CONSTRAINT userrole_role_check 
CHECK (role IN ('ADMIN', 'COMPANY', 'TOURIST', 'GUIDE'));

-- 5. Verificar constraint criada
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname = 'userrole_role_check';

-- 6. Teste final: Tentar inserir GUIDE (deve funcionar)
-- (Execute separadamente se quiser testar)
-- INSERT INTO userrole (id, "userId", role) 
-- VALUES ('test_guide', 'test_user', 'GUIDE') 
-- ON CONFLICT DO NOTHING;
-- DELETE FROM userrole WHERE id = 'test_guide';

-- ============================================
-- RESULTADO ESPERADO:
-- ============================================
-- 1. Enum deve ter 4 valores: ADMIN, COMPANY, TOURIST, GUIDE
-- 2. Constraint deve permitir os 4 valores
-- 3. Após executar, fazer redeploy no Vercel SEM cache
