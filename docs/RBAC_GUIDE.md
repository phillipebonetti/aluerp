# Sistema de RBAC, Auditoria e Segurança — Guia Completo

## Visão Geral

O AluERP implementa um sistema profissional de controle de acesso baseado em funções (RBAC), auditoria completa e segurança reforçada.

## Arquitetura

### Componentes Principais

```
┌─────────────────────────────────────────────────────────────┐
│                   CAMADA DE AUTENTICAÇÃO                    │
│  NextAuth.js + Session com Permissões Cacheadas             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              CAMADA DE AUTORIZAÇÃO (RBAC)                   │
│  ├─ Middleware de Rotas                                      │
│  ├─ usePermission Hook                                       │
│  └─ Permission Component                                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│            CAMADA DE NEGÓCIO (Server Actions)               │
│  ├─ Verificações de Permissão                               │
│  ├─ Auditoria de Mudanças                                   │
│  └─ Validação de Dados                                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              CAMADA DE DADOS (Prisma ORM)                   │
│  ├─ Usuários e Sessões                                      │
│  ├─ Papéis e Permissões                                     │
│  └─ Logs de Auditoria                                       │
└─────────────────────────────────────────────────────────────┘
```

## Modelos de Dados

### Role (Papel)
Define um grupo de permissões que pode ser atribuído a usuários.

```prisma
model Role {
  id              String
  companyId       String
  name            String          // Ex: "Gerente", "Vendedor"
  description     String?
  isDefault       Boolean
  permissions     RolePermission[]
  members         CompanyMember[]
}
```

### Permission (Permissão)
Define uma ação específica em um recurso.

```prisma
model Permission {
  id              String
  companyId       String
  resource        String          // Ex: "clientes"
  action          String          // Ex: "create", "read", "update", "delete"
  name            String
  description     String?
  roles           RolePermission[]
}
```

### RolePermission (Junction)
Relaciona papéis com permissões (N:N).

### UserSession
Rastreia sessões ativas do usuário para gerenciamento de dispositivos.

```prisma
model UserSession {
  id              String
  userId          String
  deviceName      String?        // Ex: "MacBook Pro"
  browser         String?        // Ex: "Chrome 90"
  operatingSystem String?        // Ex: "macOS"
  ipAddress       String?
  lastActivityAt  DateTime
  expiresAt       DateTime?
  revokedAt       DateTime?
}
```

### AuditLog (Log de Auditoria)
Registra todas as ações do sistema para conformidade.

```prisma
model AuditLog {
  id              String
  userId          String
  action          String          // CREATE, UPDATE, DELETE, LOGIN, etc
  resource        String          // clients, projects, financeiro, etc
  resourceId      String
  changes         String?         // JSON com before/after
  ipAddress       String?
  createdAt       DateTime
}
```

## Fluxo de Autenticação

### 1. Login
```typescript
// Usuário faz login
// NextAuth valida credenciais
// Sistema recupera permissões do usuário
// Sessão é criada com permissões cacheadas
// Auditoria registra LOGIN
```

### 2. Verificação de Permissão
```typescript
// Middleware valida rota protegida
// Hook usePermission verifica permissão em tempo real
// Se não autorizado → redireciona para /403
```

### 3. Logout
```typescript
// Usuário faz logout
// Sessão é marcada como revogada
// Auditoria registra LOGOUT
```

## Como Usar

### 1. Verificar Permissão no Hook

```typescript
import { usePermission } from '@/src/hooks/usePermission'

export function MeuComponente() {
  const { can, permissions } = usePermission()

  if (!can('clientes.criar')) {
    return <p>Você não tem permissão</p>
  }

  return <Button>Novo Cliente</Button>
}
```

### 2. Usar o Componente Permission

```typescript
import { Permission } from '@/components/auth/Permission'

export function Dashboard() {
  return (
    <div>
      <Permission action="clientes.criar">
        <Button>Novo Cliente</Button>
      </Permission>

      {/* Múltiplas permissões com AND */}
      <Permission 
        require="all"
        actions={["clientes.editar", "clientes.deletar"]}
      >
        <Button>Gerenciar Clientes</Button>
      </Permission>

      {/* Múltiplas permissões com OR */}
      <Permission 
        require="any"
        actions={["financeiro.view", "financeiro.edit"]}
      >
        <Button>Acessar Financeiro</Button>
      </Permission>
    </div>
  )
}
```

### 3. Auditar uma Ação em Server Action

