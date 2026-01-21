'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Star, Users, Phone, Globe, Instagram, ExternalLink } from 'lucide-react'
import VerificationBadge from '../../../components/VerificationBadge'

// Ícone do WhatsApp
const WhatsAppIcon = ({ size = 20, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
    <path d="M8 12h.01M12 12h.01M16 12h.01"/>
  </svg>
)

interface Empresa {
  id: string
  name: string
  slug: string | null
  address: string
  phone: string | null
  website: string | null
  instagram: string | null
  facebook: string | null
  whatsapp: string | null
  profileImage: string | null
  description: string | null
  category: string
  followersCount: number
  averageRating: number
  reviewsCount: number
  isVerified: boolean
}

declare global {
  interface Window {
    L: any
  }
}

export default function MapaTuristico() {
  const router = useRouter()
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null)
  const [map, setMap] = useState<any>(null)
  const [markers, setMarkers] = useState<any[]>([])

  useEffect(() => {
    fetchEmpresas()
    loadLeafletMap()
  }, [])

  useEffect(() => {
    // Adicionar estilos CSS para o Leaflet
    const style = document.createElement('style')
    style.textContent = `
      .custom-div-icon {
        background: transparent !important;
        border: none !important;
      }
      .leaflet-popup-content-wrapper {
        border-radius: 8px !important;
      }
      .leaflet-popup-tip {
        background: white !important;
      }
    `
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  const fetchEmpresas = async () => {
    try {
      console.log('🔍 Buscando empresas para o mapa...')
      const response = await fetch('/api/map/empresas')
      if (response.ok) {
        const data = await response.json()
        console.log('📦 Dados recebidos da API:', data)
        console.log('🏢 Número de empresas:', data.empresas?.length || 0)
        setEmpresas(data.empresas || [])
      } else {
        console.error('❌ Erro na resposta da API:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('❌ Erro ao buscar empresas:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadLeafletMap = () => {
    if (window.L) {
      initializeMap()
      return
    }

    // Verificar se já existe o Leaflet
    const existingScript = document.querySelector('script[src*="leaflet"]')
    if (existingScript) {
      const checkLeaflet = setInterval(() => {
        if (window.L) {
          clearInterval(checkLeaflet)
          initializeMap()
        }
      }, 100)
      return
    }

    // Carregar CSS do Leaflet
    const cssLink = document.createElement('link')
    cssLink.rel = 'stylesheet'
    cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(cssLink)
    
    // Carregar JS do Leaflet
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => {
      setTimeout(initializeMap, 100)
    }
    document.head.appendChild(script)
  }

  const initializeMap = () => {
    if (!window.L) return

    const mapElement = document.getElementById('map')
    if (!mapElement) {
      console.warn('Elemento do mapa não encontrado, tentando novamente...')
      setTimeout(initializeMap, 500)
      return
    }

    // Coordenadas de Foz do Iguaçu
    const fozDoIguacu = [-25.5167, -54.5856]

    try {
      const mapInstance = window.L.map('map').setView(fozDoIguacu, 13)

      // Adicionar camada do mapa
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstance)

      setMap(mapInstance)
    } catch (error) {
      console.error('Erro ao inicializar o mapa:', error)
    }
  }

  useEffect(() => {
    if (map && empresas.length > 0) {
      createMarkers()
    }
  }, [map, empresas])

  const createMarkers = async () => {
    if (!map || !window.L) return

    console.log('📍 Criando markers para', empresas.length, 'empresas')
    
    // Limpar markers existentes
    markers.forEach(marker => map.removeLayer(marker))
    const newMarkers: any[] = []

    for (let i = 0; i < empresas.length; i++) {
      const empresa = empresas[i]
      
      try {
        // Geocodificar endereço usando Nominatim (OpenStreetMap)
        console.log('🔍 Geocodificando:', empresa.name, '-', empresa.address)
        const coordinates = await geocodeAddressNominatim(empresa.address)
        if (coordinates) {
          console.log('✅ Coordenadas encontradas para', empresa.name, ':', coordinates)
          // Criar ícone customizado
          const iconHtml = `
            <div style="
              width: 40px; 
              height: 40px; 
              background: #3B82F6; 
              border: 2px solid #1D4ED8; 
              border-radius: 50%; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              color: white; 
              font-weight: bold; 
              font-size: 16px;
              position: relative;
            ">
              ${empresa.name.charAt(0).toUpperCase()}
              ${empresa.isVerified ? '<div style="position: absolute; top: -5px; right: -5px; width: 16px; height: 16px; background: #10B981; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 10px;">✓</div>' : ''}
            </div>
          `

          const customIcon = window.L.divIcon({
            html: iconHtml,
            className: 'custom-div-icon',
            iconSize: [40, 40],
            iconAnchor: [20, 40]
          })

          const marker = window.L.marker(coordinates, { icon: customIcon }).addTo(map)

          // Popup
          const popupContent = `
            <div style="min-width: 200px; padding: 10px;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <h3 style="margin: 0; font-weight: bold; color: #1f2937;">${empresa.name}</h3>
                ${empresa.isVerified ? '<div style="width: 16px; height: 16px; background: #3B82F6; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 10px;">✓</div>' : ''}
              </div>
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">${empresa.category}</p>
              <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 12px; font-size: 12px; color: #6b7280;">
                <span>👥 ${empresa.followersCount} seguidores</span>
              </div>
              <button 
                onclick="window.location.href='/empresa/${empresa.slug || empresa.id}'" 
                style="
                  width: 100%; 
                  background: #3B82F6; 
                  color: white; 
                  border: none; 
                  padding: 8px 12px; 
                  border-radius: 6px; 
                  cursor: pointer;
                  font-size: 12px;
                "
                onmouseover="this.style.background='#2563EB'"
                onmouseout="this.style.background='#3B82F6'"
              >
                Ver Perfil
              </button>
            </div>
          `

          marker.bindPopup(popupContent)

          marker.on('click', () => {
            setSelectedEmpresa(empresa)
          })

          newMarkers.push(marker)
        }
      } catch (error) {
        console.error(`Erro ao geocodificar endereço da empresa ${empresa.name}:`, error)
      }
    }

    setMarkers(newMarkers)
  }

  const geocodeAddressNominatim = async (address: string): Promise<[number, number] | null> => {
    try {
      const query = encodeURIComponent(`${address}, Foz do Iguaçu, Paraná, Brasil`)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`
      )
      const data = await response.json()
      
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat)
        const lng = parseFloat(data[0].lon)
        return [lat, lng]
      }
      
      return null
    } catch (error) {
      console.error('Erro na geocodificação:', error)
      return null
    }
  }

  const handleEmpresaClick = (empresa: Empresa) => {
    router.push(`/empresa/${empresa.slug || empresa.id}`)
  }

  const handleLocalizeEmpresa = async (empresa: Empresa) => {
    if (!map || !window.L) return

    try {
      const coordinates = await geocodeAddressNominatim(empresa.address)
      if (coordinates) {
        // Mover o mapa para a empresa
        map.setView(coordinates, 15)
        
        // Encontrar e abrir o popup do marker correspondente
        markers.forEach((marker: any) => {
          const markerLatLng = marker.getLatLng()
          if (
            Math.abs(markerLatLng.lat - coordinates[0]) < 0.0001 &&
            Math.abs(markerLatLng.lng - coordinates[1]) < 0.0001
          ) {
            marker.openPopup()
            setSelectedEmpresa(empresa)
          }
        })
      }
    } catch (error) {
      console.error('Erro ao localizar empresa:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🗺️ Mapa Turístico de Foz do Iguaçu
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Descubra as <span className="font-semibold text-pink-600">top 20 empresas verificadas</span> com mais seguidores em Foz do Iguaçu. 
            Clique nos pins para conhecer mais sobre cada estabelecimento!
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-soft text-center">
            <div className="text-3xl font-bold text-pink-600 mb-2">{empresas.length}</div>
            <div className="text-gray-600">Empresas Verificadas</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-soft text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {empresas.reduce((total, emp) => total + emp.followersCount, 0)}
            </div>
            <div className="text-gray-600">Total de Seguidores</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-soft text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {empresas.reduce((total, emp) => total + emp.reviewsCount, 0)}
            </div>
            <div className="text-gray-600">Avaliações</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Mapa */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-pink-500 to-blue-500 text-white">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Mapa Interativo
                </h2>
                <p className="text-sm opacity-90 mt-1">
                  Clique nos pins para ver detalhes das empresas
                </p>
              </div>
              <div id="map" className="w-full h-[500px]"></div>
            </div>
          </div>

          {/* Lista de Empresas */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-pink-500" />
              Top Empresas
            </h2>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {empresas.map((empresa, index) => (
                <div
                  key={empresa.id}
                  onClick={() => handleEmpresaClick(empresa)}
                  className="bg-white rounded-xl p-4 shadow-soft hover:shadow-medium transition-all duration-300 cursor-pointer group"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      {empresa.profileImage ? (
                        <img
                          src={empresa.profileImage}
                          alt={empresa.name}
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold">
                          {empresa.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 truncate group-hover:text-pink-600 transition-colors">
                          {empresa.name}
                        </h3>
                        {empresa.isVerified && <VerificationBadge size="sm" />}
                        <span className="bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded-full">
                          #{index + 1}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">{empresa.category}</p>
                      
                      <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{empresa.followersCount}</span>
                        </div>
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleLocalizeEmpresa(empresa)
                        }}
                        className="mt-2 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                      >
                        <MapPin className="w-3 h-3" />
                        Localizar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legenda */}
        <div className="mt-8 bg-white rounded-2xl p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Como funciona o ranking?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">Ranking por Seguidores</div>
                <div>As empresas são ordenadas pelo número de seguidores, mostrando as mais populares primeiro.</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <VerificationBadge size="sm" />
              </div>
              <div>
                <div className="font-medium text-gray-900">Apenas Verificadas</div>
                <div>Somente empresas verificadas aparecem no mapa, garantindo qualidade e confiabilidade.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
