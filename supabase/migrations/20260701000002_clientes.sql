-- ============================================================================
-- Fase 1 — Clientes
-- ============================================================================

create table public.clientes (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null references public.organizations(id)
                    default '00000000-0000-0000-0000-000000000001',

  -- Identificação
  tipo            public.pessoa_tipo not null default 'pf',
  nome            text not null,
  documento       text,                       -- CPF ou CNPJ (somente dígitos)
  rg              text,
  data_nascimento date,

  -- Contato
  telefone        text,
  whatsapp        text,
  email           citext,

  -- Endereço
  cep             text,
  logradouro      text,
  numero          text,
  complemento     text,
  bairro          text,
  cidade          text,
  estado          char(2),

  -- Integração ASAAS (preenchido na Fase 5)
  asaas_customer_id text,

  observacoes     text,
  status          public.cliente_status not null default 'ativo',

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  -- Um mesmo documento não pode se repetir dentro da organização.
  constraint uq_clientes_org_documento unique (org_id, documento)
);

comment on table public.clientes is 'Clientes (pessoas físicas ou jurídicas).';
comment on column public.clientes.documento is 'CPF/CNPJ armazenado só com dígitos.';
comment on column public.clientes.asaas_customer_id is 'ID do cliente no ASAAS.';

create index idx_clientes_org_id     on public.clientes (org_id);
create index idx_clientes_status     on public.clientes (org_id, status);
create index idx_clientes_nome       on public.clientes (org_id, nome);
create index idx_clientes_documento  on public.clientes (org_id, documento);
-- Busca textual simples por nome (case-insensitive via trigram seria ideal;
-- mantemos índice btree em lower para prefixo).
create index idx_clientes_nome_lower on public.clientes (org_id, lower(nome));

create trigger trg_clientes_updated_at
  before update on public.clientes
  for each row execute function public.set_updated_at();
