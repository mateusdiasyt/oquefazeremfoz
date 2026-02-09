'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Globe, Share2 } from 'lucide-react'

function stripHtml(html: string): string {
  return (html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function formatDate(dateString: string): string {
  const d = new Date(dateString)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${day}/${month}/${year}, ${hours}:${minutes}`
}

export interface PortalReleaseCardRelease {
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

interface PortalReleaseCardProps {
  release: PortalReleaseCardRelease
}

export default function PortalReleaseCard({ release }: PortalReleaseCardProps) {
  const releaseHref = `/empresa/${release.business.slug}/release/${release.slug}`
  const companyHref = `/empresa/${release.business.slug}`
  const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${releaseHref}` : releaseHref
  const domain = typeof window !== 'undefined' ? window.location.host : 'www.oquefazeremfoz.com.br'

  const plain = stripHtml(release.body)
  const excerpt = release.lead || plain.slice(0, 220) + (plain.length > 220 ? '...' : '')

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const url = `${typeof window !== 'undefined' ? window.location.origin : ''}${releaseHref}`
    if (navigator.share) {
      navigator.share({ title: release.title, url }).catch(() => navigator.clipboard?.writeText(url))
    } else {
      navigator.clipboard?.writeText(url)
    }
  }

  return (
    <article className="w-full bg-white border border-gray-200 rounded-none shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Fonte + data em uma linha */}
      <Link href={companyHref} className="flex items-center gap-3 px-4 pt-4 pb-2 hover:opacity-90">
        <div className="w-9 h-9 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 bg-purple-100">
          {release.business.profileImage ? (
            <img src={release.business.profileImage} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-purple-600 font-bold text-sm">
              {release.business.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900 text-sm truncate">
              {release.business.name}
            </span>
            {release.business.isVerified && (
              <img src="/icons/verificado.png" alt="" className="w-4 h-4 flex-shrink-0" />
            )}
          </div>
          <p className="text-xs text-gray-500">{formatDate(release.publishedAt || release.createdAt)}</p>
        </div>
      </Link>

      {/* URL clicável */}
      <Link href={releaseHref} className="block px-4 pb-3">
        <span className="text-sm text-blue-600 hover:underline break-all">{fullUrl}</span>
      </Link>

      {/* Imagem em destaque + ícone compartilhar */}
      <Link href={releaseHref} className="block relative w-full aspect-[16/10] bg-gray-100">
        {release.featuredImageUrl ? (
          <img
            src={release.featuredImageUrl}
            alt={release.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            Sem imagem
          </div>
        )}
        <button
          type="button"
          onClick={handleShare}
          className="absolute top-3 right-3 w-9 h-9 rounded-lg bg-white/90 hover:bg-white flex items-center justify-center shadow-sm"
          aria-label="Compartilhar"
        >
          <Share2 className="w-4 h-4 text-gray-600" />
        </button>
      </Link>

      {/* Título + resumo + fonte */}
      <div className="p-4 pt-3">
        <Link href={releaseHref}>
          <h2 className="font-bold text-gray-900 text-lg leading-snug mb-2 hover:text-purple-600 transition-colors">
            {release.title}
          </h2>
        </Link>
        {excerpt && (
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">
            {excerpt}
          </p>
        )}
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Globe className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{domain}</span>
        </div>
      </div>
    </article>
  )
}
