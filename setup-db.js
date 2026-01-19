const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupDatabase() {
  try {
    console.log('🔄 Configurando banco de dados...');
    
    // Testar conexão
    await prisma.$connect();
    console.log('✅ Conexão com MySQL estabelecida!');
    
    // Criar planos padrão
    const basic = await prisma.plan.upsert({
      where: { name: "Básico" },
      update: {},
      create: {
        name: "Básico",
        priceCents: 1990,
        isVerified: false,
        features: ["Perfil da empresa", "Postagens", "Cupons"],
      },
    });

    const verified = await prisma.plan.upsert({
      where: { name: "Verificado" },
      update: {},
      create: {
        name: "Verificado",
        priceCents: 3990,
        isVerified: true,
        features: ["Selo verificado", "Boost no ranking", "Stories em destaque"],
      },
    });

    // Criar empresa demo
    const comp = await prisma.company.upsert({
      where: { slug: "hotel-xyz" },
      update: {},
      create: {
        name: "Hotel XYZ",
        slug: "hotel-xyz",
        description: "Hotel no centro de Foz, café da manhã incluso.",
        verified: true,
        ratingAvg: 4.5,
        ratingCount: 12,
      },
    });

    // Criar posts de exemplo
    await prisma.post.createMany({
      data: [
        { 
          companyId: comp.id, 
          title: "Promoção fim de semana", 
          body: "Diárias com 15% off para estadias de 2 ou mais noites.",
          imageUrl: "/placeholder.jpg"
        },
        { 
          companyId: comp.id, 
          title: "Piscina aquecida", 
          body: "Nossa piscina aquecida está aberta das 08h às 22h todos os dias.",
          imageUrl: "/placeholder.jpg"
        },
        { 
          companyId: comp.id, 
          title: "Café da manhã incluso", 
          body: "Desfrute do nosso café da manhã completo com produtos locais.",
          imageUrl: "/placeholder.jpg"
        },
      ],
    });

    // Criar cupons de exemplo
    await prisma.coupon.createMany({
      data: [
        {
          companyId: comp.id,
          code: "WEEKEND15",
          description: "15% de desconto em diárias de fim de semana",
          discountPct: 15,
          endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
        },
        {
          companyId: comp.id,
          code: "FOZ2024",
          description: "R$ 50 de desconto para estadias de 3+ noites",
          discountCents: 5000,
          endsAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 dias
        },
      ],
    });

    // Criar produtos de exemplo
    await prisma.product.createMany({
      data: [
        {
          companyId: comp.id,
          name: "Diária Standard",
          description: "Quarto com cama de casal, ar condicionado e TV",
          priceCents: 15000, // R$ 150,00
          stock: 10,
        },
        {
          companyId: comp.id,
          name: "Diária Premium",
          description: "Quarto com vista para a cidade, minibar e café da manhã",
          priceCents: 25000, // R$ 250,00
          stock: 5,
        },
        {
          companyId: comp.id,
          name: "Pacote Cataratas",
          description: "2 diárias + transporte para as Cataratas do Iguaçu",
          priceCents: 45000, // R$ 450,00
          stock: 8,
        },
      ],
    });

    console.log('✅ Banco de dados configurado com sucesso!');
    console.log('📊 Dados criados:');
    console.log(`   - 2 planos (${basic.name}, ${verified.name})`);
    console.log(`   - 1 empresa (${comp.name})`);
    console.log(`   - 3 posts de exemplo`);
    console.log(`   - 2 cupons de desconto`);
    console.log(`   - 3 produtos/ingressos`);
    
  } catch (error) {
    console.error('❌ Erro ao configurar banco:', error.message);
    console.log('\n🔧 Verifique se:');
    console.log('   1. O XAMPP está rodando');
    console.log('   2. O MySQL está ativo no XAMPP');
    console.log('   3. O banco "oqfoz" foi criado no phpMyAdmin');
    console.log('   4. A DATABASE_URL está correta no .env');
  } finally {
    await prisma.$disconnect();
  }
}

setupDatabase();






