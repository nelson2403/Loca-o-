-- ============================================================================
-- SCHEMA COMPLETO — Sistema de Gestão de Locações
-- Gerado de supabase/migrations/*.sql (ordem preservada).
-- ============================================================================

-- >>> supabase/migrations/20260701000001_foundation.sql
-- ============================================================================
-- Fase 1 — Fundação do banco
-- Extensões, organizações (multitenancy-ready), perfis de usuário, enums,
-- funções auxiliares e trigger de updated_at.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Extensões
-- ----------------------------------------------------------------------------
create extension if not exists "pgcrypto"; -- gen_random_uuid()
create extension if not exists "citext";   -- e-mails/documentos case-insensitive

-- ----------------------------------------------------------------------------
-- Função utilitária: mantém `updated_at` sempre atualizado
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on function public.set_updated_at() is
  'Trigger BEFORE UPDATE: define updated_at = now() automaticamente.';

-- ----------------------------------------------------------------------------
-- Organizações (multitenancy futuro)
-- Hoje o sistema é single-tenant: existe UMA organização padrão. O modelo já
-- prevê `org_id` em todas as tabelas de domínio para permitir multi-empresa no
-- futuro sem reescrita (ver docs/DECISIONS.md).
-- ----------------------------------------------------------------------------
create table public.organizations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  document    text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.organizations is 'Empresas/organizações (tenant).';

create trigger trg_organizations_updated_at
  before update on public.organizations
  for each row execute function public.set_updated_at();

-- Organização padrão (UUID fixo e bem-conhecido) usada como default do org_id.
insert into public.organizations (id, name)
values ('00000000-0000-0000-0000-000000000001', 'Organização Padrão')
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- Perfis de usuário (1:1 com auth.users)
-- Vincula cada usuário autenticado a uma organização e a um papel de acesso.
-- ----------------------------------------------------------------------------
create type public.user_role as enum ('admin', 'operador', 'leitura');

create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  org_id      uuid not null references public.organizations(id)
                default '00000000-0000-0000-0000-000000000001',
  full_name   text,
  email       citext,
  role        public.user_role not null default 'admin',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.profiles is
  'Perfil do usuário: organização e papel de acesso. 1:1 com auth.users.';

create index idx_profiles_org_id on public.profiles (org_id);

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Cria automaticamente um profile quando um usuário se registra no Auth.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- Helpers de autorização (usados nas políticas RLS)
-- ----------------------------------------------------------------------------

-- Organização do usuário autenticado atual.
create or replace function public.auth_org_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select org_id from public.profiles where id = auth.uid();
$$;

comment on function public.auth_org_id() is
  'Retorna o org_id do usuário autenticado (base do isolamento por tenant).';

-- Papel do usuário autenticado atual.
create or replace function public.auth_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

comment on function public.auth_role() is
  'Retorna o papel (role) do usuário autenticado.';

-- ----------------------------------------------------------------------------
-- Enums de domínio
-- ----------------------------------------------------------------------------
create type public.pessoa_tipo   as enum ('pf', 'pj');
create type public.cliente_status as enum ('ativo', 'inativo', 'inadimplente');

create type public.imovel_tipo   as enum
  ('casa', 'apartamento', 'comercial', 'terreno', 'galpao', 'outro');
create type public.imovel_status as enum
  ('disponivel', 'locado', 'manutencao', 'inativo');

create type public.veiculo_status as enum
  ('disponivel', 'locado', 'manutencao', 'inativo');

create type public.contrato_tipo   as enum ('imovel', 'veiculo');
create type public.contrato_status as enum
  ('rascunho', 'ativo', 'encerrado', 'cancelado');
create type public.indice_reajuste as enum ('igpm', 'ipca', 'incc', 'nenhum');

create type public.parcela_status as enum
  ('pendente', 'pago', 'atrasado', 'cancelado', 'isento');
create type public.forma_pagamento as enum
  ('boleto', 'pix', 'dinheiro', 'transferencia', 'cartao', 'outro');

create type public.documento_entidade as enum
  ('cliente', 'imovel', 'veiculo', 'contrato', 'parcela');


-- >>> supabase/migrations/20260701000002_clientes.sql
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


-- >>> supabase/migrations/20260701000003_imoveis_veiculos.sql
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


-- >>> supabase/migrations/20260701000004_contratos_parcelas.sql
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


-- >>> supabase/migrations/20260701000005_documentos_auditoria.sql
-- ============================================================================
-- Fase 1 — Documentos (anexos) e Auditoria (histórico)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Documentos / anexos
-- Referência polimórfica a uma entidade (cliente, imóvel, veículo, contrato,
-- parcela). O arquivo em si fica no Supabase Storage; aqui guardamos os metadados.
-- ----------------------------------------------------------------------------
create table public.documentos (
  id             uuid primary key default gen_random_uuid(),
  org_id         uuid not null references public.organizations(id)
                   default '00000000-0000-0000-0000-000000000001',

  entidade       public.documento_entidade not null,
  entidade_id    uuid not null,

  nome           text not null,               -- nome amigável do arquivo
  storage_path   text not null,               -- caminho no bucket
  mime_type      text,
  tamanho_bytes  bigint,

  uploaded_by    uuid references public.profiles(id) on delete set null,
  created_at     timestamptz not null default now()
);

comment on table public.documentos is
  'Metadados de arquivos anexados (arquivo físico no Supabase Storage).';

create index idx_documentos_org_id   on public.documentos (org_id);
create index idx_documentos_entidade on public.documentos (entidade, entidade_id);

-- ----------------------------------------------------------------------------
-- Auditoria / histórico
-- Registro imutável de ações relevantes: quem, o quê, quando, de onde.
-- Preenchido pela aplicação (server-side) e por triggers específicas quando fizer
-- sentido. `dados` guarda o snapshot/diff em JSONB.
-- ----------------------------------------------------------------------------
create table public.audit_log (
  id           bigint generated always as identity primary key,
  org_id       uuid not null references public.organizations(id)
                 default '00000000-0000-0000-0000-000000000001',

  actor_id     uuid references public.profiles(id) on delete set null,
  actor_email  text,

  acao         text not null,                 -- ex.: 'contrato.criado'
  entidade     text,                          -- ex.: 'contrato'
  entidade_id  uuid,
  descricao    text,
  dados        jsonb,                          -- payload/diff
  ip           inet,
  user_agent   text,

  created_at   timestamptz not null default now()
);

comment on table public.audit_log is
  'Histórico imutável de ações (auditoria): usuário, ação, entidade, data/hora, IP.';

create index idx_audit_org_id     on public.audit_log (org_id, created_at desc);
create index idx_audit_entidade   on public.audit_log (entidade, entidade_id);
create index idx_audit_actor      on public.audit_log (actor_id);


-- >>> supabase/migrations/20260701000006_rls.sql
-- ============================================================================
-- Fase 1 — Row Level Security (RLS)
--
-- Modelo de acesso:
--  * Isolamento por organização: cada usuário só enxerga linhas do seu org_id
--    (função auth_org_id()). Preparado para multitenancy futuro.
--  * Papéis (role):
--      - admin    : tudo (inclui DELETE e gestão)
--      - operador : cria e edita (sem DELETE)
--      - leitura  : somente leitura
--  * A service_role (usada em webhooks/jobs no servidor) BYPASSA RLS por design.
-- ============================================================================

-- Helpers de papel ----------------------------------------------------------
create or replace function public.auth_can_write()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.auth_role() in ('admin', 'operador'), false);
$$;

create or replace function public.auth_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.auth_role() = 'admin', false);
$$;

-- ----------------------------------------------------------------------------
-- organizations
-- ----------------------------------------------------------------------------
alter table public.organizations enable row level security;

create policy organizations_select on public.organizations
  for select to authenticated
  using (id = public.auth_org_id());

create policy organizations_update on public.organizations
  for update to authenticated
  using (id = public.auth_org_id() and public.auth_is_admin())
  with check (id = public.auth_org_id());

-- ----------------------------------------------------------------------------
-- profiles
-- ----------------------------------------------------------------------------
alter table public.profiles enable row level security;

-- Vê o próprio perfil e os colegas da mesma organização.
create policy profiles_select on public.profiles
  for select to authenticated
  using (id = auth.uid() or org_id = public.auth_org_id());

-- Atualiza o próprio perfil; admin atualiza qualquer um da organização.
create policy profiles_update on public.profiles
  for update to authenticated
  using (id = auth.uid() or (org_id = public.auth_org_id() and public.auth_is_admin()))
  with check (org_id = public.auth_org_id());

-- ----------------------------------------------------------------------------
-- Macro para tabelas de domínio com o padrão org + papéis.
-- (Escrito de forma explícita por tabela para clareza e auditoria.)
-- ----------------------------------------------------------------------------

-- clientes -------------------------------------------------------------------
alter table public.clientes enable row level security;

create policy clientes_select on public.clientes
  for select to authenticated using (org_id = public.auth_org_id());
create policy clientes_insert on public.clientes
  for insert to authenticated
  with check (org_id = public.auth_org_id() and public.auth_can_write());
create policy clientes_update on public.clientes
  for update to authenticated
  using (org_id = public.auth_org_id() and public.auth_can_write())
  with check (org_id = public.auth_org_id());
create policy clientes_delete on public.clientes
  for delete to authenticated
  using (org_id = public.auth_org_id() and public.auth_is_admin());

-- imoveis --------------------------------------------------------------------
alter table public.imoveis enable row level security;

create policy imoveis_select on public.imoveis
  for select to authenticated using (org_id = public.auth_org_id());
create policy imoveis_insert on public.imoveis
  for insert to authenticated
  with check (org_id = public.auth_org_id() and public.auth_can_write());
create policy imoveis_update on public.imoveis
  for update to authenticated
  using (org_id = public.auth_org_id() and public.auth_can_write())
  with check (org_id = public.auth_org_id());
create policy imoveis_delete on public.imoveis
  for delete to authenticated
  using (org_id = public.auth_org_id() and public.auth_is_admin());

-- veiculos -------------------------------------------------------------------
alter table public.veiculos enable row level security;

create policy veiculos_select on public.veiculos
  for select to authenticated using (org_id = public.auth_org_id());
create policy veiculos_insert on public.veiculos
  for insert to authenticated
  with check (org_id = public.auth_org_id() and public.auth_can_write());
create policy veiculos_update on public.veiculos
  for update to authenticated
  using (org_id = public.auth_org_id() and public.auth_can_write())
  with check (org_id = public.auth_org_id());
create policy veiculos_delete on public.veiculos
  for delete to authenticated
  using (org_id = public.auth_org_id() and public.auth_is_admin());

-- contratos ------------------------------------------------------------------
alter table public.contratos enable row level security;

create policy contratos_select on public.contratos
  for select to authenticated using (org_id = public.auth_org_id());
create policy contratos_insert on public.contratos
  for insert to authenticated
  with check (org_id = public.auth_org_id() and public.auth_can_write());
create policy contratos_update on public.contratos
  for update to authenticated
  using (org_id = public.auth_org_id() and public.auth_can_write())
  with check (org_id = public.auth_org_id());
create policy contratos_delete on public.contratos
  for delete to authenticated
  using (org_id = public.auth_org_id() and public.auth_is_admin());

-- parcelas -------------------------------------------------------------------
alter table public.parcelas enable row level security;

create policy parcelas_select on public.parcelas
  for select to authenticated using (org_id = public.auth_org_id());
create policy parcelas_insert on public.parcelas
  for insert to authenticated
  with check (org_id = public.auth_org_id() and public.auth_can_write());
create policy parcelas_update on public.parcelas
  for update to authenticated
  using (org_id = public.auth_org_id() and public.auth_can_write())
  with check (org_id = public.auth_org_id());
create policy parcelas_delete on public.parcelas
  for delete to authenticated
  using (org_id = public.auth_org_id() and public.auth_is_admin());

-- documentos -----------------------------------------------------------------
alter table public.documentos enable row level security;

create policy documentos_select on public.documentos
  for select to authenticated using (org_id = public.auth_org_id());
create policy documentos_insert on public.documentos
  for insert to authenticated
  with check (org_id = public.auth_org_id() and public.auth_can_write());
create policy documentos_delete on public.documentos
  for delete to authenticated
  using (org_id = public.auth_org_id() and public.auth_can_write());

-- audit_log (imutável para o cliente: só leitura; escrita via service_role) ---
alter table public.audit_log enable row level security;

create policy audit_select on public.audit_log
  for select to authenticated using (org_id = public.auth_org_id());


-- >>> supabase/migrations/20260701000007_storage.sql
-- ============================================================================
-- Fase 1 — Supabase Storage
--
-- Bucket privado único `arquivos` para todos os anexos (documentos de clientes,
-- fotos de imóveis/veículos, PDFs de contratos, comprovantes).
--
-- Convenção de caminho (organiza por org e por entidade):
--   {org_id}/{entidade}/{entidade_id}/{arquivo}
--   ex.: 000...001/cliente/<uuid>/rg.pdf
--
-- Acesso é privado: a aplicação gera URLs assinadas quando precisa exibir.
-- As políticas garantem que cada usuário só acessa arquivos do seu org_id.
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('arquivos', 'arquivos', false)
on conflict (id) do nothing;

-- Leitura: apenas arquivos da própria organização.
create policy "arquivos_select_own_org"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'arquivos'
    and (storage.foldername(name))[1] = public.auth_org_id()::text
  );

-- Upload: usuários com permissão de escrita, dentro da própria organização.
create policy "arquivos_insert_own_org"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'arquivos'
    and (storage.foldername(name))[1] = public.auth_org_id()::text
    and public.auth_can_write()
  );

-- Atualização (ex.: substituir arquivo).
create policy "arquivos_update_own_org"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'arquivos'
    and (storage.foldername(name))[1] = public.auth_org_id()::text
    and public.auth_can_write()
  );

-- Remoção.
create policy "arquivos_delete_own_org"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'arquivos'
    and (storage.foldername(name))[1] = public.auth_org_id()::text
    and public.auth_can_write()
  );


-- >>> supabase/migrations/20260701000008_mensagens_config_webhooks.sql
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

