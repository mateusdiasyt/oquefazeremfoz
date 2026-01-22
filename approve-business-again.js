const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function approveBusiness() {
  try {
    const business = await prisma.business.update({
      where: { id: 'business_1758392641519_ta243a6pt' },
      data: { 
        isApproved: true,
        approvedAt: new Date()
      }
    });
    console.log('Empresa aprovada novamente:', JSON.stringify(business, null, 2));
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

approveBusiness();