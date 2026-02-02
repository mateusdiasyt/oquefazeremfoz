'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Globe } from 'lucide-react'

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

export interface ReleaseNewsCardRelease {
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

interface ReleaseNewsCardProps {
  release: ReleaseNewsCardRelease
  baseUrl?: string
}

export default function ReleaseNewsCard({ release, baseUrl }: ReleaseNewsCardProps) {
  const href = `/empresa/${release.business.slug}/release/${release.slug}`
  const [displayUrl, setDisplayUrl] = useState(baseUrl ? `${baseUrl.replace(/\/$/, '')}${href}` : href)
  const [domain, setDomain] = useState(baseUrl ? (() => { try { return new URL(baseUrl).host } catch { return 'Portal' } })() : 'Portal')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDisplayUrl(`${window.location.origin}${href}`)
      setDomain(window.location.host)
    }
  }, [href])

  const excerpt = release.lead || stripHtml(release.body).slice(0, 180) + (release.body.length > 180 ? '...' : '')

  return (
    <article className="bg-white border-b-2 border-gray-200 md:border md:border-gray-100 md:rounded-3xl md:shadow-sm hover:md:shadow-md transition-all duration-200 overflow-hidden p-4 md:p-6 mb-0 md:mb-6">
      <Link href={href} className="block">
        {/* Cabeçalho: logo, nome, verificado, data */}
        <div className="flex items-start gap-3 pb-2">
          <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 bg-purple-100">
            {release.business.profileImage ? (
              <img src={release.business.profileImage} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-purple-600 font-bold text-sm">
                {release.business.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-gray-900 text-sm" style={{ letterSpacing: '-0.01em' }}>
                {release.business.name}
              </span>
              {release.business.isVerified && (
                <img
                  src="/icons/verificado.png"
                  alt="Verificado"
                  className="w-4 h-4 object-contain"
                  title="Verificado"
                />
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{formatDate(release.publishedAt || release.createdAt)}</p>
          </div>
        </div>

        {/* URL em destaque */}
        <div className="pb-3">
          <span className="text-sm text-blue-600 hover:underline break-all font-medium">{displayUrl}</span>
        </div>

        {/* Card de conteúdo: imagem, título, lead, fonte */}
        <div className="border-t border-gray-100 bg-white rounded-2xl overflow-hidden border border-gray-100">
          {release.featuredImageUrl && (
            <div className="relative w-full aspect-[16/10] bg-gray-200">
              <img
                src={release.featuredImageUrl}
                alt={release.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-white/90 flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            </div>
          )}
          <div className="p-4">
            <h3 className="font-bold text-gray-900 text-base leading-snug mb-2" style={{ letterSpacing: '-0.01em' }}>
              {release.title}
            </h3>
            {excerpt && (
              <p className="text-sm text-gray-600 leading-relaxed line-clamp-3" style={{ letterSpacing: '-0.01em' }}>
                {excerpt}
              </p>
            )}
            <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-500">
              <Globe className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{domain || 'Portal'}</span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  )
}
