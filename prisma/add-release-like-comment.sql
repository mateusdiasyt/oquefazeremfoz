-- Só adiciona coluna e tabelas de like/comentário em release. Não altera outras tabelas.

-- 1) Coluna likes na tabela businessrelease
ALTER TABLE "businessrelease" ADD COLUMN IF NOT EXISTS "likes" INTEGER NOT NULL DEFAULT 0;

-- 2) Tabela releaselike
CREATE TABLE IF NOT EXISTS "releaselike" (
  "id" TEXT NOT NULL,
  "releaseId" TEXT NOT NULL,
  "userId" TEXT,
  "businessId" TEXT,
  CONSTRAINT "releaselike_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "releaselike" DROP CONSTRAINT IF EXISTS "ReleaseLike_releaseId_fkey";
ALTER TABLE "releaselike" ADD CONSTRAINT "ReleaseLike_releaseId_fkey"
  FOREIGN KEY ("releaseId") REFERENCES "businessrelease"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "releaselike" DROP CONSTRAINT IF EXISTS "ReleaseLike_userId_fkey";
ALTER TABLE "releaselike" ADD CONSTRAINT "ReleaseLike_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "user"("id") ON UPDATE CASCADE;

ALTER TABLE "releaselike" DROP CONSTRAINT IF EXISTS "ReleaseLike_businessId_fkey";
ALTER TABLE "releaselike" ADD CONSTRAINT "ReleaseLike_businessId_fkey"
  FOREIGN KEY ("businessId") REFERENCES "business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE UNIQUE INDEX IF NOT EXISTS "ReleaseLike_releaseId_userId_key" ON "releaselike"("releaseId", "userId");
CREATE UNIQUE INDEX IF NOT EXISTS "ReleaseLike_releaseId_businessId_key" ON "releaselike"("releaseId", "businessId");
CREATE INDEX IF NOT EXISTS "ReleaseLike_userId_idx" ON "releaselike"("userId");
CREATE INDEX IF NOT EXISTS "ReleaseLike_businessId_idx" ON "releaselike"("businessId");

-- 3) Tabela releasecomment
CREATE TABLE IF NOT EXISTS "releasecomment" (
  "id" TEXT NOT NULL,
  "releaseId" TEXT NOT NULL,
  "userId" TEXT,
  "businessId" TEXT,
  "parentId" TEXT,
  "body" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "releasecomment_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "releasecomment" DROP CONSTRAINT IF EXISTS "ReleaseComment_releaseId_fkey";
ALTER TABLE "releasecomment" ADD CONSTRAINT "ReleaseComment_releaseId_fkey"
  FOREIGN KEY ("releaseId") REFERENCES "businessrelease"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "releasecomment" DROP CONSTRAINT IF EXISTS "ReleaseComment_userId_fkey";
ALTER TABLE "releasecomment" ADD CONSTRAINT "ReleaseComment_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "user"("id") ON UPDATE CASCADE;

ALTER TABLE "releasecomment" DROP CONSTRAINT IF EXISTS "ReleaseComment_businessId_fkey";
ALTER TABLE "releasecomment" ADD CONSTRAINT "ReleaseComment_businessId_fkey"
  FOREIGN KEY ("businessId") REFERENCES "business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "releasecomment" DROP CONSTRAINT IF EXISTS "ReleaseComment_parentId_fkey";
ALTER TABLE "releasecomment" ADD CONSTRAINT "ReleaseComment_parentId_fkey"
  FOREIGN KEY ("parentId") REFERENCES "releasecomment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "ReleaseComment_releaseId_idx" ON "releasecomment"("releaseId");
CREATE INDEX IF NOT EXISTS "ReleaseComment_userId_idx" ON "releasecomment"("userId");
CREATE INDEX IF NOT EXISTS "ReleaseComment_parentId_idx" ON "releasecomment"("parentId");
CREATE INDEX IF NOT EXISTS "ReleaseComment_businessId_idx" ON "releasecomment"("businessId");
