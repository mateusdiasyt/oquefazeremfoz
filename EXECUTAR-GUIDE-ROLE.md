# 🔧 Adicionar Role GUIDE ao Banco de Dados

## ⚠️ Problema
O banco de dados PostgreSQL (Neon.tech) ainda não tem o valor `GUIDE` no enum `userrole_role`, causando erro ao tentar cadastrar guias.

## ✅ Solução: Executar SQL no Neon.tech

### Passo 1: Acessar o Neon.tech
1. Acesse [https://console.neon.tech](https://console.neon.tech)
2. Faça login na sua conta
3. Selecione o projeto `oqfoz` (ou o nome do seu projeto)

### Passo 2: Abrir SQL Editor
1. No menu lateral, clique em **"SQL Editor"** ou **"Query"**
2. Clique em **"New query"** ou **"Create query"**

### Passo 3: Executar o SQL
1. Copie e cole o seguinte comando SQL:

```sql
ALTER TYPE "userrole_role" ADD VALUE IF NOT EXISTS 'GUIDE';
```

2. Clique em **"Run"** ou **"Execute"**
3. Aguarde a confirmação de sucesso

### Passo 4: Verificar
Execute este comando para verificar se o valor foi adicionado:

```sql
SELECT unnest(enum_range(NULL::userrole_role)) AS role_value;
```

Você deve ver:
- ADMIN
- COMPANY
- TOURIST
- GUIDE

## ✅ Pronto!
Após executar o SQL, o cadastro de guias funcionará normalmente.
