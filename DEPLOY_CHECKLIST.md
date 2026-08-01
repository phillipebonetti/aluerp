# 🚀 DEPLOY CHECKLIST - SPRINT GO LIVE 1A

## PRÉ-DEPLOYMENT

### 1. Verificações de Código
- [ ] Todos os arquivos criados (.tsx, .ts sem erros de sintaxe)
- [ ] Imports corrigidos (@/src/lib/, @/src/types/)
- [ ] TypeScript sem erros (npm run build)
- [ ] ESLint passou (npm run lint)
- [ ] Prisma schema válido (npx prisma validate)

### 2. Instalação de Dependências
```bash
npm install react-hook-form @hookform/resolvers --legacy-peer-deps
```
- [ ] Instalação completou sem erros
- [ ] node_modules atualizado
- [ ] package-lock.json atualizado

### 3. Database Migration
```bash
npx prisma migrate dev --name add_os_models
```
- [ ] Migration criada
- [ ] SQL revisado para segurança
- [ ] Dados existentes não afetados
- [ ] Rollback plan testado

### 4. Build & Compile
```bash
npm run build
```
- [ ] Build completa sem erros
- [ ] Tamanho do bundle aceitável
- [ ] Output em `.next/` válido

### 5. Testes Locais
```bash
npm run dev
```
- [ ] Página de listagem carrega (localhost:3000/os)
- [ ] Botão "Nova OS" funciona
- [ ] Formulário renderiza
- [ ] Tabela mostra dados
- [ ] Navegação entre abas funciona
- [ ] Botões de ação funcionam

---

## STAGING DEPLOYMENT

### 1. Deploy para Staging
```bash
vercel --scope team_8uMvAdNi6nKEMXNsahLeXbFm
```
- [ ] Deploy completou
- [ ] URL de staging acessível
- [ ] Migrations rodaram no DB staging

### 2. Testes em Staging
- [ ] Criar nova OS funciona
- [ ] Editar OS funciona
- [ ] Deletar OS funciona
- [ ] Listar com filtros funciona
- [ ] Abas carregam dados
- [ ] Performance aceitável (< 2s)

### 3. Verificações de Segurança
- [ ] HTTPS ativo
- [ ] SQL injection testada (safe - Prisma)
- [ ] XSS testada (safe - React)
- [ ] CSRF tokens presentes
- [ ] Rate limiting ativo

### 4. Verificações de Performance
- [ ] Core Web Vitals medidos
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] Database queries otimizadas

---

## PRODUCTION DEPLOYMENT

### 1. Deploy para Produção
```bash
vercel --scope team_8uMvAdNi6nKEMXNsahLeXbFm --prod
```
- [ ] Deploy completou
- [ ] URL de produção acessível
- [ ] Migrations rodaram no DB produção

### 2. Smoke Tests em Produção
- [ ] Página de listagem carrega
- [ ] Criar OS funciona
- [ ] Dados salvam no DB
- [ ] Abas carregam
- [ ] Não há 500 errors

### 3. Monitoramento
- [ ] Sentry/Logs monitorados
- [ ] Database performance normal
- [ ] Sem memory leaks
- [ ] Sem N+1 queries

### 4. Notificações
- [ ] Slack notificado
- [ ] Clientes notificados
- [ ] Documentação atualizada

---

## PÓS-DEPLOYMENT

### 1. Validação com Cliente
- [ ] Demo com cliente (Aleeds)
- [ ] Feedback coletado
- [ ] Issues registradas se houver

### 2. Monitoramento (24h)
- [ ] Nenhum erro crítico
- [ ] Performance mantida
- [ ] Uptime 100%

### 3. Documentação
- [ ] README atualizado
- [ ] Runbook criado
- [ ] Hotline ativa

### 4. Rollback Plan (Se Necessário)
```bash
# Voltar para versão anterior
vercel --scope team_8uMvAdNi6nKEMXNsahLeXbFm --prod --version=[anterior]

# Rollback DB
npx prisma migrate resolve --rolled-back add_os_models
```

---

## PROBLEMAS COMUNS & SOLUÇÕES

### Build falha
**Problema**: `Cannot find module`
**Solução**: 
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Migrations falham
**Problema**: `Error in migration`
**Solução**:
```bash
npx prisma migrate status
npx prisma migrate resolve --rolled-back [migration-name]
npx prisma migrate deploy
```

### TypeScript errors
**Problema**: `Type 'undefined' is not assignable`
**Solução**: Verificar imports em `@/src/lib/` vs `@/lib/`

### Performance ruim
**Problema**: Queries lentas
**Solução**:
```bash
npx prisma studio  # Inspecionar dados
# Verificar índices em prisma/schema.prisma
```

---

## ROLLBACK PROCEDURE

Se precisar reverter:

### 1. Reverter Código
```bash
git revert <commit-hash>
git push
```

### 2. Reverter Database
```bash
npx prisma migrate resolve --rolled-back add_os_models
npx prisma migrate deploy
```

### 3. Redeploy
```bash
vercel --scope team_8uMvAdNi6nKEMXNsahLeXbFm --prod
```

### 4. Verificar
```bash
# Confirmar que site volta ao estado anterior
curl https://seu-dominio.com/os
```

---

## APROVAÇÃO

- [ ] Product Manager: _______________
- [ ] Lead Developer: _______________
- [ ] DevOps: _______________
- [ ] QA: _______________

**Data Deploy**: _______________
**Versão**: _______________
**Commit**: _______________

