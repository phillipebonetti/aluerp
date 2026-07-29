# AluERP — Regras de Negócio do Banco de Dados

## Objetivo

Este documento define as regras de negócio que devem ser implementadas na camada de aplicação (server actions, triggers, validações) para manter a integridade e coerência dos dados do AluERP.

---

## 1. REGRAS DE EMPRESA (COMPANY)

### 1.1 Validação de CNPJ

**Regra:** CNPJ deve ser válido e único por empresa.

**Implementação:**

```typescript
// lib/validation/document.ts
import { z } from 'zod'

export const validateCNPJ = (cnpj: string): boolean => {
  const clean = cnpj.replace(/\D/g, '')
  if (clean.length !== 14) return false
  
  // Algoritmo de validação de CNPJ
  let sum = 0
  let multiplier = 5
  
  for (let i = 0; i < 12; i++) {
    sum += parseInt(clean[i]) * multiplier
    multiplier = multiplier === 2 ? 9 : multiplier - 1
  }
  
  let remainder = sum % 11
  let firstCheck = remainder < 2 ? 0 : 11 - remainder
  
  if (parseInt(clean[12]) !== firstCheck) return false
  
  // Validar segundo dígito...
  return true
}

export const CNPJSchema = z
  .string()
  .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'CNPJ inválido')
  .refine(validateCNPJ, 'CNPJ não passou na validação')
```

### 1.2 Plano Não Pode Ser Downgrade

**Regra:** Empresa nunca pode fazer downgrade de plano automaticamente.

**Implementação:**

```typescript
// modules/Company/actions/updatePlan.ts
'use server'

export async function updateCompanyPlan(
  companyId: string,
  newPlan: Plan
) {
  const company = await prisma.company.findUnique({ where: { id: companyId } })
  
  const hierarchy = { FREE: 0, PRO: 1, ENTERPRISE: 2 }
  
  if (hierarchy[newPlan] < hierarchy[company!.plan]) {
    throw new Error('Downgrade de plano não permitido. Entre em contato com suporte.')
  }
  
  // Prosseguir com upgrade
  await prisma.company.update({
    where: { id: companyId },
    data: { plan: newPlan }
  })
}
```

### 1.3 Soft Delete Cascata

**Regra:** Deletar Company deve marcar como `deletedAt` (soft delete), mas cascade hard delete para members.

**Implementação:**

```typescript
// modules/Company/actions/deleteCompany.ts
'use server'

export async function deleteCompany(companyId: string) {
  const user = await getCurrentUser()
  if (!user) throw new UnauthorizedError()
  
  // Verificar se user é owner
  const member = await prisma.companyMember.findFirst({
    where: { companyId, userId: user.id, role: { name: 'OWNER' } }
  })
  
  if (!member) throw new ForbiddenError('Apenas OWNER pode deletar empresa')
  
  // Soft delete
  await prisma.company.update({
    where: { id: companyId },
    data: { deletedAt: new Date() }
  })
}
```

---

## 2. REGRAS DE USUÁRIO E ACESSO (RBAC)

### 2.1 Permissão Requerida para Ação

**Regra:** Todo create, update, delete deve checar se usuário tem Permission correspondente.

**Implementação:**

```typescript
// core/permissions/check.ts
export async function checkPermission(
  userId: string,
  resource: string,
  action: 'create' | 'read' | 'update' | 'delete'
): Promise<boolean> {
  const member = await prisma.companyMember.findFirst({
    where: { userId },
    include: {
      role: {
        include: {
          permissions: true
        }
      }
    }
  })
  
  if (!member?.role) return false
  
  return member.role.permissions.some(
    p => p.resource === resource && p.action === action
  )
}

// Uso:
const canCreate = await checkPermission(userId, 'clients', 'create')
if (!canCreate) throw new ForbiddenError()
```

### 2.2 Primeiro Membro é Owner

**Regra:** Quando criar company, primeiro member deve receber role OWNER automaticamente.

**Implementação:**

```typescript
// modules/Company/actions/create.ts
'use server'

export async function createCompany(input: CreateCompanyInput) {
  const user = await getCurrentUser()
  if (!user) throw new UnauthorizedError()
  
  const company = await prisma.company.create({
    data: {
      name: input.name,
      cnpj: input.cnpj,
      members: {
        create: {
          userId: user.id,
          role: {
            connect: {
              companyId_name: {
                companyId: '???', // problema: company não existe ainda
                name: 'OWNER'
              }
            }
          }
        }
      }
    }
  })
  
  // Solução: criar em 2 transações
  const defaultRole = await prisma.role.create({
    data: {
      companyId: company.id,
      name: 'OWNER',
      isDefault: true
    }
  })
  
  await prisma.companyMember.create({
    data: {
      companyId: company.id,
      userId: user.id,
      roleId: defaultRole.id
    }
  })
  
  return company
}
```

