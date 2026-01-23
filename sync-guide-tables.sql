-- ============================================
-- SCRIPT PARA CRIAR TABELAS DE GUIAS
-- ============================================
-- Execute este script no SQL Editor do Neon.tech
-- Este script cria as tabelas necessárias para:
-- - Avaliações de guias (guidereview)
-- - Galeria de guias (guidegallery)
-- - Posts de guias (guidepost)
-- - Atualiza tabela follow para suportar guias
-- - Atualiza tabela post para suportar guias

-- ============================================
-- 1. CRIAR TABELA guidereview
-- ============================================
CREATE TABLE IF NOT EXISTS "guidereview" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "guideId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "rating" INTEGER NOT NULL,
  "comment" TEXT,
  "imageUrl" TEXT,
  "isVerified" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "GuideReview_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "guide"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "GuideReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Índices para guidereview
CREATE INDEX IF NOT EXISTS "GuideReview_userId_idx" ON "guidereview"("userId");
CREATE INDEX IF NOT EXISTS "GuideReview_guideId_idx" ON "guidereview"("guideId");

-- Constraint única: um usuário só pode avaliar um guia uma vez
CREATE UNIQUE INDEX IF NOT EXISTS "GuideReview_guideId_userId_key" ON "guidereview"("guideId", "userId");

-- ============================================
-- 2. CRIAR TABELA guidegallery
-- ============================================
CREATE TABLE IF NOT EXISTS "guidegallery" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "guideId" TEXT NOT NULL,
  "imageUrl" TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "GuideGallery_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "guide"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Índice para guidegallery
CREATE INDEX IF NOT EXISTS "GuideGallery_guideId_idx" ON "guidegallery"("guideId");

-- ============================================
-- 3. CRIAR TABELA guidepost
-- ============================================
CREATE TABLE IF NOT EXISTS "guidepost" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "guideId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "body" TEXT,
  "imageUrl" TEXT,
  "videoUrl" TEXT,
  "likes" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "GuidePost_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "guide"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Índice para guidepost
CREATE INDEX IF NOT EXISTS "GuidePost_guideId_idx" ON "guidepost"("guideId");

-- ============================================
-- 4. ATUALIZAR TABELA follow PARA SUPORTAR GUIAS
-- ============================================
-- Adicionar colunas para seguir guias (se não existirem)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'follow' AND column_name = 'followerGuideId') THEN
    ALTER TABLE "follow" ADD COLUMN "followerGuideId" TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'follow' AND column_name = 'followingGuideId') THEN
    ALTER TABLE "follow" ADD COLUMN "followingGuideId" TEXT;
  END IF;
END $$;

-- Adicionar foreign keys (se não existirem)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'Follow_followerGuideId_fkey'
  ) THEN
    ALTER TABLE "follow" 
    ADD CONSTRAINT "Follow_followerGuideId_fkey" 
    FOREIGN KEY ("followerGuideId") REFERENCES "guide"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'Follow_followingGuideId_fkey'
  ) THEN
    ALTER TABLE "follow" 
    ADD CONSTRAINT "Follow_followingGuideId_fkey" 
    FOREIGN KEY ("followingGuideId") REFERENCES "guide"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- Adicionar índices (se não existirem)
CREATE INDEX IF NOT EXISTS "Follow_followingGuideId_idx" ON "follow"("followingGuideId");

-- Adicionar constraint única (se não existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'Follow_followerGuideId_followingGuideId_key'
  ) THEN
    ALTER TABLE "follow" 
    ADD CONSTRAINT "Follow_followerGuideId_followingGuideId_key" 
    UNIQUE ("followerGuideId", "followingGuideId");
  END IF;
END $$;

-- ============================================
-- 5. ATUALIZAR TABELA post PARA SUPORTAR GUIAS
-- ============================================
-- Tornar businessId opcional e adicionar guideId
DO $$ 
BEGIN
  -- Tornar businessId nullable (se ainda não for)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'post' AND column_name = 'businessId' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE "post" ALTER COLUMN "businessId" DROP NOT NULL;
  END IF;
  
  -- Adicionar guideId (se não existir)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'post' AND column_name = 'guideId') THEN
    ALTER TABLE "post" ADD COLUMN "guideId" TEXT;
  END IF;
END $$;

-- Adicionar foreign key para guideId (se não existir)
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

-- Adicionar índice para guideId (se não existir)
CREATE INDEX IF NOT EXISTS "Post_guideId_idx" ON "post"("guideId");

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================
-- Verificar se todas as tabelas foram criadas
SELECT 
  'guidereview' as tabela,
  COUNT(*) as registros
FROM "guidereview"
UNION ALL
SELECT 
  'guidegallery' as tabela,
  COUNT(*) as registros
FROM "guidegallery"
UNION ALL
SELECT 
  'guidepost' as tabela,
  COUNT(*) as registros
FROM "guidepost";

-- Verificar estrutura da tabela follow
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'follow'
ORDER BY ordinal_position;

-- Verificar estrutura da tabela post
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'post'
ORDER BY ordinal_position;
