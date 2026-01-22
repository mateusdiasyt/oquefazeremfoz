-- Adicionar campo businessId na tabela comment
ALTER TABLE comment ADD COLUMN IF NOT EXISTS "businessId" VARCHAR(191);

-- Criar índice para businessId
CREATE INDEX IF NOT EXISTS "Comment_businessId_idx" ON comment("businessId");

-- Adicionar constraint de foreign key
ALTER TABLE comment 
ADD CONSTRAINT "Comment_businessId_fkey" 
FOREIGN KEY ("businessId") 
REFERENCES business(id) 
ON DELETE CASCADE 
ON UPDATE CASCADE;
