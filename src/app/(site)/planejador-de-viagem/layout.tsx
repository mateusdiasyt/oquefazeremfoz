import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Planejador de Viagem — Foz do Iguaçu',
  description:
    'Planeje sua viagem para Foz do Iguaçu em segundos: escolha atrativos, número de dias e pessoas e receba um roteiro otimizado com custos estimados.',
  openGraph: {
    title: 'Planejador de Viagem — Foz do Iguaçu | OQFOZ',
    description:
      'Roteiro otimizado, custos e dias para Cataratas, Itaipu, Marco das 3 Fronteiras e mais.',
  },
}

export default function PlanejadorDeViagemLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
