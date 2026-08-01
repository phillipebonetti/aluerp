# AluERP — Guia de Início

## 1. Estrutura do Projeto

```
aluerp/
├── app/                          # Next.js App Router
│   ├── (app)/                   # Layout protegido
│   │   ├── crm/                 # CRM Comercial
│   │   ├── relatorios/          # Relatórios
│   │   ├── dashboard/           # Dashboard Executivo
│   │   ├── configuracoes/       # Configurações
│   │   │   └── integracoes/     # Central de Integrações
│   │   └── ai/                  # Assistente IA
│   ├── (auth)/                  # Layout de autenticação
│   ├── api/                     # API routes
│   └── portal/                  # Portal do Cliente
├── components/                   # Componentes React reutilizáveis
├── src/
│   ├── lib/
│   │   ├── db.ts               # Prisma client
│   │   ├── utils.ts            # Funções utilitárias
│   │   ├── ai/                 # Módulo de IA
│   │   └── integrations/       # Integrações
│   ├── services/               # Service layer
│   ├── actions/                # Server actions
│   └── hooks/                  # React hooks
├── prisma/
│   └── schema.prisma           # Modelo de dados
└── public/                     # Arquivos estáticos
```

## 2. Fluxo de Autenticação

### Login
```
Usuario visita /auth/login
→ Entra email/senha
→ Server action validateCredentials()
→ Session criada (HTTPOnly cookie)
→ Redireciona para /dashboard
```

### Acesso Protegido
```
Usuario visita página protegida
→ middleware verifica session
→ Se não autenticado: redireciona para /auth/login
→ Se autenticado: carrega dados
→ Valida permissões (companyId)
```

## 3. Como Adicionar Nova Página

### Passo 1: Criar arquivo de page
```typescript
// app/(app)/nova-feature/page.tsx
'use client'

import { PageHeader } from '@/components/ui/page-header'

export default function NovaFeaturePage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Nova Feature"
        description="Descrição da feature"
      />
      {/* Seu conteúdo aqui */}
    </div>
  )
}
```

### Passo 2: Criar server action (se necessário)
```typescript
// src/actions/nova-feature.ts
'use server'

import { prisma } from '@/src/lib/db'

export async function getDataAction(companyId: string) {
  try {
    const data = await prisma.model.findMany({
      where: { companyId }
    })
    return { success: true, data }
  } catch (error) {
    return { success: false, error: 'Erro ao buscar dados' }
  }
}
```

### Passo 3: Usar na página
```typescript
const { data } = await getDataAction(companyId)
```

## 4. Como Adicionar Novo Modelo ao Banco

### Passo 1: Adicionar ao schema.prisma
```prisma
model NovoModelo {
  id        String   @id @default(cuid())
  companyId String
  
  // campos...
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relações
  company   Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  
  @@index([companyId])
  @@map("novo_modelo")
}
```

### Passo 2: Atualizar Company
```prisma
model Company {
  // ... outros campos
  novoModelos NovoModelo[]
}
```

### Passo 3: Executar migrações
```bash
npm run db:push
```

## 5. Como Usar a IA

### Configurar Provider
1. Acesse `/ai/config`
2. Escolha um provedor (OpenAI recomendado)
3. Insira sua API key
4. Clique "Testar Conexão"

### Usar no Chat
1. Acesse `/ai`
2. Crie uma nova conversa
3. Faça suas perguntas
4. IA terá contexto do seu ERP

### Perguntas Exemplos
- "Quantas obras estão em andamento?"
- "Qual cliente mais comprou este ano?"
- "Quanto faturamos este mês?"
- "Quais contas vencem hoje?"

## 6. Como Adicionar Integração

### Passo 1: Preparar o Provider
```typescript
// Sua integração já está pronta em:
// src/lib/integrations/providers/[provedor].ts
```

### Passo 2: Configurar na UI
- Acesse `/configuracoes/integracoes`
- Clique em "Conectar" para o provider
- Configure credenciais

### Passo 3: Usar
```typescript
const integration = await getIntegrationAction(companyId, 'whatsapp')
// Usar integration.credential para chamar API
```

## 7. Stack Tecnológico

### Frontend
- **Next.js 16** — Framework React
- **React 19** — UI library
- **TypeScript** — Type safety
- **TailwindCSS 4** — Styling
- **shadcn/ui** — Componentes
- **Framer Motion** — Animações
- **Recharts** — Gráficos

### Backend
- **Next.js Server Actions** — RPC seguro
- **Prisma ORM** — Database layer
- **Zod** — Validação
- **Node.js** — Runtime

