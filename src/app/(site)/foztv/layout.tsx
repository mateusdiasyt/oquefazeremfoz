import type { Metadata } from 'next'
import { getPageSeo, pageSeoToMetadata } from '../../../lib/pageSeo'

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo('/foztv')
  if (seo) return pageSeoToMetadata(seo)
  return {
    title: 'FozTV | Vídeos sobre Foz do Iguaçu | OQFOZ',
    description: 'Assista vídeos sobre Foz do Iguaçu: turismo, gastronomia, atrações e dicas.',
    robots: { index: true, follow: true },
  }
}

export default function FozTVLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
