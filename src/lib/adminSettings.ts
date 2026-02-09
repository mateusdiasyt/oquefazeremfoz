import { prisma } from './db'

const KEYS = {
  GEMINI_API_KEY: 'gemini_api_key',
  BOT_SYSTEM_PROMPT: 'bot_system_prompt',
} as const

export async function getAdminSetting(key: string): Promise<string | null> {
  const row = await prisma.adminsetting.findUnique({
    where: { key },
  })
  return row?.value ?? null
}

export async function setAdminSetting(key: string, value: string): Promise<void> {
  await prisma.adminsetting.upsert({
    where: { key },
    create: { id: `setting_${key}`, key, value },
    update: { value },
  })
}

export async function getGeminiApiKey(): Promise<string | null> {
  return getAdminSetting(KEYS.GEMINI_API_KEY)
}

export async function getBotSystemPrompt(): Promise<string | null> {
  return getAdminSetting(KEYS.BOT_SYSTEM_PROMPT)
}

export async function setGeminiApiKey(apiKey: string): Promise<void> {
  await setAdminSetting(KEYS.GEMINI_API_KEY, apiKey.trim())
}

export async function setBotSystemPrompt(prompt: string): Promise<void> {
  await setAdminSetting(KEYS.BOT_SYSTEM_PROMPT, prompt.trim())
}

export function maskApiKey(apiKey: string | null): string {
  if (!apiKey || apiKey.length < 8) return ''
  return apiKey.slice(0, 4) + '…' + apiKey.slice(-4)
}
