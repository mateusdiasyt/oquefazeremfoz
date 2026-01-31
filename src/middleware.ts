import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET!

// Função para decodificar JWT usando Web Crypto API
async function verifyJWT(token: string, secret: string) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format')
    }

    const [header, payload, signature] = parts
    
    // Decodificar o payload
    const decodedPayload = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    
    // Verificar se o token não expirou
    if (decodedPayload.exp && Date.now() >= decodedPayload.exp * 1000) {
      throw new Error('Token expired')
    }

    // Criar a chave para verificação
    const encoder = new TextEncoder()
    const keyData = encoder.encode(secret)
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )

    // Verificar a assinatura
    const data = encoder.encode(`${header}.${payload}`)
    const signatureBytes = Uint8Array.from(atob(signature.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0))
    
    const isValid = await crypto.subtle.verify('HMAC', key, signatureBytes, data)
    
    if (!isValid) {
      throw new Error('Invalid signature')
    }

    return decodedPayload
  } catch (error) {
    throw new Error(`JWT verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Permitir acesso público a sitemap.xml e robots.txt (importante para SEO)
  if (pathname === '/sitemap.xml' || pathname === '/robots.txt') {
    return NextResponse.next()
  }
  
  // Rotas públicas (acessíveis sem login) - IMPORTANTE PARA SEO
  const publicRoutes = [
    '/login', 
    '/register',
    '/empresa', // Páginas de empresas e releases devem ser públicas para SEO
    '/empresas', // Lista de empresas pública
    '/cupons', // Cupons públicos
    '/mapa-turistico', // Mapa público
    '/selo-verificado', // Selo verificados públicos
    '/post' // Páginas de posts individuais (para compartilhamento)
  ]
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || 
    pathname.startsWith(route + '/') ||
    pathname.match(/^\/empresa\/[^\/]+$/) // Páginas individuais de empresas
  )
  
  // Se for rota pública, permitir acesso (importante para crawlers do Google)
  if (isPublicRoute) {
    return NextResponse.next()
  }
  
  // Verificar autenticação para rotas protegidas
  const token = request.cookies.get('auth-token')?.value
  
  if (!token) {
    // Redirecionar para login se não estiver autenticado
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    const decoded = await verifyJWT(token, JWT_SECRET)
    
    // Verificação adicional para rotas admin
    if (pathname.startsWith('/admin')) {
      // Verificar se o usuário tem role ADMIN (isso será verificado no layout do admin também)
      return NextResponse.next()
    }
    
    return NextResponse.next()
  } catch (error) {
    // Token inválido, redirecionar para login
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - sitemap.xml (sitemap - importante para SEO)
     * - robots.txt (robots file - importante para SEO)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap|robots|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
