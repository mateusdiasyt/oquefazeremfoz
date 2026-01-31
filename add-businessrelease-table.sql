-- Execute este SQL no Neon para criar a tabela businessrelease
-- Ou use: npx prisma db push

CREATE TABLE IF NOT EXISTS "businessrelease" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "lead" TEXT,
    "body" TEXT NOT NULL,
    "featuredImageUrl" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "businessrelease_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "BusinessRelease_businessId_slug_key" ON "businessrelease"("businessId", "slug");
CREATE INDEX IF NOT EXISTS "BusinessRelease_businessId_idx" ON "businessrelease"("businessId");
CREATE INDEX IF NOT EXISTS "BusinessRelease_publishedAt_idx" ON "businessrelease"("publishedAt");

ALTER TABLE "businessrelease" ADD CONSTRAINT "BusinessRelease_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
