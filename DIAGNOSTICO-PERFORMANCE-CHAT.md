# 🔍 Diagnóstico Completo de Performance - Sistema de Chat

## 📊 Resumo Executivo

**Principais Gargalos Identificados:**
1. ⚠️ **CRÍTICO**: N+1 Query Problem na API de conversas (loop com await)
2. ⚠️ **CRÍTICO**: Ausência de Optimistic UI no envio de mensagens
3. ⚠️ **ALTO**: Overfetching de dados (business completo)
4. ⚠️ **ALTO**: Queries sequenciais desnecessárias
5. ⚠️ **MÉDIO**: Comparação JSON.stringify pesada no frontend
6. ⚠️ **MÉDIO**: Re-fetch após enviar mensagem

---

## 🚨 Problemas Críticos

### 1. N+1 Query Problem na API de Conversas

**Localização:** `src/app/(site)/api/messages/conversations/route.ts:97`

**Problema:**
```typescript
for (const conv of existingConversations) {
  // ❌ Query dentro de loop - N+1 problem
  const unreadCount = await prisma.message.count({
    where: {
      conversationId: conv.id,
      receiverId: user.id,
      isRead: false
    }
  })
}
```

**Impacto:** 
- Se há 10 conversas = 1 query inicial + 10 queries de count = **11 queries**
- Cada query = ~50-200ms = **550ms - 2.2s apenas para contar não lidas**

**Solução:**
```typescript
// ✅ Buscar todos os counts de uma vez
const unreadCounts = await prisma.message.groupBy({
  by: ['conversationId'],
  where: {
    receiverId: user.id,
    isRead: false,
    conversationId: {
      in: existingConversations.map(c => c.id)
    }
  },
  _count: {
    id: true
  }
})

// Criar mapa para lookup O(1)
const unreadCountMap = new Map(
  unreadCounts.map(item => [item.conversationId, item._count.id])
)

// Usar no loop
for (const conv of existingConversations) {
  const unreadCount = unreadCountMap.get(conv.id) || 0
  // ...
}
```

**Ganho estimado:** 80-90% redução no tempo de resposta

---

### 2. Ausência de Optimistic UI

**Localização:** `src/components/FloatingChat.tsx:407-495`

**Problema:**
```typescript
// ❌ Aguarda resposta do servidor antes de mostrar mensagem
const response = await fetch(`/api/messages/${conversation!.id}`, {...})
if (response.ok) {
  const data = await response.json()
  // Só então busca mensagens novamente
  await fetchMessages(conversation.id, true)
}
```

**Impacto:**
- Usuário vê delay de 200-500ms antes da mensagem aparecer
- Experiência não é "instantânea" como WhatsApp

**Solução:**
```typescript
const sendMessage = async () => {
  // ✅ 1. Criar mensagem otimista IMEDIATAMENTE
  const optimisticMessage: Message = {
    id: `temp_${Date.now()}`,
    content: messageContent,
    sender: {
      id: user.id,
      name: user.name,
      business: user.activeBusiness
    },
    receiver: {
      id: conversation.business?.userId,
      name: conversation.business?.name
    },
    createdAt: new Date().toISOString(),
    isRead: false
  }

  // ✅ 2. Atualizar UI instantaneamente
  setMessages(prev => [...prev, optimisticMessage])
  setNewMessage('')
  scrollToBottom()

  // ✅ 3. Enviar em background
  try {
    const response = await fetch(`/api/messages/${conversation.id}`, {...})
    if (response.ok) {
      const data = await response.json()
      // ✅ 4. Substituir mensagem otimista pela real
      setMessages(prev => prev.map(msg => 
        msg.id === optimisticMessage.id 
          ? data.message 
          : msg
      ))
    } else {
      // ✅ 5. Reverter se falhar
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id))
      // Mostrar erro
    }
  } catch (error) {
    // Reverter
    setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id))
  }
}
```

**Ganho estimado:** Sensação de instantaneidade (0ms de delay percebido)

---

## ⚠️ Problemas de Alto Impacto

### 3. Overfetching de Dados

**Localização:** Múltiplas APIs

**Problema:**
```typescript
// ❌ Busca business completo com todos os campos
business: {
  orderBy: { createdAt: 'desc' }
}
// Retorna: id, name, slug, profileImage, isVerified, category, 
//          description, address, phone, email, website, etc.
```

**Solução:**
```typescript
// ✅ Buscar apenas campos necessários
business: {
  select: {
    id: true,
    name: true,
    profileImage: true,
    isVerified: true
  },
  orderBy: { createdAt: 'desc' },
  take: 1 // Apenas a empresa ativa
}
```

