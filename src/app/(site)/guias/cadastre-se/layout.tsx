import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cadastre-se como Guia | OQFOZ - Foz do Iguaçu',
  description: 'Tenha seu perfil de guia de turismo no OQFOZ. Apareça para milhares de turistas em Foz do Iguaçu. Cadastro gratuito.',
}

export default function GuiasCadastreSeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
