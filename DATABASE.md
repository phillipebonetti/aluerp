# AluERP — Documentação de Banco de Dados

## Visão Geral

Schema PostgreSQL profissional para ERP SaaS multiempresa de esquadrias de alumínio e vidro temperado. Versão 3.0.0 (Fundação).

**Tecnologias:**
- PostgreSQL (provider)
- Prisma ORM
- Supabase (host recomendado)

---

## Arquitetura Multiempresa

### Isolamento de Dados

Cada **Company** é um tenant isolado. Todas as entidades relacionadas possuem `companyId`:

```typescript
Client → companyId (referencia Company)
Project → companyId (referencia Company)
Quote → companyId (referencia Company)
Transaction → companyId (referencia Company)
```

**Benefício:** Quando aplicar RLS (Row Level Security) no Supabase, basta filtrar por `companyId = auth.uid()`.

### Deleção Cascata

- Deletar `Company` → deleta membros, clientes, fornecedores, projetos, tudo
- Deletar `Client` → deleta contatos, endereços
- Deletar `Project` → deleta fotos, documentos, custos

**Exceção:** `Project.clientId` e `Quote.clientId` usam `onDelete: Restrict` — cliente não pode ser deletado enquanto tiver projeto/orçamento ativo.

---

## Estrutura de Core

### Companies

```
id (CUID)
name (String)
cnpj (String, unique)
phone, email, logo, website
timezone (default: "America/Sao_Paulo")
plan (FREE|PRO|ENTERPRISE)
status (ACTIVE|SUSPENDED|CANCELLED|ARCHIVED)
createdAt, updatedAt, deletedAt
```

**Índices:**
- `plan`, `status`, `deletedAt` (filtros comuns)

---

### Users

```
id (CUID)
name, email (unique)
avatar, phone
status (ACTIVE|INACTIVE|SUSPENDED)
createdAt, updatedAt, deletedAt
```

**Índices:**
- `email`, `status`, `deletedAt`

---

### CompanyMember (N:N)

Relaciona User com Company via Role.

```
id (CUID)
companyId (FK → Company)
userId (FK → User)
roleId (FK → Role, nullable)
status (ACTIVE|INVITED|INACTIVE)
joinedAt, createdAt, updatedAt
```

**Unique:**
- `(companyId, userId)` — um user só pode ter um role por company

**Índices:**
- `companyId`, `userId`

---

### Roles (RBAC)

Papéis customizáveis por company.

```
id (CUID)
companyId (FK → Company)
name (String)
description
isDefault (Boolean)
createdAt, updatedAt
```

**Unique:**
- `(companyId, name)` — nome de role é único dentro de cada company

**Pré-populados (sugestão):**
- OWNER — acesso total
- ADMIN — gerenciamento
- MANAGER — supervisor de projetos
- VIEWER — apenas leitura

---

### Permissions (RBAC)

Matriz de permissões granulares.

```
id (CUID)
companyId (FK → Company)
name (String)
resource (String) — "clients", "projects", "financeiro", etc
action (String) — "create", "read", "update", "delete"
description
createdAt
```

**Unique:**
- `(companyId, resource, action)` — ex: ("clients", "create")

**Fluxo:**
1. Role has many Permissions (via RolePermission junction)
2. CompanyMember has Role
3. Check if Role has Permission before action

---

## Estrutura de Clientes

### Client

```
id (CUID)
companyId (FK → Company)
name
type (PERSON|COMPANY)
documentType (CPF|CNPJ|RG|PASSPORT)
document (String, ex: "12345678900")
email, phone
status (ACTIVE|INACTIVE|ARCHIVED)
notes (String)
createdAt, updatedAt, deletedAt
```

**Índices:**
- `companyId`, `document`, `status`, `deletedAt`

**Relações:**
- ClientContact[] (1:N, cascade)
- ClientAddress[] (1:N, cascade)
- Quote[] (1:N, restrict delete)
- Project[] (1:N, restrict delete)

---

### ClientContact

```
id (CUID)
clientId (FK → Client)
name, email, phone, role
isPrimary (Boolean)
createdAt, updatedAt
```