**Ganho estimado:** 40-60% redução no payload

---

### 4. Queries Sequenciais Desnecessárias

**Localização:** `src/app/(site)/api/messages/[conversationId]/route.ts`

**Problema:**
```typescript
// ❌ Sequencial
const conversation = await prisma.conversation.findFirst({...})
const messages = await prisma.message.findMany({...})
await prisma.message.updateMany({...}) // Marca como lidas
```

**Solução:**
```typescript
// ✅ Paralelo quando possível
const [conversation, messages] = await Promise.all([
  prisma.conversation.findFirst({...}),
  prisma.message.findMany({...})
])

// Marcação de lidas pode ser assíncrona (não precisa bloquear resposta)
prisma.message.updateMany({...}).catch(console.error) // Fire and forget
```

**Ganho estimado:** 30-50% redução no tempo de resposta

---

### 5. Comparação JSON.stringify Pesada

**Localização:** `src/components/FloatingChat.tsx:103-106`

**Problema:**
```typescript
// ❌ Comparação pesada a cada polling (3s)
const hasChanges = 
  newMessages.length !== messages.length ||
  JSON.stringify(newMessages.map(...)) !== JSON.stringify(messages.map(...))
```

**Solução:**
```typescript
// ✅ Comparação leve usando hash ou timestamp
const getMessagesHash = (msgs: Message[]) => 
  msgs.map(m => `${m.id}:${m.isRead}`).join('|')

const hasChanges = 
  newMessages.length !== messages.length ||
  getMessagesHash(newMessages) !== getMessagesHash(messages)

// OU melhor ainda: usar timestamp da última mensagem
const lastMessageTimestamp = messages[messages.length - 1]?.createdAt
const newLastMessageTimestamp = newMessages[newMessages.length - 1]?.createdAt
const hasChanges = newLastMessageTimestamp !== lastMessageTimestamp
```

**Ganho estimado:** 70-90% redução no tempo de comparação

---

## 🔧 Problemas de Médio Impacto

### 6. Re-fetch Após Enviar Mensagem

**Localização:** `src/components/FloatingChat.tsx:481`

**Problema:**
```typescript
// ❌ Busca todas as mensagens novamente após enviar
await fetchMessages(conversation.id, true)
```

**Solução:**
- Com Optimistic UI, não precisa re-fetch
- Apenas substituir mensagem otimista pela real

---

### 7. Falta de Índices no Banco

**Verificar se existem:**
```sql
-- Índices recomendados
CREATE INDEX IF NOT EXISTS "Message_conversationId_receiverId_isRead_idx" 
ON "message" ("conversationId", "receiverId", "isRead");

CREATE INDEX IF NOT EXISTS "Message_conversationId_createdAt_idx" 
ON "message" ("conversationId", "createdAt");

CREATE INDEX IF NOT EXISTS "Conversation_updatedAt_idx" 
ON "conversation" ("updatedAt");
```

---

## 📋 Plano de Ação Prioritizado

### Fase 1: Quick Wins (Impacto Imediato)
1. ✅ Implementar Optimistic UI no envio
2. ✅ Corrigir N+1 Query na API de conversas
3. ✅ Reduzir overfetching (select apenas campos necessários)

**Tempo estimado:** 2-3 horas  
**Ganho esperado:** 60-80% melhoria na percepção de velocidade

### Fase 2: Otimizações de API
4. ✅ Paralelizar queries quando possível
5. ✅ Marcação de lidas assíncrona
6. ✅ Otimizar comparação de mensagens

**Tempo estimado:** 2-3 horas  
**Ganho esperado:** 30-40% redução no tempo de resposta

### Fase 3: Otimizações Avançadas
7. ✅ Adicionar índices no banco
8. ✅ Implementar paginação de mensagens
9. ✅ Cache de conversas (React Query ou SWR)

**Tempo estimado:** 4-6 horas  
**Ganho esperado:** 20-30% melhoria adicional

---

## 🎯 Métricas de Sucesso

**Antes:**
- Carregamento de conversas: ~800-1500ms
- Abertura de conversa: ~400-800ms
- Envio de mensagem: ~300-600ms (delay percebido)

**Depois (esperado):**
- Carregamento de conversas: ~200-400ms
- Abertura de conversa: ~150-300ms
- Envio de mensagem: ~0ms (instantâneo com optimistic UI)

---

## 💡 Boas Práticas Implementadas

1. ✅ Polling silencioso (sem loading)
2. ✅ Comparação antes de atualizar state
3. ✅ Scroll inteligente

**A melhorar:**
- ❌ Optimistic UI
- ❌ Paralelização de queries
- ❌ Redução de overfetching
