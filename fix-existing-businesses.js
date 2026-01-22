const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixExistingBusinesses() {
  try {
    console.log('🔍 Procurando usuários com empresas cadastradas...')
    
    // Buscar todos os usuários que têm empresas
    const usersWithBusinesses = await prisma.user.findMany({
      include: {
        business: {
          orderBy: { createdAt: 'asc' } // Primeira empresa criada
        }
      }
    })

    console.log(`📊 Encontrados ${usersWithBusinesses.length} usuários`)

    let fixedCount = 0
    
    for (const user of usersWithBusinesses) {
      if (user.business && user.business.length > 0) {
        // Se o usuário não tem activeBusinessId definido, definir a primeira empresa como ativa
        if (!user.activeBusinessId) {
          const firstBusiness = user.business[0]
          console.log(`\n👤 Usuário: ${user.email || user.name || user.id}`)
          console.log(`   Empresas encontradas: ${user.business.length}`)
          console.log(`   Definindo empresa ativa: ${firstBusiness.name} (${firstBusiness.id})`)
          
          await prisma.user.update({
            where: { id: user.id },
            data: { activeBusinessId: firstBusiness.id }
          })
          
          fixedCount++
          console.log(`   ✅ Empresa ativa definida!`)
        } else {
          console.log(`\n👤 Usuário: ${user.email || user.name || user.id}`)
          console.log(`   ✅ Já tem empresa ativa definida: ${user.activeBusinessId}`)
        }
      }
    }

    console.log(`\n✨ Processo concluído!`)
    console.log(`   ${fixedCount} usuário(s) atualizado(s)`)

  } catch (error) {
    console.error('❌ Erro ao processar:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixExistingBusinesses()
