# AluERP - Visão Geral da Arquitetura

## Estrutura de Pastas

```
project/
├── app/                           # Next.js App Router
│   ├── (app)/                     # Páginas autenticadas
│   ├── (auth)/                    # Páginas de autenticação
│   ├── api/                       # Rotas de API
│   └── layout.tsx                 # Layout raiz
│
├── src/
│   ├── core/
│   │   ├── config/                # Configuração de ambiente
│   │   └── supabase/              # Cliente Supabase
│   │
│   ├── lib/
│   │   ├── database/              # Query optimizer, builder
│   │   ├── rbac/                  # Role-based access control
│   │   ├── audit/                 # Auditoria e logging
│   │   ├── storage/               # Organização de storage
│   │   ├── validations/           # Schemas Zod
│   │   ├── pagination.ts          # Utilities de paginação
│   │   ├── filters.ts             # Utilities de filtro
│   │   ├── search.ts              # Full-text search
│   │   └── upload.ts              # Upload de arquivos
│   │
│   ├── hooks/
│   │   ├── useForm.ts             # Hook customizado de form
│   │   ├── useCache.ts            # Cache e memoização
│   │   ├── useLazyLoad.ts         # Lazy loading
│   │   ├── useCompanySettings.ts  # Configurações da empresa
│   │   └── ... mais hooks
│   │
│   ├── repositories/              # Camada de acesso a dados
│   │   ├── base.repository.ts     # Classe base abstrata
│   │   ├── transaction.repository.ts
│   │   ├── client.repository.ts
│   │   └── ... mais repositories
│   │
│   ├── services/                  # Lógica de negócio
│   │   ├── financial.service.ts   # Serviço financeiro
│   │   ├── dashboard.service.ts   # Serviço dashboard
│   │   ├── audit.service.ts       # Auditoria
│   │   ├── settings.service.ts    # Configurações
│   │   ├── storage.service.ts     # Storage
│   │   └── ... mais services
│   │
│   └── modules/                   # Módulos do sistema
│       ├── dashboard/
│       │   ├── types/
│       │   ├── repositories/
│       │   ├── services/
│       │   ├── actions/
│       │   └── README.md
│       │
│       ├── financial/
│       ├── crm/                   # Novo módulo
│       ├── producao/              # Novo módulo
│       ├── estoque/               # Novo módulo
│       ├── compras/               # Novo módulo
│       ├── rh/                    # Novo módulo
│       ├── assistencia/           # Novo módulo
│       ├── pos-venda/             # Novo módulo
│       └── integracoes/           # Novo módulo
│
├── components/
│   ├── ui/                        # Componentes base shadcn/ui
│   ├── dashboard/                 # Componentes de dashboard
│   ├── forms/                     # Formulários padronizados
│   ├── storage/                   # Componentes de storage
│   └── ... mais componentes
│
├── public/                        # Arquivos estáticos
├── prisma/
│   ├── schema.prisma              # Schema do banco de dados
│   └── migrations/                # Migrações
│
└── SPRINT*_COMPLETION.md          # Documentação de sprints
```

## Camadas de Arquitetura

### 1. Apresentação (UI/UX)
- **Componentes React** - Baseados em shadcn/ui
- **Formulários** - Com React Hook Form + Zod
- **Dashboard** - Widgets e visualizações

### 2. Interface de Aplicação (Server Actions)
- **Next.js Server Actions** - Orquestração de requisições
- **Validação** - Zod schemas
- **Auditoria** - Logging de ações

### 3. Lógica de Negócio (Services)
- **Cálculos** - Financeiro, métricas
- **Regras de Negócio** - Validações complexas
- **Orquestração** - Coordenação de repositórios

### 4. Acesso a Dados (Repositories)
- **BaseRepository** - Classe abstrata com CRUD genérico
- **Repositories Específicas** - Lógica customizada por entidade
- **Otimizações** - Query builder, batch queries

