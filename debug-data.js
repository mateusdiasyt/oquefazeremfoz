const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "mysql://root:@localhost:3306/oquefazeremfoz"
    }
  }
})

async function debugData() {
  try {
    console.log('🔍 Verificando dados no banco...\n')
    
    // 1. Verificar posts
    console.log('📝 POSTS:')
    const allPosts = await prisma.post.findMany({
      include: {
        business: {
          select: {
            id: true,
            name: true,
            isApproved: true
          }
        }
      }
    })
    console.log(`Total de posts: ${allPosts.length}`)
    if (allPosts.length > 0) {
      console.log('Primeiros 3 posts:')
      allPosts.slice(0, 3).forEach((post, index) => {
        console.log(`  ${index + 1}. ID: ${post.id}, Título: ${post.title}`)
        console.log(`     Business: ${post.business?.name || 'N/A'} (Aprovado: ${post.business?.isApproved || 'N/A'})`)
      })
    }
    
    // 2. Verificar empresas
    console.log('\n🏢 EMPRESAS:')
    const allBusinesses = await prisma.business.findMany()
    console.log(`Total de empresas: ${allBusinesses.length}`)
    
    const approvedBusinesses = await prisma.business.findMany({
      where: { isApproved: true }
    })
    console.log(`Empresas aprovadas: ${approvedBusinesses.length}`)
    
    if (allBusinesses.length > 0) {
      console.log('Primeiras 3 empresas:')
      allBusinesses.slice(0, 3).forEach((business, index) => {
        console.log(`  ${index + 1}. ID: ${business.id}, Nome: ${business.name}`)
        console.log(`     Aprovada: ${business.isApproved}, Criada: ${business.createdAt}`)
      })
    }
    
    // 3. Verificar cupons (businesscoupon)
    console.log('\n🎫 CUPONS (businesscoupon):')
    const allCoupons = await prisma.businesscoupon.findMany({
      include: {
        business: {
          select: {
            id: true,
            name: true,
            isApproved: true
          }
        }
      }
    })
    console.log(`Total de cupons: ${allCoupons.length}`)
    
    const activeCoupons = await prisma.businesscoupon.findMany({
      where: {
        isActive: true,
        validUntil: {
          gt: new Date()
        }
      }
    })
    console.log(`Cupons ativos e válidos: ${activeCoupons.length}`)
    
    if (allCoupons.length > 0) {
      console.log('Primeiros 3 cupons:')
      allCoupons.slice(0, 3).forEach((coupon, index) => {
        console.log(`  ${index + 1}. ID: ${coupon.id}, Título: ${coupon.title}`)
        console.log(`     Ativo: ${coupon.isActive}, Válido até: ${coupon.validUntil}`)
        console.log(`     Business: ${coupon.business?.name || 'N/A'} (Aprovado: ${coupon.business?.isApproved || 'N/A'})`)
      })
    }
    
    // 4. Verificar se existe tabela coupon também
    console.log('\n🎫 CUPONS (coupon):')
    try {
      const allCoupons2 = await prisma.coupon.findMany({
        include: {
          business: {
            select: {
              id: true,
              name: true,
              isApproved: true
            }
          }
        }
      })
      console.log(`Total de cupons (tabela coupon): ${allCoupons2.length}`)
    } catch (error) {
      console.log('Tabela coupon não existe ou erro:', error.message)
    }
    
    console.log('\n✅ Verificação concluída!')
    
  } catch (error) {
    console.error('❌ Erro na verificação:', error.message)
    console.error('Stack:', error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

debugData()