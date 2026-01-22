-- Adicionar role 'GUIDE' ao enum userrole_role
-- Execute este script no banco de dados PostgreSQL (Neon.tech)

-- Primeiro, criar um novo tipo com o valor adicional
ALTER TYPE "userrole_role" ADD VALUE IF NOT EXISTS 'GUIDE';

-- Nota: Se você já tiver dados na tabela userrole, não precisa fazer nada mais.
-- O enum já foi atualizado com o novo valor.
