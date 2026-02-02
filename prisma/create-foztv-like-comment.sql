-- Rode este SQL UMA VEZ no banco (após a tabela foztvvideo existir).
-- Cria tabelas de curtida e comentários do FozTV.

CREATE TABLE IF NOT EXISTS "foztvvideolike" (
  "id"       TEXT NOT NULL PRIMARY KEY,
  "videoId"  TEXT NOT NULL REFERENCES "foztvvideo"("id") ON DELETE CASCADE,
  "userId"   TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "FozTVVideoLike_videoId_userId_key" ON "foztvvideolike"("videoId", "userId");
CREATE INDEX IF NOT EXISTS "FozTVVideoLike_videoId_idx" ON "foztvvideolike"("videoId");
CREATE INDEX IF NOT EXISTS "FozTVVideoLike_userId_idx" ON "foztvvideolike"("userId");

CREATE TABLE IF NOT EXISTS "foztvvideocomment" (
  "id"        TEXT NOT NULL PRIMARY KEY,
  "videoId"   TEXT NOT NULL REFERENCES "foztvvideo"("id") ON DELETE CASCADE,
  "userId"    TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "body"      TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "FozTVVideoComment_videoId_idx" ON "foztvvideocomment"("videoId");
CREATE INDEX IF NOT EXISTS "FozTVVideoComment_userId_idx" ON "foztvvideocomment"("userId");
