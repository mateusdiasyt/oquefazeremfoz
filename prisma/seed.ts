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

  // --- Planejador Inteligente de Viagem: config e atrativos iniciais ---
  await prisma.planejadorconfig.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      alimentacaoEconomicaCents: 5000,
      alimentacaoPadraoCents: 12000,
      alimentacaoConfortoCents: 20000,
      multiplicadorUber: 1,
      multiplicadorTransfer: 1.5,
      multiplicadorCarroProprio: 0.3,
      horasMaximasPorDia: 8,
      moeda: 'BRL',
      updatedAt: new Date(),
    },
  });

  const atrativosIniciais = [
    { id: 'atr_cataratas_br', nome: 'Cataratas Brasil', precoAdultoCents: 8500, precoCriancaCents: 4500, duracaoMediaHoras: 4, tempoDeslocamentoMedioHoras: 0.5, regiao: 'Cataratas Brasil', nivelCansaco: 'medio', custoTransporteMedioCents: 8000, exigeDocumento: false, ordem: 1 },
    { id: 'atr_cataratas_arg', nome: 'Cataratas Argentina', precoAdultoCents: 12000, precoCriancaCents: 6000, duracaoMediaHoras: 5, tempoDeslocamentoMedioHoras: 1.5, regiao: 'Argentina', nivelCansaco: 'intenso', custoTransporteMedioCents: 15000, exigeDocumento: true, ordem: 2 },
    { id: 'atr_parque_aves', nome: 'Parque das Aves', precoAdultoCents: 8500, precoCriancaCents: 4500, duracaoMediaHoras: 2.5, tempoDeslocamentoMedioHoras: 0.5, regiao: 'Cataratas Brasil', nivelCansaco: 'leve', custoTransporteMedioCents: 6000, exigeDocumento: false, ordem: 3 },
    { id: 'atr_itaipu_panoramica', nome: 'Itaipu Panorâmica', precoAdultoCents: 5500, precoCriancaCents: 2800, duracaoMediaHoras: 2.5, tempoDeslocamentoMedioHoras: 0.5, regiao: 'Itaipu', nivelCansaco: 'leve', custoTransporteMedioCents: 7000, exigeDocumento: false, ordem: 4 },
    { id: 'atr_itaipu_especial', nome: 'Itaipu Especial', precoAdultoCents: 18000, precoCriancaCents: 9000, duracaoMediaHoras: 4, tempoDeslocamentoMedioHoras: 0.5, regiao: 'Itaipu', nivelCansaco: 'medio', custoTransporteMedioCents: 7000, exigeDocumento: false, ordem: 5 },
    { id: 'atr_marco_3fronteiras', nome: 'Marco das 3 Fronteiras', precoAdultoCents: 4500, precoCriancaCents: 2300, duracaoMediaHoras: 2, tempoDeslocamentoMedioHoras: 0.3, regiao: 'Centro', nivelCansaco: 'leve', custoTransporteMedioCents: 4000, exigeDocumento: false, ordem: 6 },
    { id: 'atr_museu_cera', nome: 'Museu de Cera', precoAdultoCents: 6000, precoCriancaCents: 3500, duracaoMediaHoras: 1.5, tempoDeslocamentoMedioHoras: 0.2, regiao: 'Centro', nivelCansaco: 'leve', custoTransporteMedioCents: 3000, exigeDocumento: false, ordem: 7 },
    { id: 'atr_vale_dinossauros', nome: 'Vale dos Dinossauros', precoAdultoCents: 5500, precoCriancaCents: 4500, duracaoMediaHoras: 2, tempoDeslocamentoMedioHoras: 0.3, regiao: 'Centro', nivelCansaco: 'leve', custoTransporteMedioCents: 4000, exigeDocumento: false, ordem: 8 },
    { id: 'atr_bar_gelo', nome: 'Bar de Gelo', precoAdultoCents: 12000, precoCriancaCents: 0, duracaoMediaHoras: 1, tempoDeslocamentoMedioHoras: 0.2, regiao: 'Centro', nivelCansaco: 'leve', custoTransporteMedioCents: 3000, exigeDocumento: false, ordem: 9 },
    { id: 'atr_compras_paraguai', nome: 'Compras no Paraguai', precoAdultoCents: 0, precoCriancaCents: 0, duracaoMediaHoras: 6, tempoDeslocamentoMedioHoras: 1.5, regiao: 'Paraguai', nivelCansaco: 'medio', custoTransporteMedioCents: 25000, exigeDocumento: true, ordem: 10 },
    { id: 'atr_city_tour', nome: 'City Tour', precoAdultoCents: 8000, precoCriancaCents: 4000, duracaoMediaHoras: 4, tempoDeslocamentoMedioHoras: 0, regiao: 'Centro', nivelCansaco: 'leve', custoTransporteMedioCents: 0, exigeDocumento: false, ordem: 11 },
    { id: 'atr_passeio_barco', nome: 'Passeio de Barco', precoAdultoCents: 15000, precoCriancaCents: 7500, duracaoMediaHoras: 2, tempoDeslocamentoMedioHoras: 0.5, regiao: 'Cataratas Brasil', nivelCansaco: 'leve', custoTransporteMedioCents: 8000, exigeDocumento: false, ordem: 12 },
  ];

  for (const a of atrativosIniciais) {
    await prisma.atrativo.upsert({
      where: { id: a.id },
      update: {},
      create: {
        ...a,
        ativo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }
}

main().finally(() => prisma.$disconnect());

