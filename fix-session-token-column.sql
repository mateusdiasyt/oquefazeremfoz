-- Script para corrigir o tamanho da coluna token na tabela session
-- Execute este SQL no SQL Editor do Neon.tech
-- 
-- O problema: A coluna token está como VARCHAR(191), mas tokens JWT podem ter mais de 191 caracteres
-- Solução: Alterar para TEXT para aceitar tokens de qualquer tamanho

-- 1. Verificar o tipo atual da coluna
SELECT 
    column_name,
    data_type,
    character_maximum_length
FROM information_schema.columns
WHERE table_name = 'session' AND column_name = 'token';

-- 2. Alterar a coluna token para TEXT
ALTER TABLE session 
ALTER COLUMN token TYPE TEXT;

-- 3. Verificar se foi alterado corretamente
SELECT 
    column_name,
    data_type,
    character_maximum_length
FROM information_schema.columns
WHERE table_name = 'session' AND column_name = 'token';

-- 4. Verificar se há algum índice que precisa ser ajustado
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'session' AND indexname LIKE '%token%';
