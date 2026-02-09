-- Conteúdos gerados pela IA (pendentes até admin concluir)
-- Execute no Neon se não usar Prisma migrate.

CREATE TABLE IF NOT EXISTS "pendingrelease" (
  "id"                   TEXT NOT NULL PRIMARY KEY,
  "businessId"           TEXT NOT NULL,
  "title"                TEXT NOT NULL,
  "lead"                 TEXT,
  "body"                 TEXT NOT NULL,
  "featuredImageUrl"     TEXT,
  "status"               TEXT NOT NULL DEFAULT 'PENDING',
  "publishedReleaseId"   TEXT,
  "createdAt"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"            TIMESTAMP(3) NOT NULL
);

CREATE INDEX IF NOT EXISTS "PendingRelease_businessId_idx" ON "pendingrelease"("businessId");
CREATE INDEX IF NOT EXISTS "PendingRelease_status_idx" ON "pendingrelease"("status");

ALTER TABLE "pendingrelease"
  ADD CONSTRAINT "PendingRelease_businessId_fkey"
  FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
