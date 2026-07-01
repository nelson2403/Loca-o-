# Decisões de Arquitetura (ADR resumido)

Registro das principais decisões técnicas e seus motivos. Formato leve inspirado
em ADRs.

## 1. Next.js 15 + App Router

**Decisão:** usar Next.js 15 (App Router), embora o `create-next-app` já ofereça
a v16.
**Motivo:** o requisito do projeto especifica a v15; ela é estável, amplamente
documentada e suportada pela Vercel. Server Actions e Route Handlers cobrem as
necessidades de backend sem um serviço separado.
**Consequência:** ao migrar para v16 no futuro, revisar breaking changes de
`next.config` e APIs de cache.

## 2. Tailwind CSS v4 + shadcn/ui (radix)

**Decisão:** Tailwind v4 (config via CSS `@theme`) e shadcn/ui com o pacote
unificado `radix-ui`.
**Motivo:** é o padrão atual do ecossistema; componentes ficam no nosso
repositório (copy-in), permitindo customização total sem lock-in.
**Consequência:** primitivos importam de `radix-ui` (namespace), ex.:
`import { Slot } from "radix-ui"`.

## 3. Supabase como backend

**Decisão:** PostgreSQL + Auth + Storage + RLS gerenciados pelo Supabase.
**Motivo:** entrega banco relacional robusto, autenticação, storage e segurança
a nível de linha (RLS) sem infra própria — ideal para uma empresa só, com custo
baixo e caminho de escala.
**Consequência:** segurança depende de RLS bem escrita (Fase 1). A
`service_role` só é usada server-side.

## 4. Três clients Supabase

**Decisão:** browser, server e admin separados (ver ARCHITECTURE.md).
**Motivo:** isolar contextos e evitar vazamento da `service_role` para o cliente
(`import "server-only"` no admin). Sessão via cookies com `@supabase/ssr`.

## 5. Validação de ambiente com Zod

**Decisão:** `src/lib/env.ts` valida todas as variáveis na carga do módulo.
**Motivo:** falhar cedo com mensagem clara em vez de erros obscuros em runtime.
Separa schema público (`NEXT_PUBLIC_*`) do de servidor.

## 6. TanStack Query para estado de servidor

**Decisão:** TanStack Query no cliente; Server Components para leitura inicial.
**Motivo:** cache, revalidação, estados de loading/erro padronizados e boa DX.
Server client singleton no browser preserva cache entre navegações.

## 7. React Hook Form + Zod nos formulários

**Decisão:** RHF + `zodResolver`.
**Motivo:** performance (uncontrolled), validação declarativa e a mesma fonte de
tipos (Zod) usada em toda a base.

## 8. Proteção de rotas no middleware

**Decisão:** `middleware.ts` faz refresh de sessão e bloqueia rotas privadas,
com allowlist de rotas públicas (`/login`, `/auth`, `/api/webhooks`).
**Motivo:** proteção centralizada e defense-in-depth; páginas server também
revalidam o usuário.

## 9. Automações via Vercel Cron

**Decisão:** jobs (cobrança mensal, lembretes, baixa) como Route Handlers
protegidos por `CRON_SECRET`, agendados pelo Vercel Cron.
**Motivo:** hospedagem escolhida é Vercel; mantém tudo no mesmo runtime e deploy,
sem depender de pg_cron/Edge Functions. Alternativa (Supabase pg_cron) fica
documentada caso haja migração de host.

## 10. Integrações isoladas (ASAAS, Evolution)

**Decisão:** clientes de integração em `src/lib/integrations/<provedor>`, atrás
de uma interface de serviço.
**Motivo:** trocar/simular provedores sem tocar nas regras de negócio; facilita
testes e o modo sandbox.

## Multitenancy

**Decisão:** hoje é single-tenant (uma empresa), mas o modelo de dados já
**reserva** uma coluna de organização (`org_id`) nas tabelas de domínio e as
políticas RLS são escritas para serem estendidas a escopo por organização.
**Motivo:** permitir evolução para multi-empresa **sem reescrita**: bastaria
popular `org_id`, ativar as políticas por organização e adicionar seleção de
tenant na sessão.
**Consequência:** um pequeno overhead de coluna/índice agora, em troca de
migração futura barata.

## Segurança (princípios adotados)

- **RLS obrigatória** em todas as tabelas de domínio (Fase 1).
- **Validação dupla:** Zod no cliente e no servidor (Server Actions).
- **Segredos server-only**; nunca expor `service_role`, chaves ASAAS/Evolution.
- **Webhooks autenticados** por token (`ASAAS_WEBHOOK_TOKEN`).
- **Auditoria**: histórico de ações com usuário, data/hora e IP (Fase 1).
- Proteção nativa contra SQL Injection (queries parametrizadas do Supabase) e
  XSS (escape do React). CSRF mitigado por SameSite cookies + Server Actions.
