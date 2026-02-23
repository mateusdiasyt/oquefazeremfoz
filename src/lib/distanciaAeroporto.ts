/**
 * Calcula a distância em km do Aeroporto Internacional de Foz do Iguaçu até um endereço.
 * Usa Nominatim (OpenStreetMap) para geocoding e OSRM para distância por rodovia.
 * Não requer API key.
 */

const FOZ_AEROPORTO_LON = -54.4872
const FOZ_AEROPORTO_LAT = -25.5963
const USER_AGENT = 'OQFOZ-Planejador/1.0 (contato@oquefazeremfoz.com.br)'

/** Fallbacks para nomes de atrativos que o Nominatim não encontra bem só com o nome. */
const FALLBACK_BUSCA: Record<string, string> = {
  'cataratas brasil': 'Parque Nacional do Iguaçu, Foz do Iguaçu, Paraná',
  'cataratas argentina': 'Cataratas del Iguazú, Puerto Iguazú, Argentina',
  'parque das aves': 'Parque das Aves, Rodovia das Cataratas, Foz do Iguaçu',
  'itaipu panorâmica': 'Usina de Itaipu, Foz do Iguaçu',
  'itaipu especial': 'Usina de Itaipu, Foz do Iguaçu',
  'marco das 3 fronteiras': 'Marco das Três Fronteiras, Foz do Iguaçu',
  'marco das três fronteiras': 'Marco das Três Fronteiras, Foz do Iguaçu',
  'museu de cera': 'Dreamland Museu de Cera, Foz do Iguaçu',
  'vale dos dinossauros': 'Vale dos Dinossauros, Foz do Iguaçu',
  'bar de gelo': 'Bar do Gelo, Foz do Iguaçu',
  'compras no paraguai': 'Ciudad del Este, Paraguai',
  'city tour': 'Centro, Foz do Iguaçu, Paraná',
  'passeio de barco': 'Porto das Cataratas, Foz do Iguaçu',
}

interface NominatimResult {
  lat: string
  lon: string
  display_name?: string
}

async function geocodificarUma(query: string): Promise<{ lat: number; lon: number } | null> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=br,py,ar`
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
  })
  if (!res.ok) return null
  const data = (await res.json()) as NominatimResult[]
  if (!data?.length) return null
  const lat = parseFloat(data[0].lat)
  const lon = parseFloat(data[0].lon)
  if (Number.isNaN(lat) || Number.isNaN(lon)) return null
  return { lat, lon }
}

/** Converte endereço em coordenadas (Nominatim). Tenta fallback para nomes conhecidos. */
export async function geocodificar(endereco: string): Promise<{ lat: number; lon: number } | null> {
  const normalizado = endereco.trim().toLowerCase()
  const fallback = FALLBACK_BUSCA[normalizado]
  const tentativas = [
    fallback || `${endereco.trim()}, Foz do Iguaçu, Paraná, Brasil`,
    ...(fallback ? [] : [`${endereco.trim()}, Foz do Iguaçu, Brasil`]),
  ]
  for (let i = 0; i < tentativas.length; i++) {
    if (i > 0) await new Promise((r) => setTimeout(r, 1100))
    const coords = await geocodificarUma(tentativas[i])
    if (coords) return coords
  }
  return null
}

/** Retorna distância em km entre aeroporto e ponto (OSRM driving). */
export async function distanciaKmAteAeroporto(lat: number, lon: number): Promise<number | null> {
  const coords = `${FOZ_AEROPORTO_LON},${FOZ_AEROPORTO_LAT};${lon},${lat}`
  const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=false`
  const res = await fetch(url)
  if (!res.ok) return null
  const data = (await res.json()) as { routes?: Array<{ distance: number }>; code?: string }
  if (data.code !== 'Ok' || !data.routes?.length) return null
  const distanceMeters = data.routes[0].distance
  return Math.round((distanceMeters / 1000) * 10) / 10
}

/** Dado um endereço, retorna a distância em km do aeroporto (geocoding + OSRM). */
export async function calcularDistanciaDoAeroporto(endereco: string): Promise<number | null> {
  const coords = await geocodificar(endereco)
  if (!coords) return null
  return distanciaKmAteAeroporto(coords.lat, coords.lon)
}
