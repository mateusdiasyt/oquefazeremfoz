-- Script completo para corrigir usuários admin no PostgreSQL (Neon.tech)
-- Execute este SQL no SQL Editor do Neon.tech
-- 
-- Este script:
-- 1. Corrige a senha de ambos os usuários admin
-- 2. Adiciona role ADMIN para ambos
-- 3. Verifica se foi corrigido

-- Hash bcrypt correto para a senha "admin123" (10 rounds)
-- IMPORTANTE: Este hash deve ter exatamente 60 caracteres
-- Hash gerado com bcrypt.hash('admin123', 10)
-- Formato: $2a$10$[22 caracteres do salt][31 caracteres do hash] = 60 caracteres total

-- 1. Atualizar senha do usuário admin@oqfoz.com.br
UPDATE "user"
SET 
  password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  "updatedAt" = NOW()
WHERE email = 'admin@oqfoz.com.br';

-- 2. Atualizar senha do usuário admin@oqfoz.com
UPDATE "user"
SET 
  password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  "updatedAt" = NOW()
WHERE email = 'admin@oqfoz.com';

-- 3. Adicionar role ADMIN para admin@oqfoz.com.br (se não existir)
INSERT INTO userrole (id, "userId", role)
SELECT 
  gen_random_uuid()::text,
  u.id,
  'ADMIN'::userrole_role
FROM "user" u
WHERE u.email = 'admin@oqfoz.com.br'
  AND NOT EXISTS (
    SELECT 1 FROM userrole ur 
    WHERE ur."userId" = u.id AND ur.role = 'ADMIN'::userrole_role
  );

-- 4. Adicionar role ADMIN para admin@oqfoz.com (se não existir)
INSERT INTO userrole (id, "userId", role)
SELECT 
  gen_random_uuid()::text,
  u.id,
  'ADMIN'::userrole_role
FROM "user" u
WHERE u.email = 'admin@oqfoz.com'
  AND NOT EXISTS (
    SELECT 1 FROM userrole ur 
    WHERE ur."userId" = u.id AND ur.role = 'ADMIN'::userrole_role
  );

-- 5. Verificar se foi corrigido corretamente
SELECT 
  u.id,
  u.email,
  u.name,
  LEFT(u.password, 20) as password_hash_preview,
  array_agg(ur.role::text) as roles,
  u."createdAt",
  u."updatedAt"
FROM "user" u
LEFT JOIN userrole ur ON ur."userId" = u.id
WHERE u.email = 'admin@oqfoz.com.br' OR u.email = 'admin@oqfoz.com'
GROUP BY u.id, u.email, u.name, u.password, u."createdAt", u."updatedAt"
ORDER BY u.email;
