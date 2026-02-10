'use client'

/**
 * PÁGINA PILAR SEO: "O que fazer em Foz do Iguaçu"
 * URL: /o-que-fazer-em-foz-do-iguacu
 *
 * Estratégia: página hub/guia evergreen que domina a keyword principal
 * e variações, com conteúdo estático otimizado + blocos dinâmicos da rede.
 * Estrutura semântica H1 > H2 > H3 para autoridade temática e rich results.
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Script from 'next/script'
import { MapPin, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'

/* ========== FAQ Schema JSON-LD para Rich Results no Google ========== */
const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'O que fazer em Foz do Iguaçu em 1 dia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Em um dia, o essencial é visitar as Cataratas do Iguaçu (lado brasileiro), fazer o passeio de barco Macuco Safari e, se der tempo, o Marco das Três Fronteiras. Priorize as Cataratas pela manhã para evitar filas.'
      }
    },
    {
      '@type': 'Question',
      name: 'O que fazer em Foz do Iguaçu em 3 dias?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Dia 1: Cataratas do Iguaçu (Brasil) e Macuco Safari. Dia 2: Parque das Aves e Itaipu Binacional. Dia 3: Marco das Três Fronteiras, compras em Ciudad del Este (Paraguai) ou passeio ao lado argentino das cataratas.'
      }
    },
    {
      '@type': 'Question',
      name: 'Quais passeios são gratuitos em Foz do Iguaçu?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Vista do Marco das Três Fronteiras (área externa), Ecomuseu de Itaipu (agendado), feira de artesanato, mirantes da cidade e trilhas em parques municipais. A maioria das atrações principais (Cataratas, Itaipu, Parque das Aves) é paga.'
      }
    },
    {
      '@type': 'Question',
      name: 'Vale a pena ir ao Paraguai a partir de Foz?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sim, para compras em Ciudad del Este (eletrônicos, perfumes, bebidas). Recomenda-se ir pela manhã, levar documento e dinheiro em espécie. O trajeto é curto e a fronteira costuma ter movimento.'
      }
    },
    {
      '@type': 'Question',
      name: 'Qual a melhor época para visitar Foz do Iguaçu?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Entre maio e setembro (menos chuva, volume das cataratas ainda bom). Dezembro a março é mais chuvoso mas as cataratas ficam mais cheias. Evite feriados prolongados para menos filas.'
      }
    },
    {
      '@type': 'Question',
      name: 'O que fazer à noite em Foz do Iguaçu?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'O Marco das Três Fronteiras tem show de luzes à noite. Há bares e restaurantes na região da Avenida Brasil e no centro. Consulte eventos e experiências noturnas publicados por empresas locais na nossa rede.'
      }
    }
  ]
}

interface Business {
  id: string
  name: string
  slug: string | null
  category: string
  profileImage: string | null
  description: string | null
  isVerified: boolean
}

