-- ============================================
-- SINCRONIZAÇÃO COMPLETA DO BANCO DE DADOS
-- ============================================
-- Execute este script no SQL Editor do Neon.tech
-- Este script corrige todos os problemas de sincronização

-- ============================================
-- 1. ADICIONAR GUIDE AO ENUM
-- ============================================
ALTER TYPE "userrole_role" ADD VALUE IF NOT EXISTS 'GUIDE';

-- Atualizar constraint do userrole
ALTER TABLE userrole DROP CONSTRAINT IF EXISTS userrole_role_check;
ALTER TABLE userrole 
ADD CONSTRAINT userrole_role_check 
CHECK (role IN ('ADMIN', 'COMPANY', 'TOURIST', 'GUIDE'));

-- ============================================
-- 2. ADICIONAR COLUNA updatedAt NA SESSION
-- ============================================
ALTER TABLE "session" 
ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- ============================================
-- 3. CRIAR TABELA GUIDE (se não existir)
-- ============================================
CREATE TABLE IF NOT EXISTS "guide" (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  "userId" VARCHAR(191) NOT NULL,
  name VARCHAR(191) NOT NULL,
  description TEXT NULL,
  specialties TEXT NULL,
  languages TEXT NULL,
  phone VARCHAR(191) NULL,
  whatsapp VARCHAR(191) NULL,
  email VARCHAR(191) NULL,
  instagram VARCHAR(191) NULL,
  facebook VARCHAR(191) NULL,
  website VARCHAR(191) NULL,
  "presentationVideo" VARCHAR(191) NULL,
  "isApproved" BOOLEAN NOT NULL DEFAULT FALSE,
  "approvedAt" TIMESTAMP(3) NULL,
  "rejectedAt" TIMESTAMP(3) NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "coverImage" VARCHAR(191) NULL,
  "profileImage" VARCHAR(191) NULL,
  "likesCount" INTEGER NOT NULL DEFAULT 0,
  slug VARCHAR(191) NOT NULL UNIQUE DEFAULT '',
  "isVerified" BOOLEAN NOT NULL DEFAULT FALSE,
  "followersCount" INTEGER NOT NULL DEFAULT 0,
  "ratingAvg" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "ratingCount" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "Guide_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" (id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Índices da tabela guide
CREATE INDEX IF NOT EXISTS "Guide_userId_idx" ON "guide" ("userId");
CREATE INDEX IF NOT EXISTS "Guide_isApproved_idx" ON "guide" ("isApproved");
CREATE INDEX IF NOT EXISTS "Guide_slug_idx" ON "guide" (slug);
CREATE UNIQUE INDEX IF NOT EXISTS "Guide_slug_key" ON "guide" (slug);

-- ============================================
-- 4. VERIFICAÇÕES
-- ============================================

-- Verificar enum
SELECT unnest(enum_range(NULL::userrole_role)) AS role_value;

-- Verificar se tabela guide existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'guide';

-- Verificar colunas da session
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'session' AND column_name = 'updatedAt';

-- ============================================
-- RESULTADO ESPERADO:
-- ============================================
-- 1. Enum tem 4 valores: ADMIN, COMPANY, TOURIST, GUIDE
-- 2. Tabela guide existe
-- 3. Tabela session tem coluna updatedAt
-- 4. Após executar, fazer redeploy no Vercel SEM cache
