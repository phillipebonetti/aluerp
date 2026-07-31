# Guia de Uso dos Contexts - AluERP

## Visão Geral

O AluERP possui dois contexts globais que gerenciam estado crítico da aplicação:

1. **AuthContext** - Autenticação, sessão e permissões do usuário
2. **EmpresaContext** - Dados e configurações da empresa ativa

## AuthContext

### Responsabilidades

- Controlar autenticação do usuário
- Gerenciar sessão (login/logout)
- Armazenar dados do usuário
- Verificar permissões
- Atualizar sessão expirada

### Interface

```typescript
interface AuthContextType {
  user: AuthUser | null                    // Usuário autenticado
  isAuthenticated: boolean                 // Se está autenticado
  isLoading: boolean                       // Carregando
  error: string | null                     // Mensagem de erro
  login: (email, password) => Promise      // Fazer login
  logout: () => Promise                    // Fazer logout
  refreshSession: () => Promise            // Atualizar sessão
}
```

### Como Usar

#### 1. Envolver aplicação com provider

```typescript
// app/layout.tsx ou app/(app)/layout.tsx
import { AuthProvider } from '@/src/contexts'

export default function RootLayout({ children }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}
```

#### 2. Usar hook useAuth em componentes

```typescript
'use client'

import { useAuth } from '@/src/contexts'

export function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth()

  if (!isAuthenticated) {
    return <p>Não autenticado</p>
  }

  return (
    <div>
      <h1>Olá, {user?.name}</h1>
      <button onClick={() => logout()}>Logout</button>
    </div>
  )
}
```

### Exemplos Práticos

#### Login

```typescript
const { login, isLoading, error } = useAuth()

async function handleLogin(email: string, password: string) {
  try {
    await login(email, password)
    // Sucesso - será redirecionado automaticamente
  } catch (err) {
    console.error('Erro ao fazer login:', err)
  }
}

return (
  <form onSubmit={(e) => {
    e.preventDefault()
    handleLogin(formData.email, formData.password)
  }}>
    <input type="email" placeholder="Email" />
    <input type="password" placeholder="Senha" />
    <button disabled={isLoading}>
      {isLoading ? 'Carregando...' : 'Entrar'}
    </button>
    {error && <p className="text-red-500">{error}</p>}
  </form>
)
```

#### Verificar Permissões

```typescript
import { usePermission } from '@/src/contexts'

export function DeleteButton() {
  const canDelete = usePermission('DELETE_CLIENT')
  
  if (!canDelete) {
    return null // Botão não renderiza
  }

  return <button>Deletar</button>
}
```

#### Verificar Papel (Role)

```typescript
import { useRole } from '@/src/contexts'

export function AdminPanel() {
  const isAdmin = useRole('ADMIN')
  
  if (!isAdmin) {
    return <p>Acesso negado</p>
  }

  return <div>Painel de Administração</div>
}
```

#### Atualizar Sessão

```typescript
const { refreshSession } = useAuth()

// Chamar periodicamente ou quando expirar
useEffect(() => {
  const interval = setInterval(() => {
    refreshSession()
  }, 5 * 60 * 1000) // A cada 5 minutos

  return () => clearInterval(interval)
}, [refreshSession])
```

## EmpresaContext

### Responsabilidades

- Armazenar dados da empresa ativa
- Gerenciar filtros globais
- Carregar permissões da empresa
- Trocar entre empresas

### Interface

```typescript
interface EmpresaContextType {
  company: CompanyData | null              // Dados da empresa
  filters: GlobalFilters                   // Filtros globais
  permissions: CompanyPermission[]         // Permissões da empresa
  isLoading: boolean                       // Carregando
  error: string | null                     // Mensagem de erro
  setActiveCompany: (id) => Promise        // Mudar empresa ativa
  updateFilters: (filters) => void         // Atualizar filtros
  resetFilters: () => void                 // Limpar filtros
  loadCompanyData: () => Promise           // Carregar dados
  loadPermissions: () => Promise           // Carregar permissões
  refreshCompanyData: () => Promise        // Atualizar dados
  hasPermission: (code) => boolean         // Verificar permissão
}
```

### Como Usar

#### 1. Envolver com provider

```typescript
// app/(app)/layout.tsx - após autenticar
import { EmpresaProvider, useAuth } from '@/src/contexts'

export default function AppLayout({ children }) {
  const { user } = useAuth()

  return (
    <EmpresaProvider companyId={user?.companyId}>
      {children}
    </EmpresaProvider>
  )
}
```

#### 2. Usar hook useEmpresa

```typescript
'use client'

import { useEmpresa } from '@/src/contexts'

export function CompanyInfo() {
  const { company, isLoading } = useEmpresa()

  if (isLoading) return <p>Carregando...</p>

  return (
    <div>
      <h1>{company?.name}</h1>
      <p>CNPJ: {company?.cnpj}</p>
    </div>
  )
}
```

### Exemplos Práticos

#### Usar Filtros Globais

```typescript
import { useGlobalFilters } from '@/src/contexts'

export function ClientsList() {
  const { filters, updateFilters } = useGlobalFilters()

  // Atualizar filtros
  const handleSearch = (term: string) => {
    updateFilters({ searchTerm: term, page: 1 })
  }

  const handleStatusChange = (status: string) => {
    updateFilters({ status, page: 1 })
  }

  // Usar filtros para buscar dados
  useEffect(() => {
    listar(filters) // Passa filters para a action
  }, [filters])

  return (
    <div>
      <input 
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Buscar..."
      />
      <select onChange={(e) => handleStatusChange(e.target.value)}>
        <option value="">Todos</option>
        <option value="ACTIVE">Ativos</option>
        <option value="INACTIVE">Inativos</option>
      </select>
    </div>
  )
}
```

