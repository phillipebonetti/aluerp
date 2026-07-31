# Constantes Centralizadas - AluERP

## Visão Geral

Todas as constantes da aplicação estão centralizadas em `src/constants/` para fácil manutenção e reutilização.

## Estrutura de Arquivos

```
src/constants/
├── index.ts           # Exportações centralizadas
├── status.ts          # Status de entidades
├── colors.ts          # Cores e paleta de design
├── permissions.ts     # Roles e permissões (RBAC)
├── menus.ts           # Menus e navegação
├── payment.ts         # Pagamentos, categorias, estados
└── config.ts          # Configurações globais
```

**Total: 1,372 linhas de constantes organizadas**

## Como Usar

### Importação Individual
```typescript
import { USER_STATUS, CLIENT_STATUS } from '@/src/constants/status'
import { ROLES, PERMISSIONS } from '@/src/constants/permissions'
```

### Importação do Index
```typescript
import { 
  USER_STATUS,
  ROLES,
  MAIN_MENU_ITEMS,
  COLORS
} from '@/src/constants'
```

## 1. Status (`status.ts`)

Define todos os status possíveis para cada entidade.

```typescript
import { USER_STATUS, CLIENT_STATUS, PROJECT_STATUS } from '@/src/constants'

// Status com labels
USER_STATUS.ACTIVE    // "ACTIVE"
USER_STATUS_LABELS.ACTIVE // "Ativo"

CLIENT_STATUS.SUSPENDED
CLIENT_STATUS_LABELS.SUSPENDED // "Suspenso"

// Status com cores (Tailwind)
PROJECT_STATUS_COLORS.ACTIVE // "bg-yellow-100 text-yellow-800 border-yellow-300"
```

**Status inclusos:**
- USER_STATUS / MEMBER_STATUS / COMPANY_STATUS
- CLIENT_STATUS
- PROJECT_STATUS
- QUOTE_STATUS
- SERVICE_ORDER_STATUS
- SUPPLIER_STATUS
- TRANSACTION_STATUS
- EMPLOYEE_STATUS
- BANK_ACCOUNT_STATUS

Cada status tem:
- Constantes de valor
- Labels em português
- Cores (para status visuais)

## 2. Cores (`colors.ts`)

Paleta de cores para toda aplicação.

```typescript
import { COLORS, STATUS_COLORS, CHART_COLORS } from '@/src/constants'

// Cores principais
COLORS.primary        // "#3B82F6" (Azul)
COLORS.success        // "#10B981" (Verde)
COLORS.danger         // "#EF4444" (Vermelho)

// Cores para status
STATUS_COLORS.active      // "bg-green-100 text-green-800 border-green-300"
STATUS_COLORS.pending     // "bg-yellow-100 text-yellow-800 border-yellow-300"

// Cores para gráficos
CHART_COLORS[0]       // "#3B82F6"
CHART_COLORS_LIGHT[0] // "#DBEAFE"

// Cores por prioridade
PRIORITY_COLORS.HIGH   // "bg-orange-100 text-orange-800 border-orange-300"
```

## 3. Permissões (`permissions.ts`)

RBAC (Role-Based Access Control) completo.

```typescript
import { 
  ROLES, 
  PERMISSIONS, 
  ROLE_PERMISSIONS,
  CAN_ACCESS_ADMIN 
} from '@/src/constants'

// Roles
ROLES.OWNER   // "OWNER"
ROLES.ADMIN   // "ADMIN"
ROLES.MANAGER // "MANAGER"

// Permissões individuais
PERMISSIONS.USER_CREATE     // "user:create"
PERMISSIONS.PROJECT_MANAGE  // "project:manage"

// Matriz de permissões por role
ROLE_PERMISSIONS.ADMIN    // [lista de todas as permissões do admin]
ROLE_PERMISSIONS.VIEWER   // [lista restrita de permissões do viewer]

// Verificações de acesso
CAN_MANAGE_USERS      // [OWNER, ADMIN]
CAN_ACCESS_ADMIN      // [OWNER, ADMIN]
CAN_EXPORT_REPORTS    // [OWNER, ADMIN, MANAGER]

// Hierarquia de roles
ROLE_HIERARCHY.OWNER   // 5
ROLE_HIERARCHY.VIEWER  // 1
```

## 4. Menus (`menus.ts`)

Estrutura de navegação e menus.

```typescript
import { 
  MAIN_MENU_ITEMS,
  ADMIN_MENU_ITEMS,
  PROTECTED_ROUTES
} from '@/src/constants'

// Menu principal
MAIN_MENU_ITEMS[0]
// {
//   id: 'dashboard',
//   label: 'Dashboard',
//   href: '/dashboard',
//   icon: 'LayoutGrid',
//   requiredPermission: 'dashboard:read'
// }

// Menu de admin
ADMIN_MENU_ITEMS

// Rotas protegidas
PROTECTED_ROUTES  // ['/dashboard', '/clientes', ...]

// Rotas de autenticação
AUTH_ROUTES       // ['/login', '/register']

// Dropdown de usuário
USER_DROPDOWN_ITEMS
```

## 5. Pagamento e Categorias (`payment.ts`)

Tipos de pagamento, categorias, estados, etc.

