-- ============================================
-- ADICIONAR ROLE 'GUIDE' AO ENUM userrole_role
-- ============================================
-- Execute este script no SQL Editor do Neon.tech
-- 
-- INSTRUÇÕES:
-- 1. Acesse https://console.neon.tech
-- 2. Selecione seu projeto
-- 3. Vá em "SQL Editor"
-- 4. Clique em "New query"
-- 5. Cole este comando e clique em "Run"
-- ============================================

ALTER TYPE "userrole_role" ADD VALUE IF NOT EXISTS 'GUIDE';

-- Verificar se foi adicionado (execute separadamente):
-- SELECT unnest(enum_range(NULL::userrole_role)) AS role_value;
