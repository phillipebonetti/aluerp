# Documentação de Rotas API - AluERP

## Visão Geral

A arquitetura de API do AluERP é organizada por domínios de negócio, com uma camada de abstração centralizada que permite implementar regras de negócio no futuro sem alterar a interface pública.

### Estrutura

```
app/api/
├── clientes/           # Gerenciamento de clientes
├── obras/              # Gerenciamento de obras/projetos
├── financeiro/         # Gerenciamento financeiro
├── dashboard/          # Dados agregados
├── relatorios/         # Geração de relatórios
├── upload/             # Upload de arquivos
└── auth/               # Autenticação e autorização
```

## Camada de Abstração

### Middlewares Reutilizáveis

Todos os handlers de API utilizam middlewares centralizados:

#### 1. Autenticação (`requireAuth`)
- Valida Bearer token
- Carrega dados do usuário
- Verifica permissões
- Adiciona contexto ao request

#### 2. Validação (`validateBody`, `validateQuery`)
- Valida dados com Zod
- Retorna erros estruturados
- Type-safe

#### 3. Error Handling (`handleApiRequest`)
- Captura exceções
- Converte erros Prisma
- Responde com status correto

#### 4. Respostas (`ApiResponses`)
- Formatação uniforme
- Status HTTP corretos
- Mensagens consistentes

## Rotas Disponíveis

### Autenticação

#### POST /api/auth/login
Autentica usuário com email e senha.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "senha123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "user-1",
      "email": "user@example.com",
      "name": "João Silva",
      "companyId": "company-1",
      "role": "admin",
      "permissions": ["read", "write"]
    },
    "expiresIn": 86400
  },
  "message": "Login realizado com sucesso",
  "statusCode": 200
}
```

#### POST /api/auth/register
Registra novo usuário e cria empresa.

**Request:**
```json
{
  "email": "novo@example.com",
  "password": "senha123",
  "name": "João Silva",
  "companyName": "Silva Construções"
}
```

**Response (201):** Similar a login.

#### POST /api/auth/refresh
Atualiza token de autenticação.

**Request:**
```json
{
  "refreshToken": "refresh-token-value"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "novo-token",
    "expiresIn": 86400
  }
}
```

### Clientes

#### GET /api/clientes
Lista clientes da empresa.

**Query Parameters:**
- `skip` (default: 0) - Paginação offset
- `take` (default: 10) - Quantidade de resultados
- `search` - Busca por nome/email/telefone
- `status` - Filtro por status (ACTIVE, INACTIVE)
- `category` - Filtro por categoria
- `city` - Filtro por cidade

**Example:**
```
GET /api/clientes?status=ACTIVE&city=São%20Paulo&take=20
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "clients": [
      {
        "id": "client-1",
        "name": "Acme Corp",
        "email": "contact@acme.com",
        "status": "ACTIVE"
      }
    ],
    "total": 150,
    "skip": 0,
    "take": 20
  }
}
```

#### POST /api/clientes
Cria novo cliente.

**Request:**
```json
{
  "name": "Nova Empresa",
  "email": "email@empresa.com",
  "phone": "(11) 99999-9999",
  "category": "CONSTRUCTION",
  "city": "São Paulo"
}
```

**Response (201):** Cliente criado.

### Obras (Projetos)

#### GET /api/obras
Lista obras/projetos da empresa.

**Query Parameters:**
- `skip` (default: 0)
- `take` (default: 10)
- `search` - Busca por nome
- `status` - Filtro por status (DRAFT, ACTIVE, COMPLETED, CANCELLED)
- `clientId` - Filtro por cliente
- `priority` - Filtro por prioridade (LOW, MEDIUM, HIGH)

**Example:**
```
GET /api/obras?status=ACTIVE&priority=HIGH
```

#### POST /api/obras
Cria nova obra.

**Request:**
```json
{
  "name": "Reforma Apartamento 101",
  "clientId": "client-1",
  "description": "Reforma completa do apartamento",
  "startDate": "2024-02-01",
  "endDate": "2024-03-01",
  "priority": "HIGH"
}
```

**Response (201):** Obra criada.

### Financeiro

#### GET /api/financeiro
Lista transações financeiras.

**Query Parameters:**
- `skip`, `take` - Paginação
- `type` - Tipo (INCOME, EXPENSE)
- `category` - Categoria
- `status` - Status (PENDING, COMPLETED, CANCELLED)
- `startDate`, `endDate` - Range de datas

#### GET /api/financeiro?metrics
Retorna métricas financeiras agregadas.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalIncome": 50000,
    "totalExpense": 30000,
    "netProfit": 20000,
    "cashFlow": [...],
    "byCategory": {...}
  }
}
```

#### POST /api/financeiro
Cria nova transação.

**Request:**
```json
{
  "type": "INCOME",
  "category": "SALES",
  "description": "Venda de projeto",
  "amount": 5000,
  "date": "2024-01-15",
  "accountId": "account-1"
}
```

### Dashboard

