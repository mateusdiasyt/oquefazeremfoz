import type { Metadata } from 'next'

/**
 * Metadata da página pilar SEO "O que fazer em Foz do Iguaçu".
 * Título e descrição alinhados à keyword principal e intenção de busca.
 */
export const metadata: Metadata = {
  title: 'O que fazer em Foz do Iguaçu – Guia Completo 2026 | OQFOZ',
  description: 'Guia completo do que fazer em Foz do Iguaçu: atrações, roteiros em 1 a 7 dias, passeios gratuitos e pagos, vida noturna, compras no Paraguai e Argentina. Conteúdo atualizado pela rede OQFOZ.',
  keywords: [
    'o que fazer em foz',
    'o que fazer em foz do iguaçu',
    'o que fazer em foz hoje',
    'o que fazer em foz em 3 dias',
    'foz do iguaçu',
    'cataratas do iguaçu',
    'atrações foz',
    'passeios foz do iguaçu',
    'roteiro foz'
  ],
  openGraph: {
    title: 'O que fazer em Foz do Iguaçu – Guia Completo 2026',
    description: 'Guia completo do que fazer em Foz: atrações, roteiros, passeios gratuitos e pagos, vida noturna e compras. Conteúdo da rede OQFOZ.',
    url: 'https://oquefazeremfoz.com.br/o-que-fazer-em-foz-do-iguacu',
    type: 'website',
    locale: 'pt_BR',
  },
  alternates: {
    canonical: 'https://oquefazeremfoz.com.br/o-que-fazer-em-foz-do-iguacu',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
