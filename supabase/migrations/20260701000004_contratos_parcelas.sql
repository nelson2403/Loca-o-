-- ============================================================================
-- Fase 1 — Contratos e Parcelas (carnê)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Contratos
-- Um contrato liga um cliente a um imóvel OU a um veículo (exatamente um).
-- ----------------------------------------------------------------------------
create table public.contratos (
  id               uuid primary key default gen_random_uuid(),
  org_id           uuid not null references public.organizations(id)
                     default '00000000-0000-0000-0000-000000000001',

  numero           text,                       -- número/identificador do contrato
  tipo             public.contrato_tipo not null,

  cliente_id       uuid not null references public.clientes(id) on delete restrict,
  imovel_id        uuid references public.imoveis(id) on delete restrict,
  veiculo_id       uuid references public.veiculos(id) on delete restrict,

  -- Valores e condições
  valor            numeric(12,2) not null check (valor >= 0),
  data_inicio      date not null,
  data_fim         date not null,
  dia_vencimento   int not null check (dia_vencimento between 1 and 31),
  qtd_parcelas     int not null check (qtd_parcelas > 0),
  indice_reajuste  public.indice_reajuste not null default 'igpm',
  multa_percent    numeric(5,2) not null default 2   check (multa_percent >= 0),
  juros_mes_percent numeric(5,2) not null default 1  check (juros_mes_percent >= 0),

  observacoes      text,
  status           public.contrato_status not null default 'rascunho',

  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  -- Exatamente um dos alvos deve estar preenchido, coerente com `tipo`.
  constraint chk_contrato_alvo check (
    (tipo = 'imovel'  and imovel_id  is not null and veiculo_id is null) or
    (tipo = 'veiculo' and veiculo_id is not null and imovel_id  is null)
  ),
  constraint chk_contrato_datas check (data_fim >= data_inicio),
  constraint uq_contratos_org_numero unique (org_id, numero)
);

comment on table public.contratos is
  'Contratos de locação (imóvel ou veículo). Origem das parcelas do carnê.';

create index idx_contratos_org_id    on public.contratos (org_id);
create index idx_contratos_cliente   on public.contratos (cliente_id);
create index idx_contratos_imovel    on public.contratos (imovel_id);
create index idx_contratos_veiculo   on public.contratos (veiculo_id);
create index idx_contratos_status    on public.contratos (org_id, status);
create index idx_contratos_vigencia  on public.contratos (org_id, data_inicio, data_fim);

create trigger trg_contratos_updated_at
  before update on public.contratos
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Parcelas (cobranças que compõem o carnê)
-- Geradas a partir do contrato (Fase 3). Cada parcela pode gerar uma cobrança
-- no ASAAS (boleto/PIX) na Fase 5.
-- ----------------------------------------------------------------------------
create table public.parcelas (
  id               uuid primary key default gen_random_uuid(),
  org_id           uuid not null references public.organizations(id)
                     default '00000000-0000-0000-0000-000000000001',
  contrato_id      uuid not null references public.contratos(id) on delete cascade,

  numero           int not null check (numero > 0),   -- 1..qtd_parcelas
  valor            numeric(12,2) not null check (valor >= 0),
  vencimento       date not null,

  status           public.parcela_status not null default 'pendente',

  -- Pagamento
  valor_pago       numeric(12,2),
  data_pagamento   date,
  forma_pagamento  public.forma_pagamento,

  -- Dados de cobrança (ASAAS — preenchidos na Fase 5)
  asaas_payment_id text,
  nosso_numero     text,
  linha_digitavel  text,
  codigo_barras    text,
  pix_copia_cola   text,
  pix_qrcode       text,
  boleto_url       text,

  observacoes      text,

  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  constraint uq_parcelas_contrato_numero unique (contrato_id, numero)
);

comment on table public.parcelas is
  'Parcelas/cobranças do carnê geradas a partir de um contrato.';

create index idx_parcelas_org_id      on public.parcelas (org_id);
create index idx_parcelas_contrato    on public.parcelas (contrato_id);
create index idx_parcelas_status      on public.parcelas (org_id, status);
create index idx_parcelas_vencimento  on public.parcelas (org_id, vencimento);
create index idx_parcelas_asaas       on public.parcelas (asaas_payment_id);

create trigger trg_parcelas_updated_at
  before update on public.parcelas
  for each row execute function public.set_updated_at();
