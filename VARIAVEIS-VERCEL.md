# 🔐 Variáveis de Ambiente para o Vercel

## 📋 Lista Completa de Variáveis

Copie e cole estas variáveis no Vercel:

---

### 1️⃣ DATABASE_URL (Placeholder por enquanto)

```
DATABASE_URL=postgresql://placeholder:placeholder@placeholder.neon.tech/placeholder?sslmode=require
```

**⚠️ Vamos atualizar isso depois que configurarmos o Neon.tech**

---

### 2️⃣ JWT_SECRET (Gerar uma chave forte)

**Opção A: Usar este gerador online**
- Acesse: https://randomkeygen.com/
- Use uma chave da seção "CodeIgniter Encryption Keys" (64 caracteres)
- Ou use: https://generate-secret.vercel.app/64

**Opção B: Usar PowerShell (Windows)**
```powershell
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

**Opção C: Usar uma chave manual (temporária)**
```
JWT_SECRET=oqfoz-super-secret-key-change-in-production-2024-vercel-deploy
```

**✅ Exemplo de chave gerada (64 caracteres):**
```
JWT_SECRET=K8mN2pQ5rT9vW3xY7zA1bC4dE6fG8hJ0kL3mN5pQ7rT9vW1xY3zA5bC7dE9fG1hJ3kL5mN7pQ9rT
```

---

### 3️⃣ NEXT_PUBLIC_BASE_URL

```
NEXT_PUBLIC_BASE_URL=https://oquefazeremfoz.vercel.app
```

**⚠️ IMPORTANTE:** 
- Use o nome do seu projeto no Vercel
- Se você mudar o nome, atualize esta variável
- O Vercel vai te mostrar a URL exata após o primeiro deploy

**Exemplos:**
- `https://oquefazeremfoz.vercel.app`
- `https://seu-projeto.vercel.app`
- `https://oqfoz-xyz.vercel.app`

---

### 4️⃣ OQFOZ_FEE_PCT

```
OQFOZ_FEE_PCT=10
```

**Valor fixo:** 10 (representa 10% de comissão)

---

### 5️⃣ NODE_ENV (Opcional)

```
NODE_ENV=production
```

**Esta é opcional**, mas recomendada para produção.

---

## 📝 Resumo Rápido

```
DATABASE_URL=postgresql://placeholder:placeholder@placeholder.neon.tech/placeholder?sslmode=require
JWT_SECRET=[GERE_UMA_CHAVE_FORTE_AQUI]
NEXT_PUBLIC_BASE_URL=https://oquefazeremfoz.vercel.app
OQFOZ_FEE_PCT=10
NODE_ENV=production
```

---

## 🎯 Como Adicionar no Vercel

1. Vá em **Settings** → **Environment Variables**
2. Clique em **"Add New"**
3. Cole o **Name** e **Value** de cada variável
4. Marque os ambientes: ✅ Production, ✅ Preview, ✅ Development
5. Clique em **"Save"**

---

## ⚠️ Importante

- ✅ **Nunca** commite essas variáveis no Git
- ✅ Use valores diferentes para produção e desenvolvimento
- ✅ Mantenha o JWT_SECRET seguro e secreto
- ✅ Atualize DATABASE_URL depois que configurar o Neon

---

## 🔄 Após Configurar o Neon

Quando você criar o banco no Neon.tech, volte aqui e atualize:

```
DATABASE_URL=postgresql://[usuario]:[senha]@[host].neon.tech/[database]?sslmode=require
```

Onde você pega os valores no dashboard do Neon.tech.
