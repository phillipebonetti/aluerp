# AluERP — Exemplos de Queries Prisma

Referência rápida de queries comuns que serão usadas nos server actions.

---

## AUTENTICAÇÃO E ACESSO

### Buscar user com suas companies

```typescript
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    memberships: {
      include: {
        company: true,
        role: {
          include: { permissions: true }
        }
      }
    }
  }
})
```

### Buscar company com members

```typescript
const company = await prisma.company.findUnique({
  where: { id: companyId },
  include: {
    members: {
      include: {
        user: true,
        role: {
          include: { permissions: true }
        }
      }
    }
  }
})
```

### Verificar permissão

```typescript
const hasPermission = await prisma.rolePermission.findFirst({
  where: {
    role: {
      members: {
        some: {
          userId: userId,
          companyId: companyId
        }
      }
    },
    permission: {
      resource: 'clients',
      action: 'create'
    }
  }
})
```

---

## CLIENTES

### Listar clientes com endereço primário

```typescript
const clients = await prisma.client.findMany({
  where: {
    companyId: companyId,
    deletedAt: null
  },
  include: {
    addresses: {
      where: { isPrimary: true },
      take: 1
    },
    contacts: {
      where: { isPrimary: true },
      take: 1
    }
  }
})
```

### Buscar cliente com histórico de quotes

```typescript
const client = await prisma.client.findUnique({
  where: { id: clientId },
  include: {
    addresses: true,
    contacts: true,
    quotes: {
      orderBy: { createdAt: 'desc' }
    },
    projects: {
      orderBy: { createdAt: 'desc' }
    }
  }
})
```

### Criar cliente com endereço

```typescript
const newClient = await prisma.client.create({
  data: {
    companyId,
    name,
    type: 'COMPANY',
    document: cnpj,
    email,
    phone,
    addresses: {
      create: {
        street,
        number,
        neighborhood,
        city,
        state,
        zipCode,
        isPrimary: true
      }
    }
  },
  include: {
    addresses: true
  }
})
```

### Atualizar cliente (adicionar contato)

```typescript
await prisma.client.update({
  where: { id: clientId },
  data: {
    contacts: {
      create: {
        name: contactName,
        email: contactEmail,
        phone: contactPhone,
        role: 'Gerente',
        isPrimary: false
      }
    }
  }
})
```

---

## FORNECEDORES

### Listar fornecedores por tipo

```typescript
const suppliers = await prisma.supplier.findMany({
  where: {
    companyId,
    type: 'MATERIAL',
    status: 'ACTIVE',
    deletedAt: null
  },
  include: {
    contacts: { where: { isPrimary: true } },
    documents: true
  }
})
```

### Buscar fornecedor com transações

```typescript
const supplier = await prisma.supplier.findUnique({
  where: { id: supplierId },
  include: {
    contacts: true,
    documents: true,
    transactions: {
      where: { status: { in: ['PENDING', 'CONFIRMED'] } },
      orderBy: { dueDate: 'asc' }
    }
  }
})
```

---

## OBRAS/PROJETOS

### Listar projetos com progresso

```typescript
const projects = await prisma.project.findMany({
  where: {
    companyId,
    status: { in: ['PLANNING', 'IN_PROGRESS'] },
    deletedAt: null
  },
  include: {
    client: {
      select: { name: true, email: true }
    },
    costs: true,
    _count: {
      select: {
        serviceOrders: true,
        documents: true,
        photos: true
      }
    }
  },
  orderBy: { startDate: 'asc' }
})
```

### Dashboard de obras

```typescript
const projectStats = await prisma.project.groupBy({
  by: ['status'],
  where: { companyId, deletedAt: null },
  _count: {
    id: true
  },
  _sum: {
    totalValue: true,
    costEstimated: true
  }
})
```

### Buscar projeto com tudo

```typescript
const project = await prisma.project.findUnique({
  where: { id: projectId },
  include: {
    client: true,
    photos: true,
    documents: true,
    costs: true,
    serviceOrders: {
      include: {
        _count: { select: { id: true } }
      }
    },
    quotes: {
      select: { id: true, status: true, totalValue: true }
    }
  }
})
```

---

## ORÇAMENTOS

### Listar orçamentos pendentes

