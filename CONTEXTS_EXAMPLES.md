# Exemplos Práticos - Contexts AluERP

## Exemplo 1: Login Component

```typescript
'use client'

import { useState } from 'react'
import { useAuth } from '@/src/contexts'
import { redirect } from 'next/navigation'

export function LoginComponent() {
  const { login, isLoading, error, isAuthenticated } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  if (isAuthenticated) {
    redirect('/app/dashboard')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(email, password)
      // Redirect automático via middleware
    } catch (err) {
      console.error('Login falhou:', err)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
      <div>
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <label>Senha</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  )
}
```

## Exemplo 2: Protected Route Component

```typescript
'use client'

import { useAuth } from '@/src/contexts'
import { redirect } from 'next/navigation'

export function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Carregando...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    redirect('/login')
  }

  return (
    <div>
      <header className="bg-blue-600 text-white p-4">
        <div className="flex justify-between items-center">
          <h1>AluERP</h1>
          <div>
            <p>Bem-vindo, {user?.name}</p>
            <p className="text-sm">{user?.email}</p>
          </div>
        </div>
      </header>
      <main>
        {children}
      </main>
    </div>
  )
}
```

## Exemplo 3: Clients List with Global Filters

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useGlobalFilters } from '@/src/contexts'
import { useClientes } from '@/src/hooks'

