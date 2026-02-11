# Visão geral do projeto OQFOZ (O que fazer em Foz do Iguaçu)

Documento técnico após leitura completa do código: stack, arquitetura, autenticação, banco de dados, APIs, frontend, admin, hospedagem e fluxos principais.

---

## 1. Stack e configuração

| Camada | Tecnologia |
|--------|------------|
| **Framework** | Next.js 14 (App Router) |
| **Linguagem** | TypeScript |
| **Estilo** | Tailwind CSS, fontes Inter, Poppins, JetBrains Mono |
| **Banco** | PostgreSQL (Neon.tech) via Prisma 6.15 |
| **Auth** | JWT em cookie `auth-token` + sessões em tabela `session`, bcrypt para senha |
| **Upload** | Vercel Blob Storage (`@vercel/blob`) |
| **Validação** | Zod (planos, produtos) |
| **Editor rico** | TipTap (link, placeholder, underline, starter-kit) |
| **Hospedagem** | Vercel (região `gru1`), cron a cada 15 min |

Variáveis de ambiente principais: `DATABASE_URL`, `JWT_SECRET`, `NEXT_PUBLIC_BASE_URL`, `OQFOZ_FEE_PCT`, `CRON_SECRET` (para o cron de publicações agendadas). O README ainda menciona MySQL/phpMyAdmin; o projeto real usa **PostgreSQL (Neon)** e `prisma/schema.prisma`.

---

## 2. Banco de dados (Prisma / SQL)

### 2.1 Modelos principais

- **user** – email, senha (hash), nome, profileImage, activeBusinessId. Relacionamentos: business[], guide[], session[], userrole[], postlike, comment, follow, message, notification, etc.
- **userrole** – userId + role (enum: ADMIN, COMPANY, TOURIST, GUIDE). Um usuário pode ter vários roles.
- **session** – userId, token (único), expiresAt. Usado para login e validação de JWT no middleware.
- **business** – Empresa: userId, name, slug (único), description, category, address, phone, website, instagram, facebook, whatsapp, presentationVideo, coverImage, profileImage, isApproved, approvedAt, rejectedAt, likesCount, followersCount, followingCount, isVerified, etc. Relacionamentos: posts, businesscoupon, businessgallery, businesslike, businessrelease, pendingrelease, businessreview, follow (follower/following), notification.
- **guide** – Guia de turismo: userId, name, slug, description, specialties, languages, contatos, presentationVideo, isApproved, ratingAvg, ratingCount, followersCount. Relacionamentos: guidereview, guidegallery, guidepost, post (posts do guia), follow.
- **post** – businessId (opcional), guideId (opcional), title, body, imageUrl, videoUrl, likes. Pode ser de empresa ou de guia. Relacionamentos: comment, postlike, business, guide.
- **comment** – postId, userId (opcional), businessId (opcional, comentar como empresa), parentId (respostas). commentlike para curtidas em comentários.
- **postlike** – postId, userId (opcional), businessId (opcional). Cur like por usuário ou por empresa.
- **follow** – Seguir usuário, empresa ou guia: followerId/followingId (user), ou followerBusinessId/followingBusinessId, ou followerGuideId/followingGuideId.
- **businessrelease** – “Release”/notícia da empresa: businessId, title, slug (único por empresa), lead, body, featuredImageUrl, isPublished, publishedAt.
- **pendingrelease** – Conteúdo pendente/agendado (ex.: gerado por IA): businessId, title, lead, body, status (PENDING | PUBLISHED), scheduledAt, publishedReleaseId. O cron publica quando `scheduledAt <= now`.
- **businesscoupon** – Cupons da empresa: businessId, title, code, description, link, discount, validUntil, isActive.
- **businessgallery** – Fotos da galeria da empresa.
- **businessproduct** – Produtos/serviços: name, description, priceCents, productUrl, imageUrl.
- **businessreview** – Avaliações da empresa (userId, rating, comment, isVerified).
- **banner** – Banners do site: title, subtitle, link, imageUrl, isActive, order.
- **foztvvideo** – Vídeos do canal FozTV (admin): title, slug, description, videoUrl, thumbnailUrl, isPublished, order. foztvvideolike, foztvvideocomment.
- **notification** – userId (dono da empresa), businessId, type (like_post, like_comment, follow, comment), title, message, link, isRead.
- **message** / **conversation** – Mensagens entre usuários (conversationId, senderId, receiverId, content, isRead).
- **company** / **plan** / **subscription** / **product** / **order** / **review** / **coupon** / **story** / **sponsoredpost** – Modelos legados ou alternativos (company vs business; plan/subscription para planos editáveis no admin).
- **pageseo** – SEO por path: title, description, keywords, ogTitle, ogDescription, ogImage, robotsIndex, robotsFollow, canonical.
- **adminsetting** – Configurações do admin (chave/valor), ex. API Gemini, prompt do bot.

