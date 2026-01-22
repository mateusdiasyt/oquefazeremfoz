const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function adicionarEmpresas() {
  try {
    console.log('🏢 Adicionando empresas reais de Foz do Iguaçu...\n');

    // 1. Cataratas do Iguaçu
    console.log('🌊 Criando Cataratas do Iguaçu...');
    const cataratas = await prisma.company.create({
      data: {
        name: "Cataratas do Iguaçu",
        slug: "cataratas-do-iguacu",
        description: "Uma das Sete Maravilhas da Natureza, as Cataratas do Iguaçu são um espetáculo natural único no mundo. Com 275 quedas d'água que chegam a 80 metros de altura, oferecem uma experiência inesquecível para visitantes de todo o mundo.",
        phone: "(45) 3521-4400",
        website: "https://www.cataratasdoiguacu.com.br",
        whatsapp: "(45) 99999-0001",
        address: "Parque Nacional do Iguaçu, Foz do Iguaçu - PR",
        lat: -25.6961,
        lng: -54.4361,
        verified: true,
        ratingAvg: 4.9,
        ratingCount: 2847,
      },
    });

    // 2. Parque das Aves
    console.log('🦜 Criando Parque das Aves...');
    const parqueAves = await prisma.company.create({
      data: {
        name: "Parque das Aves",
        slug: "parque-das-aves",
        description: "O Parque das Aves é um centro de conservação de aves da Mata Atlântica, localizado próximo às Cataratas do Iguaçu. Com mais de 1.300 aves de 150 espécies diferentes, oferece uma experiência única de contato com a natureza.",
        phone: "(45) 3529-8282",
        website: "https://www.parquedasaves.com.br",
        whatsapp: "(45) 99999-0002",
        address: "Av. das Cataratas, 12450 - Vila Yolanda, Foz do Iguaçu - PR",
        lat: -25.6878,
        lng: -54.4425,
        verified: true,
        ratingAvg: 4.7,
        ratingCount: 1923,
      },
    });

    // 3. Itaipu Binacional
    console.log('⚡ Criando Itaipu Binacional...');
    const itaipu = await prisma.company.create({
      data: {
        name: "Itaipu Binacional",
        slug: "itaipu-binacional",
        description: "A maior usina hidrelétrica do mundo em geração de energia, Itaipu é uma obra de engenharia impressionante que une Brasil e Paraguai. Oferece visitas técnicas, espetáculo de luzes e muito mais.",
        phone: "(45) 3520-5252",
        website: "https://www.itaipu.gov.br",
        whatsapp: "(45) 99999-0003",
        address: "Av. Tancredo Neves, 6731 - Jardim Itaipu, Foz do Iguaçu - PR",
        lat: -25.4064,
        lng: -54.5886,
        verified: true,
        ratingAvg: 4.8,
        ratingCount: 1567,
      },
    });

    console.log('✅ 3 empresas criadas com sucesso!\n');

    // Criar posts para cada empresa
    console.log('📝 Criando posts para as empresas...');

    // Posts Cataratas
    await prisma.post.createMany({
      data: [
        {
          companyId: cataratas.id,
          title: "🌊 Temporada de Chuvas - Cataratas Mais Impressionantes",
          body: "Durante a temporada de chuvas (dezembro a março), as Cataratas ficam ainda mais espetaculares! O volume de água pode chegar a 8 vezes maior que o normal, criando um espetáculo único.",
          imageUrl: "/placeholder.jpg",
        },
        {
          companyId: cataratas.id,
          title: "🎫 Promoção Especial - Pacote Família",
          body: "Aproveite nossa promoção especial para famílias! Crianças até 5 anos não pagam e crianças de 6 a 11 anos pagam metade do valor. Válido até o final do mês.",
          imageUrl: "/placeholder.jpg",
        },
        {
          companyId: cataratas.id,
          title: "🌅 Passeio do Nascer do Sol",
          body: "Experimente a magia das Cataratas ao nascer do sol! Um passeio exclusivo que oferece uma perspectiva única deste espetáculo da natureza.",
          imageUrl: "/placeholder.jpg",
        },
      ],
    });

    // Posts Parque das Aves
    await prisma.post.createMany({
      data: [
        {
          companyId: parqueAves.id,
          title: "🦜 Novos Habitantes Chegaram!",
          body: "Damos as boas-vindas a 15 novas aves que chegaram ao nosso centro de conservação! Entre elas, araras-azuis e tucanos que foram resgatados e estão se adaptando ao novo lar.",
          imageUrl: "/placeholder.jpg",
        },
        {
          companyId: parqueAves.id,
          title: "🎓 Programa Educativo para Escolas",
          body: "Traga sua escola para uma experiência educativa única! Nosso programa especial para grupos escolares inclui visita guiada e atividades interativas sobre conservação.",
          imageUrl: "/placeholder.jpg",
        },
        {
          companyId: parqueAves.id,
          title: "📸 Momentos Únicos - Fotos com Aves",
          body: "Capture momentos únicos com nossas aves! O Parque das Aves oferece experiências especiais para fotos com araras, tucanos e outras aves nativas.",
          imageUrl: "/placeholder.jpg",
        },
      ],
    });

    // Posts Itaipu
    await prisma.post.createMany({
      data: [
        {
          companyId: itaipu.id,
          title: "⚡ Itaipu Iluminada - Espetáculo de Luzes",
          body: "Não perca o espetáculo de luzes da Itaipu! Toda noite, a usina é iluminada com um show de luzes que conta a história da energia e da água. Gratuito para todos!",
          imageUrl: "/placeholder.jpg",
        },
        {
          companyId: itaipu.id,
          title: "🔬 Visita Técnica - Como Funciona a Usina",
          body: "Descubra os segredos por trás da maior geradora de energia limpa do mundo! Nossa visita técnica explica como a água se transforma em energia elétrica.",
          imageUrl: "/placeholder.jpg",
        },
        {
          companyId: itaipu.id,
          title: "🌱 Sustentabilidade e Meio Ambiente",
          body: "A Itaipu é referência mundial em sustentabilidade! Conheça nossos projetos de preservação ambiental e como geramos energia limpa para milhões de pessoas.",
          imageUrl: "/placeholder.jpg",
        },
      ],
    });

    console.log('✅ 9 posts criados!\n');

    // Criar cupons para cada empresa
    console.log('🎫 Criando cupons de desconto...');

    await prisma.coupon.createMany({
      data: [
        {
          companyId: cataratas.id,
          code: "CATARATAS20",
          description: "20% de desconto em ingressos para as Cataratas",
          discountPct: 20,
          startsAt: new Date(),
          endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          quantity: 500,
        },
        {
          companyId: cataratas.id,
          code: "FAMILIA50",
          description: "R$ 50 de desconto no pacote família",
          discountCents: 5000,
          startsAt: new Date(),
          endsAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
          quantity: 200,
        },
        {
          companyId: parqueAves.id,
          code: "AVES15",
          description: "15% de desconto no Parque das Aves",
          discountPct: 15,
          startsAt: new Date(),
          endsAt: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
          quantity: 300,
        },
        {
          companyId: parqueAves.id,
          code: "ESCOLA30",
          description: "30% de desconto para grupos escolares",
          discountPct: 30,
          startsAt: new Date(),
          endsAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          quantity: 100,
        },
        {
          companyId: itaipu.id,
          code: "ITAIPU10",
          description: "10% de desconto na visita técnica",
          discountPct: 10,
          startsAt: new Date(),
          endsAt: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
          quantity: 400,
        },
        {
          companyId: itaipu.id,
          code: "LIGHTFREE",
          description: "Entrada gratuita no espetáculo de luzes",
          discountCents: 0,
          startsAt: new Date(),
          endsAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          quantity: 1000,
        },
      ],
    });

    console.log('✅ 6 cupons criados!\n');

    // Criar produtos/ingressos para cada empresa
    console.log('🎫 Criando produtos e ingressos...');

    await prisma.product.createMany({
      data: [
        // Cataratas
        {
          companyId: cataratas.id,
          name: "Ingresso Cataratas - Adulto",
          description: "Ingresso para acesso às Cataratas do Iguaçu (lado brasileiro). Inclui transporte interno e trilhas.",
          priceCents: 4500, // R$ 45,00
          stock: 1000,
        },
        {
          companyId: cataratas.id,
          name: "Ingresso Cataratas - Criança",
          description: "Ingresso para crianças de 6 a 11 anos. Crianças até 5 anos não pagam.",
          priceCents: 2250, // R$ 22,50
          stock: 500,
        },
        {
          companyId: cataratas.id,
          name: "Pacote Cataratas + Macuco Safari",
          description: "Ingresso para as Cataratas + passeio de barco até a Garganta do Diabo. Experiência única!",
          priceCents: 12000, // R$ 120,00
          stock: 200,
        },
        {
          companyId: cataratas.id,
          name: "Passeio do Nascer do Sol",
          description: "Passeio exclusivo ao nascer do sol nas Cataratas. Inclui café da manhã e guia especializado.",
          priceCents: 8500, // R$ 85,00
          stock: 50,
        },

        // Parque das Aves
        {
          companyId: parqueAves.id,
          name: "Ingresso Parque das Aves - Adulto",
          description: "Ingresso para o Parque das Aves. Inclui visita a todos os viveiros e apresentações.",
          priceCents: 3500, // R$ 35,00
          stock: 800,
        },
        {
          companyId: parqueAves.id,
          name: "Ingresso Parque das Aves - Criança",
          description: "Ingresso para crianças de 6 a 11 anos. Crianças até 5 anos não pagam.",
          priceCents: 1750, // R$ 17,50
          stock: 400,
        },
        {
          companyId: parqueAves.id,
          name: "Experiência com Araras",
          description: "Experiência especial para fotos com araras. Inclui fotógrafo profissional e 5 fotos digitais.",
          priceCents: 15000, // R$ 150,00
          stock: 30,
        },
        {
          companyId: parqueAves.id,
          name: "Visita Guiada para Escolas",
          description: "Visita educativa especial para grupos escolares. Inclui guia especializado e material didático.",
          priceCents: 2000, // R$ 20,00
          stock: 100,
        },

        // Itaipu
        {
          companyId: itaipu.id,
          name: "Visita Panorâmica - Adulto",
          description: "Visita panorâmica à usina de Itaipu. Inclui transporte e guia especializado.",
          priceCents: 2500, // R$ 25,00
          stock: 600,
        },
        {
          companyId: itaipu.id,
          name: "Visita Técnica - Adulto",
          description: "Visita técnica detalhada à usina. Inclui acesso a áreas restritas e explicações técnicas.",
          priceCents: 5000, // R$ 50,00
          stock: 150,
        },
        {
          companyId: itaipu.id,
          name: "Espetáculo de Luzes",
          description: "Espetáculo de luzes da Itaipu. Gratuito e aberto ao público todas as noites.",
          priceCents: 0, // Gratuito
          stock: 999999,
        },
        {
          companyId: itaipu.id,
          name: "Pacote Completo Itaipu",
          description: "Visita panorâmica + visita técnica + espetáculo de luzes. Economia de 20%!",
          priceCents: 6000, // R$ 60,00
          stock: 100,
        },
      ],
    });

    console.log('✅ 12 produtos/ingressos criados!\n');

    // Criar avaliações para cada empresa
    console.log('⭐ Criando avaliações...');

    await prisma.review.createMany({
      data: [
        // Avaliações Cataratas
        {
          companyId: cataratas.id,
          userId: (await prisma.user.findFirst({ where: { role: 'TOURIST' } }))?.id || '',
          rating: 5,
          comment: "Simplesmente espetacular! As Cataratas são de tirar o fôlego. Uma experiência única que todo mundo deveria viver pelo menos uma vez na vida.",
          verifiedBuy: true,
        },
        {
          companyId: cataratas.id,
          userId: (await prisma.user.findFirst({ where: { role: 'TOURIST' } }))?.id || '',
          rating: 5,
          comment: "O Macuco Safari é imperdível! Ficar bem próximo das quedas é uma sensação indescritível. Recomendo muito!",
          verifiedBuy: true,
        },
        {
          companyId: cataratas.id,
          userId: (await prisma.user.findFirst({ where: { role: 'TOURIST' } }))?.id || '',
          rating: 4,
          comment: "Lugar incrível! Só achei que poderia ter mais opções de alimentação no local. Mas a experiência vale muito a pena.",
          verifiedBuy: true,
        },

        // Avaliações Parque das Aves
        {
          companyId: parqueAves.id,
          userId: (await prisma.user.findFirst({ where: { role: 'TOURIST' } }))?.id || '',
          rating: 5,
          comment: "Parque lindo e bem cuidado! As aves estão em ótimas condições e o contato próximo é emocionante. Perfeito para crianças!",
          verifiedBuy: true,
        },
        {
          companyId: parqueAves.id,
          userId: (await prisma.user.findFirst({ where: { role: 'TOURIST' } }))?.id || '',
          rating: 4,
          comment: "Muito educativo e divertido! A experiência com as araras foi única. Só achei que poderia ter mais interação com outras aves.",
          verifiedBuy: true,
        },

        // Avaliações Itaipu
        {
          companyId: itaipu.id,
          userId: (await prisma.user.findFirst({ where: { role: 'TOURIST' } }))?.id || '',
          rating: 5,
          comment: "Impressionante! A visita técnica mostra a grandiosidade da obra. O espetáculo de luzes é lindo demais!",
          verifiedBuy: true,
        },
        {
          companyId: itaipu.id,
          userId: (await prisma.user.findFirst({ where: { role: 'TOURIST' } }))?.id || '',
          rating: 4,
          comment: "Muito interessante conhecer como funciona a geração de energia. A visita panorâmica já é suficiente para ter uma boa ideia.",
          verifiedBuy: true,
        },
      ],
    });

    console.log('✅ 7 avaliações criadas!\n');

    // Criar stories para cada empresa
    console.log('📱 Criando stories...');

    await prisma.story.createMany({
      data: [
        {
          companyId: cataratas.id,
          imageUrl: "/placeholder.jpg",
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
        {
          companyId: parqueAves.id,
          imageUrl: "/placeholder.jpg",
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
        {
          companyId: itaipu.id,
          imageUrl: "/placeholder.jpg",
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      ],
    });

    console.log('✅ 3 stories criados!\n');

    console.log('🎉 EMPRESAS ADICIONADAS COM SUCESSO!\n');
    console.log('📊 RESUMO:');
    console.log(`   🏢 Empresas: 3 (Cataratas, Parque das Aves, Itaipu)`);
    console.log(`   📝 Posts: 9 posts temáticos`);
    console.log(`   🎫 Cupons: 6 cupons de desconto`);
    console.log(`   🛍️ Produtos: 12 ingressos/experiências`);
    console.log(`   ⭐ Avaliações: 7 avaliações realistas`);
    console.log(`   📱 Stories: 3 stories (24h)\n`);
    
    console.log('🌊 Cataratas do Iguaçu:');
    console.log('   - Ingressos adultos e crianças');
    console.log('   - Macuco Safari');
    console.log('   - Passeio do nascer do sol');
    console.log('   - Cupons: CATARATAS20, FAMILIA50\n');
    
    console.log('🦜 Parque das Aves:');
    console.log('   - Ingressos e experiências especiais');
    console.log('   - Fotos com araras');
    console.log('   - Visitas escolares');
    console.log('   - Cupons: AVES15, ESCOLA30\n');
    
    console.log('⚡ Itaipu Binacional:');
    console.log('   - Visitas panorâmicas e técnicas');
    console.log('   - Espetáculo de luzes (gratuito)');
    console.log('   - Pacotes completos');
    console.log('   - Cupons: ITAIPU10, LIGHTFREE\n');
    
    console.log('✅ Agora você tem 3 empresas reais de Foz para usar como espelho!');

  } catch (error) {
    console.error('❌ Erro ao adicionar empresas:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

adicionarEmpresas();






