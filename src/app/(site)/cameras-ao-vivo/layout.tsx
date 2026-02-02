import type { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.oquefazeremfoz.com.br'

export const metadata: Metadata = {
  title: 'Câmeras ao Vivo BR-277 e Ponte da Amizade | Trânsito Foz do Iguaçu',
  description: 'Acompanhe o trânsito em tempo real na BR-277, Aduana e Ponte da Amizade. Câmeras ao vivo Foz do Iguaçu: sentido Brasil, sentido Paraguai e acesso à fronteira. Transmissão 24h.',
  keywords: [
    'câmeras ao vivo Foz do Iguaçu',
    'trânsito Ponte da Amizade ao vivo',
    'BR-277 ao vivo',
    'Aduana Ponte da Amizade câmera',
    'trânsito Foz do Iguaçu tempo real',
    'Ponte da Amizade sentido Brasil',
    'Ponte da Amizade sentido Paraguai',
    'câmeras de trânsito Foz',
    'fronteira Brasil Paraguai ao vivo',
    'transito Foz do Iguacu agora',
  ],
  authors: [{ name: 'OQFOZ', url: SITE_URL }],
  creator: 'OQFOZ',
  publisher: 'OQFOZ',
  alternates: {
    canonical: `${SITE_URL}/cameras-ao-vivo`,
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: `${SITE_URL}/cameras-ao-vivo`,
    siteName: 'O Que Fazer em Foz',
    title: 'Câmeras ao Vivo BR-277 e Ponte da Amizade | Trânsito Foz do Iguaçu',
    description: 'Acompanhe o trânsito em tempo real na BR-277, Aduana e Ponte da Amizade. Câmeras ao vivo Foz do Iguaçu: sentido Brasil, sentido Paraguai e acesso à fronteira.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Câmeras ao Vivo BR-277 e Ponte da Amizade | Trânsito Foz do Iguaçu',
    description: 'Acompanhe o trânsito em tempo real na BR-277, Aduana e Ponte da Amizade. Câmeras ao vivo Foz do Iguaçu.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  category: 'technology',
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/cameras-ao-vivo#webpage`,
      url: `${SITE_URL}/cameras-ao-vivo`,
      name: 'Câmeras ao Vivo BR-277 e Ponte da Amizade | Trânsito Foz do Iguaçu',
      description: 'Acompanhe o trânsito em tempo real na BR-277, Aduana e Ponte da Amizade. Câmeras ao vivo Foz do Iguaçu: sentido Brasil, sentido Paraguai e acesso à fronteira. Transmissão 24h.',
      inLanguage: 'pt-BR',
      isPartOf: {
        '@type': 'WebSite',
        '@id': `${SITE_URL}#website`,
        name: 'O Que Fazer em Foz',
        url: SITE_URL,
      },
      about: {
        '@type': 'Thing',
        name: 'Trânsito ao vivo Foz do Iguaçu',
        description: 'Transmissão ao vivo das câmeras de trânsito da BR-277, Aduana e Ponte da Amizade em Foz do Iguaçu.',
      },
    },
    {
      '@type': 'ItemList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'BR-277 – Aduana Ponte da Amizade – Ao vivo' },
        { '@type': 'ListItem', position: 2, name: 'BR-277 – Sentido Ponte da Amizade – Ao vivo' },
        { '@type': 'ListItem', position: 3, name: 'Ponte da Amizade – Sentido Brasil – Ao vivo' },
        { '@type': 'ListItem', position: 4, name: 'Ponte da Amizade – Sentido Paraguai – Ao vivo' },
      ],
    },
  ],
}

export default function CamerasAoVivoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  )
}
