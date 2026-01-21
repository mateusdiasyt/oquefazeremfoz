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
        console.log('🎯 Banners carregados:', activeBanners.length)
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
    <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white w-full relative z-10">
      {/* Carrossel de Banners */}
      {banners.length > 0 && currentBanner && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="relative">
            <div className="overflow-hidden rounded-2xl shadow-soft">
              <div className="relative h-64 md:h-80">
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
                        {/* Overlay mais claro e com pointer-events-none para permitir cliques */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
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
                        {/* Overlay mais claro quando não há link */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                      </>
                    )}
                    
                    {/* Botão Patrocine aqui - sempre acima do overlay */}
                    <div className="absolute top-4 right-4 z-20 pointer-events-auto">
                      <a
                        href="https://wa.me/5545999287669?text=Olá! Tenho interesse em patrocinar no banner da página inicial."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-black/40 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full hover:bg-black/60 transition-all duration-300 border border-white/20 hover:border-white/40 opacity-75 hover:opacity-100"
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
                <div className="absolute bottom-4 right-4 flex gap-2 z-10">
                  {banners.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
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

      {/* Informações do rodapé */}
      <div className="border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-gray-400 text-sm">
                © {new Date().getFullYear()} O Que Fazer em Foz. Todos os direitos reservados.
              </p>
            </div>
            <div className="flex gap-6 text-sm text-gray-400">
              <a href="/" className="hover:text-white transition-colors">
                Início
              </a>
              <a href="/empresas" className="hover:text-white transition-colors">
                Empresas
              </a>
              <a href="/mapa-turistico" className="hover:text-white transition-colors">
                Mapa Turístico
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
