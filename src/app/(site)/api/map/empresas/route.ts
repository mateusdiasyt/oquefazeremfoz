import { NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/db'

export async function GET() {
  try {
    console.log('🗺️ Buscando empresas para o mapa...')
    
    // Primeiro, vamos ver quantas empresas existem no total
    const totalEmpresas = await prisma.business.count()
    console.log('📊 Total de empresas no banco:', totalEmpresas)
    
    // Buscar todas as empresas primeiro (para debug)
    const todasEmpresas = await prisma.business.findMany({
      select: {
        id: true,
        name: true,
        address: true,
        isApproved: true,
        isVerified: true
      }
    })
    console.log('📋 Todas as empresas:', todasEmpresas)
    
    // ✅ CORREÇÃO: Buscar apenas empresas aprovadas e com usuário válido
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
    
    console.log('🏢 Empresas encontradas:', empresas.length)

    // ✅ Filtrar empresas com usuário válido e endereço
    const empresasValidas = empresas.filter(emp => emp.user && emp.user.id)
    const empresasComEndereco = empresasValidas.filter(emp => emp.address && emp.address.trim() !== '')
    console.log('📍 Empresas com endereço:', empresasComEndereco.length)
    console.log('📋 Empresas com endereço:', empresasComEndereco.map(e => ({name: e.name, address: e.address, isApproved: e.isApproved})))

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