### 2.3 Convidar é CREATE CompanyMember

**Regra:** Quando convidar usuário, criar CompanyMember com status INVITED.

**Implementação:**

```typescript
// modules/Company/actions/inviteMember.ts
'use server'

export async function inviteMember(
  companyId: string,
  email: string,
  roleId: string
) {
  const user = await getCurrentUser()
  
  // Validar permissão
  const canInvite = await checkPermission(user!.id, 'company_members', 'create')
  if (!canInvite) throw new ForbiddenError()
  
  // Buscar ou criar user
  let targetUser = await prisma.user.findUnique({ where: { email } })
  if (!targetUser) {
    targetUser = await prisma.user.create({
      data: { email, name: email.split('@')[0] }
    })
  }
  
  // Criar membership com status INVITED
  const member = await prisma.companyMember.create({
    data: {
      companyId,
      userId: targetUser.id,
      roleId,
      status: 'INVITED'
    }
  })
  
  // TODO: Enviar email de convite
  
  return member
}
```

---

## 3. REGRAS DE CLIENTES

### 3.1 Documento Deve Ser Válido

**Regra:** CPF ou CNPJ deve passar na validação antes de salvar.

**Implementação:**

```typescript
// modules/Client/schemas/index.ts
import { z } from 'zod'
import { validateCPF, validateCNPJ } from '@/lib/validation/document'

export const CreateClientSchema = z.object({
  name: z.string().min(3),
  type: z.enum(['PERSON', 'COMPANY']),
  documentType: z.enum(['CPF', 'CNPJ', 'RG', 'PASSPORT']),
  document: z.string().optional().refine(
    (doc) => {
      if (!doc) return true
      if (doc.includes('CPF')) return validateCPF(doc)
      if (doc.includes('CNPJ')) return validateCNPJ(doc)
      return true
    },
    'Documento inválido'
  )
})
```

### 3.2 Endereço Primário Obrigatório

**Regra:** Todo cliente deve ter pelo menos um endereço marcado como `isPrimary = true`.

**Implementação:**

```typescript
// modules/Client/actions/create.ts
export async function createClient(
  companyId: string,
  input: CreateClientInput,
  primaryAddress: ClientAddressInput
) {
  const user = await getCurrentUser()
  
  const client = await prisma.client.create({
    data: {
      companyId,
      ...input,
      addresses: {
        create: {
          ...primaryAddress,
          isPrimary: true
        }
      }
    }
  })
  
  return client
}
```

### 3.3 Não Deletar Client com Projects

**Regra:** Client com `projects` ou `quotes` não pode ser deletado (Restrict).

**Implementação:** Automaticamente pelo Prisma (Foreign Key Constraint).

---

## 4. REGRAS DE FORNECEDORES

### 4.1 Tipo de Fornecedor

**Regra:** Supplier.type define permissões (ex: MATERIAL só aparece em certos campos).

**Implementação:** Usar na UI para filtrar dropdowns.

### 4.2 Contato Primário

**Regra:** Todo fornecedor deve ter pelo menos um contato com `isPrimary = true`.

**Implementação:** Similar ao Client.

---

## 5. REGRAS DE OBRAS/PROJETOS

### 5.1 Status Transition

**Regra:** Transição de status deve respeitar fluxo: `PLANNING → IN_PROGRESS → COMPLETED` ou `CANCELLED`.

**Implementação:**

```typescript
// modules/Project/helpers/statusTransition.ts
const VALID_TRANSITIONS: Record<ProjectStatus, ProjectStatus[]> = {
  PLANNING: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['PAUSED', 'COMPLETED', 'CANCELLED'],
  PAUSED: ['IN_PROGRESS', 'CANCELLED'],
  COMPLETED: ['ARCHIVED'],
  CANCELLED: ['ARCHIVED'],
  ARCHIVED: []
}

export function canTransition(from: ProjectStatus, to: ProjectStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false
}

// Uso:
if (!canTransition(project.status, newStatus)) {
  throw new Error(`Cannot transition from ${project.status} to ${newStatus}`)
}
```

### 5.2 Projeto Não Pode Mudar Cliente

**Regra:** Uma vez criado, projeto não pode trocar de client.

**Implementação:**

```typescript
export async function updateProject(
  projectId: string,
  input: Partial<UpdateProjectInput>
) {
  const project = await prisma.project.findUnique({ where: { id: projectId } })
  
  if (input.clientId && input.clientId !== project!.clientId) {
    throw new Error('Não é permitido mudar o cliente de uma obra')
  }
  
  // Prosseguir com update
}
```

### 5.3 Calcular Custo Total

**Regra:** `totalValue` do Project = SUM(ProjectCost.amount) + sum(ServiceOrder costs).

