-- Se você já criou a tabela "atrativo" antes e não tem as colunas de foto, distância e endereço,
-- execute este script no SQL Editor do Neon:

ALTER TABLE "atrativo" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;
ALTER TABLE "atrativo" ADD COLUMN IF NOT EXISTS "distanciaAeroportoKm" DOUBLE PRECISION;
ALTER TABLE "atrativo" ADD COLUMN IF NOT EXISTS "endereco" TEXT;
