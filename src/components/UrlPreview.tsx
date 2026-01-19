'use client'

import { useState, useEffect } from 'react'
import { ExternalLink, Globe } from 'lucide-react'

interface UrlPreviewProps {
  url: string
}

interface UrlMetadata {
  title?: string
  description?: string
  image?: string
  siteName?: string
  domain?: string
}

export default function UrlPreview({ url }: UrlPreviewProps) {
  const [metadata, setMetadata] = useState<UrlMetadata | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (url && isValidUrl(url)) {
      fetchUrlMetadata(url)
    }
  }, [url])

  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  const getDomain = (url: string): string => {
    try {
      const urlObj = new URL(url)
      return urlObj.hostname.replace('www.', '')
    } catch {
      return url
    }
  }

  const fetchUrlMetadata = async (url: string) => {
    setLoading(true)
    setError(false)
    
    try {
      const response = await fetch(`/api/url-metadata?url=${encodeURIComponent(url)}`)
      
      if (response.ok) {
        const data = await response.json()
        setMetadata({
          title: data.title || 'Link',
          description: data.description || 'Clique para acessar',
          image: data.image,
          siteName: data.siteName || getDomain(url),
          domain: getDomain(url)
        })
      } else {
        setError(true)
      }
    } catch (error) {
      console.error('Erro ao buscar metadata:', error)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  const handleClick = () => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  if (loading) {
    return (
      <div className="mt-4 border border-gray-200 rounded-xl p-4 bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !metadata) {
    return (
      <div className="mt-4 border border-gray-200 rounded-xl overflow-hidden bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer" onClick={handleClick}>
        {/* Imagem placeholder em 16:9 */}
        <div className="relative w-full bg-gradient-to-r from-pink-500 to-pink-600" style={{ aspectRatio: '16/9' }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <Globe className="w-16 h-16 text-white opacity-80" />
          </div>
          {/* Overlay com ícone de link externo */}
          <div className="absolute top-3 right-3 w-8 h-8 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
            <ExternalLink className="w-4 h-4 text-white" />
          </div>
        </div>
        
        {/* Conteúdo do card */}
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-base leading-tight mb-2">
                {getDomain(url)}
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Clique para acessar
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="mt-4 border border-gray-200 rounded-xl overflow-hidden bg-white hover:shadow-lg transition-all duration-200 cursor-pointer group"
      onClick={handleClick}
    >
      {/* Imagem em 16:9 */}
      {metadata.image && (
        <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
          <img
            src={metadata.image}
            alt={metadata.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
          {/* Overlay com ícone de link externo */}
          <div className="absolute top-3 right-3 w-8 h-8 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
            <ExternalLink className="w-4 h-4 text-white" />
          </div>
        </div>
      )}
      
      {/* Conteúdo do card */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-base leading-tight mb-2 line-clamp-2">
              {metadata.title}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {metadata.description}
            </p>
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500 truncate">
                {metadata.domain}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
