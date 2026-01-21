-- Remover constraint UNIQUE do campo userId na tabela business
-- Execute este SQL no seu banco de dados Neon PostgreSQL

-- Primeiro, vamos verificar qual é o nome exato da constraint
-- Execute este primeiro para ver o nome:
SELECT 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
WHERE tc.table_name = 'business' 
  AND tc.constraint_type = 'UNIQUE'
  AND kcu.column_name = 'userId';

-- Depois, remova a constraint (o nome pode variar, tente um destes):
-- Se o nome for "business_userId_key":
ALTER TABLE "business" DROP CONSTRAINT IF EXISTS "business_userId_key";

-- Ou se for outro nome comum no PostgreSQL:
ALTER TABLE "business" DROP CONSTRAINT IF EXISTS "Business_userId_key";

-- IMPORTANTE: NÃO remova "Business_userId_fkey" - essa é a FOREIGN KEY e é necessária!

-- Após remover, você pode verificar se foi removida:
SELECT 
    tc.constraint_name, 
    tc.constraint_type
FROM information_schema.table_constraints AS tc 
WHERE tc.table_name = 'business' 
  AND tc.constraint_type = 'UNIQUE';
