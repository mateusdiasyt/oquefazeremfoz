const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

async function populateDatabase() {
  try {
    console.log('🌱 Iniciando população do banco de dados...');

    // 1. Criar usuários
    console.log('👤 Criando usuários...');
    
    const adminUser = await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        email: 'admin@oquefazeremfoz.com',
        password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        name: 'Administrador',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    const touristUser = await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        email: 'turista@email.com',
        password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        name: 'João Turista',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    const businessUser1 = await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        email: 'hotel@cataratas.com',
        password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        name: 'Hotel das Cataratas',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    const businessUser2 = await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        email: 'parque@aves.com',
        password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        name: 'Parque das Aves',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    // 2. Criar roles para usuários
    console.log('🔐 Criando roles de usuários...');
    
    await prisma.userrole.create({
      data: {
        id: crypto.randomUUID(),
        userId: adminUser.id,
        role: 'ADMIN'
      }
    });

    await prisma.userrole.create({
      data: {
        id: crypto.randomUUID(),
        userId: touristUser.id,
        role: 'TOURIST'
      }
    });

    await prisma.userrole.create({
      data: {
        id: crypto.randomUUID(),
        userId: businessUser1.id,
        role: 'COMPANY'
      }
    });

    await prisma.userrole.create({
      data: {
        id: crypto.randomUUID(),
        userId: businessUser2.id,
        role: 'COMPANY'
      }
    });

    // 3. Criar empresas
    console.log('🏢 Criando empresas...');
    
    const hotelBusiness = await prisma.business.create({
      data: {
        id: crypto.randomUUID(),
        userId: businessUser1.id,
        name: 'Hotel das Cataratas',
        description: 'Hotel de luxo localizado dentro do Parque Nacional do Iguaçu, oferecendo vista privilegiada das Cataratas.',
        category: 'Hospedagem',
        address: 'Rodovia das Cataratas, km 32, Foz do Iguaçu, PR',
        phone: '(45) 2102-7000',
        website: 'https://www.belmond.com/hotels/south-america/brazil/iguazu-falls/belmond-hotel-das-cataratas/',
        instagram: '@hotelcataratas',
        whatsapp: '5545999887766',
        isApproved: true,
        isVerified: true,
        slug: 'hotel-das-cataratas',
        likesCount: 150,
        followersCount: 1200,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    const parqueBusiness = await prisma.business.create({
      data: {
        id: crypto.randomUUID(),
        userId: businessUser2.id,
        name: 'Parque das Aves',
        description: 'Santuário de aves da Mata Atlântica com mais de 1.400 aves de 150 espécies diferentes.',
        category: 'Turismo',
        address: 'Rodovia das Cataratas, km 17.1, Foz do Iguaçu, PR',
        phone: '(45) 3529-8282',
        website: 'https://www.parquedasaves.com.br/',
        instagram: '@parquedasaves',
        whatsapp: '5545999554433',
        isApproved: true,
        isVerified: true,
        slug: 'parque-das-aves',
        likesCount: 89,
        followersCount: 850,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    // 4. Criar posts
    console.log('📝 Criando posts...');
    
    const post1 = await prisma.post.create({
      data: {
        id: crypto.randomUUID(),
        businessId: hotelBusiness.id,
        title: 'Vista Espetacular das Cataratas',
        body: 'Acorde todos os dias com a vista mais incrível do mundo! Nossos quartos oferecem vista privilegiada das Cataratas do Iguaçu. Uma experiência única que você nunca esquecerá. 🌊✨',
        imageUrl: '/uploads/images/hotel-cataratas-vista.jpg',
        likes: 45,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 dias atrás
      }
    });

    const post2 = await prisma.post.create({
      data: {
        id: crypto.randomUUID(),
        businessId: hotelBusiness.id,
        title: 'Jantar Romântico no Restaurante',
        body: 'Desfrute de um jantar romântico em nosso restaurante com vista para as Cataratas. Menu especial com pratos da culinária internacional e brasileira. Reserve já! 🍽️❤️',
        imageUrl: '/uploads/images/hotel-restaurante.jpg',
        likes: 32,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 dia atrás
      }
    });

    const post3 = await prisma.post.create({
      data: {
        id: crypto.randomUUID(),
        businessId: parqueBusiness.id,
        title: 'Tucanos Coloridos em Liberdade',
        body: 'Venha conhecer nossos tucanos! Mais de 50 tucanos de diferentes espécies vivem em nossos viveiros de imersão. Uma experiência única de contato com a natureza! 🦜🌿',
        imageUrl: '/uploads/images/parque-tucanos.jpg',
        likes: 67,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 dias atrás
      }
    });

    const post4 = await prisma.post.create({
      data: {
        id: crypto.randomUUID(),
        businessId: parqueBusiness.id,
        title: 'Borboletário Encantado',
        body: 'Caminhe entre centenas de borboletas tropicais em nosso borboletário! Um ambiente mágico onde você pode observar de perto esses seres incríveis. Aberto todos os dias! 🦋🌺',
        imageUrl: '/uploads/images/parque-borboletas.jpg',
        likes: 89,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // 4 dias atrás
      }
    });

    // 5. Criar likes nos posts
    console.log('👍 Criando likes nos posts...');
    
    await prisma.postlike.create({
      data: {
        id: crypto.randomUUID(),
        postId: post1.id,
        userId: touristUser.id
      }
    });

    await prisma.postlike.create({
      data: {
        id: crypto.randomUUID(),
        postId: post3.id,
        userId: touristUser.id
      }
    });

    // 6. Criar comentários
    console.log('💬 Criando comentários...');
    
    await prisma.comment.create({
      data: {
        id: crypto.randomUUID(),
        postId: post1.id,
        userId: touristUser.id,
        body: 'Que vista incrível! Já estou planejando minha próxima visita! 😍',
        createdAt: new Date()
      }
    });

    await prisma.comment.create({
      data: {
        id: crypto.randomUUID(),
        postId: post3.id,
        userId: touristUser.id,
        body: 'Os tucanos são lindos! Meus filhos adoraram a visita! 🦜❤️',
        createdAt: new Date()
      }
    });

    // 7. Criar avaliações
    console.log('⭐ Criando avaliações...');
    
    await prisma.businessreview.create({
      data: {
        id: crypto.randomUUID(),
        businessId: hotelBusiness.id,
        userId: touristUser.id,
        rating: 5,
        comment: 'Hotel excepcional! Atendimento impecável e vista das Cataratas é de tirar o fôlego. Recomendo muito!',
        isVerified: true,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      }
    });

    await prisma.businessreview.create({
      data: {
        id: crypto.randomUUID(),
        businessId: parqueBusiness.id,
        userId: touristUser.id,
        rating: 5,
        comment: 'Experiência incrível! As crianças adoraram ver os animais de perto. Muito bem cuidado e organizado.',
        isVerified: true,
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
      }
    });

    // 8. Criar cupons
    console.log('🎫 Criando cupons...');
    
    await prisma.businesscoupon.create({
      data: {
        id: crypto.randomUUID(),
        businessId: hotelBusiness.id,
        title: 'Desconto Especial - Fim de Semana',
        code: 'WEEKEND20',
        description: 'Ganhe 20% de desconto em estadias de fim de semana. Válido para reservas até o final do mês!',
        discount: '20%',
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    await prisma.businesscoupon.create({
      data: {
        id: crypto.randomUUID(),
        businessId: parqueBusiness.id,
        title: 'Entrada Família',
        code: 'FAMILIA15',
        description: 'Desconto de 15% para famílias com crianças até 12 anos. Apresente documento na entrada.',
        discount: '15%',
        validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 dias
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    // 9. Criar produtos
    console.log('📦 Criando produtos...');
    
    await prisma.businessproduct.create({
      data: {
        id: crypto.randomUUID(),
        businessId: hotelBusiness.id,
        name: 'Pacote Romântico',
        description: 'Pacote especial para casais incluindo: quarto com vista, jantar romântico, spa e café da manhã especial.',
        priceCents: 89900, // R$ 899,00
        currency: 'BRL',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    await prisma.businessproduct.create({
      data: {
        id: crypto.randomUUID(),
        businessId: parqueBusiness.id,
        name: 'Ingresso Família',
        description: 'Ingresso especial para famílias (2 adultos + 2 crianças até 12 anos). Inclui visita guiada.',
        priceCents: 12000, // R$ 120,00
        currency: 'BRL',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    // 10. Criar seguidores
    console.log('👥 Criando seguidores...');
    
    await prisma.businesslike.create({
      data: {
        id: crypto.randomUUID(),
        businessId: hotelBusiness.id,
        userId: touristUser.id
      }
    });

    await prisma.businesslike.create({
      data: {
        id: crypto.randomUUID(),
        businessId: parqueBusiness.id,
        userId: touristUser.id
      }
    });

    console.log('✅ Banco de dados populado com sucesso!');
    console.log('📊 Dados criados:');
    console.log('   👤 4 usuários (1 admin, 1 turista, 2 empresários)');
    console.log('   🏢 2 empresas (Hotel das Cataratas, Parque das Aves)');
    console.log('   📝 4 posts com conteúdo');
    console.log('   👍 2 likes em posts');
    console.log('   💬 2 comentários');
    console.log('   ⭐ 2 avaliações');
    console.log('   🎫 2 cupons ativos');
    console.log('   📦 2 produtos');
    console.log('   👥 2 seguidores');

  } catch (error) {
    console.error('❌ Erro ao popular banco de dados:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  populateDatabase()
    .then(() => {
      console.log('🎉 População concluída!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Falha na população:', error);
      process.exit(1);
    });
}

module.exports = { populateDatabase };