const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();

async function addAdminRole() {
  try {
    const email = 'mateospinheiro@gmail.com';
    
    // 1. Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { email },
      include: { userrole: true }
    });
    
    if (!user) {
      console.log(`❌ Usuário ${email} não encontrado!`);
      return;
    }
    
    console.log(`✅ Usuário encontrado: ${user.name || user.email}`);
    console.log(`📧 Email: ${user.email}`);
    console.log(`🆔 ID: ${user.id}`);
    console.log(`👤 Roles atuais: ${user.userrole.map(ur => ur.role).join(', ') || 'Nenhum'}`);
    
    // 2. Verificar se já tem role ADMIN
    const hasAdminRole = user.userrole.some(ur => ur.role === 'ADMIN');
    
    if (hasAdminRole) {
      console.log(`✅ Usuário já possui role ADMIN!`);
      return;
    }
    
    // 3. Adicionar role ADMIN (mantendo os roles existentes)
    const newAdminRole = await prisma.userrole.create({
      data: {
        id: crypto.randomUUID(),
        userId: user.id,
        role: 'ADMIN'
      }
    });
    
    console.log(`🎉 Role ADMIN adicionado com sucesso!`);
    console.log(`🆔 Role ID: ${newAdminRole.id}`);
    
    // 4. Verificar resultado final
    const updatedUser = await prisma.user.findUnique({
      where: { email },
      include: { userrole: true }
    });
    
    console.log(`\n📋 Roles finais: ${updatedUser.userrole.map(ur => ur.role).join(', ')}`);
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addAdminRole();