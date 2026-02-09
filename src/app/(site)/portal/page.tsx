'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Newspaper, Globe } from 'lucide-react'
import ReleaseNewsCard, { type ReleaseNewsCardRelease } from '@/components/ReleaseNewsCard'

export default function PortalPage() {
  const [releases, setReleases] = useState<ReleaseNewsCardRelease[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/public/portal/releases', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => setReleases(Array.isArray(data) ? data : []))
      .catch(() => setReleases([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <section className="pt-6 pb-4 px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
              <Newspaper className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Portal do Turismo
              </h1>
              <p className="text-gray-600 text-sm mt-0.5">
                Notícias e conteúdos para turistas — releases das empresas Portal
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-12 px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
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
                Os releases das empresas com categoria &quot;Portais&quot; aparecerão aqui. Cadastre empresas como Portal e publique releases para que eles sejam exibidos.
              </p>
            </div>
          ) : (
            <div className="space-y-0">
              {releases.map((release) => (
                <ReleaseNewsCard key={release.id} release={release} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
