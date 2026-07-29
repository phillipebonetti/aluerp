# Quick Start — Desenvolvendo no AluERP

## 🚀 Começar Agora

### 1. Estrutura Está Pronta
```bash
npm run dev  # ou pnpm dev
# Acesse http://localhost:3000
```

**Tudo funciona igual.** Layout, componentes, autenticação, dashboard — nada mudou.

---

## 📝 Desenvolver um Novo Módulo

### Passo 1: Escolher o Módulo
- `modules/Financial/` — Financeiro
- `modules/Client/` — Clientes
- `modules/Supplier/` — Fornecedores
- Ou qualquer outro em `modules/`

### Passo 2: Estruturar o Módulo

```bash
cd modules/SEU_MODULO

# Criar pastas
mkdir -p actions schemas hooks

# Criar arquivos base
touch types.ts
touch schemas/index.ts
touch actions/index.ts
```

### Passo 3: Definir Types

```typescript
// modules/SEU_MODULO/types.ts
export type MeuDominio = {
  id: string
  companyId: string
  name: string
  // seus campos...
}
```

### Passo 4: Definir Schemas (Zod)

```typescript
// modules/SEU_MODULO/schemas/index.ts
import { z } from 'zod'

export const CreateSchema = z.object({
  name: z.string().min(3),
  // seus campos...
})
```

### Passo 5: Implementar Actions

```typescript
// modules/SEU_MODULO/actions/index.ts
'use server'

import { getCurrentUser } from '@/core/auth'
import { getPrisma } from '@/core/database'
import { CreateSchema } from '../schemas'

export async function create(input: unknown) {
  const data = CreateSchema.parse(input)
  const user = await getCurrentUser()
  if (!user) throw new Error('Unauthorized')

  const prisma = await getPrisma()
  if (!prisma) throw new Error('Database unavailable')

  return await prisma.seuModelo.create({
    data: {
      ...data,
      companyId: user.activeCompanyId,
    },
  })
}

export async function list() {
  // Similar...
}
```

### Passo 6: Exportar Públicos

```typescript
// modules/SEU_MODULO/index.ts
export type * from './types'
export * from './schemas'
export * as SeuModuloActions from './actions'
```

### Passo 7: Usar na Página

```typescript
// app/(app)/seu-modulo/page.tsx
'use client'

import { SeuModuloActions } from '@/modules/SEU_MODULO'

export default function Page() {
  async function handleCreate(data: unknown) {
    const result = await SeuModuloActions.create(data)
    console.log('Criado:', result)
  }

  return (
    <div>
      {/* Component UI */}
    </div>
  )
}
```

---

## 🎯 Template Rápido

Copie e adapte:

```typescript
// modules/NOVO/types.ts
export type MeuDominio = {
  id: string
  companyId: string
  createdAt: Date
}

// modules/NOVO/schemas/index.ts
import { z } from 'zod'
export const CreateSchema = z.object({})

// modules/NOVO/actions/index.ts
'use server'
import { getCurrentUser } from '@/core/auth'
import { getPrisma } from '@/core/database'
import { CreateSchema } from '../schemas'

export async function create(input: unknown) {
  const data = CreateSchema.parse(input)
  const user = await getCurrentUser()
  if (!user) throw new Error('Unauthorized')
  const prisma = await getPrisma()
  if (!prisma) throw new Error('Database unavailable')
  
  // Sua lógica aqui
}

// modules/NOVO/index.ts
export type * from './types'
export * from './schemas'
export * as NOVOActions from './actions'
```

---

## 📚 Documentação Completa

- **`ARCHITECTURE.md`** — Explicação completa
- **`MODULES.md`** — Guia detalhado com exemplos
- **`ARCHITECTURE_SUMMARY.md`** — Resumo executivo
- **`STRUCTURE.txt`** — Árvore de diretórios

---

## 🔗 Imports Essenciais

```typescript
// Core — sempre disponível
import { getCurrentUser } from '@/core/auth'
import { getPrisma } from '@/core/database'
import { NotFoundError, UnauthorizedError } from '@/core/errors'
import { createLogger } from '@/core/logger'

// Seus módulos
import type { MeuDominio } from '@/modules/SEU_MODULO'
import { SEU_MODULOActions } from '@/modules/SEU_MODULO'

// Não use
// ❌ import { legacyFunc } from '@/lib/auth'  → use @/core/auth
// ❌ import { create } from '@/modules/Other' → Evite cruzar módulos
```

---

## ✅ Checklist Antes de Commitar

- [ ] Tipos definidos em `types.ts`
- [ ] Schemas Zod em `schemas/`
- [ ] Server actions em `actions/`
- [ ] Exports públicos em `index.ts`
- [ ] Usado na página via imports limpos
- [ ] `pnpm exec tsc --noEmit` passa
- [ ] `npm run dev` sem erros
- [ ] Preview visual funciona

---

## 🐛 Troubleshooting

### "Module not found"
Verifique se o caminho em `import` está correto. Use `@/core/*` e `@/modules/*`.

### "Unauthorized"
`getCurrentUser()` retornou `null`. Verifique se o usuário está logado no preview.

### "Type 'any' implicitly"
Use Zod para validar entrada:
```typescript
const data = MySchema.parse(input)
```

### Build error
Rode `pnpm exec tsc --noEmit` para ver erros TypeScript.

---

## 🚢 Próxima Fase

Após implementar seu módulo:

1. Adicione a tabela ao `prisma/schema.prisma`
2. Rode `pnpm exec prisma generate`
3. Se tiver Supabase: `pnpm db:push`
4. Teste no preview
5. Revise com equipe

---

## 💡 Dicas

- **Use `revalidatePath()`** após mutações para refrescar cache
- **Sempre valide com Zod** — não confie em tipos TypeScript para validação
- **Respeite o isolamento** — módulos não importam uns dos outros
- **Scope com `companyId`** — todo dado deve filtrar por company
- **Trate erros** — use `@/core/errors` para exceções conhecidas

---

**Bom desenvolvimento! 🎉**

Dúvidas? Veja `MODULES.md` para exemplos completos.
