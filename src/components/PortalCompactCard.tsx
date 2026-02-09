'use client'

import Link from 'next/link'
import type { PortalReleaseCardRelease } from './PortalReleaseCard'

function formatDate(dateString: string): string {
  const d = new Date(dateString)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

interface PortalCompactCardProps {
  release: PortalReleaseCardRelease
  index: number
}

export default function PortalCompactCard({ release, index }: PortalCompactCardProps) {
  const href = `/empresa/${release.business.slug}/release/${release.slug}`

  return (
    <Link
      href={href}
      className="flex gap-4 p-3 rounded-xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50/30 transition-all group"
    >
      <div className="relative w-24 flex-shrink-0 aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
        {release.featuredImageUrl ? (
          <img
            src={release.featuredImageUrl}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-full h-full bg-purple-100 flex items-center justify-center text-purple-400 text-xs font-medium">
            {release.business.name.charAt(0)}
          </div>
        )}
        <span className="absolute top-1 right-1 w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center">
          {String(index).padStart(2, '0')}
        </span>
      </div>
      <div className="flex-1 min-w-0 py-0.5">
        <span className="inline-block px-2 py-0.5 rounded bg-purple-100 text-purple-700 text-xs font-semibold mb-1">
          Release
        </span>
        <div className="flex items-center gap-2 mb-0.5">
          <div className="w-5 h-5 rounded-full overflow-hidden border border-gray-200 flex-shrink-0 bg-purple-100">
            {release.business.profileImage ? (
              <img src={release.business.profileImage} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="w-full h-full flex items-center justify-center text-purple-600 text-[10px] font-bold">
                {release.business.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 truncate">
            Por {release.business.name}
            {release.business.isVerified && (
              <img src="/icons/verificado.png" alt="" className="inline-block w-3.5 h-3.5 ml-1 align-middle" />
            )}
          </p>
        </div>
        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-purple-600 transition-colors">
          {release.title}
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">{formatDate(release.publishedAt || release.createdAt)}</p>
      </div>
    </Link>
  )
}
