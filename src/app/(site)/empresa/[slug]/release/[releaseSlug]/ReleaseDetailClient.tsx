'use client'

import { useMemo, useState, useEffect } from 'react'
import DOMPurify from 'dompurify'
import Link from 'next/link'
import { ArrowLeft, Calendar } from 'lucide-react'
import { capitalizeWords, getTimeAgo } from '@/utils/formatters'
import { useLocale } from '@/contexts/LocaleContext'
import { getTranslations } from '@/lib/translations'
import { translateContent } from '@/lib/translateContent'

export interface Release {
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

export default function ReleaseDetailClient({ release }: { release: Release }) {
  const { locale } = useLocale()
  const t = getTranslations(locale)
  const [displayTitle, setDisplayTitle] = useState(release.title)
  const [displayLead, setDisplayLead] = useState<string | null>(release.lead)

  useEffect(() => {
    if (locale === 'pt') {
      setDisplayTitle(release.title)
      setDisplayLead(release.lead)
      return
    }
    let cancelled = false
    Promise.all([
      translateContent(release.title, locale),
      release.lead ? translateContent(release.lead, locale) : Promise.resolve(null)
    ]).then(([title, lead]) => {
      if (!cancelled) {
        setDisplayTitle(title)
        setDisplayLead(lead ?? null)
      }
    })
    return () => { cancelled = true }
  }, [release.id, release.title, release.lead, locale])

  const sanitizedBody = useMemo(() => {
    const html = release?.body || ''
    const safeTags = ['p', 'br', 'strong', 'em', 'u', 'a', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'blockquote']
    if (html.trim().startsWith('<')) {
      if (typeof window !== 'undefined') {
        return DOMPurify.sanitize(html, { ALLOWED_TAGS: safeTags, ALLOWED_ATTR: ['href', 'target', 'rel'] })
      }
      return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').replace(/on\w+="[^"]*"/gi, '')
    }
    return html.replace(/\n/g, '<br />')
  }, [release?.body])

  const displayDate = release.publishedAt || release.createdAt

  return (
    <div className="min-h-screen bg-white">
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
        <Link
          href={`/empresa/${release.business.slug}`}
          className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.release.backToCompany} {capitalizeWords(release.business.name)}
        </Link>

        <header className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Calendar className="w-4 h-4" />
            <time dateTime={displayDate}>{getTimeAgo(displayDate, t.time)}</time>
            <span>•</span>
            <span>{capitalizeWords(release.business.name)}</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" style={{ letterSpacing: '-0.02em' }}>
            {displayTitle}
          </h1>

          {(displayLead ?? release.lead) && (
            <p className="text-xl text-gray-600 leading-relaxed" style={{ letterSpacing: '-0.01em' }}>
              {displayLead ?? release.lead}
            </p>
          )}
        </header>

        {release.featuredImageUrl && (
          <div className="rounded-2xl overflow-hidden mb-8 shadow-lg">
            <img
              src={release.featuredImageUrl}
              alt={displayTitle}
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
