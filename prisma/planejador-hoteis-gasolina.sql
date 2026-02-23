-- Hotéis (para rota e combustível no carro próprio) + campos de gasolina na config.
-- Execute no SQL Editor do Neon (ou outro Postgres) após rodar prisma generate.

-- Tabela de hotéis
CREATE TABLE IF NOT EXISTS "hotel" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "nome" TEXT NOT NULL,
  "endereco" TEXT NOT NULL,
  "ativo" BOOLEAN NOT NULL DEFAULT true,
  "ordem" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE INDEX IF NOT EXISTS "Hotel_ativo_idx" ON "hotel"("ativo");

-- Novos campos na config do planejador (gasolina para custo carro próprio)
ALTER TABLE "planejadorconfig" ADD COLUMN IF NOT EXISTS "precoGasolinaCents" INTEGER NOT NULL DEFAULT 590;
ALTER TABLE "planejadorconfig" ADD COLUMN IF NOT EXISTS "consumoKmPorLitro" DOUBLE PRECISION NOT NULL DEFAULT 10;
