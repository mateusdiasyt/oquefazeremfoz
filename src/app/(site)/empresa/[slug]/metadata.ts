import { Metadata } from 'next'
import { prisma } from '../../../../../lib/db'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const business = await prisma.business.findUnique({
      where: { slug: params.slug },
      select: {
        name: true,
        description: true,
        category: true,
        address: true,
        profileImage: true,
        coverImage: true,
        isVerified: true,
        website: true,
        phone: true,
        instagram: true,
        whatsapp: true,
      },
    })

    if (!business || !business.name) {
      return {
        title: 'Empresa não encontrada | OQFOZ',
        description: 'A empresa solicitada não foi encontrada.',
      }
    }

    const title = `${business.name} - ${business.category} em Foz do Iguaçu | OQFOZ`
    const description = business.description 
      ? `${business.description.substring(0, 155)}...`
      : `${business.name} é um ${business.category.toLowerCase()} em Foz do Iguaçu. Descubra mais sobre nossos serviços, localização e entre em contato.`
    
    const image = business.coverImage || business.profileImage || 'https://oquefazeremfoz.com.br/og-image.png'
    const url = `https://oquefazeremfoz.com.br/empresa/${params.slug}`

    return {
      title,
      description,
      keywords: [
        business.name,
        business.category,
        'Foz do Iguaçu',
        'turismo',
        'atrações',
        business.address || '',
      ].filter(Boolean),
      openGraph: {
        type: 'website',
        locale: 'pt_BR',
        url,
        siteName: 'OQFOZ',
        title,
        description,
        images: [
          {
            url: image.startsWith('http') ? image : `https://oquefazeremfoz.com.br${image}`,
            width: 1200,
            height: 630,
            alt: business.name,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [image.startsWith('http') ? image : `https://oquefazeremfoz.com.br${image}`],
      },
      alternates: {
        canonical: url,
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
    }
  } catch (error) {
    console.error('Erro ao gerar metadata:', error)
    return {
      title: 'Empresa | OQFOZ',
      description: 'Descubra empresas em Foz do Iguaçu',
    }
  }
}
