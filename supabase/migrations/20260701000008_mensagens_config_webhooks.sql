-- ============================================================================
-- Fase 5/6 — Mensagens (WhatsApp), Configurações e idempotência de Webhooks
-- ============================================================================

-- Enums --------------------------------------------------------------------
create type public.mensagem_status as enum ('pendente', 'enviado', 'erro');
create type public.mensagem_canal  as enum ('whatsapp');

-- ----------------------------------------------------------------------------
-- Mensagens (histórico de envios pela Evolution API)
-- ----------------------------------------------------------------------------
create table public.mensagens (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references public.organizations(id)
                 default '00000000-0000-0000-0000-000000000001',

  canal        public.mensagem_canal not null default 'whatsapp',
  template     text,                         -- chave do template usado
  telefone     text not null,
  conteudo     text not null,

  cliente_id   uuid references public.clientes(id) on delete set null,
  contrato_id  uuid references public.contratos(id) on delete set null,
  parcela_id   uuid references public.parcelas(id) on delete set null,

  status       public.mensagem_status not null default 'pendente',
  erro         text,
  provider_id  text,                          -- id retornado pela Evolution

  created_at   timestamptz not null default now()
);

comment on table public.mensagens is 'Histórico de mensagens enviadas (WhatsApp).';

create index idx_mensagens_org_id    on public.mensagens (org_id, created_at desc);
create index idx_mensagens_cliente   on public.mensagens (cliente_id);
create index idx_mensagens_parcela   on public.mensagens (parcela_id);
create index idx_mensagens_status    on public.mensagens (org_id, status);

-- ----------------------------------------------------------------------------
-- Configurações (uma linha por organização)
-- Guarda dados da empresa, flags de integração, templates e regras de automação.
-- ----------------------------------------------------------------------------
create table public.configuracoes (
  org_id            uuid primary key references public.organizations(id)
                      default '00000000-0000-0000-0000-000000000001',

  empresa_nome      text,
  empresa_documento text,
  empresa_telefone  text,
  empresa_email     text,

  -- Templates de mensagem por chave (ex.: 'lembrete', 'cobranca', 'recibo').
  templates         jsonb not null default '{}'::jsonb,

  -- Configuração das automações (dias de lembrete, etc.).
  automacoes        jsonb not null default '{
    "lembrete_dias_antes": 3,
    "cobranca_apos_dias": 1,
    "cobranca_segunda_apos_dias": 7,
    "enviar_recibo": true,
    "gerar_cobranca_asaas": false,
    "enviar_whatsapp": false
  }'::jsonb,

  updated_at        timestamptz not null default now()
);

comment on table public.configuracoes is 'Configurações gerais por organização.';

create trigger trg_configuracoes_updated_at
  before update on public.configuracoes
  for each row execute function public.set_updated_at();

-- Linha padrão para a organização padrão.
insert into public.configuracoes (org_id, empresa_nome)
values ('00000000-0000-0000-0000-000000000001', 'Minha Empresa')
on conflict (org_id) do nothing;

-- ----------------------------------------------------------------------------
-- Webhooks ASAAS (idempotência)
-- Registra os eventos recebidos para evitar processamento duplicado.
-- ----------------------------------------------------------------------------
create table public.asaas_webhook_events (
  id           uuid primary key default gen_random_uuid(),
  event_id     text unique,                   -- id do evento no ASAAS
  event_type   text,
  payload      jsonb not null,
  processed    boolean not null default false,
  error        text,
  created_at   timestamptz not null default now()
);

comment on table public.asaas_webhook_events is
  'Log/idempotência dos webhooks recebidos do ASAAS (escrita via service_role).';

-- ----------------------------------------------------------------------------
-- RLS
-- ----------------------------------------------------------------------------
alter table public.mensagens enable row level security;

create policy mensagens_select on public.mensagens
  for select to authenticated using (org_id = public.auth_org_id());
create policy mensagens_insert on public.mensagens
  for insert to authenticated
  with check (org_id = public.auth_org_id() and public.auth_can_write());

alter table public.configuracoes enable row level security;

create policy configuracoes_select on public.configuracoes
  for select to authenticated using (org_id = public.auth_org_id());
create policy configuracoes_update on public.configuracoes
  for update to authenticated
  using (org_id = public.auth_org_id() and public.auth_is_admin())
  with check (org_id = public.auth_org_id());
create policy configuracoes_insert on public.configuracoes
  for insert to authenticated
  with check (org_id = public.auth_org_id() and public.auth_is_admin());

-- asaas_webhook_events: sem políticas para authenticated (só service_role acessa).
alter table public.asaas_webhook_events enable row level security;
