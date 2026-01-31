'use client'

import Link from 'next/link'
import { Calendar, Edit3, Trash2 } from 'lucide-react'
import { getTimeAgo } from '@/utils/formatters'

interface Release {
  id: string
  title: string
  slug: string
  lead: string | null
  body: string
  featuredImageUrl: string | null
  isPublished: boolean
  publishedAt: string | null
  createdAt: string
  business?: { slug: string }
}

interface ReleaseCardProps {
  release: Release
  businessSlug: string
  isOwner?: boolean
  onEdit?: (release: Release) => void
  onDelete?: (releaseId: string) => void
}

export default function ReleaseCard({ release, businessSlug, isOwner, onEdit, onDelete }: ReleaseCardProps) {
  const displayDate = release.publishedAt || release.createdAt
  const excerpt = release.lead || release.body?.slice(0, 120) + (release.body?.length > 120 ? '...' : '')

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <Link href={`/empresa/${businessSlug}/release/${release.slug}`} className="block">
        {release.featuredImageUrl ? (
          <div className="aspect-video w-full overflow-hidden">
            <img
              src={release.featuredImageUrl}
              alt={release.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        ) : (
          <div className="aspect-video w-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
            <span className="text-4xl font-bold text-purple-300">{release.title.charAt(0)}</span>
          </div>
        )}
        <div className="p-5">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <Calendar className="w-4 h-4" />
            <span>{getTimeAgo(displayDate)}</span>
            {!release.isPublished && (
              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">Rascunho</span>
            )}
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 hover:text-purple-600 transition-colors">
            {release.title}
          </h3>
          {excerpt && (
            <p className="text-sm text-gray-600 line-clamp-2">{excerpt}</p>
          )}
        </div>
      </Link>
      {isOwner && (onEdit || onDelete) && (
        <div className="px-5 pb-4 flex gap-2">
          {onEdit && (
            <button
              onClick={(e) => { e.preventDefault(); onEdit(release) }}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              Editar
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => { e.preventDefault(); onDelete(release.id) }}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Excluir
            </button>
          )}
        </div>
      )}
    </div>
  )
}
