const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function fixMateusUser() {
  try {
    console.log('🔧 Corrigindo usuário mateusdiasyt@hotmail.com...\n');
    
    // Buscar o usuário
    const user = await prisma.user.findUnique({
      where: {
        email: 'mateusdiasyt@hotmail.com'
      },
      include: {
        business: true,
        userrole: true
      }
    });

    if (!user) {
      console.log('❌ Usuário não encontrado!');
      return;
    }

    console.log('✅ Usuário encontrado:', user.id);
    console.log('Roles atuais:', user.userrole.map(ur => ur.role));

    // Verificar se já tem o role COMPANY
    const hasCompanyRole = user.userrole.some(ur => ur.role === 'COMPANY');
    
    if (!hasCompanyRole) {
      console.log('🔧 Adicionando role COMPANY...');
      
      // Adicionar role COMPANY
      await prisma.userRole.create({
        data: {
          userId: user.id,
          role: 'COMPANY'
        }
      });
      
      console.log('✅ Role COMPANY adicionado com sucesso!');
    } else {
      console.log('✅ Usuário já possui role COMPANY');
    }

    // Corrigir empresa se existir
    if (user.business) {
      console.log('\n🏢 Corrigindo empresa...');
      console.log('Status aprovado atual:', user.business.isApproved);
      
      if (user.business.isApproved === null || user.business.isApproved === undefined || user.business.isApproved === false) {
        console.log('🔧 Definindo empresa como aprovada...');
        
        await prisma.business.update({
          where: { id: user.business.id },
          data: { 
            isApproved: true,
            approvedAt: new Date()
          }
        });
        
        console.log('✅ Empresa aprovada com sucesso!');
      } else {
        console.log('✅ Status de aprovação já está definido');
      }
    }

    // Verificar e atualizar senha
    console.log('\n🔑 Verificando senha...');
    const senha = 'Vanguarda@2021';
    const isValidPassword = await bcrypt.compare(senha, user.password);
    console.log('Senha atual válida:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('🔧 Atualizando senha...');
      const hashedPassword = await bcrypt.hash(senha, 10);
      
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      });
      
      console.log('✅ Senha atualizada com sucesso!');
    }

    // Verificar resultado final
    console.log('\n🔍 Verificando resultado final...');
    const updatedUser = await prisma.user.findUnique({
      where: { email: 'mateusdiasyt@hotmail.com' },
      include: {
        business: true,
        userrole: true
      }
    });

    console.log('✅ Resultado final:');
    console.log('Roles:', updatedUser.userrole.map(ur => ur.role));
    if (updatedUser.business) {
      console.log('Empresa isApproved:', updatedUser.business.isApproved);
      console.log('Empresa approvedAt:', updatedUser.business.approvedAt);
    }
    
    // Verificar senha novamente
    const senhaAtualizada = await bcrypt.compare(senha, updatedUser.password);
    console.log('Senha válida após atualização:', senhaAtualizada);

  } catch (error) {
    console.error('❌ Erro ao corrigir usuário:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixMateusUser();