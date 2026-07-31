# Template de Rota API - AluERP

Use este template ao criar novas rotas API. Garante consistência e segurança em todo o projeto.

## Template Básico GET

```typescript
import { NextRequest } from 'next/server'
import { z } from 'zod'
import { handleApiRequest, requireAuth, validateQuery, ApiError } from '@/src/api/middleware'
import { ApiResponses } from '@/src/api/utils/response'
import { MyService } from '@/src/services'
import { AuthenticatedRequest } from '@/src/api/middleware/auth'

// 1. Definir schemas de validação
const listSchema = z.object({
  skip: z.string().optional().transform(v => v ? parseInt(v) : 0),
  take: z.string().optional().transform(v => v ? parseInt(v) : 10),
  search: z.string().optional(),
  // Adicionar outros filtros conforme necessário
})

/**
 * GET /api/dominios
 * Listar recursos do domínio
 * 
 * Autenticação: Requerida
 * Permissão: Nenhuma (todos autenticados)
 */
export async function GET(request: NextRequest) {
  return handleApiRequest(async (req) => {
    // 2. Validar autenticação
    const authError = await requireAuth(req as AuthenticatedRequest)
    if (authError) return authError

    const authReq = req as AuthenticatedRequest
    if (!authReq.user) {
      return ApiResponses.unauthorized('Usuário não encontrado')
    }

    try {
      // 3. Validar entrada
      const { searchParams } = new URL(req.url)
      const params = Object.fromEntries(searchParams)
      const validated = validateQuery(params, listSchema)

      if (!validated) {
        return ApiResponses.badRequest('Parâmetros inválidos')
      }

      // 4. Chamar service
      const service = new MyService()
      const result = await service.list({
        companyId: authReq.user.companyId,
        skip: validated.skip,
        take: validated.take,
        search: validated.search,
      })

      // 5. Retornar resposta
      return ApiResponses.success(result, 'Recursos listados com sucesso')
    } catch (error) {
      if (error instanceof ApiError) throw error
      throw new ApiError(500, 'Erro ao listar recursos')
    }
  }, request)
}
```

## Template POST (Criar)

```typescript
/**
 * POST /api/dominios
 * Criar novo recurso
 * 
 * Autenticação: Requerida
 * Permissão: dominios:write
 */
export async function POST(request: NextRequest) {
  return handleApiRequest(async (req) => {
    // 1. Validar autenticação
    const authError = await requireAuth(req as AuthenticatedRequest)
    if (authError) return authError

    const authReq = req as AuthenticatedRequest
    if (!authReq.user) {
      return ApiResponses.unauthorized('Usuário não encontrado')
    }

    // 2. Validar permissão
    if (!authReq.user.permissions.includes('dominios:write')) {
      return ApiResponses.forbidden('Permissão requerida: dominios:write')
    }

    try {
      // 3. Validar entrada
      const body = await req.json()
      const validated = z.object({
        name: z.string().min(2),
        email: z.string().email().optional(),
        // Adicionar outros campos
      }).parse(body)

      // 4. Chamar service
      const service = new MyService()
      const newResource = await service.create({
        companyId: authReq.user.companyId,
        userId: authReq.user.id,
        data: validated,
      })

      // 5. Retornar resposta
      return ApiResponses.created(newResource, 'Recurso criado com sucesso')
    } catch (error) {
      if (error instanceof ApiError) throw error
      if (error instanceof z.ZodError) {
        return ApiResponses.badRequest(error.errors[0].message)
      }
      throw new ApiError(400, 'Erro ao criar recurso')
    }
  }, request)
}
```

## Template PUT (Atualizar)

```typescript
/**
 * PUT /api/dominios/[id]
 * Atualizar recurso
 * 
 * Autenticação: Requerida
 * Permissão: dominios:write
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleApiRequest(async (req) => {
    // 1. Validar autenticação
    const authError = await requireAuth(req as AuthenticatedRequest)
    if (authError) return authError

    const authReq = req as AuthenticatedRequest
    if (!authReq.user) {
      return ApiResponses.unauthorized('Usuário não encontrado')
    }

    // 2. Validar permissão
    if (!authReq.user.permissions.includes('dominios:write')) {
      return ApiResponses.forbidden('Permissão requerida: dominios:write')
    }

    try {
      // 3. Extrair ID
      const { id } = await params

      // 4. Validar entrada
      const body = await req.json()
      const validated = z.object({
        name: z.string().min(2).optional(),
        email: z.string().email().optional(),
      }).parse(body)

      // 5. Chamar service
      const service = new MyService()
      const updated = await service.update({
        id,
        companyId: authReq.user.companyId,
        userId: authReq.user.id,
        data: validated,
      })

      // 6. Retornar resposta
      return ApiResponses.success(updated, 'Recurso atualizado com sucesso')
    } catch (error) {
      if (error instanceof ApiError) throw error
      throw new ApiError(400, 'Erro ao atualizar recurso')
    }
  }, request)
}
```

