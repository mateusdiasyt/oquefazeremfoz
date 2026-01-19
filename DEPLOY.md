# 🚀 Guia de Deploy - OQFOZ

## 📋 Pré-requisitos

1. Conta no [Vercel](https://vercel.com)
2. Conta no [Neon.tech](https://neon.tech)
3. Repositório no GitHub conectado

---

## 🗄️ Passo 1: Configurar Banco de Dados (Neon.tech)

### 1.1 Criar Projeto no Neon.tech

1. Acesse [https://neon.tech](https://neon.tech)
2. Faça login ou crie uma conta
3. Clique em **"Create a project"**
4. Escolha um nome para o projeto (ex: `oqfoz`)
5. Selecione a região mais próxima (recomendado: **São Paulo** se disponível)
6. Clique em **"Create project"**

### 1.2 Obter String de Conexão

1. No dashboard do Neon, copie a **Connection String**
2. Ela terá o formato:
   ```
   postgresql://usuario:senha@host.neon.tech/database?sslmode=require
   ```

### 1.3 Executar Migrações

**Opção A: Via Neon SQL Editor**
1. No dashboard do Neon, vá em **SQL Editor**
2. Copie o conteúdo do arquivo `database.sql`
3. Cole e execute no editor SQL

**Opção B: Via Prisma (recomendado)**
```bash
# Atualizar o schema.prisma para usar PostgreSQL
# Depois executar:
npx prisma db push
```

---

## 🌐 Passo 2: Configurar Vercel

### 2.1 Conectar Repositório

1. Acesse [https://vercel.com](https://vercel.com)
2. Faça login com sua conta GitHub
3. Clique em **"Add New Project"**
4. Selecione o repositório `oquefazeremfoz`
5. Clique em **"Import"**

### 2.2 Configurar Variáveis de Ambiente

Na página de configuração do projeto, adicione as seguintes variáveis:

#### Variáveis Obrigatórias:

```
DATABASE_URL=postgresql://usuario:senha@host.neon.tech/database?sslmode=require
```

```
JWT_SECRET=sua-chave-secreta-super-segura-aqui-mude-em-producao
```

```
NEXT_PUBLIC_BASE_URL=https://seu-projeto.vercel.app
```

```
OQFOZ_FEE_PCT=10
```

#### Variáveis Opcionais:

```
NODE_ENV=production
```

### 2.3 Configurar Build Settings

O Vercel detecta automaticamente Next.js, mas verifique:

- **Framework Preset:** Next.js
- **Build Command:** `prisma generate && next build`
- **Output Directory:** `.next` (automático)
- **Install Command:** `npm install`

### 2.4 Deploy

1. Clique em **"Deploy"**
2. Aguarde o build completar
3. Seu site estará disponível em: `https://seu-projeto.vercel.app`

---

## 🔧 Passo 3: Atualizar Schema do Prisma

O Neon.tech usa **PostgreSQL**, então precisamos atualizar o `schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  // Mudar de "mysql" para "postgresql"
  url      = env("DATABASE_URL")
}
```

Depois execute:
```bash
npx prisma generate
npx prisma db push
```

---

## 📝 Passo 4: Pós-Deploy

### 4.1 Executar Seed (Opcional)

Para popular o banco com dados iniciais:

```bash
# Localmente, com DATABASE_URL apontando para Neon
npm run prisma:seed
```

### 4.2 Verificar Funcionamento

1. Acesse a URL do Vercel
2. Teste o login/registro
3. Verifique se as páginas carregam corretamente
4. Teste as funcionalidades principais

---

## 🔄 Atualizações Futuras

Para fazer deploy de atualizações:

1. Faça commit e push para o GitHub
2. O Vercel detecta automaticamente e faz deploy
3. Ou acesse o dashboard do Vercel e clique em **"Redeploy"**

---

## 🐛 Troubleshooting

### Erro de Conexão com Banco

- Verifique se a `DATABASE_URL` está correta
- Confirme se o banco está ativo no Neon
- Verifique se o SSL está habilitado (`?sslmode=require`)

### Erro de Build

- Verifique os logs no Vercel
- Confirme se todas as dependências estão no `package.json`
- Verifique se o `prisma generate` está rodando no build

### Erro de Variáveis de Ambiente

- Confirme se todas as variáveis foram adicionadas no Vercel
- Verifique se não há espaços extras nas variáveis
- Reinicie o deploy após adicionar novas variáveis

---

## 📚 Recursos

- [Documentação Vercel](https://vercel.com/docs)
- [Documentação Neon.tech](https://neon.tech/docs)
- [Prisma com PostgreSQL](https://www.prisma.io/docs/concepts/database-connectors/postgresql)

---

## ✅ Checklist de Deploy

- [ ] Projeto criado no Neon.tech
- [ ] String de conexão copiada
- [ ] Schema Prisma atualizado para PostgreSQL
- [ ] Migrações executadas no Neon
- [ ] Projeto conectado no Vercel
- [ ] Variáveis de ambiente configuradas
- [ ] Build executado com sucesso
- [ ] Site acessível e funcionando

---

**🎉 Pronto! Seu site está no ar!**
