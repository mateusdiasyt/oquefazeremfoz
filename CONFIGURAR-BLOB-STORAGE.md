# 📸 Configurar Vercel Blob Storage para Upload de Imagens

## ❓ Por que precisa?

No **Vercel serverless**, o sistema de arquivos é **read-only**, então não podemos salvar arquivos localmente. 

Para fazer upload de imagens, precisamos usar um serviço externo. Estamos usando **Vercel Blob Storage**, que é a solução nativa do Vercel.

---

## ✅ O que acontece agora?

1. **Imagem é enviada** pelo usuário no formulário
2. **Upload para Vercel Blob Storage** (armazenamento de arquivos na nuvem)
3. **URL da imagem** é retornada pelo Vercel
4. **URL é salva no banco de dados** (Neon.tech) no campo `imageUrl`

---

## 🔧 Como configurar (Passo a Passo)

### **Passo 1: Criar Blob Store no Vercel**

1. Acesse: https://vercel.com/dashboard
2. Vá em **Storage** (menu lateral)
3. Clique em **Create Database**
4. Selecione **Blob**
5. Escolha um nome (ex: `oqfoz-images`)
6. Selecione a **região** (ex: `Washington, D.C. (iad1)` ou `São Paulo`)
7. Clique em **Create**

---

### **Passo 2: Obter o Token**

1. Na página do Blob Store criado, vá na aba **Settings**
2. Copie o **`BLOB_READ_WRITE_TOKEN`**

---

### **Passo 3: Adicionar Variável de Ambiente no Vercel**

1. No Vercel, vá no seu **projeto** (`oquefazeremfoz`)
2. Vá em **Settings** → **Environment Variables**
3. Clique em **Add New**
4. Adicione:
   - **Key**: `BLOB_READ_WRITE_TOKEN`
   - **Value**: (cole o token que você copiou)
   - **Environment**: Selecione todas as opções (Production, Preview, Development)
5. Clique em **Save**

---

### **Passo 4: Fazer Redeploy**

1. No Vercel, vá em **Deployments**
2. Clique nos **3 pontinhos** do último deploy
3. Selecione **Redeploy**
4. Aguarde 2-5 minutos

---

## ✅ Pronto!

Agora quando você cadastrar um produto com imagem:
- ✅ A imagem será enviada para o Vercel Blob Storage
- ✅ A URL da imagem será salva no banco (Neon.tech)
- ✅ A imagem aparecerá no produto

---

## 🔍 Como verificar se funcionou?

1. Cadastre um produto com imagem
2. Verifique no banco de dados (Neon.tech):
   ```sql
   SELECT id, name, "imageUrl" FROM businessproduct ORDER BY "createdAt" DESC LIMIT 1;
   ```
3. Se `imageUrl` tiver uma URL do tipo `https://...blob.vercel-storage.com/...`, funcionou! ✅

---

## ❌ Se não funcionar

### Erro: `BLOB_READ_WRITE_TOKEN is not defined`

- Verifique se adicionou a variável de ambiente no Vercel
- Verifique se fez o redeploy após adicionar

### Erro: `Upload failed`

- Verifique se o Blob Store está ativo no Vercel
- Verifique se o token está correto
- Veja os logs do Vercel para mais detalhes

---

## 📝 Nota

Se você preferir usar outro serviço de armazenamento (Cloudinary, AWS S3, etc.), podemos adaptar o código. Por enquanto, Vercel Blob Storage é a opção mais simples e integrada ao Vercel.
