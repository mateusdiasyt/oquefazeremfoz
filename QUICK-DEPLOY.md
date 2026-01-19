# ⚡ Deploy Rápido - OQFOZ

## 🚀 Passos Rápidos

### 1️⃣ Neon.tech (Banco de Dados)

1. Acesse [neon.tech](https://neon.tech) e crie um projeto
2. Copie a **Connection String** (formato PostgreSQL)
3. No SQL Editor do Neon, execute o arquivo `database.sql` OU use:
   ```bash
   npx prisma db push
   ```

### 2️⃣ Vercel (Hospedagem)

1. Acesse [vercel.com](https://vercel.com) e conecte seu GitHub
2. Importe o repositório `oquefazeremfoz`
3. Adicione as variáveis de ambiente:

   ```
   DATABASE_URL=postgresql://... (do Neon)
   JWT_SECRET=sua-chave-secreta-forte
   NEXT_PUBLIC_BASE_URL=https://seu-projeto.vercel.app
   OQFOZ_FEE_PCT=10
   ```

4. Clique em **Deploy**

### 3️⃣ Atualizar Schema (IMPORTANTE!)

O schema já foi atualizado para PostgreSQL, mas se precisar:

```bash
# Gerar cliente Prisma
npx prisma generate

# Sincronizar schema com banco
npx prisma db push
```

---

## ✅ Pronto!

Seu site estará em: `https://seu-projeto.vercel.app`

---

📖 Para instruções detalhadas, veja [DEPLOY.md](./DEPLOY.md)