**Implementação:**

```typescript
// modules/Project/helpers/calculateCost.ts
export async function recalculateProjectCost(projectId: string) {
  const costs = await prisma.projectCost.aggregate({
    where: { projectId },
    _sum: { amount: true }
  })
  
  await prisma.project.update({
    where: { id: projectId },
    data: { 
      costEstimated: costs._sum.amount ?? 0
    }
  })
}
```

---

## 6. REGRAS DE ORÇAMENTOS

### 6.1 Numeração Única

**Regra:** Quote.number deve ser único dentro de Company.

**Implementação:** Automaticamente pelo Prisma (`@@unique([companyId, number])`).

**Sugestão:** Auto-incrementar no backend:

```typescript
// modules/Quote/helpers/generateNumber.ts
export async function generateQuoteNumber(companyId: string): Promise<string> {
  const lastQuote = await prisma.quote.findFirst({
    where: { companyId },
    orderBy: { createdAt: 'desc' }
  })
  
  const nextNumber = (parseInt(lastQuote?.number ?? '0') + 1).toString().padStart(5, '0')
  return `ORC-${new Date().getFullYear()}-${nextNumber}`
}
```

### 6.2 Total = Soma de Itens

**Regra:** Quote.totalValue = SUM(QuoteItem.totalPrice) - SUM(QuoteItem.discount).

**Implementação:**

```typescript
// modules/Quote/actions/addItem.ts
export async function addQuoteItem(
  quoteId: string,
  item: CreateQuoteItemInput
) {
  const quoteItem = await prisma.quoteItem.create({
    data: {
      quoteId,
      totalPrice: item.quantity * item.unitPrice,
      ...item
    }
  })
  
  // Recalcular total da quote
  const items = await prisma.quoteItem.findMany({ where: { quoteId } })
  const total = items.reduce(
    (sum, i) => sum + (i.totalPrice ?? 0) - (i.discount ?? 0),
    0
  )
  
  await prisma.quote.update({
    where: { id: quoteId },
    data: { totalValue: total }
  })
  
  return quoteItem
}
```

### 6.3 Status APPROVED ou REJECTED

**Regra:** Um orçamento enviado (status=SENT) pode ser aprovado ou rejeitado, mas não editado.

**Implementação:**

```typescript
export async function approveQuote(quoteId: string) {
  const quote = await prisma.quote.findUnique({ where: { id: quoteId } })
  
  if (quote!.status !== 'SENT') {
    throw new Error('Apenas orçamentos ENVIADOS podem ser aprovados')
  }
  
  await prisma.quote.update({
    where: { id: quoteId },
    data: { status: 'APPROVED', approvedAt: new Date() }
  })
}
```

### 6.4 Versionamento

**Regra:** Quando atualizar orçamento aprovado, criar nova versão.

**Implementação:**

```typescript
export async function updateQuote(quoteId: string, input: UpdateQuoteInput) {
  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
    include: { versions: true }
  })
  
  if (quote!.status === 'APPROVED') {
    // Criar versão anterior
    const lastVersion = quote!.versions[quote!.versions.length - 1]
    
    await prisma.quoteVersion.create({
      data: {
        quoteId,
        versionNumber: (lastVersion?.versionNumber ?? 0) + 1,
        status: quote!.status,
        totalValue: quote!.totalValue
      }
    })
    
    // Reset para DRAFT
    await prisma.quote.update({
      where: { id: quoteId },
      data: { status: 'DRAFT', approvedAt: null, ...input }
    })
  }
}
```

---

## 7. REGRAS FINANCEIRAS

### 7.1 Balance = Débito - Crédito

**Regra:** BankAccount.balance = SUM(income transactions) - SUM(expense transactions).

**Implementação (Trigger PostgreSQL):**

```sql
CREATE TRIGGER update_bank_balance_after_transaction
AFTER INSERT OR UPDATE ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_bank_balance();

CREATE FUNCTION update_bank_balance()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE bank_accounts
  SET balance = (
    SELECT COALESCE(SUM(CASE 
      WHEN type = 'INCOME' THEN amount 
      WHEN type = 'EXPENSE' THEN -amount 
    END), 0)
    FROM transactions
    WHERE bank_account_id = NEW.bank_account_id AND status = 'PAID'
  )
  WHERE id = NEW.bank_account_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 7.2 Transaction Não Pode Ser Editado

**Regra:** Uma vez criado, Transaction.amount não pode ser alterado (apenas status).

**Implementação:**

```typescript
export async function updateTransaction(
  transactionId: string,
  input: { status?: TransactionStatus; notes?: string }
) {
  const allowed = ['status', 'notes', 'paymentDate']
  
  const invalidFields = Object.keys(input).filter(k => !allowed.includes(k))
  
  if (invalidFields.length > 0) {
    throw new Error(`Campos não editáveis: ${invalidFields.join(', ')}`)
  }
  
  await prisma.transaction.update({
    where: { id: transactionId },
    data: input as any
  })
}
```

### 7.3 Status OVERDUE Automático

**Regra:** Transaction com dueDate < hoje e status PENDING deve ser OVERDUE.

**Implementação (job):**

```typescript
// lib/jobs/markOverdueTransactions.ts
export async function markOverdueTransactions() {
  const now = new Date()
  
  await prisma.transaction.updateMany({
    where: {
      dueDate: { lt: now },
      status: 'PENDING'
    },
    data: { status: 'OVERDUE' }
  })
}

