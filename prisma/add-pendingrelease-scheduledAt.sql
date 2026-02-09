-- Adiciona agendamento de publicação ao pendingrelease
-- Execute no Neon se a tabela já existir sem essa coluna.

ALTER TABLE "pendingrelease"
  ADD COLUMN IF NOT EXISTS "scheduledAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "PendingRelease_scheduledAt_idx" ON "pendingrelease"("scheduledAt");
