const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

const prisma = new PrismaClient();

async function setupCompleto() {
  try {
    console.log('🚀 Iniciando configuração completa do OQFOZ...\n');

    // 1. Gerar cliente Prisma
    console.log('📦 Gerando cliente Prisma...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Cliente Prisma gerado!\n');

    // 2. Criar tabelas no banco
    console.log('🗄️ Criando tabelas no banco de dados...');
    execSync('npx prisma db push', { stdio: 'inherit' });
    console.log('✅ Tabelas criadas com sucesso!\n');

    // 3. Testar conexão
    console.log('🔌 Testando conexão com o banco...');
    await prisma.$connect();
    console.log('✅ Conexão estabelecida!\n');

    // 4. Limpar dados existentes (se houver)
    console.log('🧹 Limpando dados existentes...');
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.review.deleteMany();
    await prisma.coupon.deleteMany();
    await prisma.post.deleteMany();
    await prisma.story.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.sponsoredPost.deleteMany();
    await prisma.subscription.deleteMany();
    await prisma.company.deleteMany();
    await prisma.plan.deleteMany();
    await prisma.user.deleteMany();
    console.log('✅ Dados limpos!\n');

    // 5. Criar planos
    console.log('💳 Criando planos...');
    const basic = await prisma.plan.create({
      data: {
        name: "Básico",
        priceCents: 1990, // R$ 19,90
        isVerified: false,
        isActive: true,
        features: JSON.stringify(["Perfil da empresa", "Postagens ilimitadas", "Cupons de desconto", "Suporte básico"]),
      },
    });

    const verified = await prisma.plan.create({
      data: {
        name: "Verificado",
        priceCents: 3990, // R$ 39,90
        isVerified: true,
        isActive: true,
        features: JSON.stringify(["Selo verificado", "Boost no ranking", "Stories em destaque", "Analytics avançado", "Suporte prioritário"]),
      },
    });

    const premium = await prisma.plan.create({
      data: {
        name: "Premium",
        priceCents: 7990, // R$ 79,90
        isVerified: true,
        isActive: true,
        features: JSON.stringify(["Tudo do Verificado", "Anúncios patrocinados", "API personalizada", "Integração WhatsApp", "Gerente dedicado"]),
      },
    });
    console.log(`✅ 3 planos criados: ${basic.name}, ${verified.name}, ${premium.name}\n`);

    // 6. Criar usuários
    console.log('👥 Criando usuários...');
    const admin = await prisma.user.create({
      data: {
        email: "admin@oqfoz.com",
        name: "Administrador",
        role: "ADMIN",
      },
    });

    const empresa1 = await prisma.user.create({
      data: {
        email: "contato@hotelrafain.com",
        name: "Hotel Rafain",
        role: "COMPANY",
      },
    });

    const empresa2 = await prisma.user.create({
      data: {
        email: "reservas@hotelxyz.com",
        name: "Hotel XYZ",
        role: "COMPANY",
      },
    });

    const turista = await prisma.user.create({
      data: {
        email: "joao@email.com",
        name: "João Silva",
        role: "TOURIST",
      },
    });
    console.log(`✅ 4 usuários criados\n`);

    // 7. Criar empresas
    console.log('🏢 Criando empresas...');
    const hotelRafain = await prisma.company.create({
      data: {
        name: "Hotel Rafain",
        slug: "hotel-rafain",
        description: "Hotel 5 estrelas no centro de Foz do Iguaçu, com vista para o Rio Iguaçu e próximo às principais atrações turísticas.",
        phone: "(45) 3521-3500",
        website: "https://www.rafain.com.br",
        whatsapp: "(45) 99999-9999",
        address: "Av. das Cataratas, 17450 - Vila Yolanda, Foz do Iguaçu - PR",
        lat: -25.5163,
        lng: -54.5854,
        verified: true,
        ratingAvg: 4.8,
        ratingCount: 156,
        ownerId: empresa1.id,
      },
    });

    const hotelXyz = await prisma.company.create({
      data: {
        name: "Hotel XYZ",
        slug: "hotel-xyz",
        description: "Hotel aconchegante no centro de Foz, café da manhã incluso e piscina aquecida.",
        phone: "(45) 3522-1000",
        website: "https://www.hotelxyz.com.br",
        whatsapp: "(45) 98888-8888",
        address: "Rua das Flores, 123 - Centro, Foz do Iguaçu - PR",
        lat: -25.5478,
        lng: -54.5881,
        verified: true,
        ratingAvg: 4.5,
        ratingCount: 89,
        ownerId: empresa2.id,
      },
    });

    const restaurante = await prisma.company.create({
      data: {
        name: "Restaurante Cataratas",
        slug: "restaurante-cataratas",
        description: "Culinária regional e internacional com vista panorâmica para as Cataratas do Iguaçu.",
        phone: "(45) 3523-2000",
        whatsapp: "(45) 97777-7777",
        address: "Parque Nacional do Iguaçu, Foz do Iguaçu - PR",
        lat: -25.6961,
        lng: -54.4361,
        verified: false,
        ratingAvg: 4.2,
        ratingCount: 45,
      },
    });
    console.log(`✅ 3 empresas criadas\n`);

    // 8. Criar assinaturas
    console.log('📋 Criando assinaturas...');
    await prisma.subscription.create({
      data: {
        companyId: hotelRafain.id,
        planId: premium.id,
        status: "ACTIVE",
        startedAt: new Date(),
        endsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 ano
      },
    });

    await prisma.subscription.create({
      data: {
        companyId: hotelXyz.id,
        planId: verified.id,
        status: "ACTIVE",
        startedAt: new Date(),
        endsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    });
    console.log('✅ Assinaturas criadas\n');

    // 9. Criar posts
    console.log('📝 Criando posts...');
    const posts = await prisma.post.createMany({
      data: [
        {
          companyId: hotelRafain.id,
          title: "Promoção Especial de Verão",
          body: "Aproveite nossas diárias com 20% de desconto para estadias de 3 ou mais noites. Inclui café da manhã e acesso à piscina.",
          imageUrl: "/placeholder.jpg",
        },
        {
          companyId: hotelRafain.id,
          title: "Novo Spa no Hotel Rafain",
          body: "Relaxe com nossos tratamentos exclusivos no novo spa com vista para o Rio Iguaçu. Agende já!",
          imageUrl: "/placeholder.jpg",
        },
        {
          companyId: hotelXyz.id,
          title: "Piscina Aquecida Disponível",
          body: "Nossa piscina aquecida está funcionando das 08h às 22h todos os dias. Venha relaxar!",
          imageUrl: "/placeholder.jpg",
        },
        {
          companyId: hotelXyz.id,
          title: "Café da Manhã Regional",
          body: "Desfrute do nosso café da manhã com produtos típicos da região, incluindo pão de queijo e cuca.",
          imageUrl: "/placeholder.jpg",
        },
        {
          companyId: restaurante.id,
          title: "Menu Especial Cataratas",
          body: "Experimente nosso menu especial inspirado nas Cataratas, com ingredientes frescos da região.",
          imageUrl: "/placeholder.jpg",
        },
      ],
    });
    console.log(`✅ ${posts.count} posts criados\n`);

    // 10. Criar cupons
    console.log('🎫 Criando cupons...');
    await prisma.coupon.createMany({
      data: [
        {
          companyId: hotelRafain.id,
          code: "VERAO20",
          description: "20% de desconto em diárias de verão",
          discountPct: 20,
          startsAt: new Date(),
          endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          quantity: 100,
        },
        {
          companyId: hotelRafain.id,
          code: "SPA50",
          description: "R$ 50 de desconto no spa",
          discountCents: 5000,
          startsAt: new Date(),
          endsAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          quantity: 50,
        },
        {
          companyId: hotelXyz.id,
          code: "WEEKEND15",
          description: "15% de desconto em fins de semana",
          discountPct: 15,
          startsAt: new Date(),
          endsAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
          quantity: 200,
        },
        {
          companyId: restaurante.id,
          code: "CATARATAS10",
          description: "10% de desconto no almoço",
          discountPct: 10,
          startsAt: new Date(),
          endsAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          quantity: 75,
        },
      ],
    });
    console.log('✅ 4 cupons criados\n');

    // 11. Criar produtos
    console.log('🛍️ Criando produtos...');
    await prisma.product.createMany({
      data: [
        {
          companyId: hotelRafain.id,
          name: "Diária Standard",
          description: "Quarto com cama de casal, ar condicionado, TV e vista para o rio",
          priceCents: 25000, // R$ 250,00
          stock: 15,
        },
        {
          companyId: hotelRafain.id,
          name: "Diária Premium",
          description: "Suíte com vista panorâmica, minibar e café da manhã incluso",
          priceCents: 45000, // R$ 450,00
          stock: 8,
        },
        {
          companyId: hotelRafain.id,
          name: "Pacote Cataratas Completo",
          description: "2 diárias + transporte + ingressos para as Cataratas",
          priceCents: 85000, // R$ 850,00
          stock: 12,
        },
        {
          companyId: hotelXyz.id,
          name: "Diária Simples",
          description: "Quarto confortável com ar condicionado e TV",
          priceCents: 12000, // R$ 120,00
          stock: 20,
        },
        {
          companyId: hotelXyz.id,
          name: "Diária com Café da Manhã",
          description: "Quarto + café da manhã regional incluso",
          priceCents: 18000, // R$ 180,00
          stock: 15,
        },
        {
          companyId: restaurante.id,
          name: "Almoço Executivo",
          description: "Pratos executivos com vista para as Cataratas",
          priceCents: 3500, // R$ 35,00
          stock: 50,
        },
        {
          companyId: restaurante.id,
          name: "Jantar Romântico",
          description: "Menu especial para casais com música ao vivo",
          priceCents: 8500, // R$ 85,00
          stock: 10,
        },
      ],
    });
    console.log('✅ 7 produtos criados\n');

    // 12. Criar avaliações
    console.log('⭐ Criando avaliações...');
    await prisma.review.createMany({
      data: [
        {
          companyId: hotelRafain.id,
          userId: turista.id,
          rating: 5,
          comment: "Hotel incrível! Vista espetacular e atendimento de primeira qualidade.",
          verifiedBuy: true,
        },
        {
          companyId: hotelRafain.id,
          userId: turista.id,
          rating: 4,
          comment: "Muito bom, só o Wi-Fi que poderia ser mais rápido.",
          verifiedBuy: true,
        },
        {
          companyId: hotelXyz.id,
          userId: turista.id,
          rating: 4,
          comment: "Hotel aconchegante e bem localizado. Recomendo!",
          verifiedBuy: true,
        },
        {
          companyId: restaurante.id,
          userId: turista.id,
          rating: 5,
          comment: "Comida deliciosa e vista linda das Cataratas!",
          verifiedBuy: false,
        },
      ],
    });
    console.log('✅ 4 avaliações criadas\n');

    // 13. Criar stories
    console.log('📱 Criando stories...');
    await prisma.story.createMany({
      data: [
        {
          companyId: hotelRafain.id,
          imageUrl: "/placeholder.jpg",
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
        },
        {
          companyId: hotelXyz.id,
          imageUrl: "/placeholder.jpg",
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
        {
          companyId: restaurante.id,
          imageUrl: "/placeholder.jpg",
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      ],
    });
    console.log('✅ 3 stories criados\n');

    // 14. Criar pedidos de exemplo
    console.log('🛒 Criando pedidos de exemplo...');
    const produtos = await prisma.product.findMany();
    
    await prisma.order.createMany({
      data: [
        {
          userId: turista.id,
          productId: produtos[0].id, // Diária Standard Rafain
          qty: 2,
          subtotalCts: 50000, // R$ 500,00
          feeCts: 5000, // R$ 50,00 (10%)
          totalCts: 55000, // R$ 550,00
          status: "PAID",
        },
        {
          userId: turista.id,
          productId: produtos[3].id, // Diária Simples XYZ
          qty: 1,
          subtotalCts: 12000, // R$ 120,00
          feeCts: 1200, // R$ 12,00 (10%)
          totalCts: 13200, // R$ 132,00
          status: "PAID",
        },
      ],
    });
    console.log('✅ 2 pedidos criados\n');

    // 15. Criar posts patrocinados
    console.log('📢 Criando posts patrocinados...');
    await prisma.sponsoredPost.createMany({
      data: [
        {
          companyId: hotelRafain.id,
          title: "Promoção Imperdível - Hotel Rafain",
          imageUrl: "/placeholder.jpg",
          budgetCts: 50000, // R$ 500,00
          startsAt: new Date(),
          endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
        },
        {
          companyId: hotelXyz.id,
          title: "Oferta Especial - Hotel XYZ",
          imageUrl: "/placeholder.jpg",
          budgetCts: 25000, // R$ 250,00
          startsAt: new Date(),
          endsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 dias
        },
      ],
    });
    console.log('✅ 2 posts patrocinados criados\n');

    console.log('🎉 CONFIGURAÇÃO COMPLETA FINALIZADA!\n');
    console.log('📊 RESUMO DOS DADOS CRIADOS:');
    console.log(`   👥 Usuários: 4 (1 admin, 2 empresas, 1 turista)`);
    console.log(`   🏢 Empresas: 3 (Hotel Rafain, Hotel XYZ, Restaurante)`);
    console.log(`   💳 Planos: 3 (Básico, Verificado, Premium)`);
    console.log(`   📝 Posts: 5 posts normais + 2 patrocinados`);
    console.log(`   🎫 Cupons: 4 cupons de desconto`);
    console.log(`   🛍️ Produtos: 7 produtos/ingressos`);
    console.log(`   ⭐ Avaliações: 4 avaliações`);
    console.log(`   📱 Stories: 3 stories`);
    console.log(`   🛒 Pedidos: 2 pedidos de exemplo`);
    console.log(`   📋 Assinaturas: 2 assinaturas ativas\n`);
    
    console.log('🚀 PRÓXIMOS PASSOS:');
    console.log('   1. Execute: npm run dev');
    console.log('   2. Acesse: http://localhost:3000');
    console.log('   3. Para admin: document.cookie = "role=admin; path=/" no console');
    console.log('   4. Acesse: http://localhost:3000/admin\n');
    
    console.log('✅ Tudo pronto para usar!');

  } catch (error) {
    console.error('❌ Erro durante a configuração:', error.message);
    console.log('\n🔧 VERIFICAÇÕES:');
    console.log('   1. XAMPP está rodando?');
    console.log('   2. MySQL está ativo no XAMPP?');
    console.log('   3. Banco "oqfoz" foi criado no phpMyAdmin?');
    console.log('   4. Arquivo .env está configurado?');
    console.log('   5. Dependências foram instaladas (npm install)?');
  } finally {
    await prisma.$disconnect();
  }
}

setupCompleto();
