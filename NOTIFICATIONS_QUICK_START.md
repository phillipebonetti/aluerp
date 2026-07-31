# Notificações — Quick Start (5 Minutos)

## Instalação

1. Executar migration:
```bash
npx prisma migrate dev --name add_notifications
```

2. Importar o componente no header (já feito):
```typescript
import { NotificationBell } from '@/components/notifications/notification-bell'
```

## Usar em Componentes

### Exibir Sino no Header
```typescript
<NotificationBell userId={user.id} companyId={user.companyId} />
```

## Criar Notificação

```typescript
import { createNotificationAction } from '@/src/actions/notifications'

// Em uma server action ou component
await createNotificationAction({
  userId: 'user-123',
  companyId: 'company-456',
  title: 'Novo Orçamento Criado',
  message: 'O orçamento #2024-001 foi criado com sucesso',
  type: 'INFO', // INFO, SUCCESS, WARNING, ERROR
  priority: 'NORMAL', // BAIXA, NORMAL, ALTA, URGENTE
  category: 'ORCAMENTOS', // SISTEMA, FINANCEIRO, OBRAS, CLIENTES, ORCAMENTOS, FORNECEDORES, VENDAS, USUARIOS, BACKUP, INTEGRACAO
  actionUrl: '/orcamentos/2024-001'
})
```

## Obter Notificações

```typescript
import { getUserNotificationsAction } from '@/src/actions/notifications'

const result = await getUserNotificationsAction(userId, companyId, {
  status: 'UNREAD', // UNREAD, READ, ARCHIVED (opcional)
  category: 'FINANCEIRO', // (opcional)
  priority: 'URGENTE', // (opcional)
  limit: 10,
  offset: 0
})

if (result.success) {
  console.log(result.data.notifications)
  console.log(result.data.total)
}
```

## Gerenciar Notificações

```typescript
import {
  markAsReadAction,
  markAllAsReadAction,
  deleteNotificationAction,
  archiveNotificationAction
} from '@/src/actions/notifications'

// Marcar como lida
await markAsReadAction('notification-id')

// Marcar todas como lidas
await markAllAsReadAction(userId, companyId)

// Deletar (soft delete)
await deleteNotificationAction('notification-id')

// Arquivar
await archiveNotificationAction('notification-id')
```

## Gerenciar Preferências

```typescript
import { updatePreferenceAction } from '@/src/actions/notifications'

await updatePreferenceAction(userId, companyId, {
  emailEnabled: true,
  pushEnabled: false,
  whatsappEnabled: false,
  silentMode: true,
  silentStart: '22:00', // HH:mm
  silentEnd: '08:00',
  categories: ['FINANCEIRO', 'URGENTE'] // categorias desejadas
})
```

## Exemplo Completo: Integração com Evento

```typescript
// Quando criar novo orçamento
export async function createQuoteAction(data) {
  // ... validação ...
  
  const quote = await db.quote.create({
    data: {
      ...data,
      companyId: session.user.companyId
    }
  })

  // Notificar criador
  await createNotificationAction({
    userId: session.user.id,
    companyId: session.user.companyId,
    title: 'Orçamento Criado',
    message: `Orçamento #${quote.number} foi criado com sucesso`,
    type: 'SUCCESS',
    priority: 'NORMAL',
    category: 'ORCAMENTOS',
    actionUrl: `/orcamentos/${quote.id}`,
    icon: 'FileText'
  })

  // Notificar gerente
  const manager = await db.user.findFirst({
    where: {
      companyId: session.user.companyId,
      role: { has: 'MANAGER' }
    }
  })

  if (manager) {
    await createNotificationAction({
      userId: manager.id,
      companyId: session.user.companyId,
      title: 'Novo Orçamento Para Análise',
      message: `${session.user.name} criou um novo orçamento`,
      type: 'INFO',
      priority: 'NORMAL',
      category: 'ORCAMENTOS',
      actionUrl: `/orcamentos/${quote.id}`
    })
  }

  return quote
}
```

## Tipos e Cores

| Tipo | Cor | Descrição |
|------|-----|-----------|
| INFO | Azul | Informação geral |
| SUCCESS | Verde | Sucesso/Confirmação |
| WARNING | Amarelo | Aviso/Atenção |
| ERROR | Vermelho | Erro/Problema |

| Prioridade | Cor | Uso |
|------------|-----|-----|
| BAIXA | Cinza | Informações secundárias |
| NORMAL | Azul | Ações regulares |
| ALTA | Laranja | Ações importantes |
| URGENTE | Vermelho | Requer ação imediata |

## Categorias Disponíveis

- SISTEMA — Eventos do sistema
- FINANCEIRO — Transações, pagamentos
- OBRAS — Obras, projetos
- CLIENTES — Cadastro, atualizações
- ORCAMENTOS — Criação, aprovação
- FORNECEDORES — Cadastro, pagamentos
- VENDAS — Vendas, comissões
- USUARIOS — Novo usuário, permissões
- BACKUP — Backup concluído
- INTEGRACAO — Integrações com sistemas

## Acessar Central de Notificações

Usuários podem acessar todas as notificações em: `/notificacoes`

Lá encontram:
- Filtros por status (Não Lidas, Lidas, Todas)
- Agrupamento por data
- Paginação
- Marcar todas como lidas

## Performance Tips

1. Sempre usar filtros ao buscar
2. Usar paginação (padrão 20 por página)
3. Não fazer queries sem limit
4. Para dashboard, usar `getUnreadCountAction`

```typescript
import { getUnreadCountAction } from '@/src/actions/notifications'

const { unread, urgent } = await getUnreadCountAction(userId, companyId)
```

## Troubleshooting

### Notificação não aparece no sino
- Verificar se `NotificationBell` está no Header
- Verificar se userId e companyId são corretos
- Verificar preferências do usuário (não está em modo silencioso?)

### Notificação aparece mas está lida
- Status foi marcado como READ
- Usar filtro status: 'UNREAD'

### Não consigo marcar todas como lidas
- Precisa estar na página `/notificacoes`
- Usar botão "Marcar todas como lidas"

## Roadmap Futuro

- [ ] Email Service (SMTP)
- [ ] Push Notifications (Web Push)
- [ ] WhatsApp Integration
- [ ] Dashboard Admin
- [ ] Realtime com Supabase
- [ ] Analytics

## Documentação Completa

Ver: `SPRINT_17_NOTIFICATIONS.md`

---

**Dúvidas?** Consulte a documentação completa ou revise os exemplos acima.
