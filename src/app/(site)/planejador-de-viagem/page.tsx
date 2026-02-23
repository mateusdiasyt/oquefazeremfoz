'use client'

import { useState, useEffect } from 'react'
import {
  MapPin,
  Users,
  Car,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileDown,
  Utensils,
  Bus,
  Clock,
  Banknote,
  Search,
  MapPinned,
  Building2,
} from 'lucide-react'
import Image from 'next/image'

interface Atrativo {
  id: string
  nome: string
  imageUrl: string | null
  precoAdultoCents: number
  precoCriancaCents: number
  duracaoMediaHoras: number
  tempoDeslocamentoMedioHoras: number
  distanciaAeroportoKm: number | null
  regiao: string
  nivelCansaco: string
  custoTransporteMedioCents: number
  exigeDocumento: boolean
}

interface DiaRoteiro {
  dia: number
  atrativos: Atrativo[]
  tempoTotalHoras: number
  regiaoPrincipal: string
  observacoes: string[]
}

interface Custos {
  ingressosCents: number
  transporteCents: number
  alimentacaoCents: number
  totalCents: number
  totalPorPessoaCents: number
}

interface Hotel {
  id: string
  nome: string
  imageUrl?: string | null
  endereco: string
  distanciaAeroportoKm?: number | null
}

interface RotaDia {
  dia: number
  km: number
  custoTransporteCents: number
  ordemNomes: string[]
}

type TipoViagem = 'economica' | 'padrao' | 'conforto'
type Transporte = 'sem_carro' | 'carro_proprio' | 'transfer'

function formatBRL(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100)
}

