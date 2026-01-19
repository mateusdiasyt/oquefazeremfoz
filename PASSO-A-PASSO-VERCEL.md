# 🚀 Deploy no Vercel - Guia Visual Passo a Passo

## 🎯 Objetivo

Fazer o deploy do projeto no Vercel ANTES de configurar o banco de dados.

---

## 📍 Passo 1: Acessar Vercel

1. Abra seu navegador
2. Acesse: **https://vercel.com**
3. Clique em **"Sign Up"** ou **"Log In"**
4. Escolha **"Continue with GitHub"** (recomendado)

---

## 📍 Passo 2: Importar Projeto

1. No dashboard do Vercel, clique em **"Add New..."**
2. Selecione **"Project"**
3. Você verá uma lista dos seus repositórios do GitHub
4. Procure por **`oquefazeremfoz`** ou **`mateusdiasyt/oquefazeremfoz`**
5. Clique no botão **"Import"** ao lado do repositório

---

## 📍 Passo 3: Configurar Build

Na tela de configuração, você verá:

### ✅ Deixe assim (já está configurado):

- **Project Name:** `oquefazeremfoz` (ou o que preferir)
- **Framework Preset:** `Next.js` (detectado automaticamente)
- **Root Directory:** `./` (raiz do projeto)
- **Build Command:** `prisma generate && next build` ✅
- **Output Directory:** `.next` (automático)
- **Install Command:** `npm install` (automático)

**✅ Não precisa mudar nada aqui!**

---

## 📍 Passo 4: Adicionar Variáveis de Ambiente

**⚠️ MUITO IMPORTANTE:** Adicione estas variáveis ANTES de clicar em "Deploy"!

### 4.1 Encontrar a Seção

Role a página para baixo até encontrar a seção:
**"Environment Variables"**

### 4.2 Adicionar Variável 1: DATABASE_URL

1. Clique em **"Add"** ou **"Add New"**
2. No campo **"Name"**, digite: `DATABASE_URL`
3. No campo **"Value"**, cole:
   ```
   postgresql://placeholder:placeholder@placeholder.neon.tech/placeholder?sslmode=require
   ```
4. Marque os checkboxes:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. Clique em **"Save"**

### 4.3 Adicionar Variável 2: JWT_SECRET

1. Clique em **"Add"** novamente
2. **Name:** `JWT_SECRET`
3. **Value:** Gere uma chave forte (veja [VARIAVEIS-VERCEL.md](./VARIAVEIS-VERCEL.md))
   
   **Ou use esta temporariamente:**
   ```
   oqfoz-super-secret-jwt-key-2024-change-in-production-vercel
   ```
4. Marque: ✅ Production, ✅ Preview, ✅ Development
5. Clique em **"Save"**

### 4.4 Adicionar Variável 3: NEXT_PUBLIC_BASE_URL

1. Clique em **"Add"**
2. **Name:** `NEXT_PUBLIC_BASE_URL`
3. **Value:** `https://oquefazeremfoz.vercel.app`
   
   **⚠️ Use o nome do seu projeto! Se você mudou o nome, use:**
   `https://[seu-nome-do-projeto].vercel.app`
4. Marque: ✅ Production, ✅ Preview, ✅ Development
5. Clique em **"Save"**

### 4.5 Adicionar Variável 4: OQFOZ_FEE_PCT

1. Clique em **"Add"**
2. **Name:** `OQFOZ_FEE_PCT`
3. **Value:** `10`
4. Marque: ✅ Production, ✅ Preview, ✅ Development
5. Clique em **"Save"**

### 4.6 Adicionar Variável 5: NODE_ENV (Opcional)

1. Clique em **"Add"**
2. **Name:** `NODE_ENV`
3. **Value:** `production`
4. Marque: ✅ Production
5. Clique em **"Save"**

---

## 📍 Passo 5: Fazer Deploy

1. Após adicionar todas as variáveis, role até o final da página
2. Clique no botão grande **"Deploy"**
3. Aguarde o build (pode levar 2-5 minutos)

---

## 📍 Passo 6: Acompanhar o Build

Você verá os logs em tempo real:

### ✅ O que você deve ver:

```
✓ Installing dependencies
✓ Running "prisma generate"
✓ Running "next build"
✓ Build completed
✓ Deploying...
✓ Deployment ready
```

### ⚠️ Se der erro:

- Clique em **"View Function Logs"** para ver detalhes
- Verifique se todas as variáveis foram adicionadas
- Confirme que o Build Command está correto

---

## 📍 Passo 7: Verificar Deploy

### 7.1 Sucesso!

Se tudo der certo, você verá:

**"Congratulations! Your project has been deployed"**

E uma URL como:
```
https://oquefazeremfoz.vercel.app
```

### 7.2 Testar o Site

1. Clique na URL ou copie e cole no navegador
2. O site deve abrir (pode dar erro de banco, mas isso é normal!)
3. Se a página carregar, o deploy funcionou! ✅

---

## 📍 Passo 8: Atualizar URL Base (Se necessário)

1. Se a URL do seu projeto for diferente, vá em:
   **Settings** → **Environment Variables**
2. Edite `NEXT_PUBLIC_BASE_URL`
3. Coloque a URL real que o Vercel te deu
4. Salve

---

## ✅ Checklist Final

- [ ] Projeto importado no Vercel
- [ ] Build Command configurado: `prisma generate && next build`
- [ ] Variável `DATABASE_URL` adicionada (placeholder)
- [ ] Variável `JWT_SECRET` adicionada
- [ ] Variável `NEXT_PUBLIC_BASE_URL` adicionada
- [ ] Variável `OQFOZ_FEE_PCT` adicionada
- [ ] Variável `NODE_ENV` adicionada (opcional)
- [ ] Deploy executado com sucesso
- [ ] Site acessível na URL do Vercel

---

## 🎯 Próximo Passo

Após o deploy funcionar:

1. ✅ Site no ar no Vercel
2. ⏭️ **Agora vamos configurar o Neon.tech** (banco de dados)
3. ⏭️ Depois atualizamos a `DATABASE_URL` no Vercel

---

## 🆘 Problemas Comuns

### ❌ "Build failed"
- Verifique os logs completos
- Confirme que todas as variáveis foram adicionadas
- Verifique se o repositório está atualizado no GitHub

### ❌ "Prisma Client not generated"
- O script `postinstall` no package.json deve resolver
- Se não, o Build Command já inclui `prisma generate`

### ❌ "Environment variable not found"
- Vá em Settings → Environment Variables
- Confirme que todas as variáveis estão lá
- Verifique se estão marcadas para "Production"

### ❌ Site carrega mas dá erro de banco
- ✅ Isso é NORMAL! Ainda não configuramos o banco
- O deploy funcionou! Agora vamos configurar o Neon.tech

---

**📖 Para ver a lista completa de variáveis, veja [VARIAVEIS-VERCEL.md](./VARIAVEIS-VERCEL.md)**

**🎉 Depois que o deploy funcionar, me avise e vamos configurar o banco!**
