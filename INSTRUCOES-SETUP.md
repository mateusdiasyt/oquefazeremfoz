# 🚀 Instruções de Configuração Completa - OQFOZ

## ✅ Pré-requisitos
1. **XAMPP instalado e funcionando**
2. **Node.js instalado** (versão 16 ou superior)
3. **Navegador web**

## 🔧 Passo a Passo

### 1. **Configurar XAMPP**
1. Abra o **XAMPP Control Panel**
2. Clique em **"Start"** ao lado do **MySQL**
3. Clique em **"Start"** ao lado do **Apache** (opcional)

### 2. **Criar Banco de Dados**
1. Abra o navegador e vá para: `http://localhost/phpmyadmin`
2. Clique em **"New"** (Novo)
3. Digite o nome: `oqfoz`
4. Clique em **"Create"** (Criar)

### 3. **Configurar Projeto**
1. **Renomeie** o arquivo `env.local` para `.env`
2. **Instale as dependências:**
   ```bash
   npm install
   ```

### 4. **Executar Setup Automático**
```bash
npm run setup:completo
```

Este comando vai:
- ✅ Gerar o cliente Prisma
- ✅ Criar todas as tabelas no banco
- ✅ Popular com dados de exemplo
- ✅ Configurar usuários, empresas, produtos, etc.

### 5. **Executar o Projeto**
```bash
npm run dev
```

### 6. **Acessar o Sistema**
1. **Site público:** `http://localhost:3000`
2. **Admin:** 
   - Abra o console do navegador (F12)
   - Digite: `document.cookie = "role=admin; path=/"`
   - Acesse: `http://localhost:3000/admin`

## 📊 O que será criado automaticamente:

### 👥 **Usuários (4)**
- **Admin:** admin@oqfoz.com
- **Hotel Rafain:** contato@hotelrafain.com
- **Hotel XYZ:** reservas@hotelxyz.com
- **Turista:** joao@email.com

### 🏢 **Empresas (3)**
- **Hotel Rafain** (Premium, verificado)
- **Hotel XYZ** (Verificado)
- **Restaurante Cataratas** (Básico)

### 💳 **Planos (3)**
- **Básico:** R$ 19,90
- **Verificado:** R$ 39,90
- **Premium:** R$ 79,90

### 📝 **Conteúdo**
- **5 posts** normais
- **2 posts** patrocinados
- **4 cupons** de desconto
- **3 stories** (24h)
- **4 avaliações** com notas

### 🛍️ **Marketplace**
- **7 produtos/ingressos** variados
- **2 pedidos** de exemplo
- **Sistema de comissão** (10%)

## 🎯 Funcionalidades Testáveis

### **Site Público:**
- ✅ Feed de posts das empresas
- ✅ Páginas individuais das empresas
- ✅ Sistema de avaliações
- ✅ Cupons de desconto
- ✅ Marketplace de produtos
- ✅ Stories (placeholder)

### **Admin Panel:**
- ✅ Dashboard
- ✅ Gerenciamento de planos (CRUD)
- ✅ Visualização de empresas
- ✅ Controle de conteúdo
- ✅ Relatórios de vendas
- ✅ Configurações

## 🔧 Solução de Problemas

### **Erro de Conexão:**
- Verifique se o MySQL está rodando no XAMPP
- Confirme se o banco `oqfoz` foi criado
- Verifique se o arquivo `.env` está correto

### **Erro de Dependências:**
- Execute: `npm install` novamente
- Verifique se o Node.js está atualizado

### **Erro de Permissões:**
- Execute o terminal como administrador
- Verifique as permissões da pasta do projeto

## 📞 Suporte

Se encontrar algum problema, verifique:
1. ✅ XAMPP está rodando
2. ✅ MySQL está ativo
3. ✅ Banco `oqfoz` existe
4. ✅ Arquivo `.env` está configurado
5. ✅ Dependências foram instaladas

---

**🎉 Após seguir estes passos, você terá um sistema completo funcionando!**