### 5. Banco de Dados
- **Prisma ORM** - Acesso aos dados
- **Supabase PostgreSQL** - Banco de dados
- **Migrações** - Controle de schema

## Padrões Implementados

### Multi-tenancy (companyId)
Todos os dados são isolados por empresa:
```typescript
// Repositories
const data = await prisma.entity.findMany({
  where: { companyId }
})
```

### RBAC (Role-Based Access Control)
- 4 roles: Admin, Financeiro, Vendedor, Operacional
- 27 permissões granulares
- Middleware de proteção

### Auditoria Completa
- Rastreamento de ações (usuário, IP, data)
- Histórico de mudanças
- Logs estruturados

### Performance
- Query optimizer com cache
- Paginação e cursor-based pagination
- Lazy loading com Suspense
- SWR para estado do cliente

### Upload e Storage
- Organização temática de pastas
- Versionamento de documentos
- Metadados completos (tamanho, tipo, usuário)

### Validação
- Schemas Zod compreensos
- Máscaras de input (CPF, CNPJ, telefone)
- Validação server-side obrigatória

## Fluxo de uma Requisição

```
1. User UI → Clica em botão
2. Server Action → Valida dados com Zod
3. Middleware RBAC → Verifica permissões
4. Service → Aplica lógica de negócio
5. Repository → Acessa banco de dados via Prisma
6. AuditService → Registra ação
7. Database → Persiste dados
8. Response → Retorna ao cliente
9. UI → Atualiza estado
10. AuditLog → Registo completo em banco
```

## Integração com Supabase

```
├── Autenticação (Supabase Auth)
├── Database (PostgreSQL)
├── Storage (Blob) - Em integração
├── Row Level Security (RLS) - Por empresa
└── Real-time (Subscriptions) - Opcional
```

## Sprint Overview

| Sprint | Foco | Linhas |
|--------|------|--------|
| 1-2 | Core Architecture | 1.942 |
| 3 | UI Components | 2.000 |
| 4 | Forms & Validation | 1.942 |
| 5 | Dashboard Expansion | 242 |
| 6 | Performance & Optimization | 1.153 |
| 7 | RBAC & Audit | 598 |
| 8 | Settings Module | 227 |
| 9 | Storage Organization | 549 |
| 10 | Future Architecture | 1.732 |
| **Total** | - | **~11.400** |

## Próximos Módulos (Pronto para Implementação)

- **CRM** - Leads, oportunidades, interações
- **Produção** - Ordens, operações, qualidade
- **Estoque** - Inventário, movimentações
- **Compras** - Requisições, cotações, pedidos
- **RH** - Funcionários, folha, férias
- **Assistência** - Tickets, chamados, contratos
- **Pós-venda** - Feedback, pesquisas, lealdade
- **Integrações** - Webhooks, APIs, sincronização

## Padrões de Código

### Nomenclatura
- Arquivos: kebab-case
- Pastas: kebab-case
- Classes: PascalCase
- Funções/Variáveis: camelCase
- Tipos/Interfaces: PascalCase

### Estrutura de Arquivo
```typescript
// Imports
import { } from '@/lib'
import { } from '@/repositories'

// Types/Interfaces
export interface MyType { }

// Classe/Função
export class MyClass { }

// Exports
export const myFunction = () => { }
```

## Como Adicionar Novo Módulo

1. Criar pasta em `src/modules/novo-modulo/`
2. Copiar estrutura de módulo existente
3. Definir types em `types/index.ts`
4. Estender BaseRepository
5. Criar Service com lógica
6. Implementar Server Actions
7. Criar componentes React
8. Integrar com navegação

## Conclusão

A arquitetura AluERP está totalmente documentada, escalável e pronta para crescimento. Cada sprint adicionou valor incremental sem quebrar o que já existia. O sistema segue princípios SOLID e padrões consolidados da indústria.