/* Bloco dinâmico: cards de atrações puxados da rede (SSR/CSR) */
function AtracoesCards() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/business/list')
      .then((r) => r.ok ? r.json() : { businesses: [] })
      .then((data) => {
        const list = data.businesses || []
        const atracoes = list.filter(
          (b: Business) =>
            b.category &&
            /atração|parque|passeio|tour|cataratas|itaipu|aves|marco|natureza|aventura/i.test(b.category)
        )
        setBusinesses(atracoes.length > 0 ? atracoes.slice(0, 8) : list.slice(0, 6))
      })
      .catch(() => setBusinesses([]))
      .finally(() => setLoading(false))
  }, [])

  const atracoesFixas = [
    { nome: 'Cataratas do Iguaçu', slug: 'cataratas', href: '/empresas?categoria=atração', desc: 'Uma das 7 maravilhas naturais do mundo.' },
    { nome: 'Parque das Aves', slug: 'parque-das-aves', href: '/empresas?categoria=atração', desc: 'Contato com aves da Mata Atlântica.' },
    { nome: 'Itaipu Binacional', slug: 'itaipu', href: '/empresas?categoria=atração', desc: 'Maior usina hidrelétrica em operação.' },
    { nome: 'Marco das Três Fronteiras', slug: 'marco-tres-fronteiras', href: '/empresas?categoria=atração', desc: 'Brasil, Argentina e Paraguai em um só lugar.' },
    { nome: 'City Tour e compras', slug: 'city-tour', href: '/empresas', desc: 'City tour e roteiros de compras.' }
  ]

  if (loading && businesses.length === 0) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-40 rounded-2xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {atracoesFixas.map((a) => (
        <Link
          key={a.slug}
          href={a.href}
          className="block p-4 rounded-2xl border border-gray-200 bg-white hover:border-purple-200 hover:shadow-md transition-all"
        >
          <h3 className="font-semibold text-gray-900 mb-1">{a.nome}</h3>
          <p className="text-sm text-gray-600">{a.desc}</p>
          <span className="text-sm text-purple-600 font-medium mt-2 inline-block">Ver na rede →</span>
        </Link>
      ))}
      {businesses.map((b) => (
        <Link
          key={b.id}
          href={b.slug ? `/empresa/${b.slug}` : '/empresas'}
          className="block p-4 rounded-2xl border border-gray-200 bg-white hover:border-purple-200 hover:shadow-md transition-all"
        >
          <div className="flex items-start gap-3">
            {b.profileImage ? (
              <img src={b.profileImage} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 font-semibold flex-shrink-0">
                {b.name.charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{b.name}</h3>
              <p className="text-sm text-gray-600 line-clamp-2">{b.description || b.category}</p>
              <span className="text-sm text-purple-600 font-medium mt-1 inline-block">Ver perfil →</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

/* FAQ acordeão + Schema */
function FAQBlock() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const faqs = FAQ_SCHEMA.mainEntity.map((q: any) => ({ pergunta: q.name, resposta: q.acceptedAnswer.text }))

  return (
    <>
      <div className="space-y-2">
        {faqs.map((faq, i) => (
          <div
            key={i}
            className="border border-gray-200 rounded-xl overflow-hidden bg-white"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between p-4 text-left font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
            >
              <span>{faq.pergunta}</span>
              {openIndex === i ? <ChevronUp className="w-5 h-5 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 flex-shrink-0" />}
            </button>
            {openIndex === i && (
              <div className="px-4 pb-4 text-gray-600 text-sm border-t border-gray-100 pt-2">
                {faq.resposta}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  )
}

export default function OQueFazerEmFozPage() {
  return (
    <>
      {/* FAQ Schema para rich results no Google */}
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }}
        strategy="afterInteractive"
      />

      <article className="min-h-screen bg-white">
        {/* ========== 1) HERO SEO – H1 único + intro com variações da keyword ========== */}
        <header className="bg-gradient-to-br from-purple-50 via-white to-pink-50 border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
              O que fazer em Foz do Iguaçu – Guia Completo 2026
            </h1>
            <div className="prose prose-gray max-w-none text-gray-600 space-y-4">
              <p>
                Descobrir <strong>o que fazer em Foz do Iguaçu</strong> é mergulhar em um destino completo: natureza, aventura, compras e fronteira. Este guia reúne as melhores atrações, roteiros por quantidade de dias, passeios gratuitos e pagos, vida noturna e dicas de compras no Paraguai e na Argentina – sempre com curadoria e conteúdo atualizado pela nossa rede.
              </p>
              <p>
                Se você está planejando <strong>o que fazer em Foz hoje</strong>, em 3 dias ou em uma semana, use esta página como hub oficial. Aqui você encontra desde as Cataratas e o Parque das Aves até experiências e posts de quem já vive ou visitou a região.
              </p>
              <p>
                Foz do Iguaçu é muito mais que as cataratas: é Itaipu, Marco das Três Fronteiras, Ciudad del Este, Puerto Iguazú e uma oferta crescente de bares, restaurantes e eventos. Este guia está sempre em evolução com a nossa comunidade.
              </p>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 space-y-14">
          {/* ========== 2) H2: Principais atrações – cards + links internos ========== */}
          <section aria-labelledby="atracoes-heading">
            <h2 id="atracoes-heading" className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Principais atrações de Foz do Iguaçu
            </h2>
            <p className="text-gray-600 mb-6">
              As atrações que ninguém pode perder: <strong>Cataratas do Iguaçu</strong>, <strong>Parque das Aves</strong>, <strong>Itaipu Binacional</strong>, <strong>Marco das Três Fronteiras</strong>, <strong>city tour</strong> e <strong>compras</strong>. Abaixo, conteúdo fixo e perfis da rede para você explorar.
            </p>
            <AtracoesCards />
          </section>

          {/* ========== 3) H2: O que fazer por quantidade de dias – H3 com mini-roteiros ========== */}
          <section aria-labelledby="por-dias-heading">
            <h2 id="por-dias-heading" className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              O que fazer em Foz do Iguaçu por quantidade de dias
            </h2>

            <h3 id="1-dia" className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              O que fazer em Foz em 1 dia
            </h3>
            <p className="text-gray-600 mb-2">
              Foque no essencial: <strong>Cataratas do Iguaçu</strong> (lado brasileiro) pela manhã, <strong>Macuco Safari</strong> ou trilha, e à tarde o <strong>Marco das Três Fronteiras</strong>. Veja empresas e experiências da rede em <Link href="/empresas" className="text-purple-600 hover:underline">Empresas</Link> e <Link href="/" className="text-purple-600 hover:underline">feed</Link>.
            </p>

            <h3 id="3-dias" className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              O que fazer em Foz em 3 dias
            </h3>
            <p className="text-gray-600 mb-2">
              <strong>Dia 1:</strong> Cataratas (Brasil) + Macuco Safari. <strong>Dia 2:</strong> Parque das Aves e Itaipu (visita panorâmica ou especial). <strong>Dia 3:</strong> Marco das Três Fronteiras e compras em Ciudad del Este ou passeio ao lado argentino. Confira <Link href="/empresas" className="text-purple-600 hover:underline">passeios e guias na rede</Link>.
            </p>

            <h3 id="5-dias" className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              O que fazer em Foz em 5 dias
            </h3>
            <p className="text-gray-600 mb-2">
              Inclua os 3 dias acima e acrescente: dia na <strong>Argentina</strong> (Cataratas lado argentino, Garganta do Diabo), um dia de <strong>compras e city tour</strong>, e um dia para <strong>aventura</strong> (rafting, tirolesa) ou descanso. Veja <Link href="/mapa-turistico" className="text-purple-600 hover:underline">mapa turístico</Link> e <Link href="/empresas" className="text-purple-600 hover:underline">empresas</Link>.
            </p>

            <h3 id="7-dias" className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              O que fazer em Foz em 7 dias
            </h3>
            <p className="text-gray-600 mb-2">
              Roteiro completo: Cataratas (BR e AR), Itaipu, Parque das Aves, Marco, compras no Paraguai, vida noturna e experiências específicas (aventura, gastronomia). Use esta página e o <Link href="/portal" className="text-purple-600 hover:underline">Portal do Turismo</Link> para se planejar.
            </p>
          </section>

          {/* ========== 4) H2: Passeios gratuitos ========== */}
          <section aria-labelledby="gratuitos-heading">
            <h2 id="gratuitos-heading" className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              Passeios gratuitos em Foz do Iguaçu
            </h2>
            <p className="text-gray-600 mb-4">
              Há opções <strong>gratuitas</strong> e <strong>de graça</strong> para quem quer conhecer Foz <strong>sem pagar</strong> entrada em todos os programas: área externa do <strong>Marco das Três Fronteiras</strong>, <strong>Ecomuseu de Itaipu</strong> (agendamento), feiras de artesanato, mirantes e parques municipais. Consulte sempre horários e agendamentos oficiais.
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Vista e área externa do Marco das Três Fronteiras</li>
              <li>Ecomuseu de Itaipu (visita gratuita, com agendamento)</li>
              <li>Feiras e pontos de artesanato</li>
              <li>Mirantes e trilhas em parques municipais</li>
            </ul>
          </section>

          {/* ========== 5) H2: Passeios pagos e experiências ========== */}
          <section aria-labelledby="pagos-heading">
            <h2 id="pagos-heading" className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              Passeios pagos e experiências imperdíveis
            </h2>
            <p className="text-gray-600 mb-4">
              Separamos por tipo para você escolher: <strong>natureza</strong> (Cataratas, Macuco Safari, Parque das Aves), <strong>família</strong> (parques temáticos, aquários), <strong>aventura</strong> (rafting, tirolesa, helicóptero) e <strong>compras</strong> (roteiros Paraguai/Argentina). Veja ofertas e empresas em <Link href="/empresas" className="text-purple-600 hover:underline">Empresas</Link> e <Link href="/cupons" className="text-purple-600 hover:underline">Cupons</Link>.
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li><strong>Natureza:</strong> Cataratas, Macuco Safari, Parque das Aves, Itaipu</li>
              <li><strong>Família:</strong> parques, aquários, passeios guiados</li>
              <li><strong>Aventura:</strong> rafting, tirolesa, voo de helicóptero</li>
              <li><strong>Compras:</strong> city tour, Paraguai, Argentina</li>
            </ul>
          </section>

          {/* ========== 6) H2: Vida noturna ========== */}
          <section aria-labelledby="noturna-heading">
            <h2 id="noturna-heading" className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              Vida noturna em Foz do Iguaçu
            </h2>
            <p className="text-gray-600 mb-4">
              Bares, restaurantes, eventos e experiências noturnas: o <strong>Marco das Três Fronteiras</strong> tem show de luzes à noite. A região da Avenida Brasil e o centro concentram bares e casas noturnas. Conteúdo ao vivo da rede: veja <Link href="/" className="text-purple-600 hover:underline">feed</Link> e <Link href="/empresas" className="text-purple-600 hover:underline">empresas</Link> para eventos e dicas atualizadas.
            </p>
          </section>

          {/* ========== 7) H2: Compras Paraguai e Argentina ========== */}
          <section aria-labelledby="compras-heading">
            <h2 id="compras-heading" className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              Compras no Paraguai e Argentina
            </h2>
            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">O que comprar</h3>
            <p className="text-gray-600 mb-4">
              Em <strong>Ciudad del Este</strong> (Paraguai): eletrônicos, perfumes, bebidas, cosméticos. Em <strong>Puerto Iguazú</strong> (Argentina): artesanato, vinhos, chocolate e produtos locais. Pesquise preços e leve documento e dinheiro em espécie quando for à fronteira.
            </p>
            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">Quando ir</h3>
            <p className="text-gray-600 mb-4">
              Evite fins de semana e feriados para menos fila na fronteira. Manhã cedo costuma ser melhor para compras no Paraguai.
            </p>
            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">Dicas práticas</h3>
            <p className="text-gray-600 mb-4">
              Leve RG ou passaporte, informe-se sobre limites de compras e declaração na Receita. Muitas empresas da rede oferecem <strong>roteiros de compras</strong> e city tour – confira em <Link href="/empresas" className="text-purple-600 hover:underline">Empresas</Link>.
            </p>
          </section>

          {/* ========== 8) H2: Mapa interativo ========== */}
          <section aria-labelledby="mapa-heading">
            <h2 id="mapa-heading" className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              Mapa interativo – o que fazer em Foz
            </h2>
            <p className="text-gray-600 mb-4">
              Use nosso mapa para ver pontos turísticos e conteúdo da rede associado a cada região.
            </p>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 overflow-hidden min-h-[280px] flex items-center justify-center">
              <Link
                href="/mapa-turistico"
                className="flex flex-col items-center gap-2 p-8 text-gray-600 hover:text-purple-600 transition-colors"
              >
                <MapPin className="w-12 h-12" />
                <span className="font-medium">Abrir mapa turístico</span>
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          </section>

          {/* ========== 9) H2: FAQ – estrutura para FAQ Schema ========== */}
          <section aria-labelledby="faq-heading">
            <h2 id="faq-heading" className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              Perguntas frequentes sobre o que fazer em Foz do Iguaçu
            </h2>
            <FAQBlock />
          </section>
        </div>
      </article>
    </>
  )
}
