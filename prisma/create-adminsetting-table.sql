-- Tabela de configurações do painel admin (API Gemini, prompt do bot)
-- Execute no Neon (ou outro PostgreSQL) se não usar Prisma migrate.

CREATE TABLE IF NOT EXISTS "adminsetting" (
  "id"    TEXT NOT NULL PRIMARY KEY,
  "key"   TEXT NOT NULL UNIQUE,
  "value" TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "AdminSetting_key_key" ON "adminsetting"("key");