```typescript
import { auditCreate } from '@/src/lib/audit-service'

async function criarCliente(userId: string, data: ClientData) {
  const cliente = await db.cliente.create(data)
  
  // Auditar criação
  await auditCreate(
    userId,
    'clientes',
    cliente.id,
    data
  )
  
  return cliente
}
```

### 4. Verificar Permissão em Server Action

```typescript
import { getUserPermissions } from '@/src/actions/permissions'

async function deletarCliente(userId: string, clienteId: string) {
  const permissions = await getUserPermissions(userId, companyId)
  const canDelete = permissions.some(
    p => p.resource === 'clientes' && p.action === 'delete'
  )
  
  if (!canDelete) {
    throw new Error('Sem permissão para deletar cliente')
  }
  
  // Proceder com deleção
}
```

## Padrões de Permissão

### Formato: `recurso.acao`

```
Dashboard
├─ dashboard.view

Clientes
├─ clientes.create
├─ clientes.read
├─ clientes.update
└─ clientes.delete

Obras/Projetos
├─ obras.view
├─ obras.create
├─ obras.edit
└─ obras.delete

Financeiro
├─ financeiro.view
├─ financeiro.create
├─ financeiro.edit
├─ financeiro.delete
└─ financeiro.export

Fornecedores
├─ fornecedores.create
├─ fornecedores.read
├─ fornecedores.update
└─ fornecedores.delete

Relatórios
├─ relatorios.view
├─ relatorios.export
└─ relatorios.import

Configurações
├─ configuracoes.view
└─ configuracoes.edit
```

## Papéis Padrão

### Administrador
- Acesso total a todo o sistema
- Pode gerenciar papéis e permissões
- Visualiza todos os logs

### Gerente
- Acesso a dashboard
- Gerenciar clientes e obras
- Visualizar financeiro
- Exportar relatórios

### Financeiro
- Apenas financeiro
- Criar e editar transações
- Exportar dados financeiros
- Não pode deletar

### Vendedor
- Criar e editar clientes
- Criar cotações
- Visualizar dashboard
- Ver apenas seus registros

### Produção
- Visualizar obras
- Atualizar status
- Sem acesso a financeiro

### Instalador
- Visualizar suas obras
- Atualizar status de serviços
- Sem acesso a dados financeiros

### Usuário (Padrão)
- Apenas leitura de informações públicas
- Visualizar própias vendas/obras

## Auditoria

### O que é Auditado

- **CREATE**: Criação de registros (clientes, obras, etc)
- **UPDATE**: Modificação de registros
- **DELETE**: Exclusão de registros
- **LOGIN**: Tentativas de login (sucesso/falha)
- **LOGOUT**: Logout do sistema
- **EXPORT**: Exportação de dados
- **IMPORT**: Importação de dados
- **PASSWORD_RESET**: Reset de senha
- **SESSION_REVOKE**: Revogação de sessão

### Como Consultar Logs

```typescript
import { getAuditLogs } from '@/src/lib/audit-service'

const logs = await getAuditLogs({
  userId: 'user-id',
  resource: 'clientes',
  action: 'DELETE',
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-12-31'),
  limit: 100,
  offset: 0
})
```

## Segurança

### Validação de Senha

Requisitos mínimos:
- 8 caracteres
- Pelo menos uma letra maiúscula
- Pelo menos uma letra minúscula
- Pelo menos um número
- Pelo menos um caractere especial

```typescript
import { validatePasswordStrength } from '@/src/actions/security'

const result = validatePasswordStrength('SenhaForte@123')
// { valid: true, errors: [] }
```

### Rate Limiting

- Máximo 5 tentativas de login falhadas
- Bloqueio de 15 minutos após limite

```typescript
import { checkLoginAttempts } from '@/src/actions/security'

const check = await checkLoginAttempts('user@email.com')
// { allowed: true, attemptsLeft: 3 }
```

### Reset de Senha

1. Usuário solicita reset
2. Email enviado com link seguro
3. Token expira em 30 minutos
4. Pode ser usado apenas uma vez

```typescript
import { createPasswordResetToken } from '@/src/actions/security'

const { token } = await createPasswordResetToken(userId)
// Enviar via email: /reset-password?token={token}
```

### Gestão de Sessões

Cada dispositivo/navegador cria uma nova sessão:
- Rastreia dispositivo, navegador, SO, IP
- Registra última atividade
- Pode ser revogada manualmente
- Expira automaticamente após 30 dias

