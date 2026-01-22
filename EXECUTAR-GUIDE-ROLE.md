# 🔧 Adicionar Role GUIDE ao Banco de Dados

## ⚠️ PROBLEMA URGENTE
O banco de dados PostgreSQL (Neon.tech) ainda não tem o valor `GUIDE` no enum `userrole_role`, causando erro 500 ao tentar cadastrar guias.

**Erro atual:** `violates check constraint "userrole_role_check"`

---

## ✅ SOLUÇÃO RÁPIDA (5 minutos)

### 📍 Método 1: Via SQL Editor do Neon.tech (MAIS FÁCIL) ⭐

#### Passo 1: Acessar Neon.tech
1. Abra seu navegador
2. Acesse: **https://console.neon.tech**
3. Faça login na sua conta
4. Selecione o projeto (geralmente `oqfoz` ou similar)

#### Passo 2: Abrir SQL Editor
1. No menu lateral esquerdo, procure por **"SQL Editor"**
   - Pode estar como "Query" ou "SQL Editor"
   - Geralmente tem um ícone de banco de dados ou código
2. Clique em **"New query"** ou **"Create query"**
   - Botão geralmente no canto superior direito

#### Passo 3: Copiar e Colar o SQL
1. **Copie EXATAMENTE este comando:**

```sql
ALTER TYPE "userrole_role" ADD VALUE IF NOT EXISTS 'GUIDE';
```

2. **Cole no editor SQL** (área de texto grande)
3. Clique no botão **"Run"** ou **"Execute"** (geralmente verde)
   - Ou pressione `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

#### Passo 4: Verificar Sucesso
Você deve ver uma mensagem como:
- ✅ "Query executed successfully"
- ✅ "Success"
- ✅ Ou nenhum erro

#### Passo 5: Testar (Opcional)
Para confirmar que funcionou, execute esta query:

```sql
SELECT unnest(enum_range(NULL::userrole_role)) AS role_value;
```

Você deve ver 4 valores:
- ADMIN
- COMPANY  
- TOURIST
- **GUIDE** ← Este deve aparecer agora!

---

### 📍 Método 2: Via Arquivo SQL (Alternativa)

Se preferir, você pode:
1. Abrir o arquivo `add-guide-role.sql` na raiz do projeto
2. Copiar o conteúdo
3. Colar no SQL Editor do Neon
4. Executar

---

## ⚠️ IMPORTANTE

- ⚠️ **Este SQL precisa ser executado UMA VEZ** no banco de dados
- ⚠️ **Sem executar este SQL, o cadastro de guias NÃO funcionará**
- ✅ Após executar, o erro 500 será resolvido
- ✅ Não afeta dados existentes

---

## 🎯 Depois de Executar

1. ✅ SQL executado com sucesso
2. ✅ Teste cadastrar um novo guia
3. ✅ O erro 500 não deve mais aparecer

---

## ❓ Precisa de Ajuda?

Se tiver dificuldade para encontrar o SQL Editor:
- Procure por "SQL" no menu lateral
- Ou "Query" ou "Database"
- Ou use a busca do dashboard do Neon
