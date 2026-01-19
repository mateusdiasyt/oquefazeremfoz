const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function updateMateusPassword() {
  try {
    // Gerar hash da nova senha
    const senha = 'Vanguarda@2021';
    const hashedPassword = await bcrypt.hash(senha, 10);

    // Atualizar senha do usuário
    const user = await prisma.user.update({
      where: { email: 'mateusdiasyt@hotmail.com' },
      data: {
        password: hashedPassword,
        updatedAt: new Date()
      }
    });

    console.log('✅ Senha atualizada com sucesso!');
    
    // Verificar se a senha foi atualizada corretamente
    const isValidPassword = await bcrypt.compare(senha, user.password);
    console.log('Senha válida após atualização:', isValidPassword);

    await prisma.$disconnect();
  } catch (error) {
    console.error('Erro:', error);
    await prisma.$disconnect();
  }
}

updateMateusPassword();