### 2.2 Enums

- **userrole_role**: ADMIN, COMPANY, TOURIST, GUIDE  
- **subscription_status**: ACTIVE, PAST_DUE, CANCELED  
- **order_status**: PAID, REFUNDED, CANCELED  

### 2.3 Índices e unicidade

O schema usa `@@index` e `@@unique` em campos como slug (business, guide), (businessId, slug) em businessrelease, (postId, userId) em postlike, (commentId, userId) em commentlike, (followerId, followingId) e variantes de follow, etc., para performance e integridade.

---

## 3. Autenticação e autorização

- **Login** (`/api/auth/login`): email + senha; bcrypt.compare; gera JWT (userId, sessionId, 7d); insere/atualiza linha em `session`; seta cookie `auth-token` (httpOnly, secure em prod, sameSite: lax, 7 dias).
- **Logout** (`/api/auth/logout`): remove sessão pelo token e limpa cookie.
- **Quem está logado** (`/api/auth/me`): lê cookie, verifyToken, busca session + user (com business, guide, userrole); retorna user com roles, activeBusinessId, businesses.
- **Middleware** (`src/middleware.ts`): em rotas protegidas (/admin, /perfil, /minhas-empresas, /empresa/dashboard, /cadastrar-empresa, /messages) exige cookie `auth-token` e verifica JWT com Web Crypto (HMAC-SHA256). Se inválido ou expirado, redireciona para /login. Sitemap e robots não passam pelo auth.
- **AuthContext** (client): chama `/api/auth/me` ao carregar; oferece login(), logout(), refreshUser(), isAdmin(), isCompany(), isTourist(). Layout do site e admin usam isso para redirecionar e mostrar UI condicional.
- **Admin**: apenas usuários com role ADMIN acessam `/admin/*`; o layout do admin checa `user.roles.includes('ADMIN')`.

---

## 4. APIs principais (resumo)

### 4.1 Públicas (ou com auth opcional)

- **GET /api/posts** – Lista posts (paginação, filtro por businessId). Só empresas aprovadas; inclui business/guide, likes, comentários; marca isLiked para o usuário atual.
- **POST /api/posts** – Criar post (empresa logada, empresa aprovada); title, body, imageUrl, videoUrl.
- **GET /api/public/feed** – Feed público (posts + últimos comentários).
- **GET /api/public/releases/recent** – Últimos releases publicados (empresas aprovadas).
- **GET /api/public/foztv** – Lista vídeos FozTV publicados.
- **GET /api/business/list** – Empresas aprovadas; para usuário logado calcula isFollowing e followersCount (via businesslike).
- **GET /api/business/slug/[slug]** – Empresa por slug.
- **GET /api/guides** – Guias aprovados (filtros search, category).
- **GET /api/guide/[slug]** – Guia por slug.
- **GET /api/coupons/recent** – Cupons recentes.
- **GET /api/weather** – Clima (provável integração OpenWeather ou similar).
- **GET /api/map/empresas** – Dados para mapa turístico.

### 4.2 Empresa / negócio (auth COMPANY ou ADMIN)

- **POST /api/business/register** – Cadastro de empresa (nome, categoria, endereço, slug opcional). Limite 3 empresas por usuário. Gera slug único; pode setar activeBusinessId.
- **PUT /api/business/cover**, **profile**, **description**, **info**, **website** – Atualização de dados da empresa.
- **POST /api/business/follow** – Seguir/deixar de seguir empresa.
- **GET /api/business/my-businesses** – Empresas do usuário.
- **POST /api/business/set-active** – Definir empresa ativa (activeBusinessId).
- **Releases**: GET/POST /api/business/releases, GET/PUT/DELETE /api/business/releases/[id].
- **Cupons, produtos, galeria**: rotas em /api/business/...