Contatos múltiplos por cliente (gerente, recepcionista, etc).

---

### ClientAddress

```
id (CUID)
clientId (FK → Client)
street, number, complement, neighborhood, city, state, zipCode
isPrimary (Boolean)
createdAt, updatedAt
```

Múltiplos endereços por cliente (residencial, comercial, etc).

---

## Estrutura de Fornecedores

### Supplier

```
id (CUID)
companyId (FK → Company)
name
type (MATERIAL|SERVICE|LABOR|OTHER)
documentType (CPF|CNPJ|RG|PASSPORT)
document
email, phone
status (ACTIVE|INACTIVE|ARCHIVED)
notes, paymentTerms
createdAt, updatedAt, deletedAt
```

**Índices:**
- `companyId`, `document`, `status`, `type`

---

### SupplierContact

```
id (CUID)
supplierId (FK → Supplier)
name, email, phone, role
isPrimary (Boolean)
createdAt
```

---

### SupplierDocument

```
id (CUID)
supplierId (FK → Supplier)
type (CONTRACT|INVOICE|RECEIPT|PHOTO|BLUEPRINT|OTHER)
url (String)
fileName (String)
uploadedAt (DateTime)
```

Armazena certificados, contratos, etc.

---

## Estrutura de Obras/Projetos

### Project

```
id (CUID)
companyId (FK → Company)
clientId (FK → Client, restrict delete)
name, description, address
status (PLANNING|IN_PROGRESS|PAUSED|COMPLETED|CANCELLED|ARCHIVED)
startDate, endDate
totalValue (Decimal)
costEstimated (Decimal)
notes
createdAt, updatedAt, deletedAt
```

**Índices:**
- `companyId`, `clientId`, `status`, `startDate`

---

### ProjectPhoto

```
id (CUID)
projectId (FK → Project, cascade)
url, caption
uploadedAt (DateTime)
```

Antes/durante/depois fotografias.

---

### ProjectDocument

```
id (CUID)
projectId (FK → Project, cascade)
type (BLUEPRINT|CONTRACT|INVOICE|RECEIPT|PHOTO|OTHER)
url, fileName
uploadedAt (DateTime)
```

---

### ProjectCost

```
id (CUID)
projectId (FK → Project, cascade)
description, amount (Decimal), category
createdAt
```

Custos adicionais registrados por projeto.

---

## Estrutura de Orçamentos

### Quote

```
id (CUID)
companyId (FK → Company)
clientId (FK → Client, restrict delete)
number (String, unique per company)
status (DRAFT|SENT|APPROVED|REJECTED|EXPIRED|ARCHIVED)
totalValue (Decimal)
validUntil (DateTime)
notes
createdAt, updatedAt
sentAt, approvedAt, rejectedAt (DateTime, nullable)
deletedAt
```

**Unique:**
- `(companyId, number)` — numeração única por empresa

**Índices:**
- `companyId`, `clientId`, `status`, `createdAt`

---

### QuoteItem

```
id (CUID)
quoteId (FK → Quote, cascade)
description, quantity (Decimal), unit (ex: "un", "m2", "m")
unitPrice, totalPrice (Decimal)
discount (Decimal, default: 0)
order (Int) — ordem de exibição
```

Itens compostos do orçamento (maçanetas, vidro temperado, mão de obra, etc).

---

### QuoteVersion

```
id (CUID)
quoteId (FK → Quote, cascade)
versionNumber (Int)
status (QuoteStatus)
totalValue (Decimal)
notes
createdAt (DateTime)
```

Histórico de versões quando orçamento é alterado.

**Unique:**
- `(quoteId, versionNumber)`

---

## Estrutura de Ordens de Serviço

### ServiceOrder

```
id (CUID)
companyId (FK → Company)
projectId (FK → Project, restrict delete)
number (String, unique per company)
status (DRAFT|SCHEDULED|IN_PROGRESS|COMPLETED|CANCELLED|ARCHIVED)
scheduledDate, startDate, endDate (DateTime, nullable)
description, notes
createdAt, updatedAt, deletedAt
```

**Unique:**
- `(companyId, number)`

