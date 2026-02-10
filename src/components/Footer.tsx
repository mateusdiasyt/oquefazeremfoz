'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Banner {
  id: string
  title: string | null
  subtitle: string | null
  link: string | null
  imageUrl: string | null
  isActive: boolean
  order: number
}

export default function Footer() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    fetchBanners()
  }, [])

  useEffect(() => {
    if (banners.length > 1 && !isPaused) {
      // Auto-rotacionar a cada 5 segundos
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % banners.length)
      }, 5000)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [banners.length, isPaused])

  const fetchBanners = async () => {
    try {
      const response = await fetch('/api/banners')
      if (response.ok) {
        const data = await response.json()
        const activeBanners = (data.banners || []).filter((b: Banner) => b.isActive)
        setBanners(activeBanners)
      } else {
        console.error('❌ Erro ao buscar banners:', response.status)
      }
    } catch (error) {
      console.error('❌ Erro ao buscar banners:', error)
    }
  }

  const goToPrevious = () => {
    if (banners.length === 0) return
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)
    setIsPaused(true)
    setTimeout(() => setIsPaused(false), 10000) // Retomar auto-rotacao após 10s
  }

  const goToNext = () => {
    if (banners.length === 0) return
    setCurrentIndex((prev) => (prev + 1) % banners.length)
    setIsPaused(true)
    setTimeout(() => setIsPaused(false), 10000) // Retomar auto-rotacao após 10s
  }

  const goToSlide = (index: number) => {
    if (banners.length === 0) return
    setCurrentIndex(index)
    setIsPaused(true)
    setTimeout(() => setIsPaused(false), 10000) // Retomar auto-rotacao após 10s
  }

  // Sempre mostrar o footer, mesmo sem banners
  const currentBanner = banners.length > 0 ? banners[currentIndex] : null

  return (
    <footer className="bg-white border-t border-gray-100 w-full relative z-10">
      {/* Carrossel de Banners - tamanho reduzido */}
      {banners.length > 0 && currentBanner && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="relative">
            <div className="overflow-hidden rounded-xl shadow-sm border border-gray-200 bg-gray-900">
              <div className="relative h-52 md:h-64">
                {banners.map((banner, index) => (
                  <div
                    key={banner.id}
                    className={`absolute inset-0 transition-opacity duration-500 ${
                      index === currentIndex ? 'opacity-100' : 'opacity-0'
                    }`}
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                  >
                    {banner.link ? (
                      <a
                        href={banner.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full h-full relative cursor-pointer group"
                      >
                        {banner.imageUrl ? (
                          <img
                            src={banner.imageUrl}
                            alt="Banner"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-r from-pink-600 to-blue-600" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                      </a>
                    ) : (
                      <>
                        {banner.imageUrl ? (
                          <img
                            src={banner.imageUrl}
                            alt="Banner"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-r from-pink-600 to-blue-600" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                      </>
                    )}
                    
                    {/* Botão Patrocine aqui */}
                    <div className="absolute top-2 right-2 md:top-3 md:right-3 z-20 pointer-events-auto">
                      <a
                        href="https://wa.me/5545999287669?text=Olá! Tenho interesse em patrocinar no banner da página inicial."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-black/50 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full hover:bg-black/70 transition-all duration-200 border border-white/20"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Patrocine aqui
                      </a>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Banner indicators */}
              {banners.length > 1 && (
                <div className="absolute bottom-2 right-2 md:bottom-3 md:right-3 flex gap-1.5 z-10">
                  {banners.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-200 ${
                        index === currentIndex 
                          ? 'bg-white' 
                          : 'bg-white/50 hover:bg-white/70'
                      }`}
                      aria-label={`Ir para banner ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rodapé - fundo mais escuro para diferenciar do body */}
      <div className="border-t border-gray-200 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-center sm:text-left">
            <div className="space-y-0.5">
              <p className="text-gray-500 text-sm">
                © {new Date().getFullYear()} O Que Fazer em Foz. Todos os direitos reservados.
              </p>
              <p className="text-gray-500 text-sm">
                Desenvolvido por{' '}
                <a
                  href="https://www.instagram.com/devmateusmendoza/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:text-purple-700 transition-colors font-medium"
                >
                  Mateus Mendoza
                </a>
              </p>
            </div>
            <nav className="flex flex-wrap justify-center sm:justify-end gap-x-6 gap-y-1 text-sm">
              <a href="/" className="text-gray-600 hover:text-purple-600 transition-colors">
                Início
              </a>
              <a href="/empresas" className="text-gray-600 hover:text-purple-600 transition-colors">
                Empresas
              </a>
              <a href="/mapa-turistico" className="text-gray-600 hover:text-purple-600 transition-colors">
                Mapa Turístico
              </a>
              <a href="/contato" className="text-gray-600 hover:text-purple-600 transition-colors">
                Contato
              </a>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  )
}
