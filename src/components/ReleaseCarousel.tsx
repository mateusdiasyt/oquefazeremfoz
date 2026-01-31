'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Newspaper } from 'lucide-react'

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

function ReleaseCarouselCard({ release }: { release: Release }) {
  return (
    <Link
      href={`/empresa/${release.business.slug}/release/${release.slug}`}
      className="flex-shrink-0 w-[110px] snap-start group"
    >
      <div className="relative w-full aspect-[9/16] max-h-[200px] rounded-2xl overflow-hidden border-2 border-transparent group-hover:border-purple-400 transition-all shadow-sm group-hover:shadow-lg ring-2 ring-purple-200/60 group-hover:ring-purple-400/80">
        {release.featuredImageUrl ? (
          <img
            src={release.featuredImageUrl}
            alt={release.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
            <span className="text-3xl font-bold text-white drop-shadow">{release.title.charAt(0)}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <div className="absolute top-2 left-2 w-9 h-9 rounded-full border-2 border-white overflow-hidden bg-white flex-shrink-0 ring-2 ring-purple-400/80">
          {release.business.profileImage ? (
            <img src={release.business.profileImage} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-purple-500 flex items-center justify-center text-white font-bold text-sm">
              {release.business.name.charAt(0)}
            </div>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-2 text-center">
          <span className="text-xs font-semibold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] line-clamp-2 block">
            {release.business.name}
          </span>
        </div>
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
      <div className="py-4 px-0 md:px-4">
        <div className="flex items-center gap-2 mb-3">
          <Newspaper className="w-4 h-4 text-purple-600" />
          <h3 className="text-sm font-semibold text-gray-900">Releases recentes</h3>
        </div>
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex-shrink-0 w-[110px] aspect-[9/16] max-h-[200px] bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (releases.length === 0) return null

  return (
    <div className="py-4 px-0 md:px-4">
      <div className="flex items-center gap-2 mb-3">
        <Newspaper className="w-4 h-4 text-purple-600" />
        <h3 className="text-sm font-semibold text-gray-900">Releases recentes</h3>
      </div>
      <div className="flex gap-3 overflow-x-auto overflow-y-hidden pb-1 -mx-4 px-4 md:mx-0 md:px-0 snap-x snap-mandatory [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-gray-50 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">
        {releases.map((release) => (
          <ReleaseCarouselCard key={release.id} release={release} />
        ))}
      </div>
    </div>
  )
}
