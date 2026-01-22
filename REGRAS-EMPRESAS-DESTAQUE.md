# 📋 Regras da Coluna "Empresas em Destaque"

## 🔍 Como Funciona Atualmente

### Localização
- **Componente:** `src/app/(site)/page.tsx` (linha 659-675)
- **API:** `/api/business/list` (rota que fornece os dados)

### Regras Atuais (Simples)

```typescript
{businesses.slice(0, 3).map((business) => (
  // Renderiza as 3 primeiras empresas
))}
```

**Critérios atuais:**
1. ✅ Empresas **aprovadas** (`isApproved: true`)
2. ✅ Empresas com **usuário válido** (não deletado)
3. ✅ Ordenação: **Mais recentes primeiro** (`createdAt: 'desc'`)
4. ✅ Limite: **Primeiras 3 empresas** da lista

### Problema Identificado

**Não há critério real de "destaque"!**
- Apenas pega as 3 empresas mais recentes
- Não considera:
  - ❌ Número de seguidores
  - ❌ Número de likes
  - ❌ Status de verificação
  - ❌ Engajamento/interações
  - ❌ Qualidade do perfil completo

---

## 💡 Sugestões de Melhorias

### Opção 1: Destaque por Engajamento (Recomendado)
```typescript
// Ordenar por: seguidores + likes + verificação
const featuredBusinesses = businesses
  .filter(b => b.isApproved && b.user)
  .sort((a, b) => {
    // Empresas verificadas primeiro
    if (a.isVerified !== b.isVerified) {
      return b.isVerified ? 1 : -1
    }
    // Depois por seguidores
    if (b.followersCount !== a.followersCount) {
      return b.followersCount - a.followersCount
    }
    // Por último, por likes
    return b.likesCount - a.likesCount
  })
  .slice(0, 3)
```

### Opção 2: Destaque Manual (Admin)
- Adicionar campo `isFeatured: boolean` no schema
- Admin pode marcar empresas para destaque
- Ordenar por: `isFeatured` primeiro, depois engajamento

### Opção 3: Destaque por Completeness Score
- Empresas com perfil mais completo aparecem primeiro
- Considera: foto, descrição, endereço, redes sociais, etc.

---

## 🎯 Implementação Recomendada

**Critérios sugeridos (em ordem de prioridade):**
1. ✅ **Verificadas** (`isVerified: true`) - prioridade máxima
2. ✅ **Mais seguidores** (`followersCount` desc)
3. ✅ **Mais likes** (`likesCount` desc)
4. ✅ **Mais recentes** (`createdAt` desc) - desempate

**Código sugerido:**
```typescript
const featuredBusinesses = businesses
  .filter(b => b.isApproved && b.user && b.user.id)
  .sort((a, b) => {
    // 1. Verificadas primeiro
    if (a.isVerified !== b.isVerified) {
      return b.isVerified ? 1 : -1
    }
    // 2. Mais seguidores
    const followersDiff = (b.followersCount || 0) - (a.followersCount || 0)
    if (followersDiff !== 0) return followersDiff
    // 3. Mais likes
    const likesDiff = (b.likesCount || 0) - (a.likesCount || 0)
    if (likesDiff !== 0) return likesDiff
    // 4. Mais recentes
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
  .slice(0, 3)
```

---

## 📊 Resumo

| Critério | Atual | Sugerido |
|----------|-------|----------|
| Ordenação | Data criação (desc) | Verificação → Seguidores → Likes → Data |
| Filtros | Aprovadas + Usuário válido | Aprovadas + Usuário válido |
| Limite | 3 empresas | 3 empresas |
| Lógica | Simples (primeiras 3) | Inteligente (melhores 3) |

---

## ⚠️ Observação

A seção se chama "Empresas em Destaque" mas atualmente não há critério real de destaque - apenas mostra as 3 mais recentes. Isso pode ser confuso para usuários que esperam ver as "melhores" ou "mais populares" empresas.
