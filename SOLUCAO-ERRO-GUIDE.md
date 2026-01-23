# 🔧 SOLUÇÃO: Erro ao Cadastrar Guia

## ❌ Erro Atual
```
violates check constraint "userrole_role_check"
Failing row contains (..., GUIDE)
```

**Causa:** O enum `userrole_role` no banco PostgreSQL não tem o valor `GUIDE`.

---

## ✅ SOLUÇÃO (5 minutos)

### Passo 1: Acessar Neon.tech
1. Abra: **https://console.neon.tech**
2. Faça login
3. Selecione seu projeto (oqfoz)

### Passo 2: Abrir SQL Editor
1. No menu lateral, clique em **"SQL Editor"**
   - Pode estar como "Query" ou ter ícone de banco de dados
2. Clique em **"New query"** ou **"Create query"**

### Passo 3: Executar o SQL
1. **Copie este comando:**

```sql
ALTER TYPE "userrole_role" ADD VALUE IF NOT EXISTS 'GUIDE';
```

2. **Cole no SQL Editor**
3. Clique em **"Run"** ou pressione `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

### Passo 4: Verificar Sucesso
Execute esta query para confirmar:

```sql
SELECT unnest(enum_range(NULL::userrole_role)) AS role_value;
```

Você deve ver **4 valores**:
- ADMIN
- COMPANY
- TOURIST
- **GUIDE** ← Este deve aparecer agora!

---

## ✅ Depois de Executar

1. ✅ SQL executado com sucesso
2. ✅ Teste cadastrar um novo guia novamente
3. ✅ O erro 500 não deve mais aparecer

---

## 📸 Onde Encontrar o SQL Editor?

Se não encontrar:
- Procure por "SQL" no menu lateral
- Ou "Query" ou "Database"
- Ou use a busca do dashboard do Neon
- Geralmente está no menu lateral esquerdo

---

## ⚠️ IMPORTANTE

- ⚠️ Execute **UMA VEZ** apenas
- ✅ Não afeta dados existentes
- ✅ Resolve o erro permanentemente
- ✅ Funciona imediatamente após executar
