# 🗄️ Configurar Neon.tech - Passo a Passo

## 🎯 Objetivo

Criar o banco de dados no Neon.tech e obter a string de conexão para usar no Vercel depois.

---

## 📍 Passo 1: Criar Conta no Neon.tech

### 1.1 Acessar o Site

1. Abra seu navegador
2. Acesse: **https://neon.tech**
3. Clique em **"Sign Up"** ou **"Get Started"**

### 1.2 Fazer Login

**Opção A: Com GitHub (Recomendado)**
- Clique em **"Continue with GitHub"**
- Autorize o Neon a acessar sua conta GitHub
- Pronto!

**Opção B: Com Email**
- Digite seu email
- Crie uma senha
- Confirme o email

---

## 📍 Passo 2: Criar um Projeto

### 2.1 Criar Novo Projeto

1. Após fazer login, você verá o dashboard
2. Clique no botão **"Create a project"** ou **"New Project"**

### 2.2 Configurar o Projeto

Preencha os campos:

- **Project name:** `oqfoz` (ou o nome que preferir)
- **Region:** Escolha a região mais próxima
  - Se estiver no Brasil: **São Paulo** (se disponível) ou **US East**
  - Ou escolha a mais próxima da sua localização
- **PostgreSQL version:** Deixe a versão mais recente (15 ou 16)

### 2.3 Criar

1. Clique em **"Create project"**
2. Aguarde alguns segundos enquanto o banco é criado

---

## 📍 Passo 3: Obter String de Conexão

### 3.1 Encontrar a Connection String

Após criar o projeto, você verá uma tela com:

**"Connection string"** ou **"Connection details"**

### 3.2 Copiar a String

A string terá este formato:

```
postgresql://[usuario]:[senha]@[host].neon.tech/[database]?sslmode=require
```

**Exemplo real:**
```
postgresql://neondb_owner:abc123xyz@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

### 3.3 Salvar em Local Seguro

**⚠️ IMPORTANTE:** Copie e salve essa string em um lugar seguro! Você vai precisar dela.

**💡 Dica:** Salve em:
- Um arquivo de texto local (não commite no Git!)
- Um gerenciador de senhas
- Ou anote em um lugar seguro

---

## 📍 Passo 4: Criar as Tabelas no Banco

Agora precisamos criar todas as tabelas do projeto no banco.

### Opção A: Via SQL Editor (Mais Rápido) ⭐ RECOMENDADO

#### 4.1 Abrir SQL Editor

1. No dashboard do Neon, procure por **"SQL Editor"** no menu lateral
2. Ou clique em **"Query"** ou **"SQL Editor"**
3. Clique em **"New query"** ou **"Create query"**

#### 4.2 Executar o SQL

1. Abra o arquivo **`database-postgresql.sql`** do projeto (está na raiz)
   - ⚠️ **IMPORTANTE:** Use o arquivo `database-postgresql.sql` (não o `database.sql`)
   - O `database-postgresql.sql` está adaptado para PostgreSQL
2. **Copie TODO o conteúdo** do arquivo
3. Cole no SQL Editor do Neon
4. Clique em **"Run"** ou **"Execute"**
5. Aguarde alguns segundos

#### 4.3 Verificar Sucesso

Você deve ver uma mensagem de sucesso como:
- ✅ "Query executed successfully"
- ✅ "Tables created"
- ✅ Ou uma lista das tabelas criadas

### Opção B: Via Prisma (Alternativa)

Se preferir usar o Prisma:

#### 4.1 Configurar Localmente

1. Crie um arquivo `.env` na raiz do projeto (se não existir)
2. Adicione:
   ```
   DATABASE_URL="postgresql://[sua-string-do-neon]"
   ```
   (Cole a string que você copiou do Neon)

#### 4.2 Executar Prisma

Abra o terminal na pasta do projeto e execute:

```bash
# Gerar cliente Prisma
npx prisma generate

# Criar tabelas no banco
npx prisma db push
```

#### 4.3 Verificar

```bash
# Abrir Prisma Studio para ver as tabelas
npx prisma studio
```

Isso abrirá uma interface visual no navegador mostrando todas as tabelas.

---

## 📍 Passo 5: Verificar se Funcionou

### 5.1 Via SQL Editor

No SQL Editor do Neon, execute:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

Você deve ver uma lista com todas as tabelas:
- `user`
- `userrole`
- `session`
- `business`
- `post`
- `comment`
- etc.

### 5.2 Via Prisma Studio

Se usou Prisma, o Prisma Studio mostrará todas as tabelas visualmente.

---

## 📍 Passo 6: Popular Dados Iniciais (Opcional)

Se quiser dados de exemplo no banco:

### 6.1 Configurar .env Local

Certifique-se de que o `.env` tem:

```
DATABASE_URL="postgresql://[sua-string-do-neon]"
```

### 6.2 Executar Seed

```bash
npm run prisma:seed
```

Isso vai popular o banco com dados de exemplo (usuários, empresas, etc.)

---

## ✅ Checklist Final

- [ ] Conta criada no Neon.tech
- [ ] Projeto criado no Neon
- [ ] String de conexão copiada e salva
- [ ] Tabelas criadas (via SQL ou Prisma)
- [ ] Tabelas verificadas (listadas corretamente)
- [ ] Dados iniciais populados (opcional)

---

## 🎯 Próximo Passo

Agora que o banco está configurado:

1. ✅ Banco criado no Neon.tech
2. ✅ String de conexão obtida
3. ✅ Tabelas criadas
4. ⏭️ **Agora vamos fazer deploy no Vercel** e usar essa string de conexão!

---

## 📝 Informações Importantes

### String de Conexão

A string que você copiou do Neon é algo como:

```
postgresql://neondb_owner:senha@ep-projeto-123456.regiao.aws.neon.tech/neondb?sslmode=require
```

**Guarde essa string!** Você vai precisar dela para:
- Configurar no Vercel (variável `DATABASE_URL`)
- Conectar localmente (arquivo `.env`)

### Segurança

- ✅ A conexão usa SSL (`sslmode=require`)
- ✅ Cada projeto tem credenciais únicas
- ✅ Você pode resetar a senha no dashboard do Neon
- ⚠️ **NUNCA** commite a string de conexão no Git!

### Free Tier

O Neon oferece um tier gratuito generoso:
- ✅ 0.5 GB de armazenamento
- ✅ Suporta desenvolvimento e pequenos projetos
- ✅ Fácil de escalar depois

---

## 🆘 Problemas Comuns

### ❌ "Connection refused"
- Verifique se copiou a string completa
- Confirme que o projeto está ativo no Neon
- Verifique se o SSL está incluído (`?sslmode=require`)

### ❌ "Table does not exist"
- Execute o `database.sql` novamente
- Ou execute `npx prisma db push`
- Verifique se está conectado ao banco correto

### ❌ "Authentication failed"
- Verifique usuário e senha na string
- Tente resetar a senha no dashboard do Neon
- Gere uma nova connection string

### ❌ Erro ao executar SQL
- Verifique se copiou o SQL completo
- Execute uma tabela por vez se necessário
- Verifique se não há erros de sintaxe

---

**📖 Para ver o SQL completo, abra o arquivo `database.sql`**

**🎉 Depois que o banco estiver configurado, me avise e vamos fazer o deploy no Vercel!**
