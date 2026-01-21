-- Script para adicionar campo 'link' à tabela banner
-- Execute este SQL no SQL Editor do Neon.tech

-- 1. Adicionar coluna 'link' (se não existir)
ALTER TABLE banner 
ADD COLUMN IF NOT EXISTS link TEXT;

-- 2. Tornar title e subtitle opcionais (nullable)
ALTER TABLE banner 
ALTER COLUMN title DROP NOT NULL,
ALTER COLUMN subtitle DROP NOT NULL;

-- 3. Definir valores padrão vazios para title e subtitle existentes
UPDATE banner 
SET title = COALESCE(title, ''),
    subtitle = COALESCE(subtitle, '')
WHERE title IS NULL OR subtitle IS NULL;

-- 4. Verificar se foi aplicado corretamente
SELECT 
    id,
    title,
    subtitle,
    link,
    imageUrl,
    isActive,
    "order"
FROM banner
LIMIT 5;
