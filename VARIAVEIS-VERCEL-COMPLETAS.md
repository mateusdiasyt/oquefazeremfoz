# 🔐 Variáveis de Ambiente para Vercel - Lista Completa

## 📋 Todas as Variáveis Necessárias

Adicione estas variáveis no Vercel em **Settings** → **Environment Variables**

---

## 1️⃣ DATABASE_URL

**Name:** `DATABASE_URL`

**Value:**
```
postgresql://neondb_owner:npg_Iw2C1KnNfemZ@ep-floral-mouse-ah1n2jju-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**Ambientes:** ✅ Production, ✅ Preview, ✅ Development

---

## 2️⃣ JWT_SECRET

**Name:** `JWT_SECRET`

**Value:** (Gere uma chave forte - veja opções abaixo)

**Opção A - Chave Forte Gerada:**
```
K8mN2pQ5rT9vW3xY7zA1bC4dE6fG8hJ0kL3mN5pQ7rT9vW1xY3zA5bC7dE9fG1hJ3kL5mN7pQ9rT
```

**Opção B - Chave Personalizada:**
```
oqfoz-vercel-production-jwt-secret-2024-super-seguro-neon-tech
```

**💡 Para gerar uma chave forte:**
- Acesse: https://randomkeygen.com/ (use "CodeIgniter Encryption Keys")
- Ou: https://generate-secret.vercel.app/64

**Ambientes:** ✅ Production, ✅ Preview, ✅ Development

---

## 3️⃣ NEXT_PUBLIC_BASE_URL

**Name:** `NEXT_PUBLIC_BASE_URL`

**Value:**
```
https://oquefazeremfoz.vercel.app
```

**⚠️ IMPORTANTE:** 
- Use o nome do seu projeto no Vercel
- Se você mudar o nome do projeto, atualize esta variável
- O Vercel vai te mostrar a URL exata após o primeiro deploy

**Exemplos de URLs:**
- `https://oquefazeremfoz.vercel.app`
- `https://seu-projeto.vercel.app`
- `https://oqfoz-xyz.vercel.app`

**Ambientes:** ✅ Production, ✅ Preview, ✅ Development

---

## 4️⃣ OQFOZ_FEE_PCT

**Name:** `OQFOZ_FEE_PCT`

**Value:**
```
10
```

**Descrição:** Comissão padrão em % (10 = 10%)

**Ambientes:** ✅ Production, ✅ Preview, ✅ Development

---

## 5️⃣ NODE_ENV

**Name:** `NODE_ENV`

**Value:**
```
production
```

**Descrição:** Ambiente de execução (opcional, mas recomendado)

**Ambientes:** ✅ Production apenas

---

## 📝 Resumo Rápido para Copiar

```
DATABASE_URL = postgresql://neondb_owner:npg_Iw2C1KnNfemZ@ep-floral-mouse-ah1n2jju-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require

JWT_SECRET = K8mN2pQ5rT9vW3xY7zA1bC4dE6fG8hJ0kL3mN5pQ7rT9vW1xY3zA5bC7dE9fG1hJ3kL5mN7pQ9rT

NEXT_PUBLIC_BASE_URL = https://oquefazeremfoz.vercel.app

OQFOZ_FEE_PCT = 10

NODE_ENV = production
```

---

## 🎯 Como Adicionar no Vercel

### Passo a Passo:

1. Acesse: https://vercel.com
2. Selecione seu projeto `oquefazeremfoz`
3. Vá em **Settings** (Configurações)
4. Clique em **Environment Variables** (Variáveis de Ambiente)
5. Para cada variável:
   - Clique em **"Add New"**
   - Cole o **Name** e **Value**
   - Marque os ambientes: ✅ Production, ✅ Preview, ✅ Development
   - Clique em **"Save"**
6. Repita para todas as 5 variáveis

---

## ⚠️ Importante

- ✅ **Nunca** commite essas variáveis no Git
- ✅ Use valores diferentes para produção e desenvolvimento (se necessário)
- ✅ Mantenha o JWT_SECRET seguro e secreto
- ✅ Após adicionar, faça um novo deploy ou aguarde o redeploy automático

---

## ✅ Checklist

- [ ] DATABASE_URL adicionada
- [ ] JWT_SECRET adicionada
- [ ] NEXT_PUBLIC_BASE_URL adicionada
- [ ] OQFOZ_FEE_PCT adicionada
- [ ] NODE_ENV adicionada (opcional)
- [ ] Todas marcadas para Production
- [ ] Todas marcadas para Preview (recomendado)
- [ ] Todas marcadas para Development (opcional)

---

## 🚀 Próximo Passo

Após adicionar todas as variáveis:

1. ✅ Variáveis configuradas
2. ⏭️ Fazer deploy no Vercel
3. ⏭️ Testar o site

---

**🎉 Depois de adicionar todas as variáveis, me avise e vamos fazer o deploy!**
