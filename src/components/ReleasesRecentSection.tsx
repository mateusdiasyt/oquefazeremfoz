'use client'

import { useState, useEffect } from 'react'
import { Newspaper } from 'lucide-react'
import ReleaseNewsCard, { type ReleaseNewsCardRelease } from './ReleaseNewsCard'

interface ReleasesRecentSectionProps {
  /** Quando mudar, refaz o fetch (ex: após publicar uma release). */
  refreshKey?: number
}

export default function ReleasesRecentSection({ refreshKey = 0 }: ReleasesRecentSectionProps) {
  const [releases, setReleases] = useState<ReleaseNewsCardRelease[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch('/api/public/releases/recent')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setReleases(Array.isArray(data) ? data : []))
      .catch(() => setReleases([]))
      .finally(() => setLoading(false))
  }, [refreshKey])

  if (loading) {
    return (
      <div className="py-4 px-0 md:px-4 space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <Newspaper className="w-4 h-4 text-purple-600" />
          <h3 className="text-sm font-semibold text-gray-900">Releases recentes</h3>
        </div>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-3xl overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-100" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-full" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (releases.length === 0) return null

  return (
    <div className="py-4 px-0 md:px-4">
      <div className="flex items-center gap-2 mb-4">
        <Newspaper className="w-4 h-4 text-purple-600" />
        <h3 className="text-sm font-semibold text-gray-900">Releases recentes</h3>
      </div>
      <div className="space-y-4">
        {releases.map((release) => (
          <ReleaseNewsCard key={release.id} release={release} />
        ))}
      </div>
    </div>
  )
}
