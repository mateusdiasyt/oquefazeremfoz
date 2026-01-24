-- ============================================
-- ADICIONAR guideId À TABELA post
-- ============================================
-- Execute no SQL Editor do Neon (https://console.neon.tech).
-- Corrige: "The column post.guideId does not exist in the current database"
-- que quebra /api/posts e /api/public/empresa.

-- 1. Tornar businessId nullable (se ainda não for)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'post' 
      AND column_name = 'businessId' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE "post" ALTER COLUMN "businessId" DROP NOT NULL;
  END IF;
END $$;

-- 2. Adicionar coluna guideId (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'post' AND column_name = 'guideId'
  ) THEN
    ALTER TABLE "post" ADD COLUMN "guideId" TEXT;
  END IF;
END $$;

-- 3. Foreign key para guide (se não existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'Post_guideId_fkey'
  ) THEN
    ALTER TABLE "post" 
    ADD CONSTRAINT "Post_guideId_fkey" 
    FOREIGN KEY ("guideId") REFERENCES "guide"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- 4. Índice (se não existir)
CREATE INDEX IF NOT EXISTS "Post_guideId_idx" ON "post"("guideId");

-- Verificar
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'post'
ORDER BY ordinal_position;
