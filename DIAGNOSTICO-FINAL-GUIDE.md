# 🔍 Diagnóstico Final: Erro GUIDE

## ❌ Situação Atual
- ✅ SQL executado no Neon.tech
- ✅ Enum mostra GUIDE no banco
- ✅ Schema Prisma tem GUIDE
- ✅ Deploy foi feito
- ❌ Erro 500 continua

---

## 🔍 Possíveis Causas

### 1. DATABASE_URL Aponta para Banco Diferente
O Vercel pode estar usando um banco diferente do que você atualizou.

**Solução:**
1. Verifique o `DATABASE_URL` no Vercel (Settings → Environment Variables)
2. Confirme que é o mesmo banco onde executou o SQL
3. Se for diferente, execute o SQL no banco correto

### 2. Prisma Client em Cache
O Prisma Client pode estar usando cache antigo.

**Solução:**
1. No Vercel, faça redeploy **SEM usar cache**
2. Ou adicione variável `FORCE_REBUILD=1` e faça novo deploy

### 3. Constraint do Banco Não Foi Atualizada
O enum foi adicionado, mas a constraint pode não ter sido atualizada.

**Solução:**
Execute este SQL no Neon.tech:

```sql
-- Verificar constraint atual
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conname LIKE '%userrole%role%';

-- Se necessário, recriar constraint
ALTER TABLE userrole DROP CONSTRAINT IF EXISTS userrole_role_check;
ALTER TABLE userrole ADD CONSTRAINT userrole_role_check 
  CHECK (role IN ('ADMIN', 'COMPANY', 'TOURIST', 'GUIDE'));
```

---

## ✅ SOLUÇÃO RECOMENDADA (Passo a Passo)

### Passo 1: Verificar Banco no Vercel
1. Vercel → Settings → Environment Variables
2. Copie o valor de `DATABASE_URL`
3. Compare com o banco do Neon.tech onde executou o SQL

### Passo 2: Executar SQL Novamente (Garantir)
No SQL Editor do Neon.tech, execute:

```sql
-- Adicionar GUIDE (se ainda não tiver)
ALTER TYPE "userrole_role" ADD VALUE IF NOT EXISTS 'GUIDE';

-- Verificar
SELECT unnest(enum_range(NULL::userrole_role)) AS role_value;

-- Recriar constraint (garantir)
ALTER TABLE userrole DROP CONSTRAINT IF EXISTS userrole_role_check;
ALTER TABLE userrole ADD CONSTRAINT userrole_role_check 
  CHECK (role IN ('ADMIN', 'COMPANY', 'TOURIST', 'GUIDE'));
```

### Passo 3: Limpar Cache e Redeploy
1. Vercel → Deployments
2. Clique nos 3 pontinhos (⋯) do último deploy
3. Selecione **"Redeploy"**
4. **DESMARQUE** "Use existing Build Cache"
5. Clique em **"Redeploy"**

### Passo 4: Verificar Build Logs
1. Durante o build, veja os logs
2. Procure por: `Running "prisma generate"`
3. Verifique se não há erros

---

## 🎯 Teste Final

Após o redeploy:
1. Aguarde build completar (2-3 min)
2. Teste cadastrar guia
3. Se ainda der erro, verifique os logs do Vercel (Functions → Logs)

---

## 📞 Se Ainda Não Funcionar

Envie:
1. Screenshot do DATABASE_URL no Vercel (ocultando senha)
2. Resultado da query: `SELECT unnest(enum_range(NULL::userrole_role))`
3. Logs do build do Vercel (especialmente a parte do `prisma generate`)
