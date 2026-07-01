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
