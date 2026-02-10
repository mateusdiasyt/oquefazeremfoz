'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Newspaper, Globe, ArrowRight, Sparkles } from 'lucide-react'
import PortalHero from '@/components/PortalHero'
import PortalCompactCard from '@/components/PortalCompactCard'
import type { PortalReleaseCardRelease } from '@/components/PortalReleaseCard'

export default function PortalPage() {
  const [releases, setReleases] = useState<PortalReleaseCardRelease[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/public/portal/releases', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => setReleases(Array.isArray(data) ? data : []))
      .catch(() => setReleases([]))
      .finally(() => setLoading(false))
  }, [])

  const heroReleases = releases.slice(0, 4)
  const gridReleases = releases.slice(4)

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <section className="pt-6 pb-4 px-4 md:px-6 lg:px-8 border-b border-gray-200 bg-white">
        <div className="w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
              <Newspaper className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Portal do Turismo
              </h1>
              <p className="text-gray-600 text-sm mt-0.5">
                Notícias e conteúdos para turistas — releases das empresas
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 px-4 md:px-6 lg:px-8">
        <div className="w-full max-w-7xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-purple-500 border-t-transparent" />
            </div>
          ) : releases.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                Nenhum conteúdo ainda
              </h2>
              <p className="text-gray-500 max-w-md mx-auto">
                Os releases publicados pelas empresas aprovadas aparecerão aqui. Publique releases no painel da sua empresa para que eles sejam exibidos.
              </p>
            </div>
          ) : (
            <>
              {/* Hero: 1 card grande + 3 pequenos */}
              {heroReleases.length > 0 && (
                <div className="mb-10">
                  <PortalHero releases={heroReleases} />
                </div>
              )}

              {/* Grid de notícias em 2 colunas */}
              {gridReleases.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Notícias do turismo</h2>
                    <Link
                      href="#mais"
                      className="text-sm font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1"
                    >
                      Ver mais <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                  <div id="mais" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {gridReleases.map((release, i) => (
                      <PortalCompactCard key={release.id} release={release} index={i + 1} />
                    ))}
                  </div>
                  <div className="mt-10 overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/5 via-white to-pink-500/5 border border-purple-100/80 shadow-sm">
                    <div className="flex gap-4 p-6 md:p-8">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Como funciona</h3>
                        <p className="text-gray-600 leading-relaxed">
                          Qualquer empresa aprovada no OQFOZ pode aparecer no Portal do Turismo. Basta publicar um <span className="font-semibold text-purple-700">release</span> (notícia ou conteúdo) pelo painel da sua empresa — o conteúdo será exibido aqui automaticamente para turistas e visitantes.
                        </p>
                        <p className="text-gray-600 leading-relaxed mt-2">
                          Quer divulgar sua empresa ou atração? Cadastre-se, seja aprovado e comece a publicar releases.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  )
}
