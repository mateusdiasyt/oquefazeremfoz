import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, isAdmin } from '@/lib/auth'
import { getGeminiApiKey, getBotSystemPrompt } from '@/lib/adminSettings'
import { prisma } from '@/lib/db'

const DEFAULT_SYSTEM = `Você é um redator de releases e artigos para turismo em Foz do Iguaçu. Escreva em português do Brasil, tom informativo e acolhedor. Gere conteúdo original, útil para turistas. Responda apenas com um JSON válido no formato: {"title":"Título do artigo","lead":"Resumo em 1 ou 2 frases","body":"Texto completo em HTML com parágrafos <p>..."}`

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !isAdmin(user.roles)) {
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const { topic, businessId, systemPrompt: customPrompt } = body as {
      topic?: string
      businessId?: string
      systemPrompt?: string
    }

    if (!topic || !businessId) {
      return NextResponse.json(
        { message: 'Tema e empresa são obrigatórios' },
        { status: 400 }
      )
    }

    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { name: true, description: true },
    })
    if (!business) {
      return NextResponse.json({ message: 'Empresa não encontrada' }, { status: 404 })
    }

    const apiKey = await getGeminiApiKey()
    if (!apiKey) {
      return NextResponse.json(
        { message: 'Configure a API key do Gemini em Configurações' },
        { status: 400 }
      )
    }

    const systemPrompt =
      (await getBotSystemPrompt()) || customPrompt || DEFAULT_SYSTEM
    const userPrompt = `Empresa: ${business.name}. ${business.description ? `Sobre a empresa: ${business.description.slice(0, 300)}.` : ''}

Crie um release completo sobre o seguinte tema: ${topic}.

Responda apenas com um JSON válido contendo: "title", "lead" e "body". O "body" deve ser HTML (use <p> para parágrafos, <strong> para destaque).`

    const payload = {
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ parts: [{ text: userPrompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json',
      },
    }

    const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash-latest']
    let res: Response | null = null
    let lastError = ''

    for (const model of modelsToTry) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`
      res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) break
      const errText = await res.text()
      lastError = errText
      try {
        const errJson = JSON.parse(errText)
        lastError = errJson?.error?.message || errText
      } catch {
        lastError = errText.slice(0, 200)
      }
      if (res.status !== 404) {
        break
      }
    }

    if (!res || !res.ok) {
      console.error('Gemini API error:', lastError)
      return NextResponse.json(
        { message: `Gemini: ${lastError || 'Erro ao chamar a API. Verifique a API key em Configurações.'}` },
        { status: 502 }
      )
    }

    const data = await res!.json()
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || ''
    if (!text) {
      return NextResponse.json(
        { message: 'Resposta vazia do Gemini' },
        { status: 502 }
      )
    }

    let parsed: { title?: string; lead?: string; body?: string }
    try {
      const cleaned = text.replace(/^```json\s*|\s*```$/g, '').trim()
      parsed = JSON.parse(cleaned)
    } catch {
      return NextResponse.json(
        { message: 'Resposta do Gemini não é JSON válido', raw: text.slice(0, 500) },
        { status: 502 }
      )
    }

    const title = String(parsed.title || topic).trim() || topic
    const lead = (parsed.lead && String(parsed.lead).trim()) || null
    const bodyHtml = String(parsed.body || '').trim() || '<p>Conteúdo em produção.</p>'

    return NextResponse.json({
      title,
      lead,
      body: bodyHtml,
    })
  } catch (error) {
    console.error('Erro ao gerar conteúdo:', error)
    return NextResponse.json(
      { message: 'Erro interno ao gerar conteúdo' },
      { status: 500 }
    )
  }
}
