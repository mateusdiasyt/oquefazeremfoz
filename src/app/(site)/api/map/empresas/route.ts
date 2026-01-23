import { NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/db'

export async function GET() {
  try {
    // ✅ Buscar apenas empresas aprovadas e com usuário válido
    const empresas = await prisma.business.findMany({
      where: {
        isApproved: true
      },
      select: {
        id: true,
        name: true,
        slug: true,
        address: true,
        category: true,
        followersCount: true,
        profileImage: true,
        isVerified: true,
        isApproved: true,
        userId: true,
        user: {
          select: {
            id: true // ✅ Verificar se usuário existe
          }
        }
      },
      take: 20
    })

    // ✅ Filtrar empresas com usuário válido e endereço
    const empresasValidas = empresas.filter(emp => emp.user && emp.user.id)
    const empresasComEndereco = empresasValidas.filter(emp => emp.address && emp.address.trim() !== '')

    // Adicionar dados padrão para rating
    const empresasComMedia = empresasComEndereco.map(empresa => ({
      ...empresa,
      averageRating: 4.5,
      reviewsCount: 10,
      phone: null,
      website: null,
      instagram: null,
      facebook: null,
      whatsapp: null,
      description: null
    }))

    return NextResponse.json({
      empresas: empresasComMedia,
      total: empresasComMedia.length
    })

  } catch (error) {
    console.error('Erro ao buscar empresas para o mapa:', error)
    return NextResponse.json({ 
      message: 'Erro interno do servidor',
      empresas: [],
      total: 0
    }, { status: 500 })
  }
}
