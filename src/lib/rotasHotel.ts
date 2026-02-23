/**
 * Rotas hotel → atrativos para cálculo de km e combustível (carro próprio).
 * Usa geocodificar (Nominatim) e OSRM para distância por rodovia.
 */

import { geocodificar } from './distanciaAeroporto'

export interface Coord {
  lat: number
  lon: number
}

/** Distância em km entre dois pontos (Haversine, linha reta). Usado para ordenar atrativos. */
export function haversineKm(a: Coord, b: Coord): number {
  const R = 6371 // raio da Terra em km
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLon = ((b.lon - a.lon) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const x =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
  return R * c
}

/** Retorna distância total em km da rota passando pelos pontos na ordem (OSRM driving). */
export async function distanciaRotaKm(pontos: Coord[]): Promise<number | null> {
  if (pontos.length < 2) return 0
  const coordsStr = pontos.map((p) => `${p.lon},${p.lat}`).join(';')
  const url = `https://router.project-osrm.org/route/v1/driving/${coordsStr}?overview=false`
  const res = await fetch(url)
  if (!res.ok) return null
  const data = (await res.json()) as { routes?: Array<{ distance: number }>; code?: string }
  if (data.code !== 'Ok' || !data.routes?.length) return null
  const distanceMeters = data.routes[0].distance
  return Math.round((distanceMeters / 1000) * 10) / 10
}

/** Geocodifica um endereço (re-export para uso em rotas). */
export { geocodificar }

/** Ordena atrativos por distância (Haversine) do hotel — mais perto primeiro. */
export function ordenarAtrativosPorDistanciaDoHotel<T>(
  atrativos: T[],
  hotelCoords: Coord,
  getCoord: (a: T) => Coord | null
): T[] {
  return [...atrativos].sort((a, b) => {
    const distA = getCoord(a) ? haversineKm(hotelCoords, getCoord(a)!) : 9999
    const distB = getCoord(b) ? haversineKm(hotelCoords, getCoord(b)!) : 9999
    return distA - distB
  })
}
