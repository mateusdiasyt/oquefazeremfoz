import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, isAdmin } from '../../../../../../lib/auth'
import { prisma } from '../../../../../../lib/db'
import { DEFAULT_PAGES, getPageSeo } from '../../../../../../lib/pageSeo'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || !isAdmin(user.roles)) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const pages = await Promise.all(
      DEFAULT_PAGES.map(async (p) => {
        const seo = await getPageSeo(p.path)
        return {
          path: p.path,
          label: p.label,
          title: seo?.title ?? p.title,
          description: seo?.description ?? p.description,
          keywords: seo?.keywords ?? p.keywords,
          ogTitle: seo?.ogTitle ?? null,
          ogDescription: seo?.ogDescription ?? null,
          ogImage: seo?.ogImage ?? null,
          robotsIndex: seo?.robotsIndex ?? true,
          robotsFollow: seo?.robotsFollow ?? true,
          canonical: seo?.canonical ?? null,
        }
      })
    )

    return NextResponse.json({ pages })
  } catch (error: unknown) {
    console.error('Erro ao listar páginas SEO:', error)
    const msg = error instanceof Error ? error.message : 'Erro interno'
    const isTableMissing =
      typeof msg === 'string' &&
      (msg.includes('does not exist') || msg.includes('PageSeo') || msg.includes('pageseo') || msg.includes('P2021'))
    return NextResponse.json(
      {
        message: isTableMissing
          ? 'Tabela de SEO ainda não existe no banco. Rode: npx prisma db push'
          : msg,
      },
      { status: isTableMissing ? 503 : 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !isAdmin(user.roles)) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const path = (body.path ?? '').trim() || '/'
    const normalized = path === '' ? '/' : path.startsWith('/') ? path : `/${path}`

    const allowed = DEFAULT_PAGES.some((p) => p.path === normalized)
    if (!allowed) {
      return NextResponse.json({ message: 'Página não configurável' }, { status: 400 })
    }

    const id = normalized === '/' ? 'seo_home' : `seo_${normalized.replace(/\//g, '_').replace(/^_/, '')}`
    const data = {
      title: body.title != null ? String(body.title).trim() || null : undefined,
      description: body.description != null ? String(body.description).trim() || null : undefined,
      keywords: body.keywords != null ? String(body.keywords).trim() || null : undefined,
      ogTitle: body.ogTitle != null ? String(body.ogTitle).trim() || null : undefined,
      ogDescription: body.ogDescription != null ? String(body.ogDescription).trim() || null : undefined,
      ogImage: body.ogImage != null ? String(body.ogImage).trim() || null : undefined,
      robotsIndex: body.robotsIndex !== undefined ? !!body.robotsIndex : undefined,
      robotsFollow: body.robotsFollow !== undefined ? !!body.robotsFollow : undefined,
      canonical: body.canonical != null ? String(body.canonical).trim() || null : undefined,
    }

    await prisma.pageseo.upsert({
      where: { path: normalized },
      create: {
        id,
        path: normalized,
        title: data.title ?? null,
        description: data.description ?? null,
        keywords: data.keywords ?? null,
        ogTitle: data.ogTitle ?? null,
        ogDescription: data.ogDescription ?? null,
        ogImage: data.ogImage ?? null,
        robotsIndex: data.robotsIndex ?? true,
        robotsFollow: data.robotsFollow ?? true,
        canonical: data.canonical ?? null,
      },
      update: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.keywords !== undefined && { keywords: data.keywords }),
        ...(data.ogTitle !== undefined && { ogTitle: data.ogTitle }),
        ...(data.ogDescription !== undefined && { ogDescription: data.ogDescription }),
        ...(data.ogImage !== undefined && { ogImage: data.ogImage }),
        ...(data.robotsIndex !== undefined && { robotsIndex: data.robotsIndex }),
        ...(data.robotsFollow !== undefined && { robotsFollow: data.robotsFollow }),
        ...(data.canonical !== undefined && { canonical: data.canonical }),
      },
    })

    const updated = await getPageSeo(normalized)
    return NextResponse.json({ page: updated })
  } catch (error: unknown) {
    console.error('Erro ao atualizar SEO:', error)
    const msg = error instanceof Error ? error.message : 'Erro interno'
    const isTableMissing =
      typeof msg === 'string' &&
      (msg.includes('does not exist') || msg.includes('PageSeo') || msg.includes('pageseo') || msg.includes('P2021'))
    return NextResponse.json(
      {
        message: isTableMissing
          ? 'Tabela de SEO ainda não existe no banco. No seu projeto rode: npx prisma db push'
          : msg,
      },
      { status: isTableMissing ? 503 : 500 }
    )
  }
}
