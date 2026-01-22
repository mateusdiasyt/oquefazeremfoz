-- Criar tabela de notificações
CREATE TABLE IF NOT EXISTS "notification" (
  "id" VARCHAR(191) NOT NULL,
  "userId" VARCHAR(191) NOT NULL,
  "businessId" VARCHAR(191),
  "type" VARCHAR(191) NOT NULL,
  "title" VARCHAR(191) NOT NULL,
  "message" VARCHAR(191) NOT NULL,
  "link" VARCHAR(191),
  "isRead" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- Adicionar chaves estrangeiras
ALTER TABLE "notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notification" ADD CONSTRAINT "Notification_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Criar índices
CREATE INDEX IF NOT EXISTS "Notification_userId_idx" ON "notification"("userId");
CREATE INDEX IF NOT EXISTS "Notification_businessId_idx" ON "notification"("businessId");
CREATE INDEX IF NOT EXISTS "Notification_isRead_idx" ON "notification"("isRead");
CREATE INDEX IF NOT EXISTS "Notification_createdAt_idx" ON "notification"("createdAt");
