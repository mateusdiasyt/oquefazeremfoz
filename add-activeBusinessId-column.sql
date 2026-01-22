-- Adicionar coluna activeBusinessId na tabela user
-- Execute este SQL no seu banco de dados Neon

ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "activeBusinessId" TEXT;

-- Verificar se a coluna foi criada
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user' AND column_name = 'activeBusinessId';
