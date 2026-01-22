"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    // Verificar se já existem planos
    const existingPlans = await prisma.plan.findMany();
    if (existingPlans.length === 0) {
        // Criar planos padrão apenas se não existirem
        await prisma.plan.create({
            data: {
                name: "Básico",
                priceCents: 1990,
                isVerified: false,
                features: JSON.stringify(["Perfil da empresa", "Postagens", "Cupons"]),
            },
        });
        await prisma.plan.create({
            data: {
                name: "Verificado",
                priceCents: 3990,
                isVerified: true,
                features: JSON.stringify(["Selo verificado", "Boost no ranking", "Stories em destaque"]),
            },
        });
    }
    // Criar usuário demo para as empresas
    const demoUser = await prisma.user.upsert({
        where: { email: "demo@empresa.com" },
        update: {},
        create: {
            email: "demo@empresa.com",
            password: "$2a$12$demo.hash.password",
            name: "Usuário Demo",
            userRoles: {
                create: {
                    role: "COMPANY"
                }
            }
        },
    });
    // Empresas demo para o mapa turístico
    const empresasDemo = [
        {
            name: "Hotel das Cataratas",
            slug: "hotel-das-cataratas",
            description: "Hotel de luxo próximo às Cataratas do Iguaçu",
            address: "Rodovia das Cataratas, km 32, Foz do Iguaçu, PR",
            category: "Hotelaria",
            phone: "(45) 3521-7000",
            isApproved: true,
            isVerified: true,
            followersCount: 150
        },
        {
            name: "Restaurante Panorâmico",
            slug: "restaurante-panoramico",
            description: "Vista incrível das Cataratas com culinária internacional",
            address: "Av. das Cataratas, 12450, Foz do Iguaçu, PR",
            category: "Restaurante",
            phone: "(45) 3574-2000",
            isApproved: true,
            isVerified: true,
            followersCount: 89
        },
        {
            name: "Parque das Aves",
            slug: "parque-das-aves",
            description: "Santuário de aves da Mata Atlântica",
            address: "Rodovia das Cataratas, km 17.1, Foz do Iguaçu, PR",
            category: "Turismo",
            phone: "(45) 3529-8282",
            isApproved: true,
            isVerified: true,
            followersCount: 320
        },
        {
            name: "Marco das Três Fronteiras",
            slug: "marco-tres-fronteiras",
            description: "Ponto turístico histórico na tríplice fronteira",
            address: "Av. Três Fronteiras, s/n, Foz do Iguaçu, PR",
            category: "Turismo",
            isApproved: true,
            isVerified: false,
            followersCount: 75
        }
    ];
    for (const empresaData of empresasDemo) {
        await prisma.business.upsert({
            where: { slug: empresaData.slug },
            update: {},
            create: {
                ...empresaData,
                userId: demoUser.id
            }
        });
    }
}
main().finally(() => prisma.$disconnect());
