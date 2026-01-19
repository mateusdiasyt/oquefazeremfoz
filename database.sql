-- ============================================
-- SQL COMPLETO - OQFOZ Database Schema
-- Baseado no schema Prisma atual
-- ============================================

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS `user` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `password` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX `User_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Roles de Usuário
CREATE TABLE IF NOT EXISTS `userrole` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `userId` VARCHAR(191) NOT NULL,
  `role` ENUM('ADMIN', 'COMPANY', 'TOURIST') NOT NULL,
  UNIQUE KEY `UserRole_userId_role_key` (`userId`, `role`),
  CONSTRAINT `UserRole_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Sessões
CREATE TABLE IF NOT EXISTS `session` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `userId` VARCHAR(191) NOT NULL,
  `token` VARCHAR(191) NOT NULL UNIQUE,
  `expiresAt` DATETIME(3) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `Session_userId_fkey` (`userId`),
  INDEX `Session_token_key` (`token`),
  CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Empresas (Business)
CREATE TABLE IF NOT EXISTS `business` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `userId` VARCHAR(191) NOT NULL UNIQUE,
  `name` VARCHAR(191) NOT NULL,
  `description` TEXT NULL,
  `category` VARCHAR(191) NOT NULL,
  `address` VARCHAR(191) NOT NULL,
  `phone` VARCHAR(191) NULL,
  `website` VARCHAR(191) NULL,
  `instagram` VARCHAR(191) NULL,
  `facebook` VARCHAR(191) NULL,
  `whatsapp` VARCHAR(191) NULL,
  `isApproved` BOOLEAN NOT NULL DEFAULT FALSE,
  `approvedAt` DATETIME(3) NULL,
  `rejectedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `coverImage` VARCHAR(191) NULL,
  `profileImage` VARCHAR(191) NULL,
  `likesCount` INT NOT NULL DEFAULT 0,
  `slug` VARCHAR(191) NOT NULL UNIQUE DEFAULT '',
  `isVerified` BOOLEAN NOT NULL DEFAULT FALSE,
  `followersCount` INT NOT NULL DEFAULT 0,
  `followingCount` INT NOT NULL DEFAULT 0,
  INDEX `Business_userId_key` (`userId`),
  INDEX `Business_slug_key` (`slug`),
  CONSTRAINT `Business_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Likes de Empresas
CREATE TABLE IF NOT EXISTS `businesslike` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `businessId` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  UNIQUE KEY `BusinessLike_businessId_userId_key` (`businessId`, `userId`),
  INDEX `BusinessLike_businessId_fkey` (`businessId`),
  INDEX `BusinessLike_userId_fkey` (`userId`),
  CONSTRAINT `BusinessLike_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `business` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `BusinessLike_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Posts
CREATE TABLE IF NOT EXISTS `post` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `businessId` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `body` TEXT NULL,
  `imageUrl` VARCHAR(191) NULL,
  `videoUrl` VARCHAR(191) NULL,
  `likes` INT NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `Post_businessId_fkey` (`businessId`),
  CONSTRAINT `Post_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `business` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Likes de Posts
CREATE TABLE IF NOT EXISTS `postlike` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `postId` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NULL,
  UNIQUE KEY `PostLike_postId_userId_key` (`postId`, `userId`),
  INDEX `PostLike_postId_fkey` (`postId`),
  INDEX `PostLike_userId_fkey` (`userId`),
  CONSTRAINT `PostLike_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `post` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `PostLike_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Comentários
CREATE TABLE IF NOT EXISTS `comment` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `postId` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NULL,
  `body` TEXT NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `Comment_postId_fkey` (`postId`),
  INDEX `Comment_userId_fkey` (`userId`),
  CONSTRAINT `Comment_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `post` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `Comment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Cupons de Empresas
CREATE TABLE IF NOT EXISTS `businesscoupon` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `businessId` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `code` VARCHAR(191) NOT NULL,
  `description` TEXT NULL,
  `link` VARCHAR(191) NULL,
  `discount` VARCHAR(191) NULL,
  `validUntil` DATETIME(3) NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT TRUE,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX `BusinessCoupon_businessId_fkey` (`businessId`),
  CONSTRAINT `BusinessCoupon_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `business` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Produtos de Empresas