```typescript
import {
  PAYMENT_METHODS,
  TRANSACTION_CATEGORIES,
  PAYMENT_TERMS,
  CLIENT_TYPES,
  BRAZIL_STATES,
  PRIORITIES
} from '@/src/constants'

// Métodos de pagamento
PAYMENT_METHODS.CREDIT_CARD    // "CREDIT_CARD"
PAYMENT_METHOD_LABELS.CREDIT_CARD // "Cartão de Crédito"

// Categorias de transação
TRANSACTION_CATEGORIES.MATERIALS    // "MATERIALS"
TRANSACTION_CATEGORY_LABELS.MATERIALS // "Materiais"

// Termos de pagamento
PAYMENT_TERMS.NET_30   // "NET_30"
PAYMENT_TERM_LABELS.NET_30 // "30 Dias"

// Tipos de cliente
CLIENT_TYPES.PESSOA_JURIDICA   // "PESSOA_JURIDICA"
CLIENT_TYPE_LABELS.PESSOA_JURIDICA // "Pessoa Jurídica"

// Tipos de fornecedor
SUPPLIER_TYPES.SERVICE // "SERVICE"
SUPPLIER_CATEGORIES.CONSTRUCTION // "CONSTRUCTION"

// Estados do Brasil
BRAZIL_STATES.SP   // "SP"
BRAZIL_STATE_NAMES.SP // "São Paulo"

// Prioridades
PRIORITIES.HIGH    // "HIGH"
PRIORITY_LABELS.HIGH // "Alta"
```

## 6. Configurações Globais (`config.ts`)

Limites, timeouts, padrões, plans, etc.

```typescript
import { 
  LIMITS,
  TIMEOUTS,
  DATE_FORMATS,
  CURRENCY_FORMAT,
  SUBSCRIPTION_PLANS,
  FEATURE_FLAGS
} from '@/src/constants'

// Limites
LIMITS.ITEMS_PER_PAGE        // 10
LIMITS.MAX_FILE_SIZE         // 10485760 (10MB)
LIMITS.MAX_NAME_LENGTH       // 255
LIMITS.MIN_PASSWORD_LENGTH   // 8

// Timeouts (em ms)
TIMEOUTS.DEBOUNCE_SEARCH     // 300
TIMEOUTS.SESSION_TIMEOUT     // 1800000 (30 min)
TIMEOUTS.TOAST_DURATION      // 3000

// Formatos
DATE_FORMATS.SHORT           // "DD/MM/YYYY"
CURRENCY_FORMAT.symbol       // "R$"
NUMBER_FORMAT.decimalSeparator // ","

// Planos de inscrição
SUBSCRIPTION_PLANS.PRO.price     // 99
SUBSCRIPTION_PLANS.PRO.maxUsers  // 5

// Feature flags
FEATURE_FLAGS.ENABLE_QUOTES       // true
FEATURE_FLAGS.ENABLE_INVENTORY    // false
```

## Casos de Uso

### 1. Validar Permissão de Usuário

```typescript
import { ROLE_PERMISSIONS, PERMISSIONS } from '@/src/constants'

function canAccess(userRole: string, action: string): boolean {
  const permissions = ROLE_PERMISSIONS[userRole] || []
  return permissions.includes(action)
}

// Uso
if (canAccess('MANAGER', PERMISSIONS.PROJECT_MANAGE)) {
  // Usuário pode gerenciar projetos
}
```

### 2. Renderizar Status com Cor

```typescript
import { PROJECT_STATUS_COLORS, PROJECT_STATUS_LABELS } from '@/src/constants'

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={PROJECT_STATUS_COLORS[status]}>
      {PROJECT_STATUS_LABELS[status]}
    </span>
  )
}

// Uso
<StatusBadge status="ACTIVE" />
// Renderiza: "Em Andamento" com cores Tailwind
```

### 3. Montar Menu Dinâmico

```typescript
import { MAIN_MENU_ITEMS } from '@/src/constants'
import { usePermissions } from '@/src/hooks'

function Sidebar() {
  const { hasPermission } = usePermissions()

  return (
    <nav>
      {MAIN_MENU_ITEMS
        .filter(item => hasPermission(item.requiredPermission))
        .map(item => (
          <a key={item.id} href={item.href}>
            {item.label}
          </a>
        ))}
    </nav>
  )
}
```

### 4. Validar Input

```typescript
import { LIMITS, VALIDATION } from '@/src/constants'

function validateProjectName(name: string): boolean {
  if (name.length > LIMITS.MAX_NAME_LENGTH) {
    return false
  }
  return true
}

function validateEmail(email: string): boolean {
  return VALIDATION.EMAIL_REGEX.test(email)
}
```

### 5. Usar Timeouts

```typescript
import { TIMEOUTS } from '@/src/constants'

// Debounce de busca
const debouncedSearch = debounce(search, TIMEOUTS.DEBOUNCE_SEARCH)

// Timeout de API
fetch(url, { signal: AbortSignal.timeout(TIMEOUTS.API_TIMEOUT) })

// Toast notification
showToast('Sucesso!', { duration: TIMEOUTS.TOAST_DURATION })
```

## Benefícios

✅ **Centralizado** - Single source of truth
✅ **Type-safe** - TypeScript com autocomplete
✅ **Consistente** - Mesmo padrão em toda app
✅ **Fácil manutenção** - Alterar em um lugar
✅ **Documentado** - Comentários e exemplos
✅ **Reutilizável** - Compartilhado entre componentes

## Checklist de Migração

- [ ] Remover hardcoded values do código
- [ ] Substituir por constantes
- [ ] Testar type checking
- [ ] Verificar autocomplete do IDE
- [ ] Documentar novos valores de constantes

## Próximos Passos

1. **Remover valores hardcoded** de componentes e services
2. **Usar constantes** em toda aplicação
3. **Adicionar novos valores** conforme necessário
4. **Manter este arquivo atualizado**

## Suporte

Para adicionar novas constantes:
1. Identifique a categoria (status, cores, etc)
2. Adicione em `src/constants/{categoria}.ts`
3. Exporte em `src/constants/index.ts`
4. Documente neste arquivo
