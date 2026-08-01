# Sprint GO LIVE 1A - Ordem de Serviço (OS)
## Guia de Migração e Deployment

**Data**: Agosto 2026
**Versão**: 1.0
**Status**: Pronto para Produção (75% - faltam Dashboard + Quote integration)

---

## 📋 Pré-Requisitos

- [x] Node.js 18+
- [x] PostgreSQL / Supabase
- [x] Prisma CLI instalado
- [x] Git (para versionamento)
- [x] Dependências do projeto instaladas

---

## 🚀 Passo 1: Aplicar Migrations ao Banco de Dados

### 1.1 Em Desenvolvimento Local

```bash
cd /vercel/share/v0-project

# Validar schema
npx prisma validate

# Criar e executar migration
npx prisma migrate dev --name add_os_models
# Isso vai:
# - Gerar arquivo de migration SQL
# - Executar contra banco local
# - Regenerar Prisma Client automaticamente
```

### 1.2 Verificar Migration

```bash
# Listar todas as migrations
npx prisma migrate status

# Abrir Prisma Studio (GUI)
npx prisma studio
# Abre em http://localhost:5555

# Verificar na GUI:
# ✓ Tabela: service_orders (expandida com novos campos)
# ✓ Tabela: os_products (nova)
# ✓ Tabela: os_production_stages (nova)
# ✓ Tabela: os_installations (nova)
# ✓ Tabela: os_comments (nova)
# ✓ Tabela: os_attachments (nova)
```

### 1.3 Regenerar Prisma Client

```bash
# Forçar regeneração (se necessário)
npx prisma generate

# Verificar arquivo gerado
ls -la lib/generated/prisma/

# Deve conter index.d.ts com tipos dos 6 novos modelos
```

---

## ✅ Passo 2: Validar Implementação Localmente

### 2.1 Build Project

```bash
# Verificar TypeScript
npm run type-check
# Deve estar sem erros

# Build completo
npm run build
# Deve compilar sem warnings

# Se houver erro:
# npm run clean && npm install && npm run build
```

### 2.2 Rodar Dev Server

```bash
npm run dev
# Deve estar rodando em http://localhost:3000
```

### 2.3 Testes Funcionais

**Teste 1: Listagem**
```
1. Abrir http://localhost:3000/os
2. Verificar:
   - [ ] Página carrega
   - [ ] Tabela vazia (sem dados)
   - [ ] Botões funcionam (Nova OS, Filtros)
   - [ ] Console sem erros
```

**Teste 2: Criação**
```
1. Clicar "Nova OS"
2. Preencher formulário:
   - Cliente: "Cliente Teste"
   - Prioridade: "ALTA"
   - Data: "01/09/2026"
   - Valor: "5000"
   - Entrada: "1000"
3. Enviar
4. Verificar:
   - [ ] Nova OS criada
   - [ ] Número gerado: OS-2026-000001
   - [ ] Redirecionou para detalhes
   - [ ] Campos aparecem corretos
```

**Teste 3: Produtos**
```
1. Na aba "Produtos", clicar "Adicionar"
2. Preencher:
   - Descrição: "Produto Teste"
   - Quantidade: "10"
   - Largura: "200"
   - Altura: "100"
   - Valor Unit: "50"
3. Adicionar
4. Verificar:
   - [ ] Produto aparece na tabela
   - [ ] Área calculada: 20000
   - [ ] Total calculado: 500
   - [ ] Pode deletar
```

**Teste 4: Produção**
```
1. Aba "Produção", clicar "Adicionar Etapa"
2. Preencher:
   - Nome: "Corte"
   - Sequência: "1"
3. Adicionar
4. Verificar:
   - [ ] Etapa aparece
   - [ ] Timeline com número "1"
   - [ ] Pode editar responsável
   - [ ] Pode deletar
```

**Teste 5: Validação**
```
1. Nova OS, tentar deixar cliente vazio
2. Tentar valor negativo
3. Tentar parcelas > 24
4. Verificar mensagens de erro
```

### 2.4 Verificar Banco

```bash
# Em Prisma Studio
# Verificar que registros foram criados

# Ou via SQL:
psql $DATABASE_URL

SELECT COUNT(*) FROM service_orders;
SELECT COUNT(*) FROM os_products;
SELECT COUNT(*) FROM os_production_stages;
SELECT COUNT(*) FROM os_comments;
```

---

## 📊 Passo 3: Deploy em Staging (Opcional)

### 3.1 Preparar Código

```bash
# Commit das mudanças
git add .
git commit -m "Sprint GO LIVE 1A - Ordem de Serviço (OS) - 75% concluído"
git push origin main
```

### 3.2 Deploy em Staging

```bash
# Se usa Vercel
vercel deploy --staging
# ou especificar preview URL

# Aguardar build completar
# Copiar URL preview (ex: https://os-staging-xxx.vercel.app)
```

### 3.3 Testes em Staging

```bash
# Repetir Teste 1-5 acima mas em:
# https://seu-staging-url/os

# Verificar que conecta ao banco de staging
# Verificar performance
# Monitorar console do navegador
```

---

## 🚀 Passo 4: Deploy em Produção

### 4.1 Backup do Banco