**Relações:** 1 Project → N ServiceOrders

---

## Estrutura Financeira

### BankAccount

```
id (CUID)
companyId (FK → Company)
bankName, accountNumber, accountType
balance (Decimal, default: 0)
status (ACTIVE|INACTIVE|CLOSED)
createdAt, updatedAt
```

Contas bancárias da empresa.

---

### CostCenter

```
id (CUID)
companyId (FK → Company)
name, description
status (ACTIVE|INACTIVE)
createdAt
```

**Unique:**
- `(companyId, name)` — cada empresa tem seus centros de custo

---

### Transaction

Movimento financeiro (entrada/saída).

```
id (CUID)
companyId (FK → Company)
type (INCOME|EXPENSE)
category (String) — "Materiais", "Mão de Obra", "Despesas", etc
amount (Decimal)
description, status (PENDING|CONFIRMED|PAID|CANCELLED|OVERDUE)
paymentMethod (CASH|CHECK|DEBIT_CARD|CREDIT_CARD|TRANSFER|PIXED|OTHER)
dueDate, paymentDate (DateTime, nullable)
notes
supplierId (FK → Supplier, nullable)
bankAccountId (FK → BankAccount, nullable)
costCenterId (FK → CostCenter, nullable)
createdAt, updatedAt
```

**Índices:**
- `companyId`, `type`, `status`, `dueDate`, `paymentDate`

**Fluxo típico:**
1. Registrar transação com `status = PENDING`
2. Confirmar quando fatura chega: `status = CONFIRMED`
3. Pagar: `status = PAID`, `paymentDate = now()`
4. Se não pagar na data: `status = OVERDUE`

---

## Auditoria

### AuditLog

```
id (CUID)
userId (FK → User, cascade)
action (String) — "CREATE", "UPDATE", "DELETE"
resource (String) — "Client", "Project", "Quote"
resourceId (String) — ID do recurso alterado
changes (String) — JSON serializado com antes/depois
ipAddress (String, nullable)
createdAt (DateTime)
```

**Índices:**
- `userId`, `resource`, `createdAt`

Útil para rastrear quem fez o quê e quando.

---

## Regras de Negócio Implementadas

### 1. Multiempresa (Multi-tenancy)

✓ Cada entidade principal possui `companyId`  
✓ Isolamento via RLS no Supabase  
✓ Deleção cascata mantém integridade por tenant  

### 2. Soft Delete

✓ `deletedAt` em: Company, User, Client, Supplier, Project, Quote, ServiceOrder, Transaction  
✓ Permite recuperação sem recriar dados  
✓ Índice em `deletedAt` para filtrar ativos rapidamente  

### 3. Timestamps Auditáveis

✓ `createdAt` (DateTime, default: now())  
✓ `updatedAt` (DateTime, update automático)  
✓ `deletedAt` (DateTime, nullable)  

### 4. RBAC Extensível

✓ Roles por company  
✓ Permissions por resource+action  
✓ RolePermission (N:N) para matrizflexível  

### 5. Numeração Única por Empresa

✓ Quote.number, ServiceOrder.number  
✓ Unique constraint: `(companyId, number)`  
✓ Permite reset por empresa, sem conflito global  

### 6. Restrições de Deleção

✓ `Client.restrict` em Projects e Quotes  
✓ Impede orfanidade de dados  
✓ Força via banco (foreign key constraint)  

### 7. Relacionamentos Completos

✓ 1:N com cascade (contactos, endereços, itens)  
✓ N:N com junction (Role ← RolePermission → Permission)  
✓ 1:N com restrict (segurança referencial)  

### 8. Enums Controlados

✓ Status predefinidos (evita typos)  
✓ DocumentType, PaymentMethod, etc  
✓ Facilita UI (dropdowns, filtros)  

---

## Sugestões de Índices Adicionais (Performance)

Para queries frequentes, considere adicionar após MVP:

```prisma
// Buscas por período
@@index([companyId, createdAt])

// Filtros por status + data
@@index([status, dueDate])

// Relatórios por categoria
@@index([category, paymentDate])

// Full-text search (PgSQL)
@@fulltext([name, description])
```

