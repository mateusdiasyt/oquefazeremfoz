import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')

    if (!url) {
      return NextResponse.json({ message: 'URL é obrigatória' }, { status: 400 })
    }

    // Validar se é uma URL válida
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ message: 'URL inválida' }, { status: 400 })
    }

    // Fazer requisição para a URL
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; OQFOZ-Bot/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
    })

    if (!response.ok) {
      return NextResponse.json({ message: 'Erro ao acessar URL' }, { status: 400 })
    }

    const html = await response.text()

    // Extrair metadata usando regex
    const extractMeta = (property: string, content: string): string | null => {
      const regex = new RegExp(`<meta[^>]*(?:property|name)=["']${property}["'][^>]*content=["']([^"']*)["'][^>]*>`, 'i')
      const match = html.match(regex)
      return match ? match[1] : null
    }

    // Extrair título
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i)
    const title = titleMatch ? titleMatch[1].trim() : null

    // Extrair descrição
    const description = 
      extractMeta('og:description', html) ||
      extractMeta('description', html) ||
      extractMeta('twitter:description', html)

    // Extrair imagem
    const image = 
      extractMeta('og:image', html) ||
      extractMeta('twitter:image', html) ||
      extractMeta('twitter:image:src', html)

    // Extrair nome do site
    const siteName = 
      extractMeta('og:site_name', html) ||
      extractMeta('twitter:site', html)

    // Processar URL da imagem se for relativa
    let processedImage = image
    if (image && !image.startsWith('http')) {
      try {
        const baseUrl = new URL(url)
        processedImage = new URL(image, baseUrl.origin).href
      } catch {
        processedImage = null
      }
    }

    return NextResponse.json({
      title: title || 'Link',
      description: description || 'Clique para acessar',
      image: processedImage,
      siteName: siteName || null
    })

  } catch (error) {
    console.error('Erro ao buscar metadata da URL:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}




