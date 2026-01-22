'use client'

import { useState } from 'react'
import { X, Share2, MessageCircle, Linkedin, Facebook, Copy, Check } from 'lucide-react'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  post: {
    id: string
    title: string
    business: {
      name: string
      slug: string
    }
  }
}

export default function ShareModal({ isOpen, onClose, post }: ShareModalProps) {
  const [copied, setCopied] = useState(false)
  
  const postUrl = `${window.location.origin}/post/${post.id}`
  const businessUrl = `${window.location.origin}/empresa/${post.business.slug}`
  
  const shareText = `Confira esta postagem de ${post.business.name}: "${post.title}"`
  
  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-green-500 hover:bg-green-600',
      action: () => {
        const url = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${postUrl}`)}`
        window.open(url, '_blank')
      }
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'bg-blue-600 hover:bg-blue-700',
      action: () => {
        const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`
        window.open(url, '_blank')
      }
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-500 hover:bg-blue-600',
      action: () => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`
        window.open(url, '_blank')
      }
    }
  ]

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(postUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Erro ao copiar:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
              <Share2 className="w-5 h-5 text-pink-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Compartilhar</h3>
              <p className="text-sm text-gray-500">Escolha onde compartilhar</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Post preview */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h4 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
              {post.title}
            </h4>
            <p className="text-xs text-gray-600">
              por {post.business.name}
            </p>
          </div>

          {/* Share options */}
          <div className="space-y-3">
            {shareOptions.map((option) => (
              <button
                key={option.name}
                onClick={option.action}
                className={`w-full flex items-center gap-4 p-4 rounded-xl text-white font-medium transition-all duration-200 hover:scale-105 ${option.color}`}
              >
                <option.icon size={20} />
                <span>Compartilhar no {option.name}</span>
              </button>
            ))}
          </div>

          {/* Copy link */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-1">Link da postagem</p>
                <p className="text-sm text-gray-800 truncate">{postUrl}</p>
              </div>
              <button
                onClick={copyToClipboard}
                className={`p-3 rounded-xl transition-colors duration-200 ${
                  copied 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {copied ? <Check size={20} /> : <Copy size={20} />}
              </button>
            </div>
            {copied && (
              <p className="text-xs text-green-600 mt-2 text-center">
                Link copiado para a área de transferência!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}





