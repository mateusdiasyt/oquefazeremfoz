import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Câmeras ao vivo | O Que Fazer em Foz',
  description: 'Acompanhe o trânsito em tempo real na BR-277 e Ponte da Amizade. Câmeras ao vivo da Aduana e sentidos Brasil e Paraguai.',
}

export default function CamerasAoVivoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