CREATE TABLE IF NOT EXISTS `businessproduct` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `businessId` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `description` TEXT NULL,
  `priceCents` INT NOT NULL,
  `currency` VARCHAR(191) NOT NULL DEFAULT 'BRL',
  `productUrl` VARCHAR(191) NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT TRUE,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `imageUrl` VARCHAR(191) NULL,
  INDEX `BusinessProduct_businessId_fkey` (`businessId`),
  CONSTRAINT `BusinessProduct_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `business` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Avaliações de Empresas
CREATE TABLE IF NOT EXISTS `businessreview` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `businessId` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `rating` INT NOT NULL,
  `comment` TEXT NULL,
  `imageUrl` VARCHAR(191) NULL,
  `isVerified` BOOLEAN NOT NULL DEFAULT FALSE,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY `BusinessReview_businessId_userId_key` (`businessId`, `userId`),
  INDEX `BusinessReview_businessId_fkey` (`businessId`),
  INDEX `BusinessReview_userId_fkey` (`userId`),
  CONSTRAINT `BusinessReview_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `business` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `BusinessReview_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Seguidores (Follow)
CREATE TABLE IF NOT EXISTS `follow` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `followerId` VARCHAR(191) NOT NULL,
  `followingId` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE KEY `Follow_followerId_followingId_key` (`followerId`, `followingId`),
  INDEX `Follow_followerId_fkey` (`followerId`),
  INDEX `Follow_followingId_fkey` (`followingId`),
  CONSTRAINT `Follow_followerId_fkey` FOREIGN KEY (`followerId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Follow_followingId_fkey` FOREIGN KEY (`followingId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Conversas
