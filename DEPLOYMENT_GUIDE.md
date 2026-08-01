# AluERP - Guia de Deployment em Produção

## 1. Preparação Pré-Deployment

### 1.1 Verificações Locais

```bash
# Instalar dependências
npm install
# ou
pnpm install

# Verificar tipos TypeScript
npm run type-check

# Executar testes
npm run test

# Build de produção
npm run build

# Verificar bundle
npm run analyze
```

### 1.2 Variáveis de Ambiente

Criar arquivo `.env.production` com:

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/aluerp

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx

# Auth
BETTER_AUTH_SECRET=<run: openssl rand -base64 32>

# Uploads
BLOB_READ_WRITE_TOKEN=xxxxx
BLOB_ENDPOINT=https://xxxxx.blob.vercel-storage.com

# Email (opcional)
SENDGRID_API_KEY=xxxxx
SENDGRID_FROM_EMAIL=noreply@aluerp.com.br

# Tracking (opcional)
NEXT_PUBLIC_ANALYTICS_ID=xxxxx
```

## 2. Setup Supabase

### 2.1 Criar Projeto

1. Ir para [supabase.com](https://supabase.com)
2. Criar novo projeto
3. Aguardar inicialização
4. Copiar credenciais (URL, ANON_KEY, SERVICE_ROLE_KEY)

### 2.2 Executar Migrations

```bash
# Sync do Prisma
npm run prisma:migrate:deploy

# Seed do banco (opcional)
npm run prisma:seed
```

### 2.3 Configurar RLS (Row Level Security)

```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
-- ... repetir para todas as tabelas

-- Criar políticas de acesso
CREATE POLICY "Users can view own company data"
ON public.companies
FOR SELECT
USING (id IN (
  SELECT company_id FROM public.users 
  WHERE id = auth.uid()
));
```

## 3. Deploy em Vercel

### 3.1 Preparar Repositório Git

```bash
# Adicionar ao git
git add .
git commit -m "AluERP Sprint 36-40 Complete System"
git push origin main
```

### 3.2 Conectar com Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### 3.3 Configurar Variáveis em Vercel

Na dashboard do Vercel:

1. Ir para Settings → Environment Variables
2. Adicionar todas as variáveis do arquivo `.env.production`
3. Marcar quais são "Preview", "Production", "Development"
4. Redeploy após adicionar variáveis

### 3.4 Configurar Domínio

Na dashboard do Vercel:

1. Ir para Settings → Domains
2. Adicionar domínio customizado
3. Configurar DNS records (CNAME)
4. Aguardar validação SSL (2-5 minutos)

## 4. Testes Pós-Deployment

### 4.1 Verificações Básicas

```bash
# Testar health check
curl https://seu-aluerp.com/api/health

# Testar autenticação
curl -X POST https://seu-aluerp.com/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Testar API
curl https://seu-aluerp.com/api/companies \
  -H "Authorization: Bearer TOKEN"
```

### 4.2 Verificações de Performance

1. Abrir [PageSpeed Insights](https://pagespeed.web.dev)
2. Colar URL: `https://seu-aluerp.com`
3. Verificar:
   - LCP < 2.5s
   - INP < 200ms
   - CLS < 0.1

### 4.3 Verificações de Segurança

1. Abrir [securityheaders.com](https://securityheaders.com)
2. Colar URL e verificar score
3. Verificar presença de:
   - HSTS headers
   - CSP headers
   - X-Frame-Options
   - X-Content-Type-Options

## 5. Monitoramento Contínuo

### 5.1 Configurar Sentry (opcional)

```bash
# Install
npm install @sentry/nextjs

# Configure
npx @sentry/wizard@latest -i nextjs
```

Variáveis:
```env
NEXT_PUBLIC_SENTRY_DSN=xxxxx
SENTRY_AUTH_TOKEN=xxxxx
```

### 5.2 Configurar Analytics

```bash
# Install
npm install @vercel/analytics @vercel/web-vitals

# Use em layout.tsx
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout() {
  return (
    <html>
      <body>
        {/* ... */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
```

### 5.3 Alertas

Configurar no Vercel:
- Email de falhas
- Slack notifications
- PagerDuty integration

## 6. Manutenção Pós-Deploy

### 6.1 Backup Regular

```bash
# Backup manual do banco
pg_dump postgresql://user:pass@host:5432/aluerp > backup.sql

# Restaurar se necessário
psql postgresql://user:pass@host:5432/aluerp < backup.sql
```

### 6.2 Atualizar Dependências

```bash
# Verificar outdated
npm outdated

# Atualizar
npm update

# Security audit
npm audit
npm audit fix
```

### 6.3 Monitorar Logs

```bash
# Ver logs do Vercel
vercel logs

# Seguir logs em tempo real
vercel logs --follow
```

## 7. Troubleshooting

### Erro: "DATABASE_URL not found"

Verificar:
- Variáveis em Vercel Settings
- Usar `NEXT_PUBLIC_` apenas para valores públicos
- Redeploy após adicionar variáveis

### Erro: "Connection timeout"

Verificar:
- IP do Vercel está whitelisted no firewall do banco?
- DATABASE_URL está correto?
- Banco está online?

### Erro: "SyntaxError: Unexpected token"

Verificar:
- TypeScript compilation: `npm run type-check`
- Prisma schema: `npx prisma validate`
- Next.js build: `npm run build`

### Erro de Autenticação

Verificar:
- BETTER_AUTH_SECRET está configurado?
- Cookies domain correto?
- CORS habilitado?

## 8. Escalabilidade

### Se tiver picos de tráfego

1. **Vercel Auto-scaling**: Automático em pro/enterprise
2. **Database**: Adicionar read replicas em Supabase
3. **Cache**: Habilitar Redis em Upstash
4. **CDN**: Habilitar em Vercel
5. **Rate Limiting**: Configurar middleware

### Limite de requisições

```typescript
// middleware.ts
import { rateLimit } from 'lib/rate-limit'

export async function middleware(request: NextRequest) {
  const ip = request.ip || 'unknown'
  const { success } = await rateLimit.check(ip)
  
  if (!success) {
    return new NextResponse('Too many requests', { status: 429 })
  }
}
```

## 9. Rollback

Se algo der errado:

```bash
# Ver deployments
vercel list

# Rollback para deployment anterior
vercel rollback

# Ou especificar deployment
vercel rollback <deployment-id>
```

## 10. Suporte & Documentação

- Documentação: `docs/` (neste repositório)
- API Docs: `https://seu-aluerp.com/api/docs`
- Status: `https://seu-aluerp.com/status`
- Suporte: `support@aluerp.com.br`

---

**Tempo estimado**: 30-60 minutos
**Dificuldade**: Intermediária
**Próximo passo**: Configurar usuários e começar testes funcionais
