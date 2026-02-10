'use client'

import Link from 'next/link'
import { MessageCircle, ArrowLeft } from 'lucide-react'

const WHATSAPP_NUMBER = '5545999287669'
const WHATSAPP_DISPLAY = '(45) 99928-7669'

export default function ContatoPage() {
  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors text-sm mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao início
        </Link>

        <div className="bg-gray-50 border border-gray-100 rounded-3xl shadow-sm p-8 md:p-10 text-center">
          <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Contato</h1>
          <p className="text-gray-600 mb-6">
            Entre em contato pelo WhatsApp
          </p>
          <p className="text-xl font-semibold text-gray-900 mb-6 font-mono tracking-wide">
            {WHATSAPP_DISPLAY}
          </p>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-green-500 hover:bg-green-600 text-white font-medium rounded-2xl transition-colors shadow-lg shadow-green-500/25"
          >
            <MessageCircle className="w-5 h-5" />
            Abrir WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}
