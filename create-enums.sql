-- Script para criar os tipos ENUM no PostgreSQL (Neon.tech)
-- Execute este script no SQL Editor do Neon.tech
-- 
-- Este script cria os tipos ENUM necessários que estão faltando no banco

-- 1. Criar tipo ENUM userrole_role
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'userrole_role') THEN
        CREATE TYPE userrole_role AS ENUM ('ADMIN', 'COMPANY', 'TOURIST');
    END IF;
END $$;

-- 2. Criar tipo ENUM subscription_status
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status') THEN
        CREATE TYPE subscription_status AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELED');
    END IF;
END $$;

-- 3. Criar tipo ENUM order_status
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
        CREATE TYPE order_status AS ENUM ('PAID', 'REFUNDED', 'CANCELED');
    END IF;
END $$;

-- 4. Verificar se foram criados
SELECT 
    typname as enum_name,
    array_agg(enumlabel ORDER BY enumsortorder) as enum_values
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE typname IN ('userrole_role', 'subscription_status', 'order_status')
GROUP BY typname
ORDER BY typname;

-- 5. Atualizar tabela userrole para usar o tipo ENUM
-- Verificar se a coluna já usa o tipo
SELECT 
    column_name,
    data_type,
    udt_name
FROM information_schema.columns
WHERE table_name = 'userrole' AND column_name = 'role';

-- Atualizar coluna role para usar o tipo ENUM
-- IMPORTANTE: Isso converte valores VARCHAR para ENUM
DO $$
BEGIN
    -- Verificar se a coluna existe e se não é do tipo ENUM
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'userrole' 
        AND column_name = 'role' 
        AND udt_name != 'userrole_role'
    ) THEN
        -- Converter a coluna para ENUM
        ALTER TABLE userrole 
        ALTER COLUMN role TYPE userrole_role USING role::userrole_role;
        
        RAISE NOTICE 'Coluna userrole.role atualizada para tipo ENUM';
    ELSE
        RAISE NOTICE 'Coluna userrole.role já usa o tipo ENUM ou não existe';
    END IF;
END $$;
