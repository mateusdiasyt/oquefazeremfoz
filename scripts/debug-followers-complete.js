const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function debugFollowersComplete() {
  try {
    console.log('🔍 Debug completo do modal de seguidores...\n')

    const businessId = 'cmfcsmxnr000et6ac3bg5ccu2' // República Arcade

    // 1. Verificar empresa
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { id: true, name: true, followersCount: true }
    })

    console.log(`🏢 Empresa: ${business?.name}`)
    console.log(`📊 Contador no banco: ${business?.followersCount}`)

    // 2. Verificar BusinessLikes
    const businessLikes = await prisma.businessLike.findMany({
      where: { businessId },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    console.log(`\n👥 BusinessLikes no banco: ${businessLikes.length}`)
    businessLikes.forEach((like, index) => {
      console.log(`${index + 1}. ${like.user.name || like.user.email} (${like.user.id})`)
    })

    // 3. Simular exatamente o que a API faz
    const followers = businessLikes.map((like, index) => {
      const baseDate = new Date()
      baseDate.setDate(baseDate.getDate() - (index + 1))
      
      return {
        id: like.user.id,
        name: like.user.name || like.user.email,
        email: like.user.email,
        profileImage: null,
        followedAt: baseDate.toISOString()
      }
    })

    console.log(`\n📤 Seguidores formatados: ${followers.length}`)
    followers.forEach((follower, index) => {
      console.log(`${index + 1}. ${follower.name} - ${follower.followedAt}`)
    })

    // 4. Verificar se há algum problema com o modelo BusinessLike
    console.log('\n🔍 Verificando estrutura do BusinessLike:')
    if (businessLikes.length > 0) {
      const sample = businessLikes[0]
      console.log('Estrutura do BusinessLike:')
      console.log(`  - id: ${sample.id}`)
      console.log(`  - userId: ${sample.userId}`)
      console.log(`  - businessId: ${sample.businessId}`)
      console.log(`  - user: ${JSON.stringify(sample.user)}`)
    }

    // 5. Verificar se há conflitos com Follow antigo
    const oldFollows = await prisma.follow.findMany({
      where: {
        followingId: business?.userId
      }
    })

    console.log(`\n⚠️ Follows antigos encontrados: ${oldFollows.length}`)
    if (oldFollows.length > 0) {
      console.log('Ainda há dados no modelo Follow antigo!')
    }

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugFollowersComplete()





