const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function unapproveBusiness() {
  try {
    const business = await prisma.business.update({
      where: { id: 'business_1758392641519_ta243a6pt' },
      data: { 
        isApproved: false,
        approvedAt: null
      }
    });
    console.log('Empresa desaprovada para teste:', JSON.stringify(business, null, 2));
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

unapproveBusiness();