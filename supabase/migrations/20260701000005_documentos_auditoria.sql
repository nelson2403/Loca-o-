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
