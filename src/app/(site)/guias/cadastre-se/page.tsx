'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Users,
  Eye,
  FileText,
  MessageCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  MapPin,
  ArrowRight,
} from 'lucide-react'

export default function GuiasCadastreSePage() {
  const [guidesCount, setGuidesCount] = useState<number | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/public/guides-count')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data?.count != null && setGuidesCount(data.count))
      .catch(() => {})
  }, [])

  const registerUrl = '/register?ref=lp-guias&tipo=guia'

  const benefits = [
    {
      icon: Eye,
      title: 'Visibilidade para turistas',
      text: 'Seu perfil aparece na página Guias e na timeline do OQFOZ, onde milhares de visitantes buscam experiências em Foz.',
    },
    {
      icon: FileText,
      title: 'Perfil profissional',
      text: 'Página própria com foto, especialidades, idiomas, pacotes e contato. Você controla suas informações.',
    },
    {
      icon: MessageCircle,
      title: 'Contato direto',
      text: 'Turistas encontram seu WhatsApp, email e redes. Receba consultas sem intermediários.',
    },
    {
      icon: Sparkles,
      title: 'Pacotes e publicações',
      text: 'Cadastre pacotes com valores e publique posts no feed. Destaque-se com selo de guia verificado.',
    },
  ]

  const steps = [
    { num: 1, title: 'Cadastre-se', desc: 'Crie sua conta em poucos cliques. É gratuito.' },
    { num: 2, title: 'Monte seu perfil', desc: 'Adicione foto, especialidades, idiomas e contatos.' },
    { num: 3, title: 'Apareça para turistas', desc: 'Seu perfil fica visível na plataforma que os turistas usam.' },
  ]

  const faqs = [
    {
      q: 'É gratuito?',
      a: 'Sim. O cadastro e o perfil de guia no OQFOZ são gratuitos.',
    },
    {
      q: 'Quem pode se cadastrar?',
      a: 'Guias de turismo e profissionais que oferecem passeios e experiências em Foz do Iguaçu.',
    },
    {
      q: 'Quanto tempo leva para aprovação?',
      a: 'Analisamos seu cadastro em até 48 horas. Após aprovado, seu perfil fica visível na página Guias.',
    },
    {
      q: 'Preciso de documentação de guia?',
      a: 'Para o selo de guia verificado, podemos solicitar comprovação. O cadastro básico não exige documentos.',
    },
    {
      q: 'Posso divulgar meus pacotes e preços?',
      a: 'Sim. Você pode cadastrar pacotes com valores e publicar posts no feed da plataforma.',
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
          <p className="text-white/90 text-sm sm:text-base font-medium mb-4 flex items-center justify-center gap-2">
            <MapPin className="w-4 h-4" />
            Guias de turismo em Foz do Iguaçu
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6" style={{ letterSpacing: '-0.02em' }}>
            Apareça para milhares de turistas
          </h1>
          <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto mb-10">
            Tenha seu perfil profissional na plataforma que os visitantes usam para descobrir experiências em Foz. Cadastro gratuito.
          </p>
          <Link
            href={registerUrl}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-violet-700 font-bold text-lg shadow-xl hover:bg-white/95 hover:shadow-2xl transition-all duration-200"
          >
            Quero me cadastrar como guia
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="mt-4 text-sm text-white/80">Sem compromisso · Leva menos de 2 minutos</p>
        </div>
      </section>

      {/* Prova social */}
      <section className="border-b border-gray-100 bg-gray-50/50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          {guidesCount != null && guidesCount > 0 ? (
            <p className="text-gray-700 font-medium">
              <span className="text-violet-600 font-bold">{guidesCount}</span> guias já fazem parte do OQFOZ
            </p>
          ) : (
            <p className="text-gray-700 font-medium">
              Guias de Foz já estão se cadastrando no OQFOZ
            </p>
          )}
        </div>
      </section>

      {/* Benefícios */}
      <section className="py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-12" style={{ letterSpacing: '-0.02em' }}>
            O que você ganha
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {benefits.map((b) => {
              const Icon = b.icon
              return (
                <div
                  key={b.title}
                  className="p-6 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md hover:border-violet-100 transition-all duration-200"
                >
                  <div className="w-12 h-12 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{b.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{b.text}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="py-16 sm:py-24 bg-gray-50/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-12" style={{ letterSpacing: '-0.02em' }}>
            Como funciona
          </h2>
          <div className="space-y-8">
            {steps.map((s) => (
              <div key={s.num} className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold">
                  {s.num}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{s.title}</h3>
                  <p className="text-gray-600 mt-1">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link
              href={registerUrl}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 transition-colors"
            >
              Começar agora
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-24">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-10" style={{ letterSpacing: '-0.02em' }}>
            Dúvidas frequentes
          </h2>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="border border-gray-200 rounded-xl overflow-hidden bg-white"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left font-medium text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  {faq.q}
                  {openFaq === i ? <ChevronUp className="w-5 h-5 text-violet-600" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 pt-0 text-gray-600 text-sm leading-relaxed border-t border-gray-100">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-violet-600 to-purple-700 text-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4" style={{ letterSpacing: '-0.02em' }}>
            Pronto para aparecer para mais turistas?
          </h2>
          <p className="text-white/90 mb-8">
            Cadastre-se em menos de 2 minutos. É gratuito e sem compromisso.
          </p>
          <Link
            href={registerUrl}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-violet-700 font-bold text-lg shadow-xl hover:bg-white/95 transition-all"
          >
            <CheckCircle2 className="w-5 h-5" />
            Quero me cadastrar como guia
          </Link>
        </div>
      </section>

      {/* Footer mínimo */}
      <footer className="py-6 border-t border-gray-100 bg-gray-50/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-gray-600">
          <Link href="/guias" className="hover:text-violet-600 font-medium">
            Ver guias cadastrados
          </Link>
          <span className="hidden sm:inline">·</span>
          <Link href="/login" className="hover:text-violet-600 font-medium">
            Já tenho conta — Entrar
          </Link>
        </div>
      </footer>
    </div>
  )
}
