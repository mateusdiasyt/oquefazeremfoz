require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAdmin() {
  try {
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@oqfoz.com' },
      select: {
        id: true,
        email: true,
        name: true,
        roles: true,
        isActive: true
      }
    });
    
    console.log('Admin user:', JSON.stringify(admin, null, 2));
    
    if (!admin) {
      console.log('❌ Admin user not found!');
    } else if (!admin.roles || !admin.roles.includes('ADMIN')) {
      console.log('❌ Admin user does not have ADMIN role!');
      console.log('Current roles:', admin.roles);
    } else {
      console.log('✅ Admin user exists and has ADMIN role');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmin();