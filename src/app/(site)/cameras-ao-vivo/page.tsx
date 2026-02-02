'use client'

import { Video } from 'lucide-react'

const CAMERAS = [
  {
    id: 'aduanapontedaamizade',
    title: 'BR-277 – Aduana Ponte da Amizade',
    subtitle: 'Ao vivo',
    url: 'https://playerv.logicahost.com.br/video-ip-camera/portovelhomamore//false/false/dmlkZW8wNC5sb2dpY2Fob3N0LmNvbS5icisx/16:9/YUhSMGNITTZMeTg9K1o=/fozaduanapontedaamizade.stream/',
  },
  {
    id: 'sentidopontedaamizade',
    title: 'BR-277 – Sentido Ponte da Amizade',
    subtitle: 'Ao vivo',
    url: 'https://playerv.logicahost.com.br/video-ip-camera/portaldacidade//false/false/V2tjeGMyRXhjRmhQU0dST1lWUldlbGxxU210alJtdDVVbTA1YVUwd05IZFVSekZQWkcxS1ZFNVhiR3BhZWpBNStS/16:9/V1ZWb1UwMUhUa2xVVkZwTlpWUm5PUT09K1I=/fozsentidopontedaamizade01.stream/',
  },
  {
    id: 'sentidobrasil',
    title: 'Ponte da Amizade – Sentido Brasil',
    subtitle: 'Ao vivo',
    url: 'https://playerv.logicahost.com.br/video-ip-camera/portovelhomamore//false/false/V2tjeGMyRXhjRmhQU0dSUFVYcFdlbGxxU210alJtdDVVbTA1YVUwd05IZFVSekZQWkcxS1ZFNVhiR3BhZWpBNStS/16:9/V1ZWb1UwMUhUa2xVVkZwTlpWUm5PUT09K1I=/fozpontedaamizadesentidobrasil.stream/',
  },
  {
    id: 'sentidoparaguai',
    title: 'Ponte da Amizade – Sentido Paraguai',
    subtitle: 'Ao vivo',
    url: 'https://playerv.logicahost.com.br/video-ip-camera/portovelhomamore//false/false/V2tjeGMyRXhjRmhQU0dSUFVYcFdlbGxxU210alJtdDVVbTA1YVUwd05IZFVSekZQWkcxS1ZFNVhiR3BhZWpBNStS/16:9/V1ZWb1UwMUhUa2xVVkZwTlpWUm5PUT09K1I=/fozpontedaamizadesentidoparaguai.stream/',
  },
]

export default function CamerasAoVivoPage() {
  return (
    <main id="conteudo" className="min-h-screen bg-white" role="main" aria-label="Câmeras ao vivo - Trânsito Foz do Iguaçu">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12" aria-labelledby="titulo-cameras">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center" aria-hidden>
              <Video className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 id="titulo-cameras" className="text-2xl md:text-3xl font-bold text-gray-900" style={{ letterSpacing: '-0.02em' }}>
                Câmeras ao vivo – BR-277 e Ponte da Amizade
              </h1>
              <p className="text-gray-600 text-sm mt-0.5">
                Acompanhe o trânsito em tempo real na região da Ponte da Amizade
              </p>
            </div>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed max-w-3xl">
            Transmissão ao vivo das câmeras de trânsito em Foz do Iguaçu: BR-277, Aduana Ponte da Amizade, sentido Brasil e sentido Paraguai. Confira o trânsito na fronteira antes de sair.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" role="list">
          {CAMERAS.map((camera) => (
            <article
              key={camera.id}
              className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              itemScope
              itemType="https://schema.org/VideoObject"
              aria-labelledby={`camera-${camera.id}`}
            >
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                <h2 id={`camera-${camera.id}`} className="font-semibold text-gray-900 text-base" style={{ letterSpacing: '-0.01em' }} itemProp="name">
                  {camera.title}
                </h2>
                <p className="text-xs text-purple-600 font-medium mt-0.5" aria-label="Transmissão ao vivo">{camera.subtitle}</p>
              </div>
              <div className="relative w-full aspect-video bg-gray-900">
                <iframe
                  src={camera.url}
                  title={`${camera.title} – transmissão ao vivo`}
                  className="absolute inset-0 w-full h-full"
                  allow="autoplay; fullscreen"
                  allowFullScreen
                />
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
