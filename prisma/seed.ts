import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Verificar se já existem planos
  const existingPlans = await prisma.plan.findMany()
  
  if (existingPlans.length === 0) {
    // Criar planos padrão apenas se não existirem
    await prisma.plan.create({
      data: {
        id: "plan_basico",
        name: "Básico",
        priceCents: 1990,
        isVerified: false,
        features: JSON.stringify(["Perfil da empresa", "Postagens", "Cupons"]),
        updatedAt: new Date(),
      },
    });

    await prisma.plan.create({
      data: {
        id: "plan_verificado",
        name: "Verificado",
        priceCents: 3990,
        isVerified: true,
        features: JSON.stringify(["Selo verificado", "Boost no ranking", "Stories em destaque"]),
        updatedAt: new Date(),
      },
    });
  }

  // Criar usuários demo para cada empresa
  const users = [
    {
      id: "user_hotel_cataratas",
      email: "hotel@cataratas.com",
      name: "Hotel das Cataratas",
      roleId: "userrole_hotel_cataratas"
    },
    {
      id: "user_restaurante_panoramico", 
      email: "contato@panoramico.com",
      name: "Restaurante Panorâmico",
      roleId: "userrole_restaurante_panoramico"
    },
    {
      id: "user_parque_aves",
      email: "info@parqueaves.com", 
      name: "Parque das Aves",
      roleId: "userrole_parque_aves"
    },
    {
      id: "user_marco_fronteiras",
      email: "contato@marcofronteiras.com", 
      name: "Marco das Três Fronteiras",
      roleId: "userrole_marco_fronteiras"
    }
  ]

  const createdUsers = []
  for (const userData of users) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        id: userData.id,
        email: userData.email,
        password: "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
        name: userData.name,
        updatedAt: new Date(),
        userrole: {
          create: {
            id: userData.roleId,
            role: "COMPANY"
          }
        }
      }
    })
    createdUsers.push(user)
  }

  // Empresas demo para o mapa turístico
  const empresasDemo = [
    {
      id: "business_hotel_cataratas",
      name: "Hotel das Cataratas",
      slug: "hotel-das-cataratas",
      description: "Hotel de luxo próximo às Cataratas do Iguaçu",
      address: "Rodovia das Cataratas, km 32, Foz do Iguaçu, PR",
      category: "Hotelaria",
      phone: "(45) 3521-7000",
      isApproved: true,
      isVerified: true,
      followersCount: 150,
      updatedAt: new Date(),
      userId: "user_hotel_cataratas"
    },
    {
      id: "business_restaurante_panoramico",
      name: "Restaurante Panorâmico",
      slug: "restaurante-panoramico",
      description: "Vista incrível das Cataratas com culinária internacional",
      address: "Av. das Cataratas, 12450, Foz do Iguaçu, PR",
      category: "Restaurante",
      phone: "(45) 3574-2000",
      isApproved: true,
      isVerified: true,
      followersCount: 89,
      updatedAt: new Date(),
      userId: "user_restaurante_panoramico"
    },
    {
      id: "business_parque_aves",
      name: "Parque das Aves",
      slug: "parque-das-aves",
      description: "Santuário de aves da Mata Atlântica",
      address: "Rodovia das Cataratas, km 17.1, Foz do Iguaçu, PR",
      category: "Turismo",
      phone: "(45) 3529-8282",
      isApproved: true,
      isVerified: true,
      followersCount: 320,
      updatedAt: new Date(),
      userId: "user_parque_aves"
    },
    {
      id: "business_marco_fronteiras",
      name: "Marco das Três Fronteiras",
      slug: "marco-tres-fronteiras",
      description: "Ponto turístico histórico na tríplice fronteira",
      address: "Av. Três Fronteiras, s/n, Foz do Iguaçu, PR",
      category: "Turismo",
      isApproved: true,
      isVerified: false,
      followersCount: 75,
      updatedAt: new Date(),
      userId: "user_marco_fronteiras"
    }
  ];

  for (const empresaData of empresasDemo) {
    await prisma.business.upsert({
      where: {
        slug: empresaData.slug
      },
      update: {},
      create: empresaData
    });
  }
}

main().finally(() => prisma.$disconnect());

