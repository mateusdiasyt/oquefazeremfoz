/**
 * Calcula a distância em km do Aeroporto Internacional de Foz do Iguaçu até um endereço.
 * Usa Nominatim (OpenStreetMap) para geocoding e OSRM para distância por rodovia.
 * Não requer API key.
 */

const FOZ_AEROPORTO_LON = -54.4872
const FOZ_AEROPORTO_LAT = -25.5963
const USER_AGENT = 'OQFOZ-Planejador/1.0 (contato@oquefazeremfoz.com.br)'

interface NominatimResult {
  lat: string
  lon: string
  display_name?: string
}

/** Converte endereço em coordenadas (Nominatim). */
export async function geocodificar(endereco: string): Promise<{ lat: number; lon: number } | null> {
  const query = encodeURIComponent(`${endereco}, Foz do Iguaçu, Brasil`)
  const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`
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
