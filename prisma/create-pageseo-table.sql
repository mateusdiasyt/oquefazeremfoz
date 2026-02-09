-- Criar tabela pageseo para SEO das páginas (admin).
-- Execute este SQL no Neon (SQL Editor) se o PUT /api/admin/seo/pages retornar 500.

CREATE TABLE IF NOT EXISTS "pageseo" (
  "id" TEXT NOT NULL,
  "path" TEXT NOT NULL,
  "title" TEXT,
  "description" TEXT,
  "keywords" TEXT,
  "ogTitle" TEXT,
  "ogDescription" TEXT,
  "ogImage" TEXT,
  "robotsIndex" BOOLEAN DEFAULT true,
  "robotsFollow" BOOLEAN DEFAULT true,
  "canonical" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "pageseo_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PageSeo_path_key" ON "pageseo"("path");
CREATE INDEX IF NOT EXISTS "PageSeo_path_idx" ON "pageseo"("path");
