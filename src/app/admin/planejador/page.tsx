'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  MapPin,
  Settings,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  X,
  Check,
} from 'lucide-react'

interface Atrativo {
  id: string
  nome: string
  imageUrl?: string | null
  precoAdultoCents: number
  precoCriancaCents: number
  duracaoMediaHoras: number
  tempoDeslocamentoMedioHoras: number
  distanciaAeroportoKm?: number | null
  regiao: string
  nivelCansaco: string
  custoTransporteMedioCents: number
  exigeDocumento: boolean
  ativo: boolean
  ordem: number
}

interface Config {
  id: string
  alimentacaoEconomicaCents: number
  alimentacaoPadraoCents: number
  alimentacaoConfortoCents: number
  multiplicadorUber: number
  multiplicadorTransfer: number
  multiplicadorCarroProprio: number
  horasMaximasPorDia: number
  moeda: string
}

const REGIOES = ['Cataratas Brasil', 'Argentina', 'Paraguai', 'Itaipu', 'Centro', 'Região Hotéis']
const NIVEIS = ['leve', 'medio', 'intenso']

function formatBRL(cents: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)
}

export default function AdminPlanejadorPage() {
  const [tab, setTab] = useState<'atrativos' | 'config'>('atrativos')
  const [atrativos, setAtrativos] = useState<Atrativo[]>([])
  const [config, setConfig] = useState<Config | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [modalAtrativo, setModalAtrativo] = useState<Atrativo | null>(null)
  const [showModalAtrativo, setShowModalAtrativo] = useState(false)
  const [formAtrativo, setFormAtrativo] = useState<Partial<Atrativo>>({})
  const [formConfig, setFormConfig] = useState<Partial<Config>>({})

  const loadAtrativos = () => {
    fetch('/api/admin/planejador/atrativos', { credentials: 'include' })
      .then((r) => r.json())
      .then(setAtrativos)
      .catch(() => setAtrativos([]))
  }

  const loadConfig = () => {
    fetch('/api/admin/planejador/config', { credentials: 'include' })
      .then((r) => r.json())
      .then((c) => {
        setConfig(c)
        setFormConfig(c)
      })
      .catch(() => setConfig(null))
  }

  useEffect(() => {
    setLoading(true)
    loadAtrativos()
    loadConfig()
    setLoading(false)
  }, [])

  const openNewAtrativo = () => {
    setFormAtrativo({
      nome: '',
      imageUrl: '',
      precoAdultoCents: 0,
      precoCriancaCents: 0,
      duracaoMediaHoras: 0,
      tempoDeslocamentoMedioHoras: 0,
      distanciaAeroportoKm: null,
      regiao: 'Centro',
      nivelCansaco: 'medio',
      custoTransporteMedioCents: 0,
      exigeDocumento: false,
      ativo: true,
      ordem: atrativos.length,
    })
    setModalAtrativo(null)
    setShowModalAtrativo(true)
  }

  const openEditAtrativo = (a: Atrativo) => {
    setModalAtrativo(a)
    setFormAtrativo({ ...a })
    setShowModalAtrativo(true)
  }

  const closeModalAtrativo = () => {
    setModalAtrativo(null)
    setFormAtrativo({})
    setShowModalAtrativo(false)
  }

  const saveAtrativo = async () => {
    if (!formAtrativo.nome?.trim()) return
    setSaving(true)
    try {
      if (modalAtrativo) {
        await fetch(`/api/admin/planejador/atrativos/${modalAtrativo.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(formAtrativo),
        })
      } else {
        await fetch('/api/admin/planejador/atrativos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(formAtrativo),
        })
      }
      loadAtrativos()
      closeModalAtrativo()
    } finally {
      setSaving(false)
    }
  }

  const deleteAtrativo = async (id: string) => {
    if (!confirm('Excluir este atrativo?')) return
    setSaving(true)
    try {
      await fetch(`/api/admin/planejador/atrativos/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      loadAtrativos()
      closeModalAtrativo()
    } finally {
      setSaving(false)
    }
  }

  const saveConfig = async () => {
    setSaving(true)
    try {
      await fetch('/api/admin/planejador/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formConfig),
      })
      loadConfig()
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Planejador de Viagem — Foz do Iguaçu</h1>
        <Link
          href="/planejador-de-viagem"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-indigo-600 hover:text-indigo-700"
        >
          Ver página pública →
        </Link>
      </div>

      <div className="flex gap-2 border-b border-gray-200 mb-6">
        <button
          type="button"
          onClick={() => setTab('atrativos')}
          className={`px-4 py-2 font-medium rounded-t-lg border-b-2 transition-colors ${
            tab === 'atrativos'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <MapPin className="inline w-4 h-4 mr-2" />
          Atrativos
        </button>
        <button
          type="button"
          onClick={() => setTab('config')}
          className={`px-4 py-2 font-medium rounded-t-lg border-b-2 transition-colors ${
            tab === 'config'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Settings className="inline w-4 h-4 mr-2" />
          Configurações gerais
        </button>
      </div>

      {tab === 'atrativos' && (
        <div>
          <div className="flex justify-end mb-4">
            <button
              type="button"
              onClick={openNewAtrativo}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" />
              Adicionar atrativo
            </button>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Nome</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Adulto</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Criança</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Duração (h)</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Região</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {atrativos.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{a.nome}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatBRL(a.precoAdultoCents)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatBRL(a.precoCriancaCents)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{a.duracaoMediaHoras}h</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{a.regiao}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                          a.ativo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {a.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => openEditAtrativo(a)}
                        className="p-1.5 text-gray-600 hover:text-indigo-600"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteAtrativo(a.id)}
                        className="p-1.5 text-gray-600 hover:text-red-600 ml-1"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'config' && config && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-2xl">
          <h3 className="font-semibold text-gray-900 mb-4">Valores de alimentação (por pessoa/dia, em centavos)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Econômica (centavos)</label>
              <input
                type="number"
                value={formConfig.alimentacaoEconomicaCents ?? ''}
                onChange={(e) => setFormConfig((c) => ({ ...c, alimentacaoEconomicaCents: Number(e.target.value) }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Padrão (centavos)</label>
              <input
                type="number"
                value={formConfig.alimentacaoPadraoCents ?? ''}
                onChange={(e) => setFormConfig((c) => ({ ...c, alimentacaoPadraoCents: Number(e.target.value) }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Conforto (centavos)</label>
              <input
                type="number"
                value={formConfig.alimentacaoConfortoCents ?? ''}
                onChange={(e) => setFormConfig((c) => ({ ...c, alimentacaoConfortoCents: Number(e.target.value) }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2"
              />
            </div>
          </div>
          <h3 className="font-semibold text-gray-900 mb-4">Multiplicadores de transporte</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Uber/ônibus</label>
              <input
                type="number"
                step="0.1"
                value={formConfig.multiplicadorUber ?? ''}
                onChange={(e) => setFormConfig((c) => ({ ...c, multiplicadorUber: Number(e.target.value) }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Transfer</label>
              <input
                type="number"
                step="0.1"
                value={formConfig.multiplicadorTransfer ?? ''}
                onChange={(e) => setFormConfig((c) => ({ ...c, multiplicadorTransfer: Number(e.target.value) }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Carro próprio</label>
              <input
                type="number"
                step="0.1"
                value={formConfig.multiplicadorCarroProprio ?? ''}
                onChange={(e) => setFormConfig((c) => ({ ...c, multiplicadorCarroProprio: Number(e.target.value) }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Horas máximas por dia</label>
              <input
                type="number"
                min={1}
                max={12}
                value={formConfig.horasMaximasPorDia ?? ''}
                onChange={(e) => setFormConfig((c) => ({ ...c, horasMaximasPorDia: Number(e.target.value) }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Moeda</label>
              <input
                type="text"
                value={formConfig.moeda ?? ''}
                onChange={(e) => setFormConfig((c) => ({ ...c, moeda: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2"
                placeholder="BRL"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={saveConfig}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Salvar configurações
          </button>
        </div>
      )}

      {/* Modal Atrativo */}
      {showModalAtrativo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">
                {modalAtrativo ? 'Editar atrativo' : 'Novo atrativo'}
              </h3>
              <button
                type="button"
                onClick={closeModalAtrativo}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  type="text"
                  value={formAtrativo.nome ?? ''}
                  onChange={(e) => setFormAtrativo((f) => ({ ...f, nome: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL da foto (opcional)</label>
                <input
                  type="url"
                  value={formAtrativo.imageUrl ?? ''}
                  onChange={(e) => setFormAtrativo((f) => ({ ...f, imageUrl: e.target.value || undefined }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Distância do aeroporto (km, opcional)</label>
                <input
                  type="number"
                  step="0.1"
                  min={0}
                  value={formAtrativo.distanciaAeroportoKm ?? ''}
                  onChange={(e) => setFormAtrativo((f) => ({ ...f, distanciaAeroportoKm: e.target.value === '' ? null : Number(e.target.value) }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2"
                  placeholder="Ex: 12.5"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preço adulto (centavos)</label>
                  <input
                    type="number"
                    value={formAtrativo.precoAdultoCents ?? 0}
                    onChange={(e) => setFormAtrativo((f) => ({ ...f, precoAdultoCents: Number(e.target.value) }))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preço criança (centavos)</label>
                  <input
                    type="number"
                    value={formAtrativo.precoCriancaCents ?? 0}
                    onChange={(e) => setFormAtrativo((f) => ({ ...f, precoCriancaCents: Number(e.target.value) }))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duração média (horas)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formAtrativo.duracaoMediaHoras ?? 0}
                    onChange={(e) => setFormAtrativo((f) => ({ ...f, duracaoMediaHoras: Number(e.target.value) }))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deslocamento médio (horas)</label>
                  <input
                    type="number"
                    step="0.25"
                    value={formAtrativo.tempoDeslocamentoMedioHoras ?? 0}
                    onChange={(e) => setFormAtrativo((f) => ({ ...f, tempoDeslocamentoMedioHoras: Number(e.target.value) }))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Região</label>
                <select
                  value={formAtrativo.regiao ?? 'Centro'}
                  onChange={(e) => setFormAtrativo((f) => ({ ...f, regiao: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2"
                >
                  {REGIOES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nível cansaço</label>
                <select
                  value={formAtrativo.nivelCansaco ?? 'medio'}
                  onChange={(e) => setFormAtrativo((f) => ({ ...f, nivelCansaco: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2"
                >
                  {NIVEIS.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Custo transporte médio (centavos)</label>
                <input
                  type="number"
                  value={formAtrativo.custoTransporteMedioCents ?? 0}
                  onChange={(e) => setFormAtrativo((f) => ({ ...f, custoTransporteMedioCents: Number(e.target.value) }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="exigeDoc"
                  checked={formAtrativo.exigeDocumento ?? false}
                  onChange={(e) => setFormAtrativo((f) => ({ ...f, exigeDocumento: e.target.checked }))}
                  className="rounded border-gray-300 text-indigo-600"
                />
                <label htmlFor="exigeDoc" className="text-sm text-gray-700">Exige documento (ex.: Argentina/Paraguai)</label>
              </div>
              {modalAtrativo && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="ativo"
                    checked={formAtrativo.ativo ?? true}
                    onChange={(e) => setFormAtrativo((f) => ({ ...f, ativo: e.target.checked }))}
                    className="rounded border-gray-300 text-indigo-600"
                  />
                  <label htmlFor="ativo" className="text-sm text-gray-700">Ativo (visível no planejador)</label>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-gray-200">
              <button
                type="button"
                onClick={closeModalAtrativo}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={saveAtrativo}
                disabled={saving || !formAtrativo.nome?.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
