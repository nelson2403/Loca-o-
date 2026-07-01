import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from "@/types/database.types";
import type { ClientesFilter } from "@/modules/clientes/schemas/cliente.schema";

export type Cliente = Tables<"clientes">;

const PAGE_SIZE = 10;

export interface PaginatedClientes {
  data: Cliente[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Lista clientes com busca, filtro de status, ordenação e paginação.
 * A RLS garante o escopo por organização — não precisamos filtrar org_id aqui.
 */
export async function listClientes(
  filter: ClientesFilter,
): Promise<PaginatedClientes> {
  const supabase = await createSupabaseServerClient();
  const page = Math.max(1, filter.page);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("clientes")
    .select("*", { count: "exact" })
    .order(filter.sort, { ascending: filter.order === "asc" })
    .range(from, to);

  if (filter.q && filter.q.trim() !== "") {
    const term = `%${filter.q.trim()}%`;
    // Busca por nome, documento ou e-mail.
    query = query.or(
      `nome.ilike.${term},documento.ilike.${term},email.ilike.${term}`,
    );
  }

  if (filter.status) {
    query = query.eq("status", filter.status);
  }

  const { data, count, error } = await query;
  if (error) throw error;

  const total = count ?? 0;
  return {
    data: data ?? [],
    count: total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

/** Opções para seletores (id + nome), ordenadas por nome. */
export async function getClienteOptions(): Promise<
  { value: string; label: string }[]
> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("clientes")
    .select("id, nome")
    .order("nome", { ascending: true })
    .limit(1000);
  if (error) throw error;
  return (data ?? []).map((c) => ({ value: c.id, label: c.nome }));
}

export async function getClienteById(id: string): Promise<Cliente | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function insertCliente(
  values: TablesInsert<"clientes">,
): Promise<Cliente> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("clientes")
    .insert(values)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function updateClienteRow(
  id: string,
  values: TablesUpdate<"clientes">,
): Promise<Cliente> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("clientes")
    .update(values)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteClienteRow(id: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("clientes").delete().eq("id", id);
  if (error) throw error;
}
