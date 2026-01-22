# 🗄️ Executar SQL no Neon.tech

## ✅ String de Conexão Obtida

Você já tem a string de conexão do Neon.tech!

---

## 🚀 Opção 1: Via SQL Editor do Neon (Mais Fácil) ⭐ RECOMENDADO

### Passos:

1. Acesse o dashboard do Neon.tech: https://console.neon.tech
2. Selecione seu projeto `oqfoz`
3. No menu lateral, clique em **"SQL Editor"**
4. Clique em **"New query"** ou **"Create query"**
5. Abra o arquivo **`database-postgresql.sql`** do projeto
6. **Copie TODO o conteúdo** do arquivo
7. Cole no SQL Editor do Neon
8. Clique em **"Run"** ou pressione `Ctrl+Enter`
9. Aguarde alguns segundos

### ✅ Verificar Sucesso:

Execute esta query no SQL Editor:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

Você deve ver todas as tabelas listadas!

---

## 🖥️ Opção 2: Via Terminal (psql)

Se você tem o `psql` instalado, pode executar:

### Windows (PowerShell):

```powershell
# Instalar psql (se não tiver)
# Baixe do: https://www.postgresql.org/download/windows/

# Conectar e executar SQL
$env:PGPASSWORD='npg_Iw2C1KnNfemZ'
Get-Content database-postgresql.sql | psql 'postgresql://neondb_owner:npg_Iw2C1KnNfemZ@ep-floral-mouse-ah1n2jju-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require'
```

### Linux/Mac:

```bash
# Conectar e executar SQL
PGPASSWORD='npg_Iw2C1KnNfemZ' psql 'postgresql://neondb_owner:npg_Iw2C1KnNfemZ@ep-floral-mouse-ah1n2jju-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require' -f database-postgresql.sql
```

---

## 🔧 Opção 3: Via Prisma (Recomendado para Desenvolvimento)

### 1. Criar arquivo .env.local

Crie um arquivo `.env.local` na raiz do projeto:

```env
DATABASE_URL="postgresql://neondb_owner:npg_Iw2C1KnNfemZ@ep-floral-mouse-ah1n2jju-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

### 2. Executar Prisma

```bash
# Gerar cliente Prisma
npx prisma generate

# Criar tabelas no banco
npx prisma db push
```

### 3. Verificar com Prisma Studio

```bash
npx prisma studio
```

Isso abrirá uma interface visual no navegador mostrando todas as tabelas.

---

## 📝 String de Conexão para Vercel

Quando for fazer deploy no Vercel, use esta string:

```
DATABASE_URL=postgresql://neondb_owner:npg_Iw2C1KnNfemZ@ep-floral-mouse-ah1n2jju-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**⚠️ IMPORTANTE:**
- Não commite essa string no Git!
- Use apenas no Vercel (variáveis de ambiente)
- Mantenha segura

---

## ✅ Checklist

- [ ] SQL executado no Neon (via SQL Editor ou Prisma)
- [ ] Tabelas verificadas (listadas corretamente)
- [ ] String de conexão salva (para usar no Vercel)
- [ ] Pronto para fazer deploy no Vercel!

---

## 🎯 Próximo Passo

Agora que o banco está configurado:

1. ✅ Banco criado no Neon.tech
2. ✅ String de conexão obtida
3. ✅ Tabelas criadas
4. ⏭️ **Agora vamos fazer deploy no Vercel!**
