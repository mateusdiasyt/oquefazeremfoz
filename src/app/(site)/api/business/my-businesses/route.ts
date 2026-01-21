import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/db'

// GET - Listar todas as empresas do usuário
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    console.log(`🔍 Buscando empresas para usuário: ${user.id} (${user.email})`)

    // Buscar todas as empresas do usuário
    const businesses = await prisma.business.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        category: true,
        profileImage: true,
        coverImage: true,
        isApproved: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true
      }
    })

    console.log(`📊 Empresas encontradas: ${businesses.length}`)
    businesses.forEach((b, i) => {
      console.log(`   ${i + 1}. ${b.name} (ID: ${b.id})`)
    })

    // Se usuário tem empresas mas não tem activeBusinessId, definir a primeira como ativa
    let activeBusinessId = user.activeBusinessId || businesses[0]?.id || null
    
    console.log(`🏢 ActiveBusinessId atual: ${activeBusinessId}`)
    
    if (businesses.length > 0 && !user.activeBusinessId) {
      // Definir a primeira empresa como ativa automaticamente
      try {
        console.log(`🔧 Tentando definir empresa ativa: ${businesses[0].id}`)
        await prisma.user.update({
          where: { id: user.id },
          data: { activeBusinessId: businesses[0].id }
        })
        activeBusinessId = businesses[0].id
        console.log(`✅ Empresa ativa definida automaticamente para usuário ${user.id}`)
      } catch (error: any) {
        console.error('⚠️ Erro ao definir empresa ativa:', error.message)
        // Continuar mesmo se falhar (pode ser que activeBusinessId não existe ainda no banco)
        if (error.message.includes('Unknown column') || error.message.includes('does not exist')) {
          console.log('💡 Dica: Execute a migration: npx prisma migrate dev')
        }
      }
    }

    return NextResponse.json({ 
      businesses,
      activeBusinessId: activeBusinessId
    }, { status: 200 })

  } catch (error) {
    console.error('Erro ao buscar empresas do usuário:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
