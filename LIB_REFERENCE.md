# Lib - Centralização de Recursos Compartilhados

## Visão Geral

A pasta `src/lib/` centraliza todos os recursos compartilhados da aplicação:
- Clientes de banco de dados (Prisma, Supabase)
- Autenticação e sessão
- Helpers e utilitários
- Funções compartilhadas

## Estrutura

```
src/lib/
├── index.ts                    # Exportações centralizadas
├── clients/                    # Clientes de BD
│   └── index.ts
├── auth-helpers/              # Helpers de autenticação
│   └── index.ts
├── helpers/                   # Helpers gerais
│   └── index.ts
├── api/                       # Helpers de API
├── database/                  # Otimizações de query
├── validations/               # Validações de forms
├── auth/                      # Autenticação core
├── upload.ts                  # Upload de arquivos
├── utils.ts                   # Utilitários gerais
└── ... (outros)
```

## 1. Clientes (`clients/`)

Acesso centralizado a banco de dados.

```typescript
import { getSupabaseBrowserClient, getPrismaClient } from '@/src/lib/clients'

// Supabase (client-side)
const supabase = getSupabaseBrowserClient()

// Prisma (server-side)
const prisma = await getPrismaClient()
```

**Características:**
- Singleton pattern
- Cache global
- Lazy loading
- Tratamento de erros

## 2. Autenticação (`auth-helpers/`)

Helpers para validação e proteção.

```typescript
import { 
  isSessionValid, 
  isAdmin, 
  hasPermission,
  validatePasswordStrength 
} from '@/src/lib/auth-helpers'

// Validar sessão
if (isSessionValid(session)) {
  // Sessão ativa
}

// Verificar admin
if (isAdmin(session)) {
  // É admin
}

// Verificar permissão
if (hasPermission(session, 'projects:manage')) {
  // Tem permissão
}

// Validar senha
const result = validatePasswordStrength('Abc123!@#')
console.log(result.score)
console.log(result.feedback)
```

**Funções principais:**
- `isSessionValid()` - Valida se sessão está ativa
- `getUserFromSession()` - Extrai usuário da sessão
- `isOwner()`, `isAdmin()` - Validações de role
- `hasPermission()`, `hasAnyPermission()`, `hasAllPermissions()` - Permissões
- `getCompanyFromSession()` - Obtém empresa
- `belongsToCompany()` - Valida empresa
- `validatePasswordStrength()` - Força de senha
- `generateSecureToken()` - Token seguro
- `isValidRedirectUrl()` - Previne open redirect
- `checkRateLimit()` - Rate limiting

## 3. Helpers Gerais (`helpers/`)

Funções reutilizáveis de negócio.

```typescript
import { 
  formatErrorResponse,
  validateResourceAccess,
  calculatePaymentAmount,
  groupBy,
  sum,
  retryWithBackoff 
} from '@/src/lib/helpers'

// Formatar erro
const error = formatErrorResponse(new Error('Falha'))

// Validar acesso
const canAccess = validateResourceAccess(resourceId, userId, userRole)

// Calcular pagamento
const payment = calculatePaymentAmount(100, 10, 5)
// { baseAmount: 100, discount: 10, tax: 4.5, totalAmount: 94.5 }

// Agrupar dados
const grouped = groupBy(users, 'status')
// { ACTIVE: [...], INACTIVE: [...] }

// Somar valores
const total = sum(items, item => item.price)

// Retry com backoff
const data = await retryWithBackoff(() => fetchData(), 3, 1000)
```

**Funções disponíveis:**
- `formatErrorResponse()` - Formatar erros
- `validateResourceAccess()` - Validar acesso
- `validateDateRange()` - Validar períodos
- `calculatePaymentAmount()` - Calcular pagamentos
- `groupBy()`, `sum()`, `average()` - Array operations
- `findIndex()` - Buscar índice
- `createQueryString()` - URL params
- `delay()`, `retryWithBackoff()` - Async helpers
- `isValidEmail()`, `sanitizeString()` - String helpers
- `generateSlug()` - Gerar slug

## 4. Index Principal (`index.ts`)

Exportações centralizadas de toda lib.

```typescript
import {
  // Banco de dados
  getPrisma,
  createSupabaseClient,
  
  // Autenticação
  getSession,
  getCurrentUser,
  
  // Helpers
  formatErrorResponse,
  validateResourceAccess,
  
  // Utilitários
  cn
} from '@/src/lib'
```

## Casos de Uso

### 1. Server Action com Autenticação

```typescript
'use server'

import { getSession } from '@/src/lib'
import { isAdmin } from '@/src/lib/auth-helpers'
import { getPrismaClient } from '@/src/lib/clients'

export async function deleteUser(userId: string) {
  const session = await getSession()
  
  if (!isAdmin(session)) {
    throw new Error('Não autorizado')
  }

  const prisma = await getPrismaClient()
  return prisma.user.delete({ where: { id: userId } })
}
```

### 2. API Route com Validação

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { extractTokenFromHeader } from '@/src/lib/auth-helpers'
import { formatErrorResponse } from '@/src/lib/helpers'

export async function POST(request: NextRequest) {
  try {
    const token = extractTokenFromHeader(
      request.headers.get('Authorization') || ''
    )

    if (!token) {
      return NextResponse.json(
        { error: 'Token ausente' },
        { status: 401 }
      )
    }

    // Processar request
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      formatErrorResponse(error),
      { status: 500 }
    )
  }
}
```

### 3. Componente com Permissões

```typescript
'use client'

import { useAuth } from '@/src/hooks'
import { hasPermission } from '@/src/lib/auth-helpers'

export function AdminPanel() {
  const session = useAuth()

  if (!hasPermission(session, 'admin:access')) {
    return <div>Acesso negado</div>
  }

  return <div>Painel de admin</div>
}
```

### 4. Retry com Backoff

```typescript
import { retryWithBackoff } from '@/src/lib/helpers'

async function fetchWithRetry() {
  return retryWithBackoff(
    () => fetch('/api/data').then(r => r.json()),
    3,
    1000
  )
}
```

## Organização Atual

```
src/lib/
├── api/                       # Helpers de API
├── auth/                      # Autenticação core
├── rbac/                      # Role-based access control
├── database/                  # Query builders e otimizadores
├── storage/                   # Storage management
├── validations/               # Validações
├── audit/                     # Auditoria
├── mock-data.ts              # Dados de teste
├── upload.ts                 # Upload
├── utils.ts                  # Utilitários gerais
├── pagination.ts             # Paginação
├── filters.ts                # Filtros
└── search.ts                 # Busca
```

## Benefícios

✅ **Centralizado** - Single source of truth
✅ **Reutilizável** - Compartilhado em toda app
✅ **Type-safe** - 100% TypeScript
✅ **Fácil manutenção** - Tudo em um lugar
✅ **Performance** - Singleton pattern
✅ **Documentado** - Exemplos inclusos

## Próximos Passos

1. **Consolidar** - Mover helpers espalhados
2. **Testar** - Adicionar testes unitários
3. **Documentar** - Manter esta doc atualizada
4. **Otimizar** - Profile e otimize hot paths

## Suporte

Para adicionar novo helper/client:
1. Crie arquivo em `src/lib/{categoria}/`
2. Exporte em `src/lib/index.ts`
3. Documente neste arquivo
