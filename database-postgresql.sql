-- ============================================
-- SQL COMPLETO - OQFOZ Database Schema
-- PostgreSQL (Neon.tech)
-- ============================================

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS "user" (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  email VARCHAR(191) NOT NULL UNIQUE,
  password VARCHAR(191) NOT NULL,
  name VARCHAR(191) NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "User_email_key" ON "user" (email);

-- Tabela de Roles de Usuário
CREATE TABLE IF NOT EXISTS "userrole" (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  "userId" VARCHAR(191) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('ADMIN', 'COMPANY', 'TOURIST')),
  UNIQUE ("userId", role),
  CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" (id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Tabela de Sessões
CREATE TABLE IF NOT EXISTS "session" (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  "userId" VARCHAR(191) NOT NULL,
  token VARCHAR(191) NOT NULL UNIQUE,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" (id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "Session_userId_fkey" ON "session" ("userId");
CREATE INDEX IF NOT EXISTS "Session_token_key" ON "session" (token);

-- Tabela de Empresas (Business)
CREATE TABLE IF NOT EXISTS "business" (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  "userId" VARCHAR(191) NOT NULL UNIQUE,
  name VARCHAR(191) NOT NULL,
  description TEXT NULL,
  category VARCHAR(191) NOT NULL,
  address VARCHAR(191) NOT NULL,
  phone VARCHAR(191) NULL,
  website VARCHAR(191) NULL,
  instagram VARCHAR(191) NULL,
  facebook VARCHAR(191) NULL,
  whatsapp VARCHAR(191) NULL,
  "isApproved" BOOLEAN NOT NULL DEFAULT FALSE,
  "approvedAt" TIMESTAMP(3) NULL,
  "rejectedAt" TIMESTAMP(3) NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "coverImage" VARCHAR(191) NULL,
  "profileImage" VARCHAR(191) NULL,
  "likesCount" INTEGER NOT NULL DEFAULT 0,
  slug VARCHAR(191) NOT NULL UNIQUE DEFAULT '',
  "isVerified" BOOLEAN NOT NULL DEFAULT FALSE,
  "followersCount" INTEGER NOT NULL DEFAULT 0,
  "followingCount" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "Business_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" (id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "Business_userId_key" ON "business" ("userId");
CREATE INDEX IF NOT EXISTS "Business_slug_key" ON "business" (slug);

-- Tabela de Likes de Empresas
CREATE TABLE IF NOT EXISTS "businesslike" (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  "businessId" VARCHAR(191) NOT NULL,
  "userId" VARCHAR(191) NOT NULL,
  UNIQUE ("businessId", "userId"),
  CONSTRAINT "BusinessLike_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business" (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "BusinessLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" (id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "BusinessLike_businessId_fkey" ON "businesslike" ("businessId");
CREATE INDEX IF NOT EXISTS "BusinessLike_userId_fkey" ON "businesslike" ("userId");

-- Tabela de Posts
CREATE TABLE IF NOT EXISTS "post" (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  "businessId" VARCHAR(191) NOT NULL,
  title VARCHAR(191) NOT NULL,
  body TEXT NULL,
  "imageUrl" VARCHAR(191) NULL,
  "videoUrl" VARCHAR(191) NULL,
  likes INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Post_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business" (id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "Post_businessId_fkey" ON "post" ("businessId");

-- Tabela de Likes de Posts
CREATE TABLE IF NOT EXISTS "postlike" (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  "postId" VARCHAR(191) NOT NULL,
  "userId" VARCHAR(191) NULL,
  UNIQUE ("postId", "userId"),
  CONSTRAINT "PostLike_postId_fkey" FOREIGN KEY ("postId") REFERENCES "post" (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "PostLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" (id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "PostLike_postId_fkey" ON "postlike" ("postId");
CREATE INDEX IF NOT EXISTS "PostLike_userId_fkey" ON "postlike" ("userId");

-- Tabela de Comentários
CREATE TABLE IF NOT EXISTS "comment" (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  "postId" VARCHAR(191) NOT NULL,
  "userId" VARCHAR(191) NULL,
  body TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "post" (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" (id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "Comment_postId_fkey" ON "comment" ("postId");
CREATE INDEX IF NOT EXISTS "Comment_userId_fkey" ON "comment" ("userId");

-- Tabela de Cupons de Empresas
CREATE TABLE IF NOT EXISTS "businesscoupon" (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  "businessId" VARCHAR(191) NOT NULL,
  title VARCHAR(191) NOT NULL,
  code VARCHAR(191) NOT NULL,
  description TEXT NULL,
  link VARCHAR(191) NULL,
  discount VARCHAR(191) NULL,
  "validUntil" TIMESTAMP(3) NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BusinessCoupon_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business" (id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "BusinessCoupon_businessId_fkey" ON "businesscoupon" ("businessId");

-- Tabela de Produtos de Empresas
CREATE TABLE IF NOT EXISTS "businessproduct" (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  "businessId" VARCHAR(191) NOT NULL,
  name VARCHAR(191) NOT NULL,
  description TEXT NULL,
  "priceCents" INTEGER NOT NULL,
  currency VARCHAR(191) NOT NULL DEFAULT 'BRL',
  "productUrl" VARCHAR(191) NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "imageUrl" VARCHAR(191) NULL,
  CONSTRAINT "BusinessProduct_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business" (id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "BusinessProduct_businessId_fkey" ON "businessproduct" ("businessId");

-- Tabela de Avaliações de Empresas
CREATE TABLE IF NOT EXISTS "businessreview" (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  "businessId" VARCHAR(191) NOT NULL,
  "userId" VARCHAR(191) NOT NULL,
  rating INTEGER NOT NULL,
  comment TEXT NULL,
  "imageUrl" VARCHAR(191) NULL,
  "isVerified" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("businessId", "userId"),
  CONSTRAINT "BusinessReview_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business" (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "BusinessReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" (id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "BusinessReview_businessId_fkey" ON "businessreview" ("businessId");
CREATE INDEX IF NOT EXISTS "BusinessReview_userId_fkey" ON "businessreview" ("userId");

-- Tabela de Seguidores (Follow)
CREATE TABLE IF NOT EXISTS "follow" (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  "followerId" VARCHAR(191) NOT NULL,
  "followingId" VARCHAR(191) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("followerId", "followingId"),
  CONSTRAINT "Follow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "user" (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Follow_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "user" (id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "Follow_followerId_fkey" ON "follow" ("followerId");
CREATE INDEX IF NOT EXISTS "Follow_followingId_fkey" ON "follow" ("followingId");

-- Tabela de Conversas
CREATE TABLE IF NOT EXISTS "conversation" (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Participantes de Conversas (Many-to-Many)
CREATE TABLE IF NOT EXISTS "_conversationparticipants" (
  "A" VARCHAR(191) NOT NULL,
  "B" VARCHAR(191) NOT NULL,
  UNIQUE ("A", "B"),
  CONSTRAINT "_conversationparticipants_A_fkey" FOREIGN KEY ("A") REFERENCES "conversation" (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "_conversationparticipants_B_fkey" FOREIGN KEY ("B") REFERENCES "user" (id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "_conversationparticipants_B_index" ON "_conversationparticipants" ("B");

-- Tabela de Mensagens
CREATE TABLE IF NOT EXISTS "message" (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  "conversationId" VARCHAR(191) NOT NULL,
  "senderId" VARCHAR(191) NOT NULL,
  "receiverId" VARCHAR(191) NOT NULL,
  content TEXT NOT NULL,
  "isRead" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversation" (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Message_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "user" (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "user" (id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "Message_conversationId_fkey" ON "message" ("conversationId");
CREATE INDEX IF NOT EXISTS "Message_receiverId_fkey" ON "message" ("receiverId");
CREATE INDEX IF NOT EXISTS "Message_senderId_fkey" ON "message" ("senderId");

-- Tabela de Banners
CREATE TABLE IF NOT EXISTS "banner" (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  title VARCHAR(191) NOT NULL,
  subtitle VARCHAR(191) NOT NULL,
  "imageUrl" VARCHAR(191) NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "order" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Tabelas Legadas (do schema antigo)
-- Mantidas para compatibilidade
-- ============================================

-- Tabela de Planos
CREATE TABLE IF NOT EXISTS "plan" (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  name VARCHAR(191) NOT NULL,
  "priceCents" INTEGER NOT NULL,
  currency VARCHAR(191) NOT NULL DEFAULT 'BRL',
  "isVerified" BOOLEAN NOT NULL DEFAULT FALSE,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  features TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Empresas (Company - legado)
CREATE TABLE IF NOT EXISTS "company" (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  name VARCHAR(191) NOT NULL,
  slug VARCHAR(191) NOT NULL UNIQUE,
  description TEXT NULL,
  phone VARCHAR(191) NULL,
  website VARCHAR(191) NULL,
  whatsapp VARCHAR(191) NULL,
  address VARCHAR(191) NULL,
  lat DOUBLE PRECISION NULL,
  lng DOUBLE PRECISION NULL,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  "ratingAvg" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "ratingCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "ownerId" VARCHAR(191) NULL
);

CREATE INDEX IF NOT EXISTS "Company_slug_key" ON "company" (slug);

-- Tabela de Assinaturas
CREATE TABLE IF NOT EXISTS "subscription" (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  "companyId" VARCHAR(191) NOT NULL,
  "planId" VARCHAR(191) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PAST_DUE', 'CANCELED')),
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "endsAt" TIMESTAMP(3) NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Subscription_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company" (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plan" (id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "Subscription_companyId_fkey" ON "subscription" ("companyId");
CREATE INDEX IF NOT EXISTS "Subscription_planId_fkey" ON "subscription" ("planId");

-- Tabela de Cupons (Coupon - legado)
CREATE TABLE IF NOT EXISTS "coupon" (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  "companyId" VARCHAR(191) NOT NULL,
  code VARCHAR(191) NOT NULL UNIQUE,
  description TEXT NULL,
  "discountPct" INTEGER NULL,
  "discountCents" INTEGER NULL,
  "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "endsAt" TIMESTAMP(3) NULL,
  quantity INTEGER NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Coupon_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company" (id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "Coupon_companyId_fkey" ON "coupon" ("companyId");

-- Tabela de Produtos (Product - legado)
CREATE TABLE IF NOT EXISTS "product" (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  "companyId" VARCHAR(191) NOT NULL,
  name VARCHAR(191) NOT NULL,
  description TEXT NULL,
  "priceCents" INTEGER NOT NULL,
  currency VARCHAR(191) NOT NULL DEFAULT 'BRL',
  stock INTEGER NULL DEFAULT 999999,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Product_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company" (id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "Product_companyId_fkey" ON "product" ("companyId");

-- Tabela de Pedidos (Order)
CREATE TABLE IF NOT EXISTS "order" (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  "userId" VARCHAR(191) NULL,
  "productId" VARCHAR(191) NOT NULL,
  qty INTEGER NOT NULL DEFAULT 1,
  "subtotalCts" INTEGER NOT NULL,
  "feeCts" INTEGER NOT NULL,
  "totalCts" INTEGER NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'PAID' CHECK (status IN ('PAID', 'REFUNDED', 'CANCELED')),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Order_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product" (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" (id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "Order_productId_fkey" ON "order" ("productId");
CREATE INDEX IF NOT EXISTS "Order_userId_fkey" ON "order" ("userId");

-- Tabela de Avaliações (Review - legado)
CREATE TABLE IF NOT EXISTS "review" (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  "companyId" VARCHAR(191) NOT NULL,
  "userId" VARCHAR(191) NOT NULL,
  rating INTEGER NOT NULL,
  comment TEXT NULL,
  "verifiedBuy" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Review_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company" (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" (id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "Review_companyId_fkey" ON "review" ("companyId");
CREATE INDEX IF NOT EXISTS "Review_userId_fkey" ON "review" ("userId");

-- Tabela de Stories
CREATE TABLE IF NOT EXISTS "story" (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  "companyId" VARCHAR(191) NOT NULL,
  "imageUrl" VARCHAR(191) NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Story_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company" (id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "Story_companyId_fkey" ON "story" ("companyId");

-- Tabela de Posts Patrocinados
CREATE TABLE IF NOT EXISTS "sponsoredpost" (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  "companyId" VARCHAR(191) NOT NULL,
  title VARCHAR(191) NOT NULL,
  "imageUrl" VARCHAR(191) NULL,
  "budgetCts" INTEGER NOT NULL,
  "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "endsAt" TIMESTAMP(3) NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SponsoredPost_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company" (id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "SponsoredPost_companyId_fkey" ON "sponsoredpost" ("companyId");

-- Função para atualizar updatedAt automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updatedAt
CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "user" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_business_updated_at BEFORE UPDATE ON "business" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversation_updated_at BEFORE UPDATE ON "conversation" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_banner_updated_at BEFORE UPDATE ON "banner" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_businesscoupon_updated_at BEFORE UPDATE ON "businesscoupon" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_businessproduct_updated_at BEFORE UPDATE ON "businessproduct" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_businessreview_updated_at BEFORE UPDATE ON "businessreview" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_plan_updated_at BEFORE UPDATE ON "plan" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_company_updated_at BEFORE UPDATE ON "company" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscription_updated_at BEFORE UPDATE ON "subscription" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