CREATE TABLE IF NOT EXISTS `conversation` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Participantes de Conversas (Many-to-Many)
CREATE TABLE IF NOT EXISTS `_conversationparticipants` (
  `A` VARCHAR(191) NOT NULL,
  `B` VARCHAR(191) NOT NULL,
  UNIQUE KEY `_conversationparticipants_AB_unique` (`A`, `B`),
  INDEX `_conversationparticipants_B_index` (`B`),
  CONSTRAINT `_conversationparticipants_A_fkey` FOREIGN KEY (`A`) REFERENCES `conversation` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `_conversationparticipants_B_fkey` FOREIGN KEY (`B`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Mensagens
CREATE TABLE IF NOT EXISTS `message` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `conversationId` VARCHAR(191) NOT NULL,
  `senderId` VARCHAR(191) NOT NULL,
  `receiverId` VARCHAR(191) NOT NULL,
  `content` TEXT NOT NULL,
  `isRead` BOOLEAN NOT NULL DEFAULT FALSE,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `Message_conversationId_fkey` (`conversationId`),
  INDEX `Message_receiverId_fkey` (`receiverId`),
  INDEX `Message_senderId_fkey` (`senderId`),
  CONSTRAINT `Message_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `conversation` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Message_receiverId_fkey` FOREIGN KEY (`receiverId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Message_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Banners
CREATE TABLE IF NOT EXISTS `banner` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `title` VARCHAR(191) NOT NULL,
  `subtitle` VARCHAR(191) NOT NULL,
  `imageUrl` VARCHAR(191) NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT TRUE,
  `order` INT NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabelas Legadas (do schema antigo)
-- Mantidas para compatibilidade
-- ============================================

-- Tabela de Planos
CREATE TABLE IF NOT EXISTS `plan` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `name` VARCHAR(191) NOT NULL,
  `priceCents` INT NOT NULL,
  `currency` VARCHAR(191) NOT NULL DEFAULT 'BRL',
  `isVerified` BOOLEAN NOT NULL DEFAULT FALSE,
  `isActive` BOOLEAN NOT NULL DEFAULT TRUE,
  `features` TEXT NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Empresas (Company - legado)
CREATE TABLE IF NOT EXISTS `company` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `name` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) NOT NULL UNIQUE,
  `description` TEXT NULL,
  `phone` VARCHAR(191) NULL,
  `website` VARCHAR(191) NULL,
  `whatsapp` VARCHAR(191) NULL,
  `address` VARCHAR(191) NULL,
  `lat` DOUBLE NULL,
  `lng` DOUBLE NULL,
  `verified` BOOLEAN NOT NULL DEFAULT FALSE,
  `ratingAvg` DOUBLE NOT NULL DEFAULT 0,
  `ratingCount` INT NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `ownerId` VARCHAR(191) NULL,
  INDEX `Company_slug_key` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Assinaturas
CREATE TABLE IF NOT EXISTS `subscription` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `companyId` VARCHAR(191) NOT NULL,
  `planId` VARCHAR(191) NOT NULL,
  `status` ENUM('ACTIVE', 'PAST_DUE', 'CANCELED') NOT NULL DEFAULT 'ACTIVE',
  `startedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `endsAt` DATETIME(3) NULL,
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX `Subscription_companyId_fkey` (`companyId`),
  INDEX `Subscription_planId_fkey` (`planId`),
  CONSTRAINT `Subscription_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `Subscription_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `plan` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Cupons (Coupon - legado)
CREATE TABLE IF NOT EXISTS `coupon` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `companyId` VARCHAR(191) NOT NULL,
  `code` VARCHAR(191) NOT NULL UNIQUE,
  `description` TEXT NULL,
  `discountPct` INT NULL,
  `discountCents` INT NULL,
  `startsAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `endsAt` DATETIME(3) NULL,
  `quantity` INT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `Coupon_companyId_fkey` (`companyId`),
  CONSTRAINT `Coupon_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Produtos (Product - legado)
CREATE TABLE IF NOT EXISTS `product` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `companyId` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `description` TEXT NULL,
  `priceCents` INT NOT NULL,
  `currency` VARCHAR(191) NOT NULL DEFAULT 'BRL',
  `stock` INT NULL DEFAULT 999999,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `Product_companyId_fkey` (`companyId`),
  CONSTRAINT `Product_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Pedidos (Order)
CREATE TABLE IF NOT EXISTS `order` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `userId` VARCHAR(191) NULL,
  `productId` VARCHAR(191) NOT NULL,
  `qty` INT NOT NULL DEFAULT 1,
  `subtotalCts` INT NOT NULL,
  `feeCts` INT NOT NULL,
  `totalCts` INT NOT NULL,
  `status` ENUM('PAID', 'REFUNDED', 'CANCELED') NOT NULL DEFAULT 'PAID',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `Order_productId_fkey` (`productId`),
  INDEX `Order_userId_fkey` (`userId`),
  CONSTRAINT `Order_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `Order_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Avaliações (Review - legado)
CREATE TABLE IF NOT EXISTS `review` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `companyId` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `rating` INT NOT NULL,
  `comment` TEXT NULL,
  `verifiedBuy` BOOLEAN NOT NULL DEFAULT FALSE,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `Review_companyId_fkey` (`companyId`),
  INDEX `Review_userId_fkey` (`userId`),
  CONSTRAINT `Review_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `Review_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Stories
CREATE TABLE IF NOT EXISTS `story` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `companyId` VARCHAR(191) NOT NULL,
  `imageUrl` VARCHAR(191) NOT NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `Story_companyId_fkey` (`companyId`),
  CONSTRAINT `Story_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Posts Patrocinados
CREATE TABLE IF NOT EXISTS `sponsoredpost` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `companyId` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `imageUrl` VARCHAR(191) NULL,
  `budgetCts` INT NOT NULL,
  `startsAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `endsAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `SponsoredPost_companyId_fkey` (`companyId`),
  CONSTRAINT `SponsoredPost_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