## Template DELETE

```typescript
/**
 * DELETE /api/dominios/[id]
 * Deletar recurso (soft delete)
 * 
 * Autenticação: Requerida
 * Permissão: dominios:delete
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleApiRequest(async (req) => {
    // 1. Validar autenticação
    const authError = await requireAuth(req as AuthenticatedRequest)
    if (authError) return authError

    const authReq = req as AuthenticatedRequest
    if (!authReq.user) {
      return ApiResponses.unauthorized('Usuário não encontrado')
    }

    // 2. Validar permissão
    if (!authReq.user.permissions.includes('dominios:delete')) {
      return ApiResponses.forbidden('Permissão requerida: dominios:delete')
    }

    try {
      // 3. Extrair ID
      const { id } = await params

      // 4. Chamar service
      const service = new MyService()
      await service.delete({
        id,
        companyId: authReq.user.companyId,
      })

      // 5. Retornar resposta
      return ApiResponses.noContent()
    } catch (error) {
      if (error instanceof ApiError) throw error
      throw new ApiError(400, 'Erro ao deletar recurso')
    }
  }, request)
}
```

## Melhores Práticas

### 1. Validação em Camadas

```typescript
// ✅ Correto: Validar em cada camada
1. Autenticação (requireAuth)
2. Autorização (permissões)
3. Entrada (Zod schema)
4. Lógica (service)
```

### 2. Tratamento de Erros

```typescript
// ✅ Correto: Usar ApiError customizado
throw new ApiError(404, 'Cliente não encontrado')

// ✅ Correto: Propagar erros de service
if (error instanceof ApiError) throw error
```

### 3. Respostas Estruturadas

```typescript
// ✅ Correto: Usar ApiResponses helpers
return ApiResponses.success(data, 'Mensagem')
return ApiResponses.created(data)
return ApiResponses.badRequest('Erro')

// ❌ Evitar: Response manual sem estrutura
return NextResponse.json({ data })
```

### 4. Documentação

```typescript
/**
 * GET /api/dominios
 * Descrição breve
 * 
 * Autenticação: Requerida/Opcional
 * Permissão: codigo-da-permissao ou "Nenhuma"
 * 
 * Query:
 * - skip: número (opcional, default: 0)
 * - take: número (opcional, default: 10)
 * 
 * Response: 200
 * {
 *   "success": true,
 *   "data": [...],
 *   "message": "..."
 * }
 */
```

### 5. Permissões

```typescript
// ✅ Verificar permissão específica
if (!authReq.user.permissions.includes('clients:write')) {
  return ApiResponses.forbidden('Permissão requerida: clients:write')
}

// ✅ Verificar role
if (!['admin', 'manager'].includes(authReq.user.role)) {
  return ApiResponses.forbidden('Role requerido: admin ou manager')
}
```

### 6. Isolamento Multi-Tenant

```typescript
// ✅ Sempre filtrar por companyId do usuário
const result = await service.list({
  companyId: authReq.user.companyId,  // IMPORTANTE!
  ...
})
```

## Checklist de Nova Rota

- [ ] Autenticação validada
- [ ] Permissões verificadas
- [ ] Entrada validada com Zod
- [ ] Isolamento multi-tenant (companyId)
- [ ] Tratamento de erros com ApiError
- [ ] Resposta com ApiResponses helper
- [ ] Documentação com JSDoc
- [ ] Status HTTP corretos
- [ ] Type-safe com TypeScript
- [ ] Testado no Postman/cURL

## Exemplo Completo

Veja `/app/api/clientes/route.ts` para um exemplo completo e funcionando.

## Referências

- [Middleware](../src/api/middleware/index.ts)
- [Utils de Response](../src/api/utils/response.ts)
- [Documentação de Rotas](./API_ROUTES_DOCUMENTATION.md)
