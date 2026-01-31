'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Newspaper } from 'lucide-react'
import { getTimeAgo } from '@/utils/formatters'

interface Release {
  id: string
  title: string
  slug: string
  lead: string | null
  body: string
  featuredImageUrl: string | null
  publishedAt: string | null
  createdAt: string
  business: {
    id: string
    name: string
    slug: string
    profileImage: string | null
    isVerified: boolean
  }
}

function stripHtml(html: string): string {
  return (html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function ReleaseCarouselCard({ release }: { release: Release }) {
  const displayDate = release.publishedAt || release.createdAt
  const excerpt = release.lead || stripHtml(release.body).slice(0, 100) + (release.body.length > 100 ? '...' : '')

  return (
    <Link
      href={`/empresa/${release.business.slug}/release/${release.slug}`}
      className="flex-shrink-0 w-[280px] md:w-[300px] snap-start bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all hover:border-purple-200 group"
    >
      {release.featuredImageUrl ? (
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={release.featuredImageUrl}
            alt={release.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : (
        <div className="aspect-video w-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
          <span className="text-4xl font-bold text-purple-300">{release.title.charAt(0)}</span>
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
          <span className="font-medium text-purple-600 truncate">{release.business.name}</span>
          {release.business.isVerified && (
            <img src="/icons/verificado.png" alt="Verificado" className="w-3.5 h-3.5 flex-shrink-0" />
          )}
          <span>•</span>
          <span>{getTimeAgo(displayDate)}</span>
        </div>
        <h3 className="text-base font-bold text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors mb-1">
          {release.title}
        </h3>
        {excerpt && <p className="text-sm text-gray-600 line-clamp-2">{excerpt}</p>}
      </div>
    </Link>
  )
}

export default function ReleaseCarousel() {
  const [releases, setReleases] = useState<Release[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/public/releases/recent')
      .then((res) => res.ok && res.json())
      .then((data) => setReleases(Array.isArray(data) ? data : []))
      .catch(() => setReleases([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="py-6 px-0 md:px-4">
        <div className="flex items-center gap-3 mb-4">
          <Newspaper className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Releases recentes</h3>
        </div>
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-shrink-0 w-[280px] h-[220px] bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (releases.length < 4) return null

  return (
    <div className="py-6 px-0 md:px-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Newspaper className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Releases recentes</h3>
        </div>
      </div>
      <div className="flex gap-4 overflow-x-auto overflow-y-hidden pb-2 -mx-4 px-4 md:mx-0 md:px-0 snap-x snap-mandatory [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
        {releases.map((release) => (
          <ReleaseCarouselCard key={release.id} release={release} />
        ))}
      </div>
    </div>
  )
}
