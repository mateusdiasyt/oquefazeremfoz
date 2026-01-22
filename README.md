# OQFOZ — Starter

> **Stack**: Next.js 14 (App Router) + TypeScript + Tailwind + shadcn/ui + Prisma (MySQL) + Zod.
> **Banco**: MySQL (gerenciado no **phpMyAdmin**).
> **Nome do site**: **oquefazeremfoz.com.br** (abreviado **OQFOZ**)

Este starter entrega:

* **Banco pronto** (schema Prisma **e** SQL para importar no phpMyAdmin)
* **MVP funcional de vitrine** (feed, stories placeholder, coluna patrocinada)
* **Página de Empresa** com avaliações e cupons
* **Marketplace** básico (produtos/ingressos + pedidos) com suporte a comissão
* **Planos editáveis** (CRUD no admin: valores, nome, descrição, features, status)
* **Admin Panel** inicial (Dashboard, Empresas, Planos, Conteúdo, Vendas, Config)

> **Observação**: autenticação está em modo **stub** neste MVP (sem NextAuth), para você testar imediatamente. Há um middleware simples que lê um cookie `role=admin` para liberar o /admin. Você pode plugar NextAuth depois.

## 1) Banco (phpMyAdmin)

- Crie um banco `oqfoz` no MySQL.
- Se quiser **sem Prisma**, importe o SQL abaixo (seção 2.2).
- Se quiser **com Prisma**:
  - Configure `DATABASE_URL` no `.env`.
  - Rode `npm i`.
  - `npm run prisma:gen && npm run prisma:push && npm run prisma:seed`.

## 2) Desenvolvimento

- Defina `NEXT_PUBLIC_BASE_URL=http://localhost:3000` no `.env`.
- `npm run dev`
- Acesse `http://localhost:3000`
- Para entrar no admin sem auth: abra o console do navegador e rode:  
  `document.cookie = "role=admin; path=/"`  
  então acesse `http://localhost:3000/admin`.

## 3) Planos Editáveis

- Vá em **Admin → Planos** para criar/editar planos (R$ 19,90 / R$ 39,90 ou novos).

## 4) Próximos passos

- Plugar **NextAuth** (Google/Email) e roles reais.
- Implementar **pagamentos recorrentes** (Mercado Pago) e **split** de comissão.
- Moderação de conteúdo, anúncios patrocinados, e SEO multilíngue.

## SQL para importar no phpMyAdmin (alternativa ao Prisma)

```sql
CREATE TABLE users (
  id VARCHAR(191) PRIMARY KEY,
  email VARCHAR(191) UNIQUE NOT NULL,
  name VARCHAR(191) NULL,
  role ENUM('ADMIN','COMPANY','TOURIST') NOT NULL DEFAULT 'TOURIST',
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE plans (
  id VARCHAR(191) PRIMARY KEY,
  name VARCHAR(191) NOT NULL,
  priceCents INT NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'BRL',
  isVerified TINYINT(1) NOT NULL DEFAULT 0,
  isActive TINYINT(1) NOT NULL DEFAULT 1,
  features JSON NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE companies (
  id VARCHAR(191) PRIMARY KEY,
  name VARCHAR(191) NOT NULL,
  slug VARCHAR(191) UNIQUE NOT NULL,
  description TEXT NULL,
  phone VARCHAR(64) NULL,
  website VARCHAR(191) NULL,
  whatsapp VARCHAR(64) NULL,
  address VARCHAR(255) NULL,
  lat DOUBLE NULL,
  lng DOUBLE NULL,
  verified TINYINT(1) NOT NULL DEFAULT 0,
  ratingAvg DOUBLE NOT NULL DEFAULT 0,
  ratingCount INT NOT NULL DEFAULT 0,
  ownerId VARCHAR(191) NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX(slug)
) ENGINE=InnoDB;

CREATE TABLE subscriptions (
  id VARCHAR(191) PRIMARY KEY,
  companyId VARCHAR(191) NOT NULL,
  planId VARCHAR(191) NOT NULL,
  status ENUM('ACTIVE','PAST_DUE','CANCELED') NOT NULL DEFAULT 'ACTIVE',
  startedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  endsAt DATETIME NULL,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (companyId) REFERENCES companies(id),
  FOREIGN KEY (planId) REFERENCES plans(id)
) ENGINE=InnoDB;

CREATE TABLE posts (
  id VARCHAR(191) PRIMARY KEY,
  companyId VARCHAR(191) NOT NULL,
  title VARCHAR(191) NOT NULL,
  body TEXT NULL,
  imageUrl VARCHAR(255) NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (companyId) REFERENCES companies(id)
) ENGINE=InnoDB;

CREATE TABLE comments (
  id VARCHAR(191) PRIMARY KEY,
  postId VARCHAR(191) NOT NULL,
  userId VARCHAR(191) NULL,
  body TEXT NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (postId) REFERENCES posts(id),
  FOREIGN KEY (userId) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE stories (
  id VARCHAR(191) PRIMARY KEY,
  companyId VARCHAR(191) NOT NULL,
  imageUrl VARCHAR(255) NOT NULL,
  expiresAt DATETIME NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (companyId) REFERENCES companies(id)
) ENGINE=InnoDB;

CREATE TABLE coupons (
  id VARCHAR(191) PRIMARY KEY,
  companyId VARCHAR(191) NOT NULL,
  code VARCHAR(64) UNIQUE NOT NULL,
  description TEXT NULL,
  discountPct INT NULL,
  discountCents INT NULL,
  startsAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  endsAt DATETIME NULL,
  quantity INT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (companyId) REFERENCES companies(id)
) ENGINE=InnoDB;

CREATE TABLE reviews (
  id VARCHAR(191) PRIMARY KEY,
  companyId VARCHAR(191) NOT NULL,
  userId VARCHAR(191) NOT NULL,
  rating INT NOT NULL,
  comment TEXT NULL,
  verifiedBuy TINYINT(1) NOT NULL DEFAULT 0,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (companyId) REFERENCES companies(id),
  FOREIGN KEY (userId) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE products (
  id VARCHAR(191) PRIMARY KEY,
  companyId VARCHAR(191) NOT NULL,
  name VARCHAR(191) NOT NULL,
  description TEXT NULL,
  priceCents INT NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'BRL',
  stock INT NULL DEFAULT 999999,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (companyId) REFERENCES companies(id)
) ENGINE=InnoDB;

CREATE TABLE orders (
  id VARCHAR(191) PRIMARY KEY,
  userId VARCHAR(191) NULL,
  productId VARCHAR(191) NOT NULL,
  qty INT NOT NULL DEFAULT 1,
  subtotalCts INT NOT NULL,
  feeCts INT NOT NULL,
  totalCts INT NOT NULL,
  status ENUM('PAID','REFUNDED','CANCELED') NOT NULL DEFAULT 'PAID',
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (productId) REFERENCES products(id)
) ENGINE=InnoDB;

CREATE TABLE sponsored_posts (
  id VARCHAR(191) PRIMARY KEY,
  companyId VARCHAR(191) NOT NULL,
  title VARCHAR(191) NOT NULL,
  imageUrl VARCHAR(255) NULL,
  budgetCts INT NOT NULL,
  startsAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  endsAt DATETIME NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (companyId) REFERENCES companies(id)
) ENGINE=InnoDB;
```