### 4.3 Guia

- **POST /api/guide/register** – Cadastro de guia (nome, especialidades, idiomas, contatos, etc.).
- **GET/PUT** profile, cover, gallery, reviews, follow, posts – análogos ao de empresa.

### 4.4 Posts e interação

- **POST /api/posts/[id]/like** – Curtir/descurtir post (user ou business).
- **GET/POST /api/posts/[id]/comments**; **POST /api/posts/comments/[commentId]/like** – Comentários e like em comentário. Notificações (like_post, like_comment, comment) para o dono da empresa via `lib/notifications.ts`.

### 4.5 Upload

- **POST /api/upload** – Upload de imagem ou vídeo (COMPANY/ADMIN). Valida tipo e tamanho (5 MB imagem, 32 MB vídeo); envia para Vercel Blob (`put()`), path `posts/{businessId}/images|videos/...`. Retorna URL pública.

### 4.6 Mensagens

- **GET /api/messages/conversations** – Lista conversas do usuário.
- **GET /api/messages/[conversationId]** – Mensagens da conversa.
- **POST /api/messages/send**, **/api/messages/start** – Enviar e iniciar conversa.

### 4.7 Notificações

- **GET /api/notifications** – Notificações do usuário (dono da empresa). createNotification usada ao like em post, like em comentário, follow e novo comentário.

### 4.8 Admin

- **Empresas**: GET/PATCH /api/admin/empresas, approve, reject, verify.
- **Guias**: GET/PATCH /api/admin/guides, approve, reject, verify.
- **Conteúdo**: pending releases (GET, concluir, publicar), publish-scheduled.
- **FozTV**: CRUD /api/admin/foztv, upload.
- **Banners**: CRUD /api/admin/banners, upload.
- **Planos**: GET/POST/PUT /api/admin/plans.
- **SEO**: GET/POST/PUT páginas em /api/admin/seo/pages.
- **Usuários**: GET/PATCH /api/admin/users, /api/admin/users/[id].
- **Configurações**: GET/PUT /api/admin/settings.
- **Bot IA**: **POST /api/admin/ai/generate** – Gera conteúdo (ex.: Gemini); **POST /api/admin/ai/release** – Publica release a partir do conteúdo (cria businessrelease). Conteúdo pode ir para pendingrelease com scheduledAt para o cron publicar depois.

### 4.9 Cron

- **GET /api/cron/publish-scheduled** – Chamado a cada 15 min (Vercel Cron). Autenticação por `CRON_SECRET` (header ou query). Busca pendingrelease com status PENDING e scheduledAt <= now; para cada um chama `publishPendingRelease(id)` em `lib/publishPendingRelease.ts` (cria businessrelease, atualiza pendingrelease para PUBLISHED e publishedReleaseId).

---

## 5. Frontend (estrutura e fluxos)