```typescript
const pendingQuotes = await prisma.quote.findMany({
  where: {
    companyId,
    status: 'SENT',
    deletedAt: null,
    validUntil: {
      gte: new Date() // Ainda válido
    }
  },
  include: {
    client: { select: { name: true } },
    items: {
      select: { description: true, quantity: true, unitPrice: true }
    }
  },
  orderBy: { sentAt: 'asc' }
})
```

### Criar orçamento com itens

```typescript
const quote = await prisma.quote.create({
  data: {
    companyId,
    clientId,
    number: '2024-001',
    status: 'DRAFT',
    totalValue: 5000,
    items: {
      create: [
        {
          description: 'Vidro Temperado 8mm',
          quantity: 10,
          unit: 'm2',
          unitPrice: 150,
          totalPrice: 1500
        },
        {
          description: 'Alumínio Anodizado',
          quantity: 50,
          unit: 'm',
          unitPrice: 50,
          totalPrice: 2500
        },
        {
          description: 'Mão de Obra',
          quantity: 40,
          unit: 'h',
          unitPrice: 35,
          totalPrice: 1400
        }
      ]
    }
  },
  include: {
    items: true
  }
})
```

### Versionar orçamento

```typescript
// Buscar versões anteriores
const versions = await prisma.quoteVersion.findMany({
  where: { quoteId },
  orderBy: { versionNumber: 'desc' }
})

// Criar nova versão
await prisma.quoteVersion.create({
  data: {
    quoteId,
    versionNumber: (versions[0]?.versionNumber ?? 0) + 1,
    status: quote.status,
    totalValue: quote.totalValue
  }
})
```

---

## FINANCEIRO

### Dashboard financeiro

```typescript
const financialSummary = await prisma.transaction.groupBy({
  by: ['type', 'status'],
  where: {
    companyId,
    createdAt: {
      gte: new Date(new Date().getFullYear(), 0, 1) // Desde janeiro
    }
  },
  _sum: { amount: true },
  _count: { id: true }
})

// Resultado:
// [
//   { type: 'INCOME', status: 'PAID', _sum: { amount: 50000 }, _count: { id: 10 } },
//   { type: 'EXPENSE', status: 'PAID', _sum: { amount: 30000 }, _count: { id: 25 } },
//   { type: 'EXPENSE', status: 'PENDING', _sum: { amount: 5000 }, _count: { id: 5 } }
// ]
```

### Contas a receber

```typescript
const accountsReceivable = await prisma.transaction.findMany({
  where: {
    companyId,
    type: 'INCOME',
    status: { in: ['PENDING', 'OVERDUE'] },
    dueDate: { gte: new Date() }
  },
  include: {
    supplier: { select: { name: true } },
    costCenter: { select: { name: true } }
  },
  orderBy: { dueDate: 'asc' }
})
```

### Contas a pagar

```typescript
const accountsPayable = await prisma.transaction.findMany({
  where: {
    companyId,
    type: 'EXPENSE',
    status: { in: ['PENDING', 'OVERDUE'] }
  },
  include: {
    supplier: { select: { name: true, email: true } },
    bankAccount: { select: { bankName: true } }
  },
  orderBy: { dueDate: 'asc' }
})
```

### Registrar pagamento

```typescript
const transaction = await prisma.transaction.update({
  where: { id: transactionId },
  data: {
    status: 'PAID',
    paymentDate: new Date(),
    bankAccountId: bankAccountId
  }
})

// Atualizar balance (ou via trigger)
await updateBankBalance(bankAccountId)
```

### Balance de conta

```typescript
const bankAccount = await prisma.bankAccount.findUnique({
  where: { id: bankAccountId },
  include: {
    transactions: {
      where: { status: 'PAID' }
    }
  }
})

const balance = bankAccount?.transactions.reduce((sum, t) => {
  return sum + (t.type === 'INCOME' ? t.amount : -t.amount)
}, 0)
```

---

## AUDITORIA

### Histórico de mudanças

```typescript
const auditLogs = await prisma.auditLog.findMany({
  where: {
    resource: 'Client',
    resourceId: clientId
  },
  include: {
    user: { select: { name: true, email: true } }
  },
  orderBy: { createdAt: 'desc' },
  take: 50
})

// Resultado:
// [
//   { 
//     action: 'UPDATE', 
//     user: { name: 'João' },
//     changes: { email: { from: '...', to: '...' } },
//     createdAt: 2024-07-29
//   }
// ]
```

