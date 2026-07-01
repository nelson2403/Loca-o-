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
