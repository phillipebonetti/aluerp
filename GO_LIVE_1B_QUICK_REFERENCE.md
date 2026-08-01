# GO LIVE 1B - Quick Reference Guide

## Como Usar os Novos Componentes

### 1. Material Tab

```tsx
import { OsMaterialsTab } from '@/components/os/os-materials-tab'

<OsMaterialsTab
  serviceOrderId="os-123"
  materials={materials}
  onAddMaterial={handleAdd}
  onUpdateMaterial={handleUpdate}
  onDeleteMaterial={handleDelete}
  onAutoCalculate={handleCalculate}
/>
```

**Features:**
- CRUD para materiais
- Categorização (ALUMINIO, VIDRO, etc)
- Rastreamento de status (PENDING, PURCHASED, etc)
- Cálculo automático de custo total

---

### 2. Commission Tab

```tsx
import { OsCommissionTab } from '@/components/os/os-commission-tab'

<OsCommissionTab
  serviceOrderId="os-123"
  commissions={commissions}
  osValue={5000}
  onApprove={handleApprove}
  onPay={handlePay}
/>
```

**Features:**
- Listagem de comissões
- Aprovação workflow
- KPIs de comissão
- Histórico de pagamentos

---

### 3. Progress Bar

```tsx
import { OsProgressBar } from '@/components/os/os-progress-bar'

<OsProgressBar
  data={{
    overallProgress: 65,
    productionProgress: 80,
    installationProgress: 0,
    estimatedDays: 14,
    elapsedDays: 9,
    remainingDays: 5,
    isOverdue: false,
  }}
  compact={false}
/>
```

**Features:**
- Progresso visual em %, por etapa
- Timeline com dias
- Alerta de atraso
- Modo compacto/expandido

---

### 4. Metrics Cards

```tsx
import { OsMetricsCards } from '@/components/os/os-metrics-cards'

<OsMetricsCards
  cards={[
    {
      label: 'Progresso',
      value: '65%',
      color: 'info',
      trend: 'up',
      trendPercentage: 5,
    },
    // ... more cards
  ]}
  columns={4}
/>
```

**Features:**
- Cards customizáveis
- Trending indicators
- Color coding
- Responsive grid

---

### 5. Checklist

```tsx
import { OsChecklist } from '@/components/os/os-checklist'

<OsChecklist
  serviceOrderId="os-123"
  items={checklist}
  onAddItem={handleAdd}
  onUpdateItem={handleUpdate}
  onDeleteItem={handleDelete}
  onUploadPhoto={handlePhotoUpload}
/>
```

**Features:**
- Itens com checkboxes
- Upload de fotos
- Progresso visual
- Histórico de conclusão

---

## Como Usar os Services

### Material Service

```typescript
import { MaterialService } from '@/src/lib/services/os-materials-service'

// Criar material
const material = await MaterialService.createMaterial({
  serviceOrderId: 'os-123',
  sequence: 1,
  name: 'Alumínio 40x40',
  category: 'ALUMINIO',
  quantity: 50,
  unit: 'm',
  unitCost: 100,
})

// Listar materiais
const materials = await MaterialService.listMaterials('os-123')

// Obter estatísticas
const stats = await MaterialService.getMaterialsStats('os-123')

// Marcar como recebido
await MaterialService.markAsReceived('material-id', 50)

// Verificar se tudo foi recebido
const allReceived = await MaterialService.areAllMaterialsReceived('os-123')
```

---

### Commission Service

```typescript
import { CommissionService } from '@/src/lib/services/os-commission-service'

// Criar comissão automaticamente
const commission = await CommissionService.createCommission({
  serviceOrderId: 'os-123',
  vendedorId: 'emp-456',
  osValue: 5000,
  commissionRate: 5, // 5%
})

// Aprovar comissão
await CommissionService.approveCommission('commission-id', 'approver-id')

// Marcar como paga
await CommissionService.payCommission('commission-id')

// Obter estatísticas
const stats = await CommissionService.getCommissionsStats('os-123')

// Relatório de período
const report = await CommissionService.getCommissionReport(
  'company-id',
  new Date('2026-01-01'),
  new Date('2026-12-31')
)

// Bulk operations
await CommissionService.bulkApproveCommissions(['os-1', 'os-2'], 'approver-id')
await CommissionService.bulkPayCommissions(['comm-1', 'comm-2'])
```

