'use client'

import { useState, useEffect, useMemo } from 'react'
import DOMPurify from 'dompurify'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar } from 'lucide-react'
import { capitalizeWords, getTimeAgo } from '@/utils/formatters'

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
  }
}

export default function ReleaseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [release, setRelease] = useState<Release | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRelease = async () => {
      try {
        const res = await fetch(
          `/api/public/release?businessSlug=${params.slug}&releaseSlug=${params.releaseSlug}`
        )
        if (!res.ok) {
          if (res.status === 404) {
            router.push(`/empresa/${params.slug}`)
            return
          }
          throw new Error('Erro ao carregar')
        }
        const data = await res.json()
        setRelease(data)
      } catch {
        router.push(`/empresa/${params.slug}`)
      } finally {
        setLoading(false)
      }
    }
    if (params.slug && params.releaseSlug) {
      fetchRelease()
    }
  }, [params.slug, params.releaseSlug, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!release) return null

  const displayDate = release.publishedAt || release.createdAt
  const sanitizedBody = useMemo(() => {
    const html = release.body || ''
    const safeTags = ['p', 'br', 'strong', 'em', 'u', 'a', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'blockquote']
    if (html.trim().startsWith('<')) {
      if (typeof window !== 'undefined') {
        return DOMPurify.sanitize(html, { ALLOWED_TAGS: safeTags, ALLOWED_ATTR: ['href', 'target', 'rel'] })
      }
      return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').replace(/on\w+="[^"]*"/gi, '')
    }
    return html.replace(/\n/g, '<br />')
  }, [release.body])

  return (
    <div className="min-h-screen bg-white">
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
        <Link
          href={`/empresa/${release.business.slug}`}
          className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para {capitalizeWords(release.business.name)}
        </Link>

        <header className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Calendar className="w-4 h-4" />
            <time dateTime={displayDate}>{getTimeAgo(displayDate)}</time>
            <span>•</span>
            <span>{capitalizeWords(release.business.name)}</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" style={{ letterSpacing: '-0.02em' }}>
            {release.title}
          </h1>

          {release.lead && (
            <p className="text-xl text-gray-600 leading-relaxed" style={{ letterSpacing: '-0.01em' }}>
              {release.lead}
            </p>
          )}
        </header>

        {release.featuredImageUrl && (
          <div className="rounded-2xl overflow-hidden mb-8 shadow-lg">
            <img
              src={release.featuredImageUrl}
              alt={release.title}
              className="w-full h-auto object-cover"
            />
          </div>
        )}

        <div
          className="prose prose-lg max-w-none text-gray-700 leading-relaxed [&_a]:text-purple-600 [&_a]:underline [&_a:hover]:text-purple-700"
          style={{ letterSpacing: '-0.01em' }}
          dangerouslySetInnerHTML={{ __html: sanitizedBody }}
        />
      </article>
    </div>
  )
}
