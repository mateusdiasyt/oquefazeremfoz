const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetMateusPassword() {
  try {
    console.log('🔧 Redefinindo senha para mateusdiasyt@hotmail.com...\n');

    // Buscar o usuário
    const user = await prisma.user.findUnique({
      where: { email: 'mateusdiasyt@hotmail.com' }
    });

    if (!user) {
      console.log('❌ Usuário não encontrado');
      return;
    }

    console.log('✅ Usuário encontrado:', user.id);

    // Gerar nova senha hash
    const newPassword = 'senha123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Atualizar a senha
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    console.log('✅ Senha redefinida com sucesso!');
    console.log('📝 Nova senha:', newPassword);

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetMateusPassword();