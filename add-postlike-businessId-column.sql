-- Script para adicionar a coluna businessId na tabela postlike
-- Execute este script no banco de dados Neon Tech

-- Verificar se a coluna já existe antes de adicionar
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'postlike' 
        AND column_name = 'businessId'
    ) THEN
        -- Adicionar a coluna businessId como nullable
        ALTER TABLE "postlike" 
        ADD COLUMN "businessId" TEXT;
        
        -- Adicionar índice na coluna businessId
        CREATE INDEX IF NOT EXISTS "PostLike_businessId_idx" 
        ON "postlike"("businessId");
        
        -- Adicionar constraint de foreign key para business
        ALTER TABLE "postlike" 
        ADD CONSTRAINT "PostLike_businessId_fkey" 
        FOREIGN KEY ("businessId") 
        REFERENCES "business"("id") 
        ON DELETE CASCADE;
        
        -- Adicionar constraint unique para postId e businessId (quando businessId não for null)
        -- Nota: Isso só funciona se não houver duplicatas. Se houver, você precisará limpar primeiro.
        CREATE UNIQUE INDEX IF NOT EXISTS "PostLike_postId_businessId_key" 
        ON "postlike"("postId", "businessId") 
        WHERE "businessId" IS NOT NULL;
        
        RAISE NOTICE 'Coluna businessId adicionada com sucesso à tabela postlike';
    ELSE
        RAISE NOTICE 'Coluna businessId já existe na tabela postlike';
    END IF;
END $$;
