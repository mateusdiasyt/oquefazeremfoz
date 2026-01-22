-- Migração: Adicionar colunas followerBusinessId e followingBusinessId na tabela follow
-- Execute este script no SQL Editor do Neon.tech

-- Adicionar coluna followerBusinessId
ALTER TABLE "follow" 
ADD COLUMN IF NOT EXISTS "followerBusinessId" VARCHAR(191) NULL;

-- Adicionar coluna followingBusinessId
ALTER TABLE "follow" 
ADD COLUMN IF NOT EXISTS "followingBusinessId" VARCHAR(191) NULL;

-- Adicionar foreign keys
ALTER TABLE "follow"
ADD CONSTRAINT "Follow_followerBusinessId_fkey" 
FOREIGN KEY ("followerBusinessId") 
REFERENCES "business" (id) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

ALTER TABLE "follow"
ADD CONSTRAINT "Follow_followingBusinessId_fkey" 
FOREIGN KEY ("followingBusinessId") 
REFERENCES "business" (id) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- Adicionar constraint única para businessIds
ALTER TABLE "follow"
ADD CONSTRAINT "Follow_followerBusinessId_followingBusinessId_key" 
UNIQUE ("followerBusinessId", "followingBusinessId");

-- Adicionar índice para followingBusinessId
CREATE INDEX IF NOT EXISTS "Follow_followingBusinessId_idx" 
ON "follow" ("followingBusinessId");

-- Verificar se as colunas foram criadas
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'follow' 
AND column_name IN ('followerBusinessId', 'followingBusinessId');
