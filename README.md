# Sistema de Gestão de Locações

SaaS privado para gestão completa de **locações de imóveis e veículos**: cadastro
de clientes/imóveis/veículos, contratos, geração automática de carnês, cobranças
(boleto/PIX) via **ASAAS**, envio automático por **WhatsApp** (Evolution API),
automações de cobrança e um dashboard financeiro completo.

> Uso interno de uma única empresa. A arquitetura é preparada para
> **multitenancy futuro** (ver [docs/DECISIONS.md](docs/DECISIONS.md)) sem
> necessidade de reescrita.

---

## Stack

| Camada        | Tecnologia                                                        |
| ------------- | ----------------------------------------------------------------- |
| Frontend      | Next.js 15 (App Router), React 19, TypeScript                     |
| Estilo/UI     | Tailwind CSS v4, shadcn/ui (radix)                                 |
| Formulários   | React Hook Form + Zod                                              |
| Dados (client)| TanStack Query                                                    |
| Backend       | Next.js (Server Actions + Route Handlers)                         |
| Banco/Auth    | Supabase (PostgreSQL, Auth, Storage, RLS)                         |
| Pagamentos    | ASAAS (boleto, PIX, webhooks)                                     |
| WhatsApp      | Evolution API                                                    |
| Automações    | Vercel Cron                                                       |
| Deploy        | Vercel                                                            |

---

## Pré-requisitos

- **Node.js** ≥ 20 (recomendado 22+)
- **npm** ≥ 10
- Conta **Supabase** (para banco/auth/storage)
- (Opcional na fase inicial) Conta **ASAAS** e instância **Evolution API**

---

## Instalação

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env.local
# edite .env.local com suas credenciais (veja seção abaixo)

# 3. Rodar em desenvolvimento
npm run dev
```

A aplicação sobe em <http://localhost:3000>. A raiz redireciona para
`/dashboard`; sem sessão você é levado ao `/login`.

> **Sem credenciais Supabase ainda?** O projeto sobe com os placeholders do
> `.env.local`, mas o login só funciona após configurar um projeto Supabase real
> e criar um usuário.

---

## Variáveis de ambiente

Todas as variáveis são **validadas na inicialização** por
[`src/lib/env.ts`](src/lib/env.ts) (Zod). Se algo estiver ausente/ inválido, o
servidor falha com uma mensagem clara. Consulte
[`.env.example`](.env.example) para a lista completa e comentada.

| Variável                         | Escopo   | Obrigatória | Descrição                                   |
| -------------------------------- | -------- | ----------- | ------------------------------------------- |
| `NEXT_PUBLIC_APP_URL`            | público  | não\*       | URL base do app (default localhost).        |
| `NEXT_PUBLIC_SUPABASE_URL`       | público  | **sim**     | URL do projeto Supabase.                    |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`  | público  | **sim**     | Chave anônima (respeita RLS).               |
| `SUPABASE_SERVICE_ROLE_KEY`      | servidor | **sim**     | Chave de serviço (bypassa RLS).             |
| `ASAAS_BASE_URL`                 | servidor | não         | Base da API ASAAS (default sandbox).        |
| `ASAAS_API_KEY`                  | servidor | não\*\*     | Chave da API ASAAS.                         |
| `ASAAS_WEBHOOK_TOKEN`            | servidor | não\*\*     | Token de validação dos webhooks ASAAS.      |
| `EVOLUTION_API_URL`              | servidor | não\*\*     | URL da instância Evolution API.             |
| `EVOLUTION_API_KEY`              | servidor | não\*\*     | API key da Evolution API.                   |
| `EVOLUTION_INSTANCE`             | servidor | não\*\*     | Instância/sessão de WhatsApp.               |
| `CRON_SECRET`                    | servidor | não\*\*     | Segredo para proteger rotas de automação.   |

\* Tem default. \*\* Passa a ser obrigatória a partir da fase que a utiliza.

---

## Scripts

```bash
npm run dev        # desenvolvimento
npm run build      # build de produção
npm run start      # servir build de produção
npm run lint       # ESLint
npm run typecheck  # checagem de tipos (tsc --noEmit)
npm run db:types   # gerar tipos do Supabase local -> src/types/database.types.ts
```

---

## Estrutura do projeto

Ver [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) para o detalhamento das camadas
e convenções. Resumo:

```
src/
├── app/                 # Rotas (App Router)
│   ├── (app)/           # Área autenticada (shell: sidebar + topbar)
│   ├── (auth)/          # Login e fluxos de autenticação
│   └── auth/callback/   # Callback OAuth/magic link do Supabase
├── components/
│   ├── ui/              # Primitivos shadcn/ui
│   ├── layout/          # Sidebar, topbar, user nav
│   ├── providers/       # Theme, Query, Tooltip, Toaster
│   ├── shared/          # Componentes reutilizáveis (PageHeader, EmptyState…)
│   └── auth/            # Formulários de autenticação
├── modules/             # Módulos de domínio (feature-first)
│   └── <modulo>/{components,hooks,services,repositories,schemas,types}
├── lib/
│   ├── supabase/        # Clients: browser, server, admin, middleware
│   ├── query/           # Config do TanStack Query
│   ├── integrations/    # ASAAS, Evolution (Fases 5-6)
│   ├── env.ts           # Validação de env (Zod)
│   └── formatters.ts    # Moeda, datas, CPF/CNPJ, telefone
├── config/              # site.ts, navigation.ts
├── server/              # Helpers e Server Actions server-only
└── types/               # Tipos globais (database.types.ts gerado)
supabase/migrations/     # Migrations SQL (Fase 1+)
docs/                    # Arquitetura e decisões
```

---

## Roadmap (fases)

- [x] **Fase 0 — Fundação**: scaffold, Supabase clients, auth/middleware, shell, dark mode.
- [x] **Fase 1 — Banco**: modelagem, migrations, RLS, triggers, auditoria, tipos.
- [x] **Fase 2 — Cadastros**: Clientes, Imóveis, Veículos (CRUD + busca/filtro/paginação + auditoria). _Uploads de fotos/anexos via Storage: pendente._
- [x] **Fase 3 — Contratos**: contratos + geração automática de carnê/parcelas.
- [x] **Fase 4 — Importação de PDF**: extração + tela de conferência.
- [x] **Fase 5 — ASAAS**: cobranças, boletos, PIX, webhook. _Requer `ASAAS_API_KEY`._
- [x] **Fase 6 — Evolution API**: lembretes/cobranças/recibos por WhatsApp. _Requer `EVOLUTION_*`._
- [x] **Fase 7 — Automações (Vercel Cron) + Dashboard + Financeiro + Histórico + Configurações + Exportação CSV**.

> Após a Fase 2, uma nova migration foi adicionada
> (`20260701000008_...`). Aplique-a com `supabase/schema_delta_08.sql` (ou o
> `schema.sql` completo) antes de usar Mensagens/Configurações/Webhooks.

---

## Deploy (Vercel)

1. Importe o repositório na Vercel.
2. Configure as variáveis de ambiente (as mesmas do `.env.local`).
3. As automações usarão **Vercel Cron** (configuração na Fase 7).

Detalhes e checklist completo em [docs/DECISIONS.md](docs/DECISIONS.md).