---

## Tipos Disponíveis

```typescript
// Material Types
type MaterialStatus = 'PENDING' | 'PURCHASED' | 'RECEIVED' | 'PARTIAL' | 'CANCELLED'
type MaterialCategory = 'ALUMINIO' | 'VIDRO' | 'FERRAGENS' | 'ACESSORIOS' | 'OUTROS'

interface OSMaterial {
  id: string
  serviceOrderId: string
  sequence: number
  name: string
  category: MaterialCategory
  description?: string
  quantity: number
  unit?: string
  unitCost: number
  totalCost: number
  supplier?: string
  status: MaterialStatus
  purchaseDate?: Date
  receivedDate?: Date
  receivedQty?: number
  notes?: string
  createdAt: Date
  updatedAt: Date
}

// Commission Types
type CommissionStatus = 'PENDING' | 'APPROVED' | 'PAID' | 'CANCELLED'

interface OSCommission {
  id: string
  serviceOrderId: string
  vendedorId: string
  osValue: number
  commissionRate: number // em percentual
  commissionValue: number
  status: CommissionStatus
  approvedBy?: string
  approvedAt?: Date
  paidAt?: Date
  notes?: string
  createdAt: Date
  updatedAt: Date
  vendedor?: { id: string; name: string }
}

// Progress Types
interface OSProgressData {
  overallProgress: number
  productionProgress: number
  installationProgress: number
  estimatedDays: number
  elapsedDays: number
  remainingDays: number
  isOverdue: boolean
}

// Metrics Card
interface OSMetricsCard {
  label: string
  value: string | number
  color: 'success' | 'warning' | 'danger' | 'info' | 'default'
  trend?: 'up' | 'down' | 'neutral'
  trendPercentage?: number
}

// Checklist
interface OSChecklistItem {
  id: string
  title: string
  description?: string
  completed: boolean
  completedBy?: string
  completedAt?: Date
  photoUrl?: string
  notes?: string
}
```

---

## Validation Schemas (Zod)

```typescript
// Material Schemas
CreateOSMaterialSchema
UpdateOSMaterialSchema
UpdateMaterialStatusSchema

// Commission Schemas
CreateOSCommissionSchema
UpdateOSCommissionSchema
ApproveCommissionSchema
PayCommissionSchema

// Progress Schemas
ProgressDataSchema

// Checklist Schemas
ChecklistItemSchema
CreateChecklistSchema
UpdateChecklistItemSchema
```

---

## Database Relations

```
ServiceOrder
├── materials (OSMaterial[])
├── commissions (OSCommission[])
└── ...

OSMaterial
├── serviceOrder (ServiceOrder)

OSCommission
├── serviceOrder (ServiceOrder)
└── vendedor (Employee)

Employee
├── osCommissions (OSCommission[])
```

---

## Próximas Integrações (Fase 4-9)

- **Fase 4**: Server Actions para todos os CRUD
- **Fase 5**: Integrar componentes na página [id]
- **Fase 6**: Dashboard com 20+ KPIs
- **Fase 7**: Kanban e Gantt visualizations
- **Fase 8**: PDF export, WhatsApp integration
- **Fase 9**: Design refinements

---

## Dicas & Troubleshooting

### Problema: Erro de Decimal no Prisma
**Solução**: Use `new Decimal(value)` para operações numéricas
```typescript
const total = new Decimal(quantity).times(new Decimal(unitCost))
```

### Problema: Componente não atualiza quando dados mudam
**Solução**: Certifique-se de passar `key` único no map
```typescript
{materials.map((m) => <div key={m.id}>{m.name}</div>)}
```

### Problema: Commission não calcula automaticamente
**Solução**: Certifique-se de chamar CommissionService.createCommission quando OS é criada
```typescript
await CommissionService.createCommission({...})
```

---

## Resources

- `GO_LIVE_1B_PLAN.md` - Plano detalhado
- `GO_LIVE_1B_PROGRESS.md` - Progress tracking
- `GO_LIVE_1B_CURRENT_STATUS.md` - Status atual
- Código inline comentado

---

**V0 Agent - GO LIVE 1B Reference**
**Agosto 2026**
