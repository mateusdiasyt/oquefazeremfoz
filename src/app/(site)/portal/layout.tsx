import type { Metadata } from 'next'
import { getPageSeo, pageSeoToMetadata } from '../../../lib/pageSeo'

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo('/portal')
  if (seo) return pageSeoToMetadata(seo)
  return {
    title: 'Portal do Turismo | Notícias e Conteúdos para Turistas | OQFOZ',
    description: 'Notícias, releases e conteúdos para turistas em Foz do Iguaçu. Conteúdo das empresas Portal.',
    robots: { index: true, follow: true },
  }
}

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
