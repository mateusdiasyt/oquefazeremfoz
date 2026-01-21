'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Banner {
  id: string
  title: string
  subtitle: string
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
        setBanners(data.banners || [])
      }
    } catch (error) {
      console.error('Erro ao buscar banners:', error)
    }
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)
    setIsPaused(true)
    setTimeout(() => setIsPaused(false), 10000) // Retomar auto-rotacao após 10s
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length)
    setIsPaused(true)
    setTimeout(() => setIsPaused(false), 10000) // Retomar auto-rotacao após 10s
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    setIsPaused(true)
    setTimeout(() => setIsPaused(false), 10000) // Retomar auto-rotacao após 10s
  }

  if (banners.length === 0) {
    return null // Não mostrar footer se não houver banners
  }

  const currentBanner = banners[currentIndex]

  return (
    <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white mt-16">
      {/* Carrossel de Banners */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="relative">
            {/* Banner Atual */}
            <div
              className="transition-all duration-500 ease-in-out"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {currentBanner.imageUrl ? (
                <div
                  className="relative h-48 md:h-64 rounded-xl overflow-hidden shadow-lg"
                  style={{
                    backgroundImage: `url(${currentBanner.imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  {/* Overlay escuro para melhorar legibilidade */}
                  <div className="absolute inset-0 bg-black/40"></div>
                  
                  {/* Conteúdo do banner */}
                  <div className="relative h-full flex flex-col justify-center items-center text-center px-4">
                    <h3 className="text-2xl md:text-3xl font-bold mb-2 drop-shadow-lg">
                      {currentBanner.title}
                    </h3>
                    {currentBanner.subtitle && (
                      <p className="text-sm md:text-base text-gray-200 drop-shadow-md max-w-2xl">
                        {currentBanner.subtitle}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-pink-600 to-blue-600 h-48 md:h-64 rounded-xl flex flex-col justify-center items-center text-center px-4 shadow-lg">
                  <h3 className="text-2xl md:text-3xl font-bold mb-2">
                    {currentBanner.title}
                  </h3>
                  {currentBanner.subtitle && (
                    <p className="text-sm md:text-base text-gray-100 max-w-2xl">
                      {currentBanner.subtitle}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Botões de navegação */}
            {banners.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-all duration-200 z-10"
                  aria-label="Banner anterior"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-all duration-200 z-10"
                  aria-label="Próximo banner"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Indicadores de slide */}
            {banners.length > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                {banners.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? 'bg-white w-8'
                        : 'bg-white/40 w-2 hover:bg-white/60'
                    }`}
                    aria-label={`Ir para banner ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

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
