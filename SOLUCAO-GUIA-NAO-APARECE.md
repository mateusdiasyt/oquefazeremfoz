# 🔧 Solução: Guia Cadastrado Não Aparece

## ❌ Problema
O guia foi cadastrado, mas não aparece na lista de guias.

**Causa:** A API `/api/guides` só retorna guias com `isApproved: true`. Guias recém-cadastrados têm `isApproved: false` por padrão.

---

## ✅ SOLUÇÃO RÁPIDA: Aprovar Guia via SQL

### Passo 1: Verificar Guias Pendentes
Execute no SQL Editor do Neon.tech:

```sql
-- Ver todos os guias (aprovados e não aprovados)
SELECT id, name, "isApproved", "createdAt", "userId"
FROM "guide"
ORDER BY "createdAt" DESC;
```

### Passo 2: Aprovar o Guia

#### Opção A: Aprovar TODOS os guias pendentes
```sql
UPDATE "guide" 
SET "isApproved" = true, "approvedAt" = NOW()
WHERE "isApproved" = false;
```

#### Opção B: Aprovar guia específico por nome
```sql
-- Substitua 'CARLOS MATEUS DIAS' pelo nome do guia
UPDATE "guide" 
SET "isApproved" = true, "approvedAt" = NOW()
WHERE name ILIKE '%CARLOS MATEUS DIAS%';
```

#### Opção C: Aprovar guia específico por ID
```sql
-- Substitua 'guide_xxxxx' pelo ID do guia (veja no passo 1)
UPDATE "guide" 
SET "isApproved" = true, "approvedAt" = NOW()
WHERE id = 'guide_xxxxx';
```

### Passo 3: Verificar se Foi Aprovado
```sql
SELECT id, name, "isApproved", "approvedAt"
FROM "guide"
WHERE "isApproved" = true;
```

---

## ✅ Depois de Aprovar

1. ✅ Recarregue a página `/guias`
2. ✅ O guia deve aparecer na lista
3. ✅ O guia ficará visível para todos os usuários

---

## 🎯 Solução Permanente (Futuro)

Para não precisar aprovar manualmente via SQL, seria ideal criar:
- Página `/admin/guias` (similar a `/admin/empresas`)
- Rotas `/api/admin/guides` para aprovar/rejeitar guias

Mas por enquanto, usar o SQL resolve o problema imediatamente.

---

## 📝 Arquivo SQL Completo

Use o arquivo `aprovar-guia.sql` que foi criado com todas as opções.