### Atividade por usuário

```typescript
const userActivity = await prisma.auditLog.groupBy({
  by: ['userId', 'action'],
  where: {
    createdAt: {
      gte: new Date(new Date().setDate(new Date().getDate() - 7))
    }
  },
  _count: { id: true },
  orderBy: [
    { userId: 'asc' },
    { _count: { id: 'desc' } }
  ]
})
```

---

## TRANSAÇÕES COMPLEXAS

### Criar orçamento → aprovado → projeto → OS

```typescript
import { Prisma } from '@prisma/client'

const result = await prisma.$transaction(async (tx) => {
  // 1. Criar orçamento
  const quote = await tx.quote.create({
    data: {
      companyId,
      clientId,
      number: generateQuoteNumber(),
      totalValue: 50000,
      status: 'DRAFT'
    }
  })
  
  // 2. Adicionar itens
  await tx.quoteItem.createMany({
    data: items.map((item, i) => ({
      quoteId: quote.id,
      ...item,
      order: i
    }))
  })
  
  // 3. Enviar (update status)
  const sentQuote = await tx.quote.update({
    where: { id: quote.id },
    data: { status: 'SENT', sentAt: new Date() }
  })
  
  // 4. Aprovar (simular)
  const approvedQuote = await tx.quote.update({
    where: { id: quote.id },
    data: { status: 'APPROVED', approvedAt: new Date() }
  })
  
  // 5. Criar projeto
  const project = await tx.project.create({
    data: {
      companyId,
      clientId,
      name: 'Esquadria Alumínio - ' + approvedQuote.number,
      address: addressFromClient,
      status: 'PLANNING',
      totalValue: approvedQuote.totalValue
    }
  })
  
  // 6. Criar OS
  const serviceOrder = await tx.serviceOrder.create({
    data: {
      companyId,
      projectId: project.id,
      number: generateSONumber(),
      status: 'DRAFT'
    }
  })
  
  return { quote: approvedQuote, project, serviceOrder }
})
```

---

## PERFORMANCE TIPS

### Usar Select para Menos Dados

```typescript
// ❌ Traz tudo
const clients = await prisma.client.findMany({ where: { companyId } })

// ✅ Traz só o necessário
const clients = await prisma.client.findMany({
  where: { companyId },
  select: {
    id: true,
    name: true,
    email: true,
    _count: {
      select: { quotes: true, projects: true }
    }
  }
})
```

### Pagination

```typescript
const pageSize = 20
const page = 1

const clients = await prisma.client.findMany({
  where: { companyId, deletedAt: null },
  skip: (page - 1) * pageSize,
  take: pageSize,
  orderBy: { createdAt: 'desc' }
})

const total = await prisma.client.count({
  where: { companyId, deletedAt: null }
})
```

### Índices para Queries Frequentes

```typescript
// Query 1: Projects por empresa e status
// @@index([companyId, status])

const projects = await prisma.project.findMany({
  where: { companyId, status: 'IN_PROGRESS' }
})

// Query 2: Transactions por empresa e período
// @@index([companyId, createdAt])

const recent = await prisma.transaction.findMany({
  where: {
    companyId,
    createdAt: { gte: startDate, lte: endDate }
  }
})
```

---

## Próximos Passos

Estes exemplos serão refatorados em **modules/\*/actions/** durante a Sprint 4.

Cada module terá seus próprios server actions com base nestes padrões:

```
modules/
├── Client/
│   ├── actions/
│   │   ├── create.ts      (createClient)
│   │   ├── read.ts        (getClient, listClients)
│   │   ├── update.ts      (updateClient)
│   │   └── delete.ts      (deleteClient)
│   ├── schemas/           (Zod validation)
│   └── types.ts
└── Quote/
    ├── actions/
    │   ├── create.ts
    │   ├── addItem.ts
    │   ├── send.ts
    │   ├── approve.ts
    │   └── version.ts
    └── types.ts
```

---

**Status:** Exemplos de referência  
**Data:** 29 de julho de 2024