#### GET /api/dashboard
Retorna dados agregados do dashboard.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalClients": 45,
      "activeProjects": 12,
      "totalRevenue": 250000,
      "expenses": 120000
    },
    "recentClients": [...],
    "upcomingProjects": [...],
    "metrics": {...}
  }
}
```

### Relatórios

#### GET /api/relatorios
Gera e retorna relatórios em diferentes formatos.

**Query Parameters:**
- `type` - Tipo (clients, projects, financial, suppliers, budgets, serviceorders)
- `format` - Formato (json, pdf, csv) - default: json
- `startDate`, `endDate` - Range de datas

**Examples:**
```
GET /api/relatorios?type=financial&format=pdf&startDate=2024-01-01&endDate=2024-12-31
GET /api/relatorios?type=clients&format=csv
```

**Response:**
- Para `format=pdf`: Arquivo PDF
- Para `format=csv`: Arquivo CSV
- Para `format=json`: Dados JSON

### Upload

#### POST /api/upload
Faz upload de arquivo.

**Content-Type:** multipart/form-data

**Request:**
```
POST /api/upload
Content-Type: multipart/form-data

file: <arquivo>
```

**Limites:**
- Tamanho máximo: 10MB
- Tipos permitidos: JPEG, PNG, WebP, PDF, DOC, DOCX, XLS, XLSX

**Response (201):**
```json
{
  "success": true,
  "data": {
    "url": "/uploads/company-1/timestamp-filename.pdf",
    "name": "filename.pdf",
    "size": 2048,
    "type": "application/pdf",
    "uploadedAt": "2024-01-15T10:30:00Z"
  }
}
```

## Autenticação

### Bearer Token

Todos os endpoints (exceto auth) requerem autenticação via Bearer token no header:

```
Authorization: Bearer <token>
```

### Exemplo com cURL

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"senha123"}'

# Usar token retornado
curl http://localhost:3000/api/clientes \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

## Tratamento de Erros

### Formato de Erro

```json
{
  "success": false,
  "error": "Descrição do erro",
  "statusCode": 400
}
```

### Status Codes

- `200` - OK
- `201` - Created
- `202` - Accepted
- `204` - No Content
- `400` - Bad Request (validação falhou)
- `401` - Unauthorized (não autenticado)
- `403` - Forbidden (sem permissão)
- `404` - Not Found
- `409` - Conflict (duplicado)
- `422` - Unprocessable Entity
- `500` - Internal Server Error

### Exemplos de Erro

```json
// 400 - Validação
{
  "success": false,
  "error": "Email é obrigatório",
  "statusCode": 400
}

// 401 - Não autenticado
{
  "success": false,
  "error": "Token não fornecido",
  "statusCode": 401
}

// 404 - Não encontrado
{
  "success": false,
  "error": "Cliente não encontrado",
  "statusCode": 404
}
```

## Padrões de Implementação

### Adicionar Nova Rota

1. **Criar arquivo** em `app/api/dominio/route.ts`

2. **Usar template:**

```typescript
import { NextRequest } from 'next/server'
import { handleApiRequest, requireAuth, validateBody } from '@/src/api/middleware'
import { ApiResponses } from '@/src/api/utils/response'
import { MyService } from '@/src/services'
import { AuthenticatedRequest } from '@/src/api/middleware/auth'

export async function GET(request: NextRequest) {
  return handleApiRequest(async (req) => {
    // 1. Validar autenticação
    const authError = await requireAuth(req as AuthenticatedRequest)
    if (authError) return authError

    const authReq = req as AuthenticatedRequest
    if (!authReq.user) return ApiResponses.unauthorized()

    try {
      // 2. Validar entrada
      // const validated = validateQuery(...)

      // 3. Chamar service
      const service = new MyService()
      const result = await service.doSomething(authReq.user.companyId)

      // 4. Retornar resposta
      return ApiResponses.success(result)
    } catch (error) {
      throw new ApiError(500, 'Erro ao processar')
    }
  }, request)
}
```

### Adicionar Permissão

```typescript
import { requirePermission } from '@/src/api/middleware'

const checkPermission = requirePermission('clients:write')
if (checkPermission) return checkPermission
```

### Adicionar Validação

```typescript
import { z } from 'zod'
import { validateBody } from '@/src/api/middleware'

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
})

const validated = await validateBody(request, schema)
```

## TODO

- [ ] Implementar autenticação real com Better Auth
- [ ] Implementar upload real com Vercel Blob
- [ ] Adicionar rate limiting
- [ ] Adicionar CORS configuration
- [ ] Adicionar logging estruturado
- [ ] Adicionar OpenAPI/Swagger docs
- [ ] Adicionar testes automatizados
- [ ] Implementar caching de respostas
- [ ] Adicionar validação de IP
- [ ] Implementar webhook events

## Referências

- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Zod - TypeScript-first schema validation](https://zod.dev)
- [Prisma Error Codes](https://www.prisma.io/docs/reference/api-reference/error-reference)
