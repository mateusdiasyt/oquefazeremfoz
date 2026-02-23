-- ============================================================
-- Planejador Inteligente de Viagem — Foz do Iguaçu
-- Execute no SQL Editor do Neon (ou qualquer PostgreSQL)
-- ============================================================

-- 1) Tabela de atrativos
CREATE TABLE IF NOT EXISTS "atrativo" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "nome" TEXT NOT NULL,
  "imageUrl" TEXT,
  "precoAdultoCents" INTEGER NOT NULL DEFAULT 0,
  "precoCriancaCents" INTEGER NOT NULL DEFAULT 0,
  "duracaoMediaHoras" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "tempoDeslocamentoMedioHoras" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "distanciaAeroportoKm" DOUBLE PRECISION,
  "endereco" TEXT,
  "regiao" TEXT NOT NULL,
  "nivelCansaco" TEXT NOT NULL DEFAULT 'medio',
  "custoTransporteMedioCents" INTEGER NOT NULL DEFAULT 0,
  "exigeDocumento" BOOLEAN NOT NULL DEFAULT false,
  "ativo" BOOLEAN NOT NULL DEFAULT true,
  "ordem" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Se a tabela já existir sem as colunas novas, adicione com:
-- ALTER TABLE "atrativo" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;
-- ALTER TABLE "atrativo" ADD COLUMN IF NOT EXISTS "distanciaAeroportoKm" DOUBLE PRECISION;
-- ALTER TABLE "atrativo" ADD COLUMN IF NOT EXISTS "endereco" TEXT;

CREATE INDEX IF NOT EXISTS "Atrativo_ativo_idx" ON "atrativo"("ativo");
CREATE INDEX IF NOT EXISTS "Atrativo_regiao_idx" ON "atrativo"("regiao");

-- 2) Tabela de configuração do planejador (uma linha só)
CREATE TABLE IF NOT EXISTS "planejadorconfig" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "alimentacaoEconomicaCents" INTEGER NOT NULL DEFAULT 5000,
  "alimentacaoPadraoCents" INTEGER NOT NULL DEFAULT 12000,
  "alimentacaoConfortoCents" INTEGER NOT NULL DEFAULT 20000,
  "multiplicadorUber" DOUBLE PRECISION NOT NULL DEFAULT 1,
  "multiplicadorTransfer" DOUBLE PRECISION NOT NULL DEFAULT 1.5,
  "multiplicadorCarroProprio" DOUBLE PRECISION NOT NULL DEFAULT 0.3,
  "horasMaximasPorDia" INTEGER NOT NULL DEFAULT 8,
  "moeda" TEXT NOT NULL DEFAULT 'BRL',
  "updatedAt" TIMESTAMP(3) NOT NULL
);

-- 3) Config padrão (upsert: insere se não existir)
INSERT INTO "planejadorconfig" (
  "id", "alimentacaoEconomicaCents", "alimentacaoPadraoCents", "alimentacaoConfortoCents",
  "multiplicadorUber", "multiplicadorTransfer", "multiplicadorCarroProprio",
  "horasMaximasPorDia", "moeda", "updatedAt"
) VALUES (
  'default', 5000, 12000, 20000,
  1, 1.5, 0.3,
  8, 'BRL', CURRENT_TIMESTAMP
)
ON CONFLICT ("id") DO UPDATE SET
  "alimentacaoEconomicaCents" = EXCLUDED."alimentacaoEconomicaCents",
  "alimentacaoPadraoCents" = EXCLUDED."alimentacaoPadraoCents",
  "alimentacaoConfortoCents" = EXCLUDED."alimentacaoConfortoCents",
  "multiplicadorUber" = EXCLUDED."multiplicadorUber",
  "multiplicadorTransfer" = EXCLUDED."multiplicadorTransfer",
  "multiplicadorCarroProprio" = EXCLUDED."multiplicadorCarroProprio",
  "horasMaximasPorDia" = EXCLUDED."horasMaximasPorDia",
  "moeda" = EXCLUDED."moeda",
  "updatedAt" = EXCLUDED."updatedAt";

-- 4) Atrativos iniciais (inserir só se a tabela estiver vazia; senão use os IDs que quiser)
INSERT INTO "atrativo" (
  "id", "nome", "imageUrl", "precoAdultoCents", "precoCriancaCents",
  "duracaoMediaHoras", "tempoDeslocamentoMedioHoras", "distanciaAeroportoKm", "regiao", "nivelCansaco",
  "custoTransporteMedioCents", "exigeDocumento", "ativo", "ordem", "createdAt", "updatedAt"
) VALUES
  ('atr_cataratas_br', 'Cataratas Brasil', NULL, 8500, 4500, 4, 0.5, 18, 'Cataratas Brasil', 'medio', 8000, false, true, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('atr_cataratas_arg', 'Cataratas Argentina', NULL, 12000, 6000, 5, 1.5, 22, 'Argentina', 'intenso', 15000, true, true, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('atr_parque_aves', 'Parque das Aves', NULL, 8500, 4500, 2.5, 0.5, 16, 'Cataratas Brasil', 'leve', 6000, false, true, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('atr_itaipu_panoramica', 'Itaipu Panorâmica', NULL, 5500, 2800, 2.5, 0.5, 28, 'Itaipu', 'leve', 7000, false, true, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('atr_itaipu_especial', 'Itaipu Especial', NULL, 18000, 9000, 4, 0.5, 28, 'Itaipu', 'medio', 7000, false, true, 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('atr_marco_3fronteiras', 'Marco das 3 Fronteiras', NULL, 4500, 2300, 2, 0.3, 14, 'Centro', 'leve', 4000, false, true, 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('atr_museu_cera', 'Museu de Cera', NULL, 6000, 3500, 1.5, 0.2, 15, 'Centro', 'leve', 3000, false, true, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('atr_vale_dinossauros', 'Vale dos Dinossauros', NULL, 5500, 4500, 2, 0.3, 14, 'Centro', 'leve', 4000, false, true, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('atr_bar_gelo', 'Bar de Gelo', NULL, 12000, 0, 1, 0.2, 14, 'Centro', 'leve', 3000, false, true, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('atr_compras_paraguai', 'Compras no Paraguai', NULL, 0, 0, 6, 1.5, 25, 'Paraguai', 'medio', 25000, true, true, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('atr_city_tour', 'City Tour', NULL, 8000, 4000, 4, 0, 14, 'Centro', 'leve', 0, false, true, 11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('atr_passeio_barco', 'Passeio de Barco', NULL, 15000, 7500, 2, 0.5, 18, 'Cataratas Brasil', 'leve', 8000, false, true, 12, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