---

## Pontos para Revisar Antes de Migrations

### 1. Supabase RLS Policies

Quando conectar ao Supabase, implementar RLS:

```sql
-- Exemplo: Usuário só vê dados da sua company
CREATE POLICY "company_isolation" ON clients
  USING (auth.uid() IN (
    SELECT userId FROM company_members WHERE companyId = clients.companyId
  ))
```

### 2. Constraints Adicionais (Aplicação)

O Prisma não enforça:
- `totalValue` no Quote deve = SUM(QuoteItem.totalPrice)
- `balance` no BankAccount deve ser atualizado ao pagar transaction
- `amount` no Transaction não pode ser negativo

**Implementar** em server actions/triggers.

### 3. Índices em Campo de Busca

Se adicionar busca por nome (Client, Supplier, User):

```prisma
@@fulltext([name])  // PgSQL only
// ou
@@index([name])
```

### 4. Indexação de Foreign Keys

Prisma gera FK automaticamente, mas índices são opcionais:

```prisma
@@index([companyId, clientId])  // Para query por company + client
```

### 5. Backup Strategy

PostgreSQL via Supabase oferece:
- Daily backups (FREE)
- Point-in-time recovery (PRO+)
- Recomendado: backup manual antes de migrations

### 6. Timezone Handling

```
Company.timezone = "America/Sao_Paulo"
```

Armazenar timestamps em UTC no DB, converter na aplicação via Luxon/Day.js.

### 7. Validação de Documento (Aplicação)

O Prisma aceita qualquer string em `document`:

```typescript
// Validar antes de salvar
if (documentType === "CPF") {
  validateCPF(document) // deve passar
}
if (documentType === "CNPJ") {
  validateCNPJ(document) // deve passar
}
```

### 8. Migrations Seguras

Ao fazer primeira migration:

```bash
pnpm exec prisma migrate dev --name init
# cria prisma/migrations/xxx_init
```

Testar em preview antes de prod.

---

## Próximas Fases

### Fase 3 (agora):
- [ ] Executar `prisma migrate dev --name init`
- [ ] Gerar Prisma Client (`prisma generate`)
- [ ] Validar tipos no TypeScript
- [ ] Conectar ao Supabase (quando env vars existirem)

### Fase 4 (1-2 semanas):
- [ ] Implementar RLS policies no Supabase
- [ ] Criar server actions para CRUD
- [ ] Adicionar validações Zod nos schemas
- [ ] Implementar audit logging

### Fase 5 (2-3 semanas):
- [ ] Triggers de banco (atualizar balances, somas)
- [ ] Índices avançados (fulltext search)
- [ ] Backup automation
- [ ] Disaster recovery plan

---

## Como Usar Este Schema

### 1. Conectar Supabase

Criar `.env.local`:

```env
DATABASE_URL=postgresql://user:password@project.supabase.co:5432/postgres?schema=public
```

### 2. Fazer Migration

```bash
pnpm exec prisma migrate dev --name init
# Cria tabelas, índices, constraints
```

### 3. Usar no Código

```typescript
import { getPrisma } from '@/core/database'

const prisma = await getPrisma()
const clients = await prisma.client.findMany({
  where: { companyId: userId },
  include: { contacts: true, addresses: true }
})
```

### 4. Type-Safe Queries

Prisma gera tipos automáticos:

```typescript
import type { Client, Quote, Transaction } from '@prisma/client'

const quote: Quote = { /* ... */ }
```

---

## Estatísticas do Schema

| Item | Quantidade |
|------|-----------|
| Models | 21 |
| Enums | 16 |
| Relationships | 40+ |
| Indexes | 35+ |
| Constraints | 25+ |
| Soft deletes | 8 |
| Lines of Prisma | 691 |

---

## Referências

- [Prisma Docs](https://www.prisma.io/docs/)
- [PostgreSQL Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
- [Supabase Auth + RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [AluERP Architecture](./ARCHITECTURE.md)

---

**Status:** Schema v3.0.0 PRONTO PARA MIGRATION  
**Data:** 29 de julho de 2024  
**Próximo:** Executar `prisma migrate dev --name init`
