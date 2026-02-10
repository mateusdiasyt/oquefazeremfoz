'use client'

import Link from 'next/link'
import { Share2 } from 'lucide-react'
import type { PortalReleaseCardRelease } from './PortalReleaseCard'

function formatDate(dateString: string): string {
  const d = new Date(dateString)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

function handleShare(e: React.MouseEvent, releaseHref: string) {
  e.preventDefault()
  e.stopPropagation()
  const url = `${typeof window !== 'undefined' ? window.location.origin : ''}${releaseHref}`
  if (navigator.share) {
    navigator.share({ title: '', url }).catch(() => navigator.clipboard?.writeText(url))
  } else {
    navigator.clipboard?.writeText(url)
  }
}

export default function PortalHero({ releases }: { releases: PortalReleaseCardRelease[] }) {
  const [featured, ...side] = releases.slice(0, 4)
  if (!featured) return null

  const featuredHref = `/empresa/${featured.business.slug}/release/${featured.slug}`

  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5">
      {/* Card grande - ~2/3 */}
      <Link
        href={featuredHref}
        className="lg:col-span-2 relative group block overflow-hidden rounded-xl bg-gray-900 min-h-[320px] lg:min-h-[380px]"
      >
        {featured.featuredImageUrl ? (
          <img
            src={featured.featuredImageUrl}
            alt={featured.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-800 to-pink-800" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <span className="absolute top-4 left-4 px-3 py-1 rounded bg-purple-600 text-white text-xs font-bold uppercase tracking-wide">
          Destaque
        </span>
        <button
          type="button"
          onClick={(e) => handleShare(e, featuredHref)}
          className="absolute top-4 right-4 w-10 h-10 rounded-lg bg-white/90 hover:bg-white flex items-center justify-center shadow-sm z-10"
          aria-label="Compartilhar"
        >
          <Share2 className="w-5 h-5 text-gray-700" />
        </button>
        <div className="absolute bottom-0 left-0 right-0 p-5 lg:p-6">
          <p className="text-white/80 text-sm mb-1">{formatDate(featured.publishedAt || featured.createdAt)}</p>
          <h2 className="text-xl lg:text-2xl font-bold text-white leading-tight line-clamp-2 group-hover:text-purple-200 transition-colors">
            {featured.title}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-6 h-6 rounded-full overflow-hidden border border-white/30 flex-shrink-0 bg-white/20">
              {featured.business.profileImage ? (
                <img src={featured.business.profileImage} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                  {featured.business.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <p className="text-white/70 text-sm truncate">{featured.business.name}</p>
            {featured.business.isVerified && (
              <img src="/icons/verificado.png" alt="" className="w-4 h-4 flex-shrink-0 opacity-90" />
            )}
          </div>
        </div>
      </Link>

      {/* 3 cards pequenos - ~1/3 */}
      <div className="flex flex-col gap-4 lg:gap-5">
        {side.map((release) => {
          const href = `/empresa/${release.business.slug}/release/${release.slug}`
          return (
            <Link
              key={release.id}
              href={href}
              className="flex gap-3 flex-1 min-h-0 rounded-xl overflow-hidden bg-white border border-gray-200 hover:border-purple-200 hover:shadow-md transition-all group"
            >
              <div className="w-28 flex-shrink-0 aspect-[4/3] bg-gray-100 overflow-hidden">
                {release.featuredImageUrl ? (
                  <img
                    src={release.featuredImageUrl}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full bg-purple-100 flex items-center justify-center text-purple-400 text-xs">
                    Sem imagem
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 py-2 pr-3 flex flex-col justify-center">
                <p className="text-xs text-gray-500 mb-0.5">{formatDate(release.publishedAt || release.createdAt)}</p>
                <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-purple-600 transition-colors">
                  {release.title}
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-4 h-4 rounded-full overflow-hidden border border-gray-200 flex-shrink-0 bg-purple-100">
                    {release.business.profileImage ? (
                      <img src={release.business.profileImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="w-full h-full flex items-center justify-center text-purple-600 text-[10px] font-bold">
                        {release.business.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">{release.business.name}</p>
                  {release.business.isVerified && (
                    <img src="/icons/verificado.png" alt="" className="w-3 h-3 flex-shrink-0" />
                  )}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