// Rodar via cron job (Next.js API route)
// GET /api/cron/overdue (protegido por CRON_SECRET)
```

---

## 8. REGRAS DE AUDITORIA

### 8.1 AuditLog Obrigatório

**Regra:** Toda ação CRUD deve ser registrada em AuditLog.

**Implementação:**

```typescript
// core/logger/audit.ts
export async function logAudit(
  userId: string,
  action: 'CREATE' | 'UPDATE' | 'DELETE',
  resource: string,
  resourceId: string,
  changes?: any
) {
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      resource,
      resourceId,
      changes: changes ? JSON.stringify(changes) : null,
      ipAddress: getClientIp() // implementar
    }
  })
}

// Uso:
await logAudit(user.id, 'CREATE', 'Client', newClient.id)
```

### 8.2 Registrar Mudança de Dados

**Regra:** AuditLog.changes deve conter antes/depois do campo alterado.

**Implementação:**

```typescript
function getChanges(before: any, after: any): Record<string, any> {
  const changes: Record<string, any> = {}
  
  for (const key in after) {
    if (before[key] !== after[key]) {
      changes[key] = { from: before[key], to: after[key] }
    }
  }
  
  return changes
}

// Uso:
const oldClient = await prisma.client.findUnique({ where: { id: clientId } })
const newClient = await prisma.client.update({
  where: { id: clientId },
  data: input
})

const changes = getChanges(oldClient, newClient)
await logAudit(user.id, 'UPDATE', 'Client', clientId, changes)
```

---

## 9. ISOLAMENTO MULTIEMPRESA (RLS)

### 9.1 Row Level Security (Supabase)

Após conectar Supabase, implementar RLS policies:

```sql
-- Qualquer table com companyId
CREATE POLICY "Isolate company data"
ON clients
USING (
  auth.uid() IN (
    SELECT user_id FROM company_members
    WHERE company_id = clients.company_id
  )
);
```

### 9.2 Query Filtering (Fallback)

Se RLS não estiver ativo, sempre filtrar por company_id no backend:

```typescript
const clients = await prisma.client.findMany({
  where: {
    companyId: user.activeCompanyId, // SEMPRE adicionar
    deletedAt: null
  }
})
```

---

## 10. VALIDAÇÕES DE DADOS

### 10.1 Decimal Precision

Todos os valores monetários devem usar `Decimal(12, 2)`:

```typescript
// NOT: amount: 1000.555
// YES: amount: 1000.55
```

### 10.2 Strings Não Vazias

```typescript
export const ClientNameSchema = z
  .string()
  .min(1, 'Nome obrigatório')
  .trim()
```

### 10.3 Enums Válidos

```typescript
const ValidStatuses = ['ACTIVE', 'INACTIVE', 'ARCHIVED']

if (!ValidStatuses.includes(status)) {
  throw new Error(`Status inválido: ${status}`)
}
```

---

## Implementação por Fase

### Sprint 3 (Agora):
- [x] Schema Prisma completo
- [x] Gerar Prisma Client
- [ ] Documentar regras (ESTE ARQUIVO)

### Sprint 4:
- [ ] Implementar validações Zod
- [ ] Criar server actions com regras
- [ ] Testes unitários

### Sprint 5:
- [ ] Implementar triggers PostgreSQL
- [ ] Implementar jobs de background
- [ ] RLS policies Supabase

### Sprint 6:
- [ ] Auditoria completa
- [ ] Relatórios
- [ ] Reconciliação financeira

---

## Próximos Passos

1. **Revisar este documento** com a equipe
2. **Implementar em ordem de prioridade:**
   - RBAC (Fase 4)
   - Validações (Fase 4)
   - Regras financeiras (Fase 5)
   - Auditoria (Fase 6)

3. **Testes:** Cada regra deve ter testes unitários e de integração

4. **Documentação:** Manter DATABASE.md e DATABASE_RULES.md sincronizados

---

**Status:** REGRAS DEFINIDAS  
**Data:** 29 de julho de 2024  
**Próximo:** Implementar em server actions (Sprint 4)