- **App Router**: `app/layout.tsx` (metadata, fonts, AuthProvider, NotificationProvider); `app/(site)/layout.tsx` (Header, Footer, FloatingChat, MobileNavigation, proteção de rotas no client); `app/admin/layout.tsx` (sidebar admin, checagem ADMIN).
- **Home** (`(site)/page.tsx`): Hero para não logados; feed com CreatePost (só COMPANY), ReleaseCarousel, timeline (posts + releases) com scroll infinito; sidebars: “Empresas em Destaque” (por categoria), “Guias em Destaque”, “Cupons do Dia”, último FozTV, clima. Follow/unfollow empresa com modal de confirmação.
- **Empresa** (`empresa/[slug]/page.tsx`): Página da empresa (dados, capa, perfil, redes, vídeo de apresentação, seguindo/seguidores, avaliações, cupons, produtos, posts, releases). Dono pode editar e criar posts/releases/cupons/produtos. Visitantes podem seguir, curtir, comentar, avaliar.
- **Guia** (`guia/[slug]/page.tsx`): Perfil do guia (avaliações, galeria, posts).
- **Outras páginas**: empresas, guias, cupons, mapa-turistico, foztv, portal, cameras-ao-vivo, o-que-fazer-em-foz-do-iguacu, login, register, cadastrar-empresa, minhas-empresas, empresa/dashboard, perfil, profile, messages, post/[id].
- **Componentes**: Header (busca, menu, notificações, dropdown usuário/empresas), Footer, MobileNavigation, PostCard, CreatePost, ReleaseCarousel, ReleaseNewsCard, FloatingChat, NotificationBell, ShareModal, FollowersModal, formulários (Post, Release, Coupon, Product, Review), RichTextEditor (TipTap), UrlPreview, SEOPanel, VerificationBadge, etc.
- **SEO**: `app/sitemap.ts` gera sitemap (URLs estáticas + empresas aprovadas com slug). `lib/pageSeo.ts` lê tabela `pageseo` e defaults por path; usado para title, description, OG, canonical, robots. Schema.org (WebSite, Organization) no layout raiz.

---

## 6. Hospedagem e deploy

- **Vercel**: `vercel.json` – framework nextjs, installCommand npm install, devCommand next dev, regions gru1, cron `*/15 * * * *` para `/api/cron/publish-scheduled`.
- **Build**: `npm run build` executa `prisma generate` e `next build`. Variáveis de ambiente no Vercel: DATABASE_URL (Neon), JWT_SECRET, NEXT_PUBLIC_BASE_URL, CRON_SECRET, etc. (ver VARIAVEIS-VERCEL*.md no repo).
- **Banco**: Neon PostgreSQL; migrations ou `prisma db push`; seed com `tsx prisma/seed.ts` (planos básico/verificado, usuários e empresas demo).
- **Blob**: Upload de imagens/vídeos em Vercel Blob (CONFIGURAR-BLOB-STORAGE.md).

---

## 7. Fluxos resumidos

1. **Cadastro empresa**: Register → login → cadastrar-empresa (POST /api/business/register) → limite 3 empresas, slug único, isApproved true no código atual (admin pode aprovar/rejeitar depois).
2. **Post**: Empresa aprovada → CreatePost → upload opcional (/api/upload) → POST /api/posts → post aparece no feed; likes/comments disparam notificações ao dono.
3. **Release**: Criar release (form) → POST business/releases → aparece no feed e em empresa/[slug]. Conteúdo pode vir do Bot IA (pending) e ser agendado (scheduledAt) → cron publica criando businessrelease.
4. **Seguir empresa**: POST /api/business/follow → follow table (por usuário ou por business); contagem de seguidores e isFollowing na listagem e na página da empresa.
5. **Mensagens**: Conversas entre usuários; rotas em /api/messages/*.
6. **Admin**: Login ADMIN → Dashboard, empresas, guias, FozTV, conteúdo (pending/scheduled), Bot IA, SEO, planos, vendas, uploads, banners, usuários, configurações.

---

## 8. Observações importantes

- O **README** fala em MySQL/phpMyAdmin; o projeto está configurado para **PostgreSQL (Neon)** e Prisma. Os SQLs na raiz (add-*.sql, create-*.sql, fix-*.sql) são scripts manuais/migrações pontuais para o Postgres.
- **Sessão**: JWT + tabela `session`; criação de sessão usa `$executeRaw` para evitar cache do Prisma após mudanças de schema. Alguns fallbacks para colunas antigas (ex.: updatedAt em session, activeBusinessId em user).
- **Follow**: Implementado para user↔user, business↔business e guide↔guide (tabela follow com vários pares de FKs).
- **Notificações**: Tipos like_post, like_comment, follow, comment; criadas em lib/notifications.ts e associadas ao userId dono da empresa (business.userId).
- **Imagens**: next.config.js com remotePatterns hostname '**' para permitir imagens externas; upload via Vercel Blob.
- **Server Actions**: bodySizeLimit 2mb em next.config (experimental.serverActions).

Este documento reflete o estado do código lido e serve como referência única para entender funções, hospedagem, SQL/Prisma e fluxos de ponta a ponta.
