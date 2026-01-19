-- Script para verificar e corrigir a senha do usuário admin
-- Execute este SQL no SQL Editor do Neon.tech

-- 1. Verificar usuário existente
SELECT 
  u.id,
  u.email,
  u.name,
  u.password,
  LEFT(u.password, 20) as password_hash_preview,
  LENGTH(u.password) as password_length,
  array_agg(ur.role) as roles
FROM "user" u
LEFT JOIN userrole ur ON ur."userId" = u.id
WHERE u.email = 'admin@oqfoz.com.br' OR u.email = 'admin@oqfoz.com'
GROUP BY u.id, u.email, u.name, u.password;

-- 2. Verificar hash correto da senha "admin123"
-- Hash bcrypt para "admin123": $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy

-- 3. Atualizar senha do usuário admin (se necessário)
UPDATE "user"
SET 
  password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  "updatedAt" = NOW()
WHERE email = 'admin@oqfoz.com.br' OR email = 'admin@oqfoz.com';

-- 4. Verificar se foi atualizado
SELECT 
  u.id,
  u.email,
  LEFT(u.password, 20) as password_hash_preview,
  array_agg(ur.role) as roles
FROM "user" u
LEFT JOIN userrole ur ON ur."userId" = u.id
WHERE u.email = 'admin@oqfoz.com.br' OR u.email = 'admin@oqfoz.com'
GROUP BY u.id, u.email, u.password;