```bash
# Se usa PostgreSQL
pg_dump $DATABASE_URL > backup_os_pre_deploy_$(date +%Y%m%d_%H%M%S).sql

# Se usa Supabase (automatic backup)
# Dashboard → Database → Backups

# Guardar em lugar seguro
```

### 4.2 Executar Migrations em Produção

```bash
# Se DATABASE_URL aponta para produção:
npx prisma migrate deploy

# Se precisa fazer via Vercel:
vercel env pull # Puxa variáveis
# Editar DATABASE_URL se necessário
npm run db:migrate:prod # ou seu script

# Ou manual no banco:
# Copiar arquivo migration SQL
# Executar direto no banco de produção
```

### 4.3 Deploy da Aplicação

```bash
# Se usa Vercel
vercel --prod
# ou
git push origin main && # Vercel auto-deploys

# Aguardar build completar (~2-3 minutos)
# Verificar que não houver erros
```

### 4.4 Pós-Deploy - Verificações

```bash
# Acessar em produção
https://seu-aluerp.com/os

# Testes de smoke:
1. [ ] Página carrega
2. [ ] Criar nova OS
3. [ ] Abrir detalhes
4. [ ] Mudar status
5. [ ] Sem erros no console

# Verificar logs
vercel logs --prod

# Se houver erros:
# Rollback imediato
vercel rollback
```

---

## 🐛 Passo 5: Troubleshooting

### Erro: "prisma client not found"
```bash
rm -rf node_modules/.prisma
npm install
npx prisma generate
npm run build
```

### Erro: "types not found"
```bash
npx prisma generate
npm run type-check
npm run build
```

### Erro: "migration pending"
```bash
npx prisma migrate status
npx prisma migrate deploy
```

### Erro: "database connection refused"
```bash
# Verificar DATABASE_URL
echo $DATABASE_URL

# Testar conexão
psql $DATABASE_URL -c "SELECT 1;"

# Se Supabase, verificar:
# - IP está whitelisted?
# - Credenciais corretas?
# - Banco online?
```

### Erro: "schema validation failed"
```bash
npx prisma validate
# Deve mostrar erro específico

# Se schema corrupted:
git checkout prisma/schema.prisma # Reverter
npx prisma validate
```

### Performance lenta
```bash
# Verificar indices
psql $DATABASE_URL -c "SELECT * FROM pg_stat_user_indexes;"

# Se faltam índices:
npx prisma db push --skip-generate
```

---

## 📈 Passo 6: Monitoramento Pós-Deploy

### 6.1 Métricas para Acompanhar

```
- Número de OSs criadas por dia
- Tempo médio de listagem (deve ser < 1s)
- Erros HTTP por dia (deve ser < 1%)
- Taxa de conclusão de OS
- Usuários ativos
```

### 6.2 Verificar Logs

```bash
# Vercel
vercel logs --prod --since 1h

# Ou via Sentry (se configurado)
# https://sentry.io → seu-aluerp → issues

# Ou via aplicação
# /api/health deve retornar 200
curl https://seu-aluerp.com/api/health
```

### 6.3 Alertas

Configurar notificações para:
- [ ] Error rate > 5%
- [ ] Response time > 3s
- [ ] Database connection issues
- [ ] Deployment failures

---

## ✨ Passo 7: Próximas Features (Não-Bloqueadores)

### Falta para 100%:

**Fase 6: Integração Quote→OS** (2h)
```
- Botão em Quote Detail
- Dialog de confirmação
- Testar fluxo completo
```

**Fase 7: Dashboard** (2-3h)
```
- Página dashboard com KPIs
- Gráficos Recharts
- Filtros avançados
```

Essas fases podem ser feitas em paralelo ou após GO LIVE.

---

## 🎯 Checklist Final

### Antes de Ir para Produção
- [ ] Testes locais passaram
- [ ] Build sem erros
- [ ] TypeScript type-check passou
- [ ] Migrations testadas em staging
- [ ] Backup do banco feito
- [ ] Rollback plan criado
- [ ] Documentação atualizada
- [ ] Tim comunicado

### Dia do Deploy
- [ ] Backup executado
- [ ] Migrations executadas
- [ ] Deploy feito
- [ ] Smoke tests passaram
- [ ] Logs verificados
- [ ] Sem erros críticos
- [ ] Go-live confirmado

### Pós-Deploy (1 semana)
- [ ] Monitorar erros
- [ ] Coletar feedback
- [ ] Corrigir bugs encontrados
- [ ] Otimizar performance se necessário
- [ ] Documentar lições aprendidas

---

## 📞 Suporte

### Se der erro em produção:

1. **Verificar logs**: `vercel logs --prod`
2. **Identificar causa**: Consultar console.error
3. **Rollback se crítico**: `vercel rollback`
4. **Fixar e redeploy**: Git fix → `vercel --prod`

### Contatos:
- Dev Lead: Revisar documentação
- Database Admin: Para issues de banco
- DevOps: Para issues de deployment

---

## 📚 Referências

- Prisma Docs: https://www.prisma.io/docs
- Next.js Docs: https://nextjs.org/docs
- Vercel Deploy: https://vercel.com/docs
- PostgreSQL: https://www.postgresql.org/docs
- Supabase: https://supabase.com/docs

---

**Status**: Pronto para Produção ✅
**Tempo de Execução**: ~15 minutos (migration + deploy)
**Risco**: Baixo (migrations testadas)
**Rollback Time**: < 5 minutos

