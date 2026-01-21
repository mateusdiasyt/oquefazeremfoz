import type { Metadata } from 'next'
import Script from 'next/script'
import { Inter, Poppins, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '../contexts/AuthContext'
import { NotificationProvider } from '../contexts/NotificationContext'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'OQFOZ - O que fazer em Foz do Iguaçu',
    template: '%s | OQFOZ'
  },
  description: 'Descubra os melhores hotéis, restaurantes, atrações, passeios, ingressos e promoções em Foz do Iguaçu. Encontre empresas verificadas, cupons exclusivos e monte seu roteiro perfeito.',
  keywords: [
    'Foz do Iguaçu',
    'atrações turísticas',
    'hotéis Foz do Iguaçu',
    'restaurantes Foz do Iguaçu',
    'passeios Foz do Iguaçu',
    'ingressos Cataratas',
    'turismo Foz do Iguaçu',
    'o que fazer em Foz',
    'pontos turísticos',
    'promoções Foz do Iguaçu',
    'cupons de desconto',
    'empresas verificadas',
    'roteiro turístico'
  ],
  authors: [{ name: 'OQFOZ' }],
  creator: 'OQFOZ',
  publisher: 'OQFOZ',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://oquefazeremfoz.com.br',
    siteName: 'OQFOZ',
    title: 'OQFOZ - O que fazer em Foz do Iguaçu',
    description: 'Descubra os melhores hotéis, restaurantes, atrações, passeios, ingressos e promoções em Foz do Iguaçu. Encontre empresas verificadas, cupons exclusivos e monte seu roteiro perfeito.',
    images: [
      {
        url: 'https://oquefazeremfoz.com.br/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'OQFOZ - O que fazer em Foz do Iguaçu',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OQFOZ - O que fazer em Foz do Iguaçu',
    description: 'Descubra os melhores hotéis, restaurantes, atrações, passeios, ingressos e promoções em Foz do Iguaçu',
    images: ['https://oquefazeremfoz.com.br/og-image.jpg'],
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
  verification: {
    google: 'google-site-verification-code', // Adicione quando tiver o código do Google Search Console
  },
  alternates: {
    canonical: 'https://oquefazeremfoz.com.br',
  },
  metadataBase: new URL('https://oquefazeremfoz.com.br'),
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${poppins.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans bg-white text-gray-900 antialiased">
        <Script
          id="website-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'OQFOZ',
              description: 'Descubra os melhores hotéis, restaurantes, atrações, passeios, ingressos e promoções em Foz do Iguaçu',
              url: 'https://oquefazeremfoz.com.br',
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://oquefazeremfoz.com.br/empresas?search={search_term_string}',
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
        <Script
          id="organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'OQFOZ',
              url: 'https://oquefazeremfoz.com.br',
              logo: 'https://oquefazeremfoz.com.br/favicon.png',
              description: 'Plataforma para descobrir o que fazer em Foz do Iguaçu',
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Foz do Iguaçu',
                addressRegion: 'PR',
                addressCountry: 'BR',
              },
            }),
          }}
        />
        <AuthProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
