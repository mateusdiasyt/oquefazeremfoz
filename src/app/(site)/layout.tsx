'use client'

import Header from '../../components/Header'
import FloatingChat from '../../components/FloatingChat'
import MobileNavigation from '../../components/MobileNavigation'

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      <main className="pb-20 md:pb-0">{children}</main>
      <FloatingChat />
      <MobileNavigation />
    </>
  )
}
