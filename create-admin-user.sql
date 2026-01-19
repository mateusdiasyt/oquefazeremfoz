-- Script para criar usuário admin no banco PostgreSQL (Neon)
-- Execute este script no SQL Editor do Neon.tech
-- 
-- Credenciais:
-- Email: admin@oqfoz.com.br
-- Senha: admin123

-- Hash bcrypt para a senha "admin123" (10 rounds)
-- Este hash foi gerado usando: bcrypt.hash('admin123', 10)

-- Criar usuário admin (se não existir)
INSERT INTO "user" (id, email, password, name, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'admin@oqfoz.com.br',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- senha: admin123 (hash bcrypt)
  'Administrador',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE
SET "updatedAt" = NOW()
RETURNING id;

-- Adicionar role ADMIN (se não existir)
INSERT INTO userrole (id, "userId", role)
SELECT 
  gen_random_uuid()::text,
  u.id,
  'ADMIN'::userrole_role
FROM "user" u
WHERE u.email = 'admin@oqfoz.com.br'
  AND NOT EXISTS (
    SELECT 1 FROM userrole ur 
    WHERE ur."userId" = u.id AND ur.role = 'ADMIN'
  );

-- Verificar se foi criado corretamente
SELECT 
  u.id,
  u.email,
  u.name,
  array_agg(ur.role) as roles
FROM "user" u
LEFT JOIN userrole ur ON ur."userId" = u.id
WHERE u.email = 'admin@oqfoz.com.br'
GROUP BY u.id, u.email, u.name;
