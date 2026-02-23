/**
 * Planejador Inteligente de Viagem — Foz do Iguaçu
 * Lógica de roteirização por região e cálculo de custos (sem scraping).
 */

export const REGIOES_ORDEM = [
  'Cataratas Brasil',
  'Argentina',
  'Paraguai',
  'Itaipu',
  'Centro',
  'Região Hotéis',
] as const

// Não misturar Argentina e Paraguai no mesmo dia
const REGIOES_INCOMPATIVEIS: [string, string][] = [['Argentina', 'Paraguai']]

export interface AtrativoInput {
  id: string
  nome: string
  precoAdultoCents: number
  precoCriancaCents: number
  duracaoMediaHoras: number
  tempoDeslocamentoMedioHoras: number
  regiao: string
  nivelCansaco: string
  custoTransporteMedioCents: number
  exigeDocumento: boolean
}

export interface DiaRoteiro {
  dia: number
  atrativos: AtrativoInput[]
  tempoTotalHoras: number
  regiaoPrincipal: string
  observacoes: string[]
}

export interface ConfigPlanejador {
  alimentacaoEconomicaCents: number
  alimentacaoPadraoCents: number
  alimentacaoConfortoCents: number
  multiplicadorUber: number
  multiplicadorTransfer: number
  multiplicadorCarroProprio: number
  horasMaximasPorDia: number
  moeda: string
}

export type TipoViagem = 'economica' | 'padrao' | 'conforto'
export type Transporte = 'sem_carro' | 'carro_proprio' | 'transfer'

/** Tempo total por atrativo = duração + deslocamento */
export function tempoTotalAtrativo(a: AtrativoInput): number {
  return a.duracaoMediaHoras + a.tempoDeslocamentoMedioHoras
}

/** Soma do tempo total de todos os atrativos */
export function tempoTotalAtrativos(atrativos: AtrativoInput[]): number {
  return atrativos.reduce((acc, a) => acc + tempoTotalAtrativo(a), 0)
}

/** Capacidade total em horas = dias × horas por dia */
export function capacidadeTotalHoras(dias: number, horasPorDia: number): number {
  return dias * horasPorDia
}

/** Dias mínimos recomendados (arredondamento para cima) */
export function diasMinimosRecomendados(tempoTotalHoras: number, horasPorDia: number): number {
  return Math.ceil(tempoTotalHoras / horasPorDia) || 1
}

/** Verifica se as regiões podem ficar no mesmo dia */
function regioesCompatíveis(regioes: string[]): boolean {
  const set = new Set(regioes)
  for (const [r1, r2] of REGIOES_INCOMPATIVEIS) {
    if (set.has(r1) && set.has(r2)) return false
  }
  return true
}

/** Agrupa atrativos por região */
function agruparPorRegiao(atrativos: AtrativoInput[]): Map<string, AtrativoInput[]> {
  const map = new Map<string, AtrativoInput[]>()
  for (const a of atrativos) {
    const list = map.get(a.regiao) || []
    list.push(a)
    map.set(a.regiao, list)
  }
  return map
}

/**
 * Ordena atrativos: mesma região junta, ordem das regiões definida (proximidade).
 */
function ordenarPorRegiao(atrativos: AtrativoInput[]): AtrativoInput[] {
  const ordemRegiao = new Map<string, number>(REGIOES_ORDEM.map((r, i) => [r, i]))
  return [...atrativos].sort((a, b) => {
    const ia = ordemRegiao.get(a.regiao) ?? 99
    const ib = ordemRegiao.get(b.regiao) ?? 99
    return ia - ib
  })
}

/**
 * Distribui atrativos nos dias respeitando:
 * - Máximo de horasPorDia por dia
 * - Prioridade por proximidade (agrupar por região)
 * - Não misturar Argentina e Paraguai no mesmo dia
 */
