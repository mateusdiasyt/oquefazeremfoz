# 🗄️ Configuração do Neon.tech

## Passo a Passo

### 1. Criar Conta e Projeto

1. Acesse [https://neon.tech](https://neon.tech)
2. Faça login ou crie uma conta (pode usar GitHub)
3. Clique em **"Create a project"**
4. Preencha:
   - **Project name:** `oqfoz`
   - **Region:** Escolha a mais próxima (São Paulo se disponível)
   - **PostgreSQL version:** 15 ou superior
5. Clique em **"Create project"**

### 2. Obter String de Conexão

1. No dashboard do projeto, você verá a **Connection String**
2. Ela terá o formato:
   ```
   postgresql://[user]:[password]@[host].neon.tech/[database]?sslmode=require
   ```
3. **Copie essa string** - você precisará dela no Vercel

### 3. Criar Tabelas no Banco

Você tem 3 opções:

#### Opção A: Via SQL Editor (Mais Rápido)

1. No dashboard do Neon, clique em **"SQL Editor"**
2. Clique em **"New query"**
3. Copie todo o conteúdo do arquivo `database.sql`
4. Cole no editor e clique em **"Run"**
5. Aguarde a confirmação de sucesso

#### Opção B: Via Prisma (Recomendado)

1. Configure a variável de ambiente localmente:
   ```bash
   # No arquivo .env
   DATABASE_URL="postgresql://[sua-string-do-neon]"
   ```

2. Execute:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

#### Opção C: Via Migrations (Mais Profissional)

```bash
npx prisma migrate dev --name init
```

### 4. Verificar Conexão

Teste a conexão:

```bash
npx prisma studio
```

Isso abrirá o Prisma Studio e você poderá ver todas as tabelas.

### 5. Popular Dados Iniciais (Opcional)

Se quiser dados de exemplo:

```bash
npm run prisma:seed
```

---

## 🔒 Segurança

- ✅ A conexão usa SSL por padrão (`sslmode=require`)
- ✅ Cada projeto tem credenciais únicas
- ✅ Você pode resetar a senha a qualquer momento
- ✅ Use variáveis de ambiente no Vercel (nunca commite a string de conexão)

---

## 📊 Monitoramento

No dashboard do Neon você pode:
- Ver estatísticas de uso
- Monitorar queries
- Ver logs de conexão
- Gerenciar branches (para desenvolvimento)

---

## 💡 Dicas

1. **Free Tier:** O Neon oferece um tier gratuito generoso para começar
2. **Backups:** Automáticos e incluídos
3. **Performance:** Escolha a região mais próxima dos seus usuários
4. **Scaling:** Fácil de escalar quando necessário

---

## 🆘 Problemas Comuns

### Erro: "Connection refused"
- Verifique se copiou a string completa
- Confirme que o projeto está ativo no Neon
- Verifique se o SSL está habilitado

### Erro: "Table does not exist"
- Execute o `database.sql` ou `prisma db push`
- Verifique se está conectado ao banco correto

### Erro: "Authentication failed"
- Verifique usuário e senha na string de conexão
- Tente resetar a senha no dashboard do Neon

---

**Próximo passo:** Configure o Vercel (veja [DEPLOY.md](./DEPLOY.md))
