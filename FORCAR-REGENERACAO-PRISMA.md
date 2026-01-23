# 🔧 Forçar Regeneração do Prisma Client

## ❌ Problema Persistente
Mesmo após deploy, o erro continua. Isso pode indicar:
1. Cache do Prisma Client
2. DATABASE_URL diferente no Vercel
3. Prisma Client não foi regenerado corretamente

---

## ✅ SOLUÇÃO: Forçar Regeneração Completa

### Passo 1: Verificar DATABASE_URL no Vercel

1. Acesse: https://vercel.com
2. Selecione o projeto `oquefazeremfoz`
3. Vá em **Settings** → **Environment Variables**
4. Verifique se `DATABASE_URL` está correto
5. Deve apontar para o mesmo banco onde você executou o SQL

### Passo 2: Limpar Cache e Forçar Rebuild

#### Opção A: Via Dashboard do Vercel (Recomendado)

1. No Vercel, vá em **Settings** → **General**
2. Role até **"Build & Development Settings"**
3. Clique em **"Clear Build Cache"** (se disponível)
4. Vá em **Deployments**
5. Clique nos **3 pontinhos** (⋯) no último deploy
6. Selecione **"Redeploy"**
7. **IMPORTANTE:** Marque a opção **"Use existing Build Cache"** como **DESMARCADA** (não usar cache)
8. Clique em **"Redeploy"**

#### Opção B: Adicionar Variável de Ambiente Temporária

Adicione uma variável de ambiente no Vercel para forçar rebuild:

1. Vá em **Settings** → **Environment Variables**
2. Adicione:
   - **Name:** `FORCE_REBUILD`
   - **Value:** `1`
   - Marque: Production, Preview, Development
3. Salve
4. Faça um novo deploy (isso vai forçar regeneração)

### Passo 3: Verificar Build Logs

1. No Vercel, vá em **Deployments**
2. Clique no último deploy
3. Veja os **Build Logs**
4. Procure por: `Running "prisma generate"`
5. Verifique se não há erros durante a geração

---

## 🔍 Verificar se o Banco Está Correto

Execute no SQL Editor do Neon.tech:

```sql
-- Verificar enum
SELECT unnest(enum_range(NULL::userrole_role)) AS role_value;

-- Verificar constraint
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conname = 'userrole_role_check';
```

---

## ⚠️ Possível Causa: Múltiplos Bancos

Se você tem múltiplos projetos no Neon.tech:
1. Verifique qual banco está sendo usado no Vercel
2. Confirme que executou o SQL no banco correto
3. O DATABASE_URL no Vercel deve apontar para o mesmo banco

---

## 🎯 Solução Alternativa: Usar Prisma Migrate

Se o problema persistir, podemos criar uma migration:

```bash
npx prisma migrate dev --name add_guide_role
```

Mas isso requer acesso local ao banco.

---

## 📝 Checklist de Verificação

- [ ] DATABASE_URL no Vercel está correto
- [ ] SQL foi executado no banco correto
- [ ] Build logs mostram `prisma generate` executando
- [ ] Cache foi limpo
- [ ] Redeploy foi feito sem usar cache
- [ ] Enum no banco tem GUIDE (verificado via SQL)