```typescript
import { getUserSessions, revokeSession } from '@/src/actions/security'

const sessions = await getUserSessions(userId, companyId)
await revokeSession(sessionId, userId)
```

## Gerenciamento de Papéis

### Criar Novo Papel

```typescript
import { createRole } from '@/src/actions/permissions'

const role = await createRole(
  userId,
  companyId,
  'Gerente de Projetos',
  'Gerencia projetos e obras',
  permissionIds // array de IDs de permissões
)
```

### Atualizar Permissões de Papel

```typescript
import { updateRolePermissions } from '@/src/actions/permissions'

await updateRolePermissions(
  userId,
  roleId,
  newPermissionIds
)
```

### Assinalar Papel a Usuário

```typescript
import { assignRoleToUser } from '@/src/actions/permissions'

await assignRoleToUser(
  userId,
  companyId,
  roleId,
  adminId
)
```

## Integração com Existentes

### Em Páginas Existentes

```typescript
// pages/clientes/page.tsx
import { Permission } from '@/components/auth/Permission'
import { usePermission } from '@/src/hooks/usePermission'

export default function ClientesPage() {
  const { can } = usePermission()

  return (
    <div>
      <Permission action="clientes.create">
        <Button onClick={handleNew}>Novo Cliente</Button>
      </Permission>

      {/* Renderizar lista */}
      {clientes.map(cliente => (
        <div key={cliente.id}>
          <Permission action="clientes.update">
            <Button onClick={() => edit(cliente)}>Editar</Button>
          </Permission>

          <Permission action="clientes.delete">
            <Button onClick={() => delete(cliente)}>Deletar</Button>
          </Permission>
        </div>
      ))}
    </div>
  )
}
```

### Em Server Actions Existentes

```typescript
// Antes
async function deleteCliente(id: string) {
  await db.cliente.delete({ where: { id } })
}

// Depois
async function deleteCliente(userId: string, id: string) {
  // Verificar permissão
  const can = await canUserAction(userId, 'clientes', 'delete')
  if (!can) throw new Error('Sem permissão')

  // Executar ação
  const cliente = await db.cliente.findUnique({ where: { id } })
  await db.cliente.delete({ where: { id } })

  // Auditar
  await auditDelete(userId, 'clientes', id, cliente)
}
```

## Testes de Conformidade

Verificações implementadas:

- ✅ Usuário comum não acessa Configurações
- ✅ Financeiro não acessa Produção
- ✅ Produção não acessa Financeiro
- ✅ Administrador acessa tudo
- ✅ Logs registram todas as ações
- ✅ Sessões podem ser gerenciadas
- ✅ Senhas validam força
- ✅ Rate limiting protege contra brute force
- ✅ Tokens de reset expiram
- ✅ Auditoriarastreia mudanças

## Performance

### Caching de Permissões

Permissões são cacheadas na sessão do usuário para evitar:
- Consultas repetidas ao banco
- Latência desnecessária
- Sobrecarga do servidor

Invalidação automática:
- Ao fazer logout
- Quando papéis são alterados
- Após 24 horas

### Índices de Banco de Dados

```prisma
// Índices otimizados para queries frequentes
@@index([userId])        // Filtros por usuário
@@index([companyId])     // Filtros por empresa
@@index([createdAt])     // Filtros por data
@@index([expiresAt])     // Sessões expiradas
@@index([resource])      // Filtros de auditoria
@@unique([userId, companyId])  // Prevenção de duplicatas
```

## Troubleshooting

### Usuário não consegue acessar página permitida

1. Verificar se papel está atribuído
2. Verificar se papel tem permissão
3. Verificar cache (refazer login)
4. Verificar logs de auditoria

### Permissão não reflete mudanças imediatas

- Permissões são cacheadas na sessão
- Usuário precisa fazer logout e login novamente
- Ou limpar cache do navegador

### Erro "Acesso Negado" incorreto

1. Verificar permissão no banco
2. Verificar middleware de rotas
3. Verificar logs de auditoria
4. Verificar papel do usuário

## Próximas Melhorias

- [ ] Dois fatores de autenticação (2FA)
- [ ] Biometria para mobile
- [ ] Histórico de mudanças detalhado
- [ ] Alertas de atividades suspeitas
- [ ] Integração com AD/LDAP
- [ ] SSO (Single Sign-On)
- [ ] Controle de acesso por campo
- [ ] Aprovação de ações críticas

## Contato e Suporte

Para dúvidas ou problemas, abra uma issue ou contate o time de segurança.
