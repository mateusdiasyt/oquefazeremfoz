-- Adiciona coluna de visualizações nos releases (estilo YouTube)
ALTER TABLE "businessrelease" ADD COLUMN IF NOT EXISTS "views" INTEGER NOT NULL DEFAULT 0;