export function roteirizar(
  atrativos: AtrativoInput[],
  dias: number,
  horasPorDia: number
): DiaRoteiro[] {
  if (atrativos.length === 0) return []

  const ordenados = ordenarPorRegiao(atrativos)
  const resultado: DiaRoteiro[] = []
  let diaAtual = 1
  let horasNoDia = 0
  let atrativosNoDia: AtrativoInput[] = []
  let regioesNoDia: string[] = []

  for (const a of ordenados) {
    const tempo = tempoTotalAtrativo(a)
    const regioesPropostas = Array.from(new Set([...regioesNoDia, a.regiao]))
    const cabeNoDia = horasNoDia + tempo <= horasPorDia
    const compativeis = regioesCompatíveis(regioesPropostas)

    if (cabeNoDia && compativeis) {
      atrativosNoDia.push(a)
      horasNoDia += tempo
      if (!regioesNoDia.includes(a.regiao)) regioesNoDia.push(a.regiao)
    } else {
      // Fechar dia atual
      if (atrativosNoDia.length > 0) {
        const regiaoPrincipal = regioesNoDia[0] || 'Centro'
        const observacoes: string[] = []
        if (atrativosNoDia.some((x) => x.exigeDocumento)) {
          observacoes.push('Leve documento de identidade (alguns atrativos exigem).')
        }
        resultado.push({
          dia: diaAtual,
          atrativos: [...atrativosNoDia],
          tempoTotalHoras: horasNoDia,
          regiaoPrincipal,
          observacoes,
        })
        diaAtual++
      }
      // Iniciar novo dia com este atrativo
      horasNoDia = tempo
      atrativosNoDia = [a]
      regioesNoDia = [a.regiao]
    }
  }

  if (atrativosNoDia.length > 0) {
    const regiaoPrincipal = regioesNoDia[0] || 'Centro'
    const observacoes: string[] = []
    if (atrativosNoDia.some((x) => x.exigeDocumento)) {
      observacoes.push('Leve documento de identidade (alguns atrativos exigem).')
    }
    resultado.push({
      dia: diaAtual,
      atrativos: atrativosNoDia,
      tempoTotalHoras: horasNoDia,
      regiaoPrincipal,
      observacoes,
    })
  }

  return resultado
}

/** Custo de ingressos (adulto + criança). Assume 1 criança por 2 adultos para simplificar se não tiver qtd criança. */
export function custoIngressos(
  atrativos: AtrativoInput[],
  numAdultos: number,
  numCriancas: number
): number {
  return atrativos.reduce((acc, a) => {
    return acc + a.precoAdultoCents * numAdultos + a.precoCriancaCents * numCriancas
  }, 0)
}

/** Custo de transporte conforme tipo e multiplicadores da config */
export function custoTransporte(
  atrativos: AtrativoInput[],
  transporte: Transporte,
  config: ConfigPlanejador
): number {
  const base = atrativos.reduce((acc, a) => acc + a.custoTransporteMedioCents, 0)
  switch (transporte) {
    case 'sem_carro':
      return Math.round(base * config.multiplicadorUber)
    case 'carro_proprio':
      return Math.round(base * config.multiplicadorCarroProprio)
    case 'transfer':
      return Math.round(base * config.multiplicadorTransfer)
    default:
      return Math.round(base * config.multiplicadorUber)
  }
}

/** Custo alimentação total = valor_dia × dias × pessoas */
export function custoAlimentacao(
  tipoViagem: TipoViagem,
  dias: number,
  pessoas: number,
  config: ConfigPlanejador
): number {
  let valorPorDia: number
  switch (tipoViagem) {
    case 'economica':
      valorPorDia = config.alimentacaoEconomicaCents
      break
    case 'conforto':
      valorPorDia = config.alimentacaoConfortoCents
      break
    default:
      valorPorDia = config.alimentacaoPadraoCents
  }
  return valorPorDia * dias * pessoas
}

/** Resumo de custos para exibição */
export function calcularCustos(
  atrativos: AtrativoInput[],
  opts: {
    dias: number
    pessoas: number
    tipoViagem: TipoViagem
    transporte: Transporte
    numAdultos?: number
    numCriancas?: number
  },
  config: ConfigPlanejador
): {
  ingressosCents: number
  transporteCents: number
  alimentacaoCents: number
  totalCents: number
  totalPorPessoaCents: number
} {
  const numAdultos = opts.numAdultos ?? Math.max(1, opts.pessoas - 1)
  const numCriancas = opts.numCriancas ?? Math.max(0, opts.pessoas - numAdultos)
  const ingressosCents = custoIngressos(atrativos, numAdultos, numCriancas)
  const transporteCents = custoTransporte(atrativos, opts.transporte, config)
  const alimentacaoCents = custoAlimentacao(opts.tipoViagem, opts.dias, opts.pessoas, config)
  const totalCents = ingressosCents + transporteCents + alimentacaoCents
  const totalPorPessoaCents = opts.pessoas > 0 ? Math.round(totalCents / opts.pessoas) : 0
  return {
    ingressosCents,
    transporteCents,
    alimentacaoCents,
    totalCents,
    totalPorPessoaCents,
  }
}
