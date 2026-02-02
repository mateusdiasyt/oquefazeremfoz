import type { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://oquefazeremfoz.com.br'

export const metadata: Metadata = {
  title: 'FozTV | Vídeos sobre Foz do Iguaçu | O Que Fazer em Foz',
  description: 'Assista vídeos sobre Foz do Iguaçu: turismo, gastronomia, atrações e dicas. Conteúdo exclusivo do O Que Fazer em Foz.',
  keywords: [
    'FozTV',
    'vídeos Foz do Iguaçu',
    'turismo Foz',
    'Cataratas vídeos',
    'Foz do Iguaçu canal',
  ],
  alternates: { canonical: `${SITE_URL}/foztv` },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: `${SITE_URL}/foztv`,
    siteName: 'O Que Fazer em Foz',
    title: 'FozTV | Vídeos sobre Foz do Iguaçu',
    description: 'Assista vídeos sobre Foz do Iguaçu. Conteúdo exclusivo do O Que Fazer em Foz.',
  },
  robots: { index: true, follow: true },
}

export default function FozTVLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
