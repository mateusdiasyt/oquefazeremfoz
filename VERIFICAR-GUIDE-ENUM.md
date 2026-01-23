# ✅ Verificar se GUIDE foi Adicionado ao Enum

## 🔍 Como Verificar

### Passo 1: Acessar Neon.tech
1. Abra: **https://console.neon.tech**
2. Faça login
3. Selecione seu projeto

### Passo 2: Abrir SQL Editor
1. Clique em **"SQL Editor"** no menu lateral
2. Clique em **"New query"**

### Passo 3: Executar Query de Verificação
Cole e execute esta query:

```sql
SELECT unnest(enum_range(NULL::userrole_role)) AS role_value;
```

### ✅ Resultado Esperado
Você deve ver **4 linhas**:
```
role_value
----------
ADMIN
COMPANY
TOURIST
GUIDE    ← Este deve aparecer!
```

### ❌ Se GUIDE NÃO Aparecer
Significa que o SQL não foi executado. Execute novamente:

```sql
ALTER TYPE "userrole_role" ADD VALUE IF NOT EXISTS 'GUIDE';
```

Depois execute a query de verificação novamente.

---

## ⚠️ IMPORTANTE

- O banco de **produção** (usado pelo site www.oquefazeremfoz.com.br) é o mesmo do Neon.tech
- Você precisa executar o SQL **UMA VEZ** no banco
- Não precisa fazer deploy - o código já está correto
- Após executar o SQL, o erro desaparece imediatamente

---

## 🎯 Checklist

- [ ] Acessei o Neon.tech
- [ ] Abri o SQL Editor
- [ ] Executei: `ALTER TYPE "userrole_role" ADD VALUE IF NOT EXISTS 'GUIDE';`
- [ ] Verifiquei com: `SELECT unnest(enum_range(NULL::userrole_role)) AS role_value;`
- [ ] Vi os 4 valores (ADMIN, COMPANY, TOURIST, GUIDE)
- [ ] Testei cadastrar um guia novamente
