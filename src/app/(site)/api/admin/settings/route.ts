import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, isAdmin } from '@/lib/auth'
import {
  getGeminiApiKey,
  getBotSystemPrompt,
  setGeminiApiKey,
  setBotSystemPrompt,
  maskApiKey,
} from '@/lib/adminSettings'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || !isAdmin(user.roles)) {
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 })
    }
    const [apiKey, botPrompt] = await Promise.all([
      getGeminiApiKey(),
      getBotSystemPrompt(),
    ])
    return NextResponse.json({
      geminiApiKey: apiKey ? maskApiKey(apiKey) : '',
      geminiApiKeySet: !!apiKey,
      botSystemPrompt: botPrompt ?? '',
    })
  } catch (error) {
    console.error('Erro ao buscar configurações admin:', error)
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !isAdmin(user.roles)) {
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 })
    }
    const body = await request.json()
    const { geminiApiKey, botSystemPrompt } = body as {
      geminiApiKey?: string
      botSystemPrompt?: string
    }
    if (typeof geminiApiKey === 'string' && geminiApiKey.trim()) {
      await setGeminiApiKey(geminiApiKey)
    }
    if (typeof botSystemPrompt === 'string') {
      await setBotSystemPrompt(botSystemPrompt)
    }
    return NextResponse.json({ message: 'Configurações salvas' })
  } catch (error) {
    console.error('Erro ao salvar configurações admin:', error)
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}
