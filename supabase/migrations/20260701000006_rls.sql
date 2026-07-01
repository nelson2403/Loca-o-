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
