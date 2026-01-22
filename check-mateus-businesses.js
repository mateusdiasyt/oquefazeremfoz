const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkMateusBusinesses() {
  try {
    console.log('🔍 Procurando usuário Carlos Mateus Dias...\n')
    
    // Buscar o usuário
    const user = await prisma.user.findUnique({
      where: { email: 'mateusdiasyt@Hotmail.com' },
      include: {
        business: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (!user) {
      console.log('❌ Usuário não encontrado!')
      return
    }

    console.log('✅ Usuário encontrado:')
    console.log(`   ID: ${user.id}`)
    console.log(`   Nome: ${user.name}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   ActiveBusinessId: ${user.activeBusinessId || '(não definido)'}`)
    console.log(`   Empresas cadastradas: ${user.business.length}`)

    if (user.business.length > 0) {
      console.log('\n📋 Empresas:')
      user.business.forEach((business, index) => {
        console.log(`\n   ${index + 1}. ${business.name}`)
        console.log(`      ID: ${business.id}`)
        console.log(`      Slug: ${business.slug}`)
        console.log(`      Categoria: ${business.category}`)
        console.log(`      Aprovada: ${business.isApproved}`)
        console.log(`      Verificada: ${business.isVerified}`)
        console.log(`      Criada em: ${business.createdAt}`)
      })

      // Se não tem activeBusinessId, definir
      if (!user.activeBusinessId && user.business.length > 0) {
        console.log('\n🔧 Definindo primeira empresa como ativa...')
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: { activeBusinessId: user.business[0].id }
          })
          console.log(`✅ Empresa "${user.business[0].name}" definida como ativa!`)
        } catch (error) {
          console.log('⚠️ Erro ao definir empresa ativa:', error.message)
          console.log('   Isso pode acontecer se a coluna activeBusinessId ainda não existe no banco')
        }
      }
    } else {
      console.log('\n⚠️ Nenhuma empresa encontrada para este usuário')
      
      // Verificar se há empresa com este userId diretamente
      const directBusiness = await prisma.business.findMany({
        where: { userId: user.id }
      })
      
      if (directBusiness.length > 0) {
        console.log(`\n🔍 Encontradas ${directBusiness.length} empresa(s) vinculadas diretamente:`)
        directBusiness.forEach((b, i) => {
          console.log(`   ${i + 1}. ${b.name} (ID: ${b.id})`)
        })
      }
    }

  } catch (error) {
    console.error('❌ Erro:', error)
    if (error.message.includes('Unknown column') || error.message.includes('does not exist')) {
      console.log('\n⚠️ AVISO: Parece que a migration do Prisma ainda não foi executada!')
      console.log('   Execute: npx prisma migrate dev --name allow_multiple_businesses_per_user')
    }
  } finally {
    await prisma.$disconnect()
  }
}

checkMateusBusinesses()
