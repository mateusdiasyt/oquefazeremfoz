'use client'

import { BarChart2, Clock, FileText, Type } from 'lucide-react'
import { getWordCount, getHeadingStructure } from './RichTextEditor'

function stripHtml(html: string): string {
  if (typeof document === 'undefined') {
    return (html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  }
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return (tmp.textContent || tmp.innerText || '').trim()
}

interface SEOPanelProps {
  title: string
  lead: string
  bodyHtml: string
}

export default function SEOPanel({ title, lead, bodyHtml }: SEOPanelProps) {
  const titleLen = title.trim().length
  const leadLen = lead.trim().length
  const wordCount = getWordCount(bodyHtml || '')
  const readingTime = Math.max(1, Math.ceil(wordCount / 200))
  const headings = getHeadingStructure(bodyHtml || '')

  const titleOk = titleLen >= 30 && titleLen <= 60
  const leadOk = leadLen === 0 || (leadLen >= 120 && leadLen <= 160)
  const hasStructure = headings.h1 > 0 || headings.h2 > 0 || headings.h3 > 0

  return (
    <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-4">
      <div className="flex items-center gap-2 mb-4">
        <BarChart2 className="w-5 h-5 text-purple-600" />
        <h3 className="font-semibold text-gray-800">Análise SEO</h3>
      </div>
      <div className="space-y-3 text-sm">
        <div className="flex items-start gap-3">
          <Type className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
          <div>
            <span className="text-gray-700">Título:</span>{' '}
            <span className={titleOk ? 'text-green-600 font-medium' : titleLen === 0 ? 'text-gray-500' : 'text-amber-600'}>
              {titleLen} caracteres
            </span>
            {titleLen > 0 && !titleOk && (
              <p className="text-xs text-gray-500 mt-0.5">
                {titleLen < 30 ? 'Ideal: 30-60 caracteres' : 'Evite títulos muito longos (máx. ~60)'}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-start gap-3">
          <FileText className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
          <div>
            <span className="text-gray-700">Resumo (meta):</span>{' '}
            <span className={leadOk || leadLen === 0 ? 'text-green-600 font-medium' : 'text-amber-600'}>
              {leadLen} caracteres
            </span>
            {leadLen > 0 && !leadOk && (
              <p className="text-xs text-gray-500 mt-0.5">Ideal para SEO: 120-160 caracteres</p>
            )}
          </div>
        </div>
        <div className="flex items-start gap-3">
          <BarChart2 className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
          <div>
            <span className="text-gray-700">Conteúdo:</span>{' '}
            <span className="text-gray-900 font-medium">{wordCount} palavras</span>
            {wordCount < 300 && wordCount > 0 && (
              <p className="text-xs text-amber-600 mt-0.5">Textos com 300+ palavras tendem a ranquear melhor</p>
            )}
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Clock className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
          <div>
            <span className="text-gray-700">Tempo de leitura:</span>{' '}
            <span className="text-gray-900 font-medium">~{readingTime} min</span>
          </div>
        </div>
        <div className="flex items-start gap-3 pt-2 border-t border-gray-100">
          <FileText className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
          <div>
            <span className="text-gray-700">Estrutura:</span>{' '}
            {hasStructure ? (
              <span className="text-green-600 font-medium">
                H1: {headings.h1} · H2: {headings.h2} · H3: {headings.h3}
              </span>
            ) : (
              <span className="text-amber-600">Use títulos (H1, H2, H3) para organizar o texto</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