export function ClientsList() {
  const { filters, updateFilters, resetFilters } = useGlobalFilters()
  const { clientes, listar, isLoading } = useClientes()

  useEffect(() => {
    listar(filters)
  }, [filters])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFilters({ searchTerm: e.target.value, page: 1 })
  }

  const handleStatusFilter = (status: string) => {
    updateFilters({ status: status || undefined, page: 1 })
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex gap-4 items-end">
        <div>
          <label>Buscar</label>
          <input
            type="text"
            placeholder="Nome ou email..."
            onChange={handleSearch}
            className="w-64"
          />
        </div>

        <div>
          <label>Status</label>
          <select onChange={(e) => handleStatusFilter(e.target.value)}>
            <option value="">Todos</option>
            <option value="ACTIVE">Ativos</option>
            <option value="INACTIVE">Inativos</option>
          </select>
        </div>

        <button
          onClick={resetFilters}
          className="px-4 py-2 bg-gray-200"
        >
          Limpar Filtros
        </button>
      </div>

      {isLoading ? (
        <p>Carregando...</p>
      ) : (
        <table className="w-full">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Telefone</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((cliente) => (
              <tr key={cliente.id}>
                <td>{cliente.name}</td>
                <td>{cliente.email}</td>
                <td>{cliente.phone}</td>
                <td>{cliente.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
```

## Exemplo 4: Permission-Based Feature Toggle

```typescript
'use client'

import { usePermission, useRole } from '@/src/contexts'
import { useCompanyPermissions } from '@/src/contexts'

export function FeaturePanel() {
  // Usando hooks simples
  const canDeleteClient = usePermission('DELETE_CLIENT')
  const isAdmin = useRole('ADMIN')

  // Ou usando o hook completo
  const { hasPermission } = useCompanyPermissions()
  const canManageBudgets = hasPermission('MANAGE_BUDGETS')

  return (
    <div className="p-6 space-y-4">
      <h2>Recursos Disponíveis</h2>

      {canDeleteClient && (
        <button className="block w-full text-left p-2 bg-red-100">
          Deletar Clientes
        </button>
      )}

      {isAdmin && (
        <button className="block w-full text-left p-2 bg-purple-100">
          Painel de Administração
        </button>
      )}

      {canManageBudgets && (
        <button className="block w-full text-left p-2 bg-green-100">
          Gerenciar Orçamentos
        </button>
      )}

      {!canDeleteClient && !isAdmin && !canManageBudgets && (
        <p className="text-gray-500">
          Você não tem acesso a nenhum recurso
        </p>
      )}
    </div>
  )
}
```

## Exemplo 5: Company Selector with Context

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/src/contexts'
import { useEmpresa } from '@/src/contexts'

interface UserCompany {
  id: string
  name: string
}

export function CompanySelector() {
  const { user } = useAuth()
  const { company, setActiveCompany } = useEmpresa()
  const [companies, setCompanies] = useState<UserCompany[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch('/api/users/me/companies')
        const data = await response.json()
        setCompanies(data.companies)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCompanies()
  }, [])

  const handleChange = async (companyId: string) => {
    try {
      await setActiveCompany(companyId)
    } catch (err) {
      console.error('Erro ao trocar empresa:', err)
    }
  }

  if (isLoading) {
    return <p>Carregando empresas...</p>
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">
        Empresa Ativa
      </label>
      <select
        value={company?.id || ''}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full"
      >
        <option value="">Selecione uma empresa</option>
        {companies.map((comp) => (
          <option key={comp.id} value={comp.id}>
            {comp.name}
          </option>
        ))}
      </select>
    </div>
  )
}
```

## Exemplo 6: Dashboard com Todos os Contexts

```typescript
'use client'

import { useAuth, useEmpresa, useGlobalFilters } from '@/src/contexts'
import { useFinanceiro } from '@/src/hooks'
import { useEffect } from 'react'

export function Dashboard() {
  const { user } = useAuth()
  const { company, hasPermission } = useEmpresa()
  const { filters } = useGlobalFilters()
  const { metrics, obterMetricas, isLoading } = useFinanceiro()

  useEffect(() => {
    if (hasPermission('VIEW_FINANCIAL')) {
      obterMetricas()
    }
  }, [])

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{company?.name}</h1>
          <p className="text-gray-600">Bem-vindo, {user?.name}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Plano: {company?.plan}</p>
          <p className="text-sm text-gray-600">Status: {company?.status}</p>
        </div>
      </div>

      {hasPermission('VIEW_FINANCIAL') && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded">
            <p className="text-sm text-gray-600">Receita</p>
            <p className="text-2xl font-bold">
              {isLoading ? '...' : `R$ ${metrics?.totalIncome || 0}`}
            </p>
          </div>

          <div className="bg-red-50 p-4 rounded">
            <p className="text-sm text-gray-600">Despesa</p>
            <p className="text-2xl font-bold">
              {isLoading ? '...' : `R$ ${metrics?.totalExpense || 0}`}
            </p>
          </div>

          <div className="bg-green-50 p-4 rounded">
            <p className="text-sm text-gray-600">Resultado</p>
            <p className="text-2xl font-bold">
              {isLoading
                ? '...'
                : `R$ ${(metrics?.totalIncome || 0) - (metrics?.totalExpense || 0)}`}
            </p>
          </div>
        </div>
      )}

      <div className="bg-white p-4 rounded border">
        <p className="text-sm text-gray-600">Filtros Globais Ativos</p>
        <pre className="text-xs mt-2 p-2 bg-gray-100 rounded">
          {JSON.stringify(filters, null, 2)}
        </pre>
      </div>
    </div>
  )
}
```

## Exemplo 7: Logout Button

```typescript
'use client'

import { useAuth } from '@/src/contexts'
import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const { logout, isLoading } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/login')
    } catch (err) {
      console.error('Erro ao fazer logout:', err)
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
    >
      {isLoading ? 'Saindo...' : 'Sair'}
    </button>
  )
}
```

## Exemplo 8: Layout Completo com Todos os Providers

```typescript
// app/(auth)/layout.tsx
import { AuthProvider, EmpresaProvider } from '@/src/contexts'
import { getSession } from '@/src/lib/auth'

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Verificar sessão no servidor
  const session = await getSession()

  return (
    <AuthProvider>
      {session?.user ? (
        <EmpresaProvider companyId={session.user.companyId}>
          {children}
        </EmpresaProvider>
      ) : (
        children
      )}
    </AuthProvider>
  )
}
```

## Dicas de Performance

### Evitar re-renders desnecessários

```typescript
// ❌ Ruim - atualiza a cada render
const { company } = useEmpresa()

// ✅ Bom - memoizar se necessário
import { useMemo } from 'react'

function MyComponent() {
  const { company } = useEmpresa()
  const memoizedCompany = useMemo(() => company, [company])
  return <div>{memoizedCompany?.name}</div>
}
```

### Usar hooks especializados

```typescript
// ❌ Importa tudo
const empresa = useEmpresa()

// ✅ Importa apenas o necessário
const { filters, updateFilters } = useGlobalFilters()
const { permissions, hasPermission } = useCompanyPermissions()
const { company } = useCompanyData()
```

## Checklist de Implementação

- [ ] Envolver app com `<AuthProvider>`
- [ ] Envolver seções autenticadas com `<EmpresaProvider>`
- [ ] Criar página de login usando `useAuth()`
- [ ] Proteger rotas com verificação de autenticação
- [ ] Usar `usePermission()` para features condicionais
- [ ] Implementar `refreshSession()` periodicamente
- [ ] Conectar filtros globais a componentes de lista
- [ ] Testar logout e limpeza de sessão
- [ ] Verificar comportamento multi-empresa
- [ ] Testar re-autenticação expirada
