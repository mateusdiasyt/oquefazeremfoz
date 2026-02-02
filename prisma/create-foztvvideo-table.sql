-- Rode este SQL UMA VEZ no banco de produção (Neon / Vercel Postgres)
-- Ex.: no Neon Dashboard > SQL Editor, ou: psql $DATABASE_URL -f prisma/create-foztvvideo-table.sql
-- Cria apenas a tabela foztvvideo, sem alterar outras tabelas.

CREATE TABLE IF NOT EXISTS "foztvvideo" (
  "id"           TEXT NOT NULL PRIMARY KEY,
  "title"        TEXT NOT NULL,
  "slug"         TEXT NOT NULL UNIQUE,
  "description"  TEXT,
  "videoUrl"      TEXT NOT NULL,
  "thumbnailUrl"  TEXT,
  "isPublished"   BOOLEAN NOT NULL DEFAULT false,
  "order"         INTEGER NOT NULL DEFAULT 0,
  "publishedAt"   TIMESTAMP(3),
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3) NOT NULL
);

CREATE INDEX IF NOT EXISTS "FozTVVideo_isPublished_idx" ON "foztvvideo"("isPublished");
CREATE INDEX IF NOT EXISTS "FozTVVideo_order_idx" ON "foztvvideo"("order");
