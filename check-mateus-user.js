const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkMateusUser() {
  try {
    console.log('🔍 Verificando usuário mateusdiasyt@hotmail.com...\n');
    
    // Buscar o usuário
    const user = await prisma.user.findUnique({
      where: {
        email: 'mateusdiasyt@hotmail.com'
      },
      include: {
        business: true // Incluir dados da empresa se existir
      }
    });

    if (!user) {
      console.log('❌ Usuário não encontrado!');
      return;
    }

    console.log('✅ Usuário encontrado:');
    console.log('ID:', user.id);
    console.log('Nome:', user.name);
    console.log('Email:', user.email);
    console.log('Role:', user.role);
    console.log('Criado em:', user.createdAt);
    console.log('');

    // Verificar se tem empresa associada
    if (user.business) {
      console.log('🏢 Empresa associada encontrada:');
      console.log('ID da empresa:', user.business.id);
      console.log('Nome da empresa:', user.business.name);
      console.log('Slug:', user.business.slug);
      console.log('Status aprovado:', user.business.approved);
      console.log('Criada em:', user.business.createdAt);
    } else {
      console.log('❌ Nenhuma empresa associada ao usuário!');
      
      // Verificar se existe empresa com este userId
      const business = await prisma.business.findFirst({
        where: {
          userId: user.id
        }
      });
      
      if (business) {
        console.log('🔍 Encontrada empresa com userId correspondente:');
        console.log('ID da empresa:', business.id);
        console.log('Nome da empresa:', business.name);
        console.log('Slug:', business.slug);
        console.log('Status aprovado:', business.approved);
      } else {
        console.log('❌ Nenhuma empresa encontrada com userId:', user.id);
      }
    }

  } catch (error) {
    console.error('❌ Erro ao verificar usuário:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMateusUser();