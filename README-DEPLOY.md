# 🚀 OQFOZ - Guia de Deploy Completo

Este projeto está configurado para deploy na **Vercel** com banco de dados **Neon.tech**.

## 📋 Checklist Rápido

- [ ] Criar projeto no Neon.tech
- [ ] Copiar Connection String do Neon
- [ ] Executar `database.sql` no Neon (ou `prisma db push`)
- [ ] Conectar repositório no Vercel
- [ ] Adicionar variáveis de ambiente no Vercel
- [ ] Fazer deploy

---

## 🗄️ Banco de Dados (Neon.tech)

**Arquivo:** [SETUP-NEON.md](./SETUP-NEON.md)

1. Crie um projeto em [neon.tech](https://neon.tech)
2. Copie a Connection String (PostgreSQL)
3. Execute o `database.sql` no SQL Editor OU use `npx prisma db push`

---

## 🌐 Hospedagem (Vercel)

**Arquivo:** [DEPLOY.md](./DEPLOY.md)

1. Conecte seu GitHub no [vercel.com](https://vercel.com)
2. Importe o repositório `oquefazeremfoz`
3. Adicione as variáveis de ambiente:
   - `DATABASE_URL` (do Neon)
   - `JWT_SECRET`
   - `NEXT_PUBLIC_BASE_URL`
   - `OQFOZ_FEE_PCT`
4. Deploy automático!

---

## ⚡ Deploy Rápido

**Arquivo:** [QUICK-DEPLOY.md](./QUICK-DEPLOY.md)

Para quem já sabe o que está fazendo.

---

## 📝 Variáveis de Ambiente Necessárias

### No Vercel:

```env
DATABASE_URL=postgresql://user:pass@host.neon.tech/db?sslmode=require
JWT_SECRET=sua-chave-secreta-forte-aqui
NEXT_PUBLIC_BASE_URL=https://seu-projeto.vercel.app
OQFOZ_FEE_PCT=10
NODE_ENV=production
```

---

## 🔧 Mudanças Feitas para Deploy

✅ Schema Prisma atualizado para PostgreSQL  
✅ `package.json` com script `postinstall` para Prisma  
✅ `vercel.json` configurado  
✅ `next.config.js` otimizado para produção  
✅ `.gitignore` atualizado  
✅ Documentação completa criada  

---

## 🆘 Problemas?

1. **Erro de build:** Verifique se `prisma generate` está rodando
2. **Erro de conexão:** Confirme a `DATABASE_URL` no Vercel
3. **Tabelas não existem:** Execute `database.sql` no Neon

---

## 📚 Arquivos de Referência

- [DEPLOY.md](./DEPLOY.md) - Guia completo de deploy
- [SETUP-NEON.md](./SETUP-NEON.md) - Configuração do banco
- [QUICK-DEPLOY.md](./QUICK-DEPLOY.md) - Deploy rápido
- [database.sql](./database.sql) - SQL completo das tabelas

---

**🎉 Boa sorte com o deploy!**
