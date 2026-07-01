-- ============================================================================
-- Fase 1 — Imóveis e Veículos (bens locáveis)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Imóveis
-- ----------------------------------------------------------------------------
create table public.imoveis (
  id               uuid primary key default gen_random_uuid(),
  org_id           uuid not null references public.organizations(id)
                     default '00000000-0000-0000-0000-000000000001',

  codigo           text not null,             -- código interno
  tipo             public.imovel_tipo not null default 'casa',

  -- Endereço
  cep              text,
  logradouro       text,
  numero           text,
  complemento      text,
  bairro           text,
  cidade           text,
  estado           char(2),

  -- Valores (em reais)
  valor_aluguel    numeric(12,2) not null default 0 check (valor_aluguel >= 0),
  valor_condominio numeric(12,2) not null default 0 check (valor_condominio >= 0),
  valor_iptu       numeric(12,2) not null default 0 check (valor_iptu >= 0),

  descricao        text,
  observacoes      text,
  status           public.imovel_status not null default 'disponivel',

  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  constraint uq_imoveis_org_codigo unique (org_id, codigo)
);

comment on table public.imoveis is 'Imóveis disponíveis para locação.';

create index idx_imoveis_org_id  on public.imoveis (org_id);
create index idx_imoveis_status  on public.imoveis (org_id, status);
create index idx_imoveis_codigo  on public.imoveis (org_id, codigo);

create trigger trg_imoveis_updated_at
  before update on public.imoveis
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Veículos
-- ----------------------------------------------------------------------------
create table public.veiculos (
  id             uuid primary key default gen_random_uuid(),
  org_id         uuid not null references public.organizations(id)
                   default '00000000-0000-0000-0000-000000000001',

  marca          text not null,
  modelo         text not null,
  ano            int check (ano between 1900 and 2100),
  placa          text,
  renavam        text,
  chassi         text,
  cor            text,

  valor_aluguel  numeric(12,2) not null default 0 check (valor_aluguel >= 0),

  observacoes    text,
  status         public.veiculo_status not null default 'disponivel',

  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),

  constraint uq_veiculos_org_placa unique (org_id, placa)
);

comment on table public.veiculos is 'Veículos disponíveis para locação.';

create index idx_veiculos_org_id on public.veiculos (org_id);
create index idx_veiculos_status on public.veiculos (org_id, status);
create index idx_veiculos_placa  on public.veiculos (org_id, placa);

create trigger trg_veiculos_updated_at
  before update on public.veiculos
  for each row execute function public.set_updated_at();