export default function PlanejadorDeViagemPage() {
  const [atrativos, setAtrativos] = useState<Atrativo[]>([])
  const [loadingAtrativos, setLoadingAtrativos] = useState(true)
  const [dias, setDias] = useState(3)
  const [pessoas, setPessoas] = useState(2)
  const [tipoViagem, setTipoViagem] = useState<TipoViagem>('padrao')
  const [transporte, setTransporte] = useState<Transporte>('sem_carro')
  const [hoteis, setHoteis] = useState<Hotel[]>([])
  const [hotelId, setHotelId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [buscaAtrativos, setBuscaAtrativos] = useState('')
  const [calculando, setCalculando] = useState(false)
  const [resultado, setResultado] = useState<{
    roteiro: DiaRoteiro[]
    rotaPorDia?: RotaDia[]
    custos: Custos
    tempoTotalHoras: number
    moeda: string
    avisoDias: { tempoTotalHoras: number; diasRecomendados: number; mensagem: string } | null
    dicas: string[]
  } | null>(null)
  const [aceitarDiasInsuficientes, setAceitarDiasInsuficientes] = useState(false)
  const [diasAjustados, setDiasAjustados] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/planejador/atrativos')
      .then((r) => r.json())
      .then((list: Atrativo[]) => {
        setAtrativos(list)
        setLoadingAtrativos(false)
      })
      .catch(() => setLoadingAtrativos(false))
  }, [])

  useEffect(() => {
    fetch('/api/planejador/hoteis')
      .then((r) => r.json())
      .then(setHoteis)
      .catch(() => setHoteis([]))
  }, [])

  const toggleAtrativo = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const buscaNorm = buscaAtrativos.trim().toLowerCase()
  const atrativosFiltrados = buscaNorm
    ? atrativos.filter(
        (a) =>
          a.nome.toLowerCase().includes(buscaNorm) ||
          a.regiao.toLowerCase().includes(buscaNorm)
      )
    : atrativos

  const handleCalcular = (diasUsar?: number) => {
    const d = diasUsar ?? dias
    if (selectedIds.size === 0) return
    setCalculando(true)
    setResultado(null)
    fetch('/api/planejador/calcular', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dias: d,
        pessoas,
        tipoViagem,
        transporte,
        atrativosIds: Array.from(selectedIds),
        ...(transporte === 'carro_proprio' && hotelId ? { hotelId } : {}),
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setResultado({
            roteiro: data.roteiro,
            rotaPorDia: data.rotaPorDia,
            custos: data.custos,
            tempoTotalHoras: data.tempoTotalHoras,
            moeda: data.moeda,
            avisoDias: data.avisoDias,
            dicas: data.dicas || [],
          })
          if (data.avisoDias && diasUsar != null) {
            setDiasAjustados(diasUsar)
          }
        }
      })
      .finally(() => setCalculando(false))
  }

  const onAjustarDias = () => {
    if (!resultado?.avisoDias) return
    const novoDias = resultado.avisoDias.diasRecomendados
    setDias(novoDias)
    setAceitarDiasInsuficientes(false)
    setDiasAjustados(novoDias)
    setResultado(null)
    handleCalcular(novoDias)
  }

  const onContinuarMesmoAssim = () => {
    setAceitarDiasInsuficientes(true)
    setResultado((r) => (r ? { ...r, avisoDias: null } : null))
  }

  const downloadPDF = () => {
    if (!resultado) return
    const lines: string[] = [
      'Planejador Inteligente de Viagem — Foz do Iguaçu',
      '============================================',
      '',
      `Dias: ${diasAjustados ?? dias} | Pessoas: ${pessoas} | Tipo: ${tipoViagem} | Transporte: ${transporte}`,
      '',
      '--- Roteiro por dia ---',
    ]
    resultado.roteiro.forEach((dia) => {
      lines.push(`\nDia ${dia.dia} (${dia.regiaoPrincipal}) — ${dia.tempoTotalHoras.toFixed(1)}h`)
      dia.atrativos.forEach((a) => lines.push(`  • ${a.nome}`))
      dia.observacoes.forEach((o) => lines.push(`  ⓘ ${o}`))
    })
    lines.push('')
    lines.push('--- Custos ---')
    lines.push(`Ingressos: ${formatBRL(resultado.custos.ingressosCents)}`)
    lines.push(`Transporte: ${formatBRL(resultado.custos.transporteCents)}`)
    lines.push(`Alimentação: ${formatBRL(resultado.custos.alimentacaoCents)}`)
    lines.push(`Total grupo: ${formatBRL(resultado.custos.totalCents)}`)
    lines.push(`Total por pessoa: ${formatBRL(resultado.custos.totalPorPessoaCents)}`)
    lines.push('')
    lines.push('--- Dicas ---')
    resultado.dicas.forEach((d) => lines.push(`• ${d}`))
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `roteiro-foz-${new Date().toISOString().slice(0, 10)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/80 to-white">
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-2">
          Planeje sua viagem para Foz do Iguaçu em segundos
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Selecione os atrativos, número de dias e pessoas e receba um roteiro otimizado com custos.
        </p>

        {loadingAtrativos ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        ) : (
          <>
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-600" />
                Onde você está hospedado?
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Selecione seu hotel para calcular a melhor ordem dos passeios e o custo em combustível (quando for de carro próprio).
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {hoteis.length === 0 ? (
                  <p className="text-gray-500 text-sm col-span-full">Nenhum hotel cadastrado no momento.</p>
                ) : (
                  hoteis.map((h) => {
                    const selected = hotelId === h.id
                    return (
                      <button
                        key={h.id}
                        type="button"
                        onClick={() => setHotelId(selected ? null : h.id)}
                        className={`text-left rounded-xl border-2 overflow-hidden transition-all ${
                          selected
                            ? 'border-purple-500 bg-purple-50/50 shadow-md ring-2 ring-purple-200'
                            : 'border-gray-100 hover:border-purple-200 hover:bg-gray-50/50'
                        }`}
                      >
                        <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                          {h.imageUrl ? (
                            <Image
                              src={h.imageUrl}
                              alt={h.nome}
                              fill
                              className="object-cover"
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100">
                              <Building2 className="w-12 h-12 text-purple-300" />
                            </div>
                          )}
                          {selected && (
                            <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                              <CheckCircle2 className="w-5 h-5 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <h3 className="font-semibold text-gray-900 truncate" title={h.nome}>{h.nome}</h3>
                          {h.distanciaAeroportoKm != null && (
                            <p className="text-xs text-gray-500 mt-0.5">{h.distanciaAeroportoKm} km do aeroporto</p>
                          )}
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            </section>

            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Seu perfil da viagem</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Calendar className="inline w-4 h-4 mr-1" /> Número de dias
                  </label>
                  <select
                    value={dias}
                    onChange={(e) => setDias(Number(e.target.value))}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                      <option key={n} value={n}>{n} {n === 1 ? 'dia' : 'dias'}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Users className="inline w-4 h-4 mr-1" /> Número de pessoas
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={pessoas}
                    onChange={(e) => setPessoas(Number(e.target.value) || 1)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de viagem</label>
                  <select
                    value={tipoViagem}
                    onChange={(e) => setTipoViagem(e.target.value as TipoViagem)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="economica">Econômica</option>
                    <option value="padrao">Padrão</option>
                    <option value="conforto">Conforto</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Car className="inline w-4 h-4 mr-1" /> Transporte
                  </label>
                  <select
                    value={transporte}
                    onChange={(e) => setTransporte(e.target.value as Transporte)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="sem_carro">Sem carro (Uber/ônibus)</option>
                    <option value="carro_proprio">Carro próprio</option>
                    <option value="transfer">Transfer turístico</option>
                  </select>
                </div>
              </div>
              {hotelId && transporte === 'carro_proprio' && (
                <p className="text-sm text-purple-700 mt-2">
                  Usando o hotel selecionado para calcular rotas e combustível.
                </p>
              )}

              <h2 className="text-lg font-semibold text-gray-900 mb-3 mt-6">Atrativos que deseja visitar</h2>
              <p className="text-sm text-gray-500 mb-3">
                Os valores são consultados e atualizados periodicamente; podem sofrer alterações. Confirme preços e horários no site oficial de cada atrativo.
              </p>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="search"
                  placeholder="Buscar atrativo ou região..."
                  value={buscaAtrativos}
                  onChange={(e) => setBuscaAtrativos(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[420px] overflow-y-auto pr-2">
                {atrativosFiltrados.map((a) => {
                  const selected = selectedIds.has(a.id)
                  const precoMedio = a.precoAdultoCents > 0 ? formatBRL(a.precoAdultoCents) : 'Consulte'
                  const duracaoTotal = a.duracaoMediaHoras + a.tempoDeslocamentoMedioHoras
                  const horas = Math.floor(duracaoTotal)
                  const mins = Math.round((duracaoTotal - horas) * 60)
                  const duracaoTexto = horas > 0 && mins > 0
                    ? `${horas}h ${mins}min`
                    : horas > 0
                      ? `${horas}h`
                      : mins > 0
                        ? `${mins}min`
                        : `${duracaoTotal.toFixed(1)}h`
                  return (
                    <label
                      key={a.id}
                      className={`block rounded-xl border-2 overflow-hidden cursor-pointer transition-all ${
                        selected
                          ? 'border-purple-500 bg-purple-50/50 shadow-md ring-2 ring-purple-200'
                          : 'border-gray-100 hover:border-purple-200 hover:bg-gray-50/50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleAtrativo(a.id)}
                        className="sr-only"
                      />
                      <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                        {a.imageUrl ? (
                          <Image
                            src={a.imageUrl}
                            alt={a.nome}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100">
                            <MapPin className="w-12 h-12 text-purple-300" />
                          </div>
                        )}
                        {selected && (
                          <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="font-semibold text-gray-900 truncate" title={a.nome}>{a.nome}</h3>
                        <p className="text-sm font-medium text-purple-700 mt-0.5">
                          Ingresso a partir de {precoMedio}
                        </p>
                        <ul className="mt-2 space-y-1 text-xs text-gray-600">
                          <li className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                            <span><strong className="text-gray-700">Duração do passeio:</strong> ~{duracaoTexto} (visita + deslocamento)</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <MapPinned className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                            <span><strong className="text-gray-700">Distância do aeroporto:</strong> {a.distanciaAeroportoKm != null ? `${a.distanciaAeroportoKm} km` : '—'}</span>
                          </li>
                          <li className="text-gray-400">{a.regiao}</li>
                        </ul>
                      </div>
                    </label>
                  )
                })}
              </div>
              {atrativosFiltrados.length === 0 && (
                <p className="text-gray-500 text-sm py-4">Nenhum atrativo encontrado para &quot;{buscaAtrativos}&quot;.</p>
              )}

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => handleCalcular()}
                  disabled={selectedIds.size === 0 || calculando}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {calculando ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <MapPin className="w-5 h-5" />
                  )}
                  Calcular meu roteiro
                </button>
                {selectedIds.size === 0 && (
                  <p className="text-sm text-gray-500 self-center">Selecione pelo menos um atrativo.</p>
                )}
              </div>
            </section>

            {resultado?.avisoDias && !aceitarDiasInsuficientes && (
              <section className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-amber-900">Atenção: dias insuficientes</h3>
                    <p className="text-amber-800 mt-1">{resultado.avisoDias.mensagem}</p>
                    <div className="flex flex-wrap gap-3 mt-4">
                      <button
                        type="button"
                        onClick={onAjustarDias}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white font-medium rounded-xl hover:bg-amber-700"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Ajustar automaticamente para {resultado.avisoDias.diasRecomendados} dias
                      </button>
                      <button
                        type="button"
                        onClick={onContinuarMesmoAssim}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-amber-600 text-amber-800 font-medium rounded-xl hover:bg-amber-100"
                      >
                        Continuar mesmo assim
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {resultado && (!resultado.avisoDias || aceitarDiasInsuficientes) && (
              <section className="space-y-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h2 className="text-xl font-bold text-gray-900">Resumo da sua viagem</h2>
                  <button
                    type="button"
                    onClick={downloadPDF}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-purple-600 text-purple-700 font-medium rounded-xl hover:bg-purple-50"
                  >
                    <FileDown className="w-4 h-4" />
                    Baixar roteiro (TXT)
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Banknote className="w-5 h-5 text-purple-600" />
                      Custos
                    </h3>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex justify-between">
                        <span>Ingressos / entradas</span>
                        <span className="font-medium">{formatBRL(resultado.custos.ingressosCents)}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="flex items-center gap-1"><Bus className="w-4 h-4" /> Transporte</span>
                        <span className="font-medium">{formatBRL(resultado.custos.transporteCents)}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="flex items-center gap-1"><Utensils className="w-4 h-4" /> Alimentação</span>
                        <span className="font-medium">{formatBRL(resultado.custos.alimentacaoCents)}</span>
                      </li>
                      <li className="flex justify-between pt-2 border-t border-gray-200">
                        <span>Total do grupo</span>
                        <span className="font-bold text-purple-700">{formatBRL(resultado.custos.totalCents)}</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Total por pessoa</span>
                        <span className="font-semibold">{formatBRL(resultado.custos.totalPorPessoaCents)}</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-purple-600" />
                      Informações
                    </h3>
                    <p className="text-gray-700">
                      Tempo total estimado: <strong>{resultado.tempoTotalHoras.toFixed(1)} horas</strong> de passeios.
                    </p>
                    {resultado.dicas.length > 0 && (
                      <ul className="mt-4 space-y-1 text-sm text-gray-600">
                        {resultado.dicas.map((d, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                            {d}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <h3 className="font-semibold text-gray-900 p-6 pb-0">Roteiro por dia</h3>
                  <div className="divide-y divide-gray-100">
                    {resultado.roteiro.map((dia) => {
                      const rotaDia = resultado.rotaPorDia?.find((r) => r.dia === dia.dia)
                      return (
                        <div key={dia.dia} className="p-6">
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <span className="font-bold text-purple-700">Dia {dia.dia}</span>
                            <span className="text-gray-500 text-sm">({dia.regiaoPrincipal})</span>
                            <span className="text-gray-500 text-sm">
                              — {dia.tempoTotalHoras.toFixed(1)}h
                            </span>
                          </div>
                          {rotaDia && rotaDia.ordemNomes.length > 0 && (
                            <p className="text-sm text-gray-700 mb-2">
                              <span className="font-medium">Rota sugerida:</span>{' '}
                              {rotaDia.ordemNomes.join(' → ')}
                              {rotaDia.km > 0 && (
                                <span className="text-gray-600 ml-1">
                                  ({rotaDia.km.toFixed(0)} km, ~{formatBRL(rotaDia.custoTransporteCents)} combustível)
                                </span>
                              )}
                            </p>
                          )}
                          {rotaDia && rotaDia.km > 0 && (
                            <p className="text-xs text-gray-500 mb-2">
                              Cálculo: distância (km) × custo por km (R$). Ex.: 25 km × R$ 5,90/km = R$ 147,50. (Configure no admin.)
                            </p>
                          )}
                          <ul className="space-y-1">
                            {dia.atrativos.map((a) => (
                              <li key={a.id} className="flex items-center gap-2 text-gray-800">
                                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                {a.nome}
                              </li>
                            ))}
                          </ul>
                          {dia.observacoes.length > 0 && (
                            <p className="text-sm text-gray-600 mt-2">{dia.observacoes.join(' ')}</p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  )
}
