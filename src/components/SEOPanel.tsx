'use client'

import { useMemo } from 'react'
import {
  BarChart2,
  Clock,
  FileText,
  Type,
  MessageSquare,
  Layout,
  Search,
  Sparkles,
  Lightbulb
} from 'lucide-react'
import { runSEOAnalysis } from '@/lib/seoAnalysis'
import { getWordCount } from './RichTextEditor'

interface SEOPanelProps {
  title: string
  lead: string
  bodyHtml: string
}

export default function SEOPanel({ title, lead, bodyHtml }: SEOPanelProps) {
  const analysis = useMemo(() => runSEOAnalysis(title, lead, bodyHtml), [title, lead, bodyHtml])
  const readingTime = Math.max(1, Math.ceil(getWordCount(bodyHtml) / 200))

  const statusColor = (status: string) => {
    if (status.includes('✅') || status.includes('⭐')) return 'text-green-600'
    if (status.includes('⚠️')) return 'text-amber-600'
    return 'text-red-600'
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-white/80">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-800">Análise SEO</h3>
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`text-2xl font-bold px-4 py-1 rounded-xl ${
                analysis.grade === 'excelente'
                  ? 'bg-green-100 text-green-700'
                  : analysis.grade === 'bom'
                    ? 'bg-emerald-100 text-emerald-700'
                    : analysis.grade === 'regular'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-red-100 text-red-700'
              }`}
            >
              {analysis.score}
            </div>
            <span className={`font-medium text-sm ${statusColor(analysis.gradeLabel)}`}>
              {analysis.gradeLabel}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 max-h-[340px] overflow-y-auto">
        <Section
          icon={Type}
          label="1. Título (H1)"
          status={analysis.title.statusLabel}
          statusColor={statusColor(analysis.title.statusLabel)}
        >
          <p className="text-sm text-gray-600">
            {analysis.title.charCount} caracteres
            {analysis.title.suggestion && (
              <span className="block mt-1 text-amber-600">{analysis.title.suggestion}</span>
            )}
          </p>
        </Section>

        <Section
          icon={FileText}
          label="2. Resumo / Meta"
          status={analysis.meta.statusLabel}
          statusColor={statusColor(analysis.meta.statusLabel)}
        >
          <p className="text-sm text-gray-600">
            {analysis.meta.charCount} caracteres
            {analysis.meta.suggestion && (
              <span className="block mt-1 text-amber-600">{analysis.meta.suggestion}</span>
            )}
          </p>
        </Section>

        <Section
          icon={BarChart2}
          label="3. Extensão"
          status={analysis.contentLength.statusLabel}
          statusColor={statusColor(analysis.contentLength.statusLabel)}
        >
          <p className="text-sm text-gray-600">
            {analysis.contentLength.wordCount} palavras · ~{readingTime} min leitura
          </p>
          <p className="text-xs text-gray-500 mt-1">{analysis.contentLength.feedback}</p>
        </Section>

        <Section
          icon={Layout}
          label="4. Estrutura"
          status={analysis.structure.statusLabel}
          statusColor={statusColor(analysis.structure.statusLabel)}
        >
          <p className="text-sm text-gray-600">
            H1: {analysis.structure.h1} · H2: {analysis.structure.h2} · H3: {analysis.structure.h3}
          </p>
          {analysis.structure.suggestions.length > 0 && (
            <ul className="mt-2 space-y-1 text-xs text-amber-600">
              {analysis.structure.suggestions.map((s, i) => (
                <li key={i}>• {s}</li>
              ))}
            </ul>
          )}
        </Section>

        <Section
          icon={Search}
          label="5. Intenção"
          status=""
          statusColor="text-gray-600"
        >
          <p className="text-sm text-gray-600">{analysis.searchIntent.label}</p>
        </Section>

        <Section
          icon={MessageSquare}
          label="6. Palavras-chave"
          status={analysis.keywords.statusLabel}
          statusColor={statusColor(analysis.keywords.statusLabel)}
        >
          <p className="text-sm text-gray-600">{analysis.keywords.observation}</p>
        </Section>

        <Section
          icon={FileText}
          label="7. Legibilidade"
          status={analysis.legibility.statusLabel}
          statusColor={statusColor(analysis.legibility.statusLabel)}
        >
          <p className="text-sm text-gray-600">
            Frases ~{analysis.legibility.avgSentenceLength} palavras
            {analysis.legibility.hasLists && ' · Listas ✓'}
            {analysis.legibility.hasBold && ' · Negrito ✓'}
          </p>
        </Section>

        <Section
          icon={Sparkles}
          label="8. Confiança (EEAT)"
          status={analysis.eeat.statusLabel}
          statusColor={statusColor(analysis.eeat.statusLabel)}
        >
          <p className="text-sm text-gray-600">{analysis.eeat.feedback}</p>
        </Section>

        {analysis.improvements.length > 0 && (
          <div className="pt-3 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Melhorias sugeridas
            </h4>
            <ul className="space-y-2">
              {analysis.improvements.map((imp, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-700">
                  <span className="text-purple-500 font-bold">{i + 1}.</span>
                  <span>{imp}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

function Section({
  icon: Icon,
  label,
  status,
  statusColor,
  children
}: {
  icon: React.ElementType
  label: string
  status: string
  statusColor: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
          <Icon className="w-4 h-4 text-gray-500" />
          {label}
        </div>
        {status && <span className={`text-xs font-medium ${statusColor}`}>{status}</span>}
      </div>
      <div className="pl-6">{children}</div>
    </div>
  )
}