### Database
- **Supabase PostgreSQL** — Banco de dados
- **Prisma Client** — ORM

### Deployment
- **Vercel** — Hosting
- **GitHub** — Version control

## 8. Variáveis de Ambiente

Criar `.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_JWT_SECRET=...

# IA (Opcional)
OPENAI_API_KEY=...

# Outras integrações
WHATSAPP_API_KEY=...
GOOGLE_OAUTH_CLIENT_ID=...
```

## 9. Comandos Úteis

### Desenvolvimento
```bash
npm run dev              # Inicia dev server (localhost:3000)
npm run db:studio      # Abre Prisma Studio
npm run lint           # Verifica lint errors
npm run build          # Build para produção
npm run start          # Inicia servidor
```

### Database
```bash
npm run db:push        # Sincroniza schema
npx prisma migrate dev --name nome_migracao  # Cria migracao
```

## 10. Arquivos Importantes

### Documentação
- `README.md` — Visão geral do projeto
- `SPRINTS_19_24_CHECKLIST.md` — Checklist consolidado
- `SPRINTS_19_TO_24_COMPLETE_SUMMARY.md` — Resumo detalhado
- `SPRINT_24_ALUERP_AI.md` — Documentação do módulo AI

### Código-Fonte
- `prisma/schema.prisma` — Definição do banco
- `src/lib/db.ts` — Prisma client
- `src/lib/ai/` — Módulo de IA
- `src/actions/` — Server actions
- `components/` — Componentes React

## 11. Troubleshooting

### Erro: "Prisma Client not initialized"
```bash
npm install
npm run db:push
npm run dev
```

### Erro: "User not authenticated"
- Verificar se está dentro de rota protegida `(app)`
- Verificar se a session é válida
- Fazer logout e login novamente

### Erro: "Company not found"
- Verificar se `companyId` está correto
- Verificar se usuário tem acesso à empresa
- Verificar soft delete: `where: { id, companyId, deletedAt: null }`

### Performance lenta
- Verificar queries (Prisma Studio)
- Adicionar índices no banco
- Usar paginação em listas grandes
- Verificar cache

## 12. Próximos Passos

### Imediato
1. [ ] Executar `npm install`
2. [ ] Configurar variáveis de ambiente
3. [ ] Executar `npm run db:push`
4. [ ] Executar `npm run dev`
5. [ ] Testar autenticação

### Curto Prazo (1-2 semanas)
1. [ ] Adicionar usuários de teste
2. [ ] Testar todos os módulos
3. [ ] Configurar IA (opcional)
4. [ ] Teste de performance

### Deploy (4-8 semanas)
1. [ ] Setup Vercel (free tier)
2. [ ] Conectar GitHub
3. [ ] Deploy automático
4. [ ] Configurar domínio custom

## 13. Suporte

### Documentação
- Consulte `SPRINT_24_ALUERP_AI.md` para IA
- Consulte `SPRINT_22_INTEGRATIONS.md` para integrações
- Consulte `SPRINT_23_CLIENT_PORTAL.md` para portal cliente

### Comunidade
- GitHub Issues para bugs
- GitHub Discussions para perguntas

### Escalação
- Contato técnico para issues críticos

## 14. Segurança

### Best Practices
- Nunca comitar `.env.local`
- Usar HTTPOnly cookies
- Validar sempre no servidor
- Escapar output HTML
- Usar parameterized queries (Prisma)

### Senhas
- Min 8 caracteres
- Incluir maiúscula, minúscula, número, símbolo
- Hash com bcrypt (implementado)

### Multi-tenant
- Sempre filtrar por `companyId`
- Validar acesso antes de retornar dados
- Não confiar em dados do cliente

## 15. Performance Tips

### Frontend
- Usar `React.memo()` para componentes pesados
- Lazy load com `dynamic()`
- Usar `useCallback` para funções
- Minimizar re-renders

### Backend
- Usar índices no banco
- Selecionar apenas campos necessários
- Paginar grandes resultados
- Cachear dados estáticos

### Deploy
- Enable gzip compression
- Otimizar imagens
- Usar CDN para assets
- Monitor performance com Vercel Analytics

---

## 🚀 Pronto para Começar?

1. Clone o repositório
2. Instale dependências: `npm install`
3. Configure ambiente: `.env.local`
4. Rode dev: `npm run dev`
5. Visite http://localhost:3000

**Boa sorte! 🎉**

---

**Última atualização:** Julho 2026  
**Versão:** 1.0.0  
**Status:** Production Ready
