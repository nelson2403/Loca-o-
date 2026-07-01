# Arquitetura

Este documento descreve a organização do código, as camadas e as convenções que
todo novo módulo deve seguir. O objetivo é manter o sistema **coeso, testável e
fácil de evoluir**, aplicando Clean Architecture e princípios SOLID de forma
pragmática (sem over-engineering).

## Princípios

1. **Feature-first (modular).** Cada domínio (`clientes`, `imoveis`,
   `veiculos`, `contratos`, `financeiro`, `dashboard`) vive isolado em
   `src/modules/<modulo>`. Um módulo não importa os internals de outro; a
   comunicação acontece por interfaces públicas (services) ou pelo banco.
2. **Separação de camadas.** UI → Hooks → Services → Repositories → Banco.
   Cada camada só conhece a de baixo.
3. **Dependências apontam para dentro.** Componentes dependem de abstrações
   (schemas/types/services), nunca o contrário.
4. **Server-only por padrão.** Acesso a segredos e à `service_role` só em
   código marcado com `import "server-only"`.

## Camadas de um módulo

```
src/modules/<modulo>/
├── components/     # UI específica do módulo (Client/Server Components)
├── hooks/          # Hooks de dados (TanStack Query) e de UI do módulo
├── services/       # Regras de negócio / orquestração (casos de uso)
├── repositories/   # Acesso a dados (Supabase). Único lugar que fala com o banco
├── schemas/        # Schemas Zod (validação + inferência de tipos)
└── types/          # Tipos/DTOs do domínio
```

### Responsabilidade de cada camada

| Camada           | Responsabilidade                                                       | Pode importar             |
| ---------------- | ---------------------------------------------------------------------- | ------------------------- |
| **components**   | Renderização, interação, estados de UI (loading/vazio/erro).           | hooks, schemas, ui, shared|
| **hooks**        | Buscar/mutar dados via services; expor estado para a UI (Query).       | services, schemas, types  |
| **services**     | Casos de uso e regras de negócio; orquestra repositórios e integrações.| repositories, integrations|
| **repositories** | CRUD e queries no Supabase; mapeia linhas ↔ entidades do domínio.       | lib/supabase, types       |
| **schemas**      | Validação (Zod) de input/output; fonte dos tipos via `z.infer`.        | zod                       |
| **types**        | Tipos de domínio/DTOs.                                                  | (nada)                    |

> **Regra de ouro:** apenas `repositories` conhecem o Supabase. Trocar o banco
> ou adicionar cache afeta uma única camada.

## Código compartilhado

- `src/components/ui` — primitivos shadcn/ui (não editar manualmente salvo
  necessidade; regerar via CLI quando possível).
- `src/components/shared` — componentes reutilizáveis entre módulos
  (`PageHeader`, `EmptyState`, `ThemeToggle`, futura `DataTable`).
- `src/components/layout` — shell da aplicação (sidebar, topbar, user nav).
- `src/components/providers` — providers globais (tema, Query, tooltip, toaster).
- `src/lib` — infraestrutura: `supabase/`, `query/`, `integrations/`, `env.ts`,
  `formatters.ts`, `utils.ts`.
- `src/config` — configuração declarativa (`site.ts`, `navigation.ts`).

## Fluxo de dados (exemplo típico)

```
Client Component
  └─ usa hook (useClientes)                 ← TanStack Query
        └─ chama service (clientesService)  ← regra de negócio
              └─ chama repository            ← Supabase (RLS aplicado)
                    └─ PostgreSQL
```

Para mutações a partir de formulários, preferimos **Server Actions** quando há
ganho (menos client JS, validação no servidor) e **Route Handlers** para
webhooks e integrações externas.

## Supabase: três clients

| Client   | Arquivo                      | Contexto                | RLS         |
| -------- | ---------------------------- | ----------------------- | ----------- |
| Browser  | `lib/supabase/client.ts`     | Client Components        | ✅ aplicado |
| Server   | `lib/supabase/server.ts`     | Server Components/Actions| ✅ aplicado |
| Admin    | `lib/supabase/admin.ts`      | Webhooks/jobs server-only| ⚠️ bypass  |

O `middleware.ts` (raiz) chama `lib/supabase/middleware.ts` para **refresh de
sessão** e **proteção de rotas** em toda requisição.

## Validação e tipos

- **Zod** é a fonte única de verdade para validação. Tipos são inferidos com
  `z.infer<typeof schema>` — evita divergência entre validação e tipagem.
- Os tipos do banco (`src/types/database.types.ts`) são **gerados** pelo
  Supabase (`npm run db:types`) e tornam os clients totalmente tipados.

## Convenções

- Arquivos pequenos e coesos — **nunca** componentes/serviços gigantes.
- Nomes de domínio em português (alinhado ao negócio); termos técnicos em inglês.
- Todo estado de UI cobre: **loading**, **vazio**, **erro** e **sucesso**.
- Toda ação relevante gera **histórico/auditoria** (Fase 1+).
- Sem soluções improvisadas: preferir a solução profissional e manutenível.

## Multitenancy (futuro)

Ver [DECISIONS.md](DECISIONS.md#multitenancy). Em resumo: todas as tabelas de
domínio nascem com `org_id`/`company_id` previsto no modelo, e as políticas RLS
são escritas de forma a serem estendidas para escopo por organização sem
reescrever a aplicação.
