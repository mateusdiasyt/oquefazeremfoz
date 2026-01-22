# 🚀 Deploy no Vercel - Passo a Passo

## 📋 Pré-requisitos

- ✅ Conta no GitHub
- ✅ Repositório `oquefazeremfoz` no GitHub
- ✅ Conta no [Vercel](https://vercel.com) (pode criar com GitHub)

---

## 🔧 Passo 1: Conectar Repositório no Vercel

### 1.1 Acessar Vercel

1. Acesse [https://vercel.com](https://vercel.com)
2. Clique em **"Sign Up"** ou **"Log In"**
3. Escolha **"Continue with GitHub"** (recomendado)

### 1.2 Importar Projeto

1. No dashboard do Vercel, clique em **"Add New..."** → **"Project"**
2. Você verá seus repositórios do GitHub
3. Procure por **`oquefazeremfoz`**
4. Clique em **"Import"** ao lado do repositório

---

## ⚙️ Passo 2: Configurar o Projeto

### 2.1 Configurações Básicas

Na tela de configuração, você verá:

- **Project Name:** `oquefazeremfoz` (ou o que preferir)
- **Framework Preset:** Next.js (deve detectar automaticamente)
- **Root Directory:** `./` (deixe como está)
- **Build Command:** `prisma generate && next build` (já configurado)
- **Output Directory:** `.next` (automático)
- **Install Command:** `npm install` (automático)

**✅ Deixe tudo como está e vá para as variáveis de ambiente**

---

## 🔐 Passo 3: Adicionar Variáveis de Ambiente

**IMPORTANTE:** Adicione estas variáveis ANTES de fazer o deploy!

### 3.1 Abrir Seção de Variáveis

Na página de configuração, role até a seção **"Environment Variables"**

### 3.2 Adicionar Cada Variável

Clique em **"Add"** para cada uma das seguintes:

#### Variável 1: `DATABASE_URL`
```
Name: DATABASE_URL
Value: postgresql://placeholder:placeholder@placeholder.neon.tech/placeholder?sslmode=require
```
**⚠️ Por enquanto, use um placeholder. Vamos configurar o Neon depois!**

#### Variável 2: `JWT_SECRET`
```
Name: JWT_SECRET
Value: [GERE_UMA_CHAVE_FORTE_AQUI]
```

**💡 Para gerar uma chave forte, você pode:**
- Usar: `openssl rand -base64 32` (no terminal)
- Ou usar um gerador online: https://randomkeygen.com/
- Ou usar: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`

**Exemplo de chave:**
```
JWT_SECRET=K8mN2pQ5rT9vW3xY7zA1bC4dE6fG8hJ0kL3mN5pQ7rT9vW1xY3zA5bC7dE9fG
```

#### Variável 3: `NEXT_PUBLIC_BASE_URL`
```
Name: NEXT_PUBLIC_BASE_URL
Value: https://oquefazeremfoz.vercel.app
```
**⚠️ Use o nome do seu projeto. O Vercel vai te mostrar a URL depois do deploy.**

#### Variável 4: `OQFOZ_FEE_PCT`
```
Name: OQFOZ_FEE_PCT
Value: 10
```

#### Variável 5: `NODE_ENV` (Opcional)
```
Name: NODE_ENV
Value: production
```

### 3.3 Selecionar Ambientes

Para cada variável, certifique-se de que está marcado:
- ✅ **Production**
- ✅ **Preview** (opcional, mas recomendado)
- ✅ **Development** (opcional)

---

## 🚀 Passo 4: Fazer Deploy

1. Após adicionar todas as variáveis, role até o final da página
2. Clique em **"Deploy"**
3. Aguarde o build completar (pode levar 2-5 minutos)

---

## ✅ Passo 5: Verificar Deploy

### 5.1 Durante o Build

Você verá os logs do build em tempo real. Procure por:
- ✅ "Installing dependencies"
- ✅ "Running prisma generate"
- ✅ "Running next build"
- ✅ "Build completed"

### 5.2 Após o Build

1. Se tudo der certo, você verá **"Congratulations! Your project has been deployed"**
2. Você receberá uma URL: `https://seu-projeto.vercel.app`
3. Clique na URL para abrir o site

### 5.3 Possíveis Erros

**Erro: "Prisma Client not generated"**
- ✅ O script `postinstall` no package.json deve resolver isso
- Se não resolver, adicione manualmente no Build Command: `prisma generate && next build`

**Erro: "Environment variable not found"**
- ✅ Verifique se todas as variáveis foram adicionadas
- ✅ Confirme que estão marcadas para "Production"

**Erro: "Build failed"**
- ✅ Veja os logs completos clicando em "View Function Logs"
- ✅ Verifique se não há erros de sintaxe no código

---

## 🔄 Passo 6: Atualizar URL Base

Após o deploy, você receberá a URL real. Atualize a variável:

1. Vá em **Settings** → **Environment Variables**
2. Edite `NEXT_PUBLIC_BASE_URL`
3. Coloque a URL real: `https://seu-projeto.vercel.app`
4. Salve e faça um novo deploy (ou aguarde o redeploy automático)

---

## 📝 Resumo das Variáveis

```
✅ DATABASE_URL (placeholder por enquanto)
✅ JWT_SECRET (chave forte gerada)
✅ NEXT_PUBLIC_BASE_URL (URL do Vercel)
✅ OQFOZ_FEE_PCT (10)
✅ NODE_ENV (production - opcional)
```

---

## 🎯 Próximos Passos

Após o deploy funcionar:

1. ✅ Site no ar no Vercel
2. ⏭️ Configurar Neon.tech (próximo passo)
3. ⏭️ Atualizar DATABASE_URL no Vercel
4. ⏭️ Executar migrations no Neon

---

## 🆘 Precisa de Ajuda?

- **Logs do Build:** Clique em "View Function Logs" no Vercel
- **Documentação Vercel:** https://vercel.com/docs
- **Suporte:** https://vercel.com/support

---

**🎉 Depois que o deploy funcionar, vamos configurar o banco de dados!**