#### Trocar Empresa

```typescript
import { useEmpresa } from '@/src/contexts'

export function CompanySelector() {
  const { setActiveCompany, company } = useEmpresa()

  return (
    <select 
      value={company?.id || ''}
      onChange={(e) => setActiveCompany(e.target.value)}
    >
      <option>Selecione uma empresa</option>
      {/* Empresas do usuário */}
    </select>
  )
}
```

#### Verificar Permissões da Empresa

```typescript
import { useCompanyPermissions } from '@/src/contexts'

export function FeatureToggle() {
  const { hasPermission } = useCompanyPermissions()

  return (
    <div>
      {hasPermission('MANAGE_BUDGETS') && (
        <button>Gerenciar Orçamentos</button>
      )}
      
      {hasPermission('VIEW_REPORTS') && (
        <button>Ver Relatórios</button>
      )}
    </div>
  )
}
```

#### Acessar Dados da Empresa

```typescript
import { useCompanyData } from '@/src/contexts'

export function CompanyStats() {
  const { company, isLoading, refresh } = useCompanyData()

  if (isLoading) return <p>Carregando...</p>

  return (
    <div>
      <h2>{company?.name}</h2>
      <p>Plano: {company?.plan}</p>
      <p>Status: {company?.status}</p>
      <button onClick={() => refresh()}>Atualizar</button>
    </div>
  )
}
```

## Padrão de Implementação Recomendado

### Estrutura de Layout

```typescript
// app/layout.tsx (Root)
<AuthProvider>
  {children}
</AuthProvider>

// app/(app)/layout.tsx (Autenticado)
<EmpresaProvider companyId={user?.companyId}>
  {children}
</EmpresaProvider>
```

### Componente com Autenticação e Empresa

```typescript
'use client'

import { useAuth, useEmpresa, useGlobalFilters } from '@/src/contexts'

export function MyPage() {
  const { user, isAuthenticated } = useAuth()
  const { company } = useEmpresa()
  const { filters, updateFilters } = useGlobalFilters()

  if (!isAuthenticated) {
    return <p>Faça login para continuar</p>
  }

  return (
    <div>
      <h1>{company?.name}</h1>
      <p>Usuário: {user?.name}</p>
      
      {/* Sua lógica aqui */}
    </div>
  )
}
```

## Boas Práticas

### 1. Memoize valores do context

```typescript
const value = useMemo(() => ({
  user,
  isAuthenticated,
  // ...
}), [user, isAuthenticated, ...])

return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
```

### 2. Tenha um "loading state" adequado

```typescript
if (isLoading) {
  return <LoadingSpinner />
}

if (error) {
  return <ErrorMessage error={error} />
}

return <Content />
```

### 3. Sempre verifique autenticação antes de acessar dados

```typescript
const { isAuthenticated, user } = useAuth()
const { company } = useEmpresa()

if (!isAuthenticated || !user) {
  return <Redirect to="/login" />
}
```

### 4. Limpar estados ao desmontar componentes

```typescript
useEffect(() => {
  return () => {
    // Limpar se necessário
    resetFilters()
  }
}, [resetFilters])
```

## Fluxo de Autenticação

```
1. Usuário acessa /login
2. Preenche email/senha
3. AuthContext.login() é chamado
4. Requisição POST /api/auth/login
5. Servidor autentica e retorna user
6. AuthContext armazena user
7. Componente renderiza dados
8. Redirect para /app/dashboard
9. EmpresaProvider carrega com user.companyId
10. Aplicação está pronta
```

## Troubleshooting

### Erro: "useAuth deve ser usado dentro de AuthProvider"

**Causa**: Hook sendo usado fora do provider

**Solução**: Envolver componente com `<AuthProvider>`

```typescript
// ❌ Errado
function App() {
  const { user } = useAuth()
  return <>{user}</>
}

// ✅ Correto
function App() {
  return (
    <AuthProvider>
      <Content />
    </AuthProvider>
  )
}

function Content() {
  const { user } = useAuth()
  return <>{user}</>
}
```

### Sessão expirando

**Solução**: Chamar `refreshSession()` periodicamente

```typescript
useEffect(() => {
  const interval = setInterval(refreshSession, 4 * 60 * 1000)
  return () => clearInterval(interval)
}, [refreshSession])
```

### Filtros não atualizando lista

**Causa**: useEffect não está monitorando filtros

**Solução**: Adicionar filtros ao dependency array

```typescript
useEffect(() => {
  listar(filters)
}, [filters, listar])
```

## API Endpoints Necessários

Os contexts esperam os seguintes endpoints:

- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/session` - Verificar sessão
- `POST /api/auth/refresh` - Atualizar sessão
- `GET /api/companies/:id` - Dados da empresa
- `GET /api/companies/:id/permissions` - Permissões

## Próximos Passos

1. Implementar os endpoints de API
2. Integrar contexts nos layouts
3. Adicionar proteção de rotas
4. Implementar logout automático
5. Adicionar notificações de erro
