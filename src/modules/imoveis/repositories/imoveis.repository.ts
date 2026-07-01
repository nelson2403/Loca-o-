import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from "@/types/database.types";
import type { ImoveisFilter } from "@/modules/imoveis/schemas/imovel.schema";

export type Imovel = Tables<"imoveis">;

const PAGE_SIZE = 10;

export interface PaginatedImoveis {
  data: Imovel[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function listImoveis(
  filter: ImoveisFilter,
): Promise<PaginatedImoveis> {
  const supabase = await createSupabaseServerClient();
  const page = Math.max(1, filter.page);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("imoveis")
    .select("*", { count: "exact" })
    .order(filter.sort, { ascending: filter.order === "asc" })
    .range(from, to);

  if (filter.q && filter.q.trim() !== "") {
    const term = `%${filter.q.trim()}%`;
    query = query.or(
      `codigo.ilike.${term},logradouro.ilike.${term},bairro.ilike.${term},cidade.ilike.${term}`,
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

export async function getImovelOptions(): Promise<
  { value: string; label: string }[]
> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("imoveis")
    .select("id, codigo, cidade")
    .order("codigo", { ascending: true })
    .limit(1000);
  if (error) throw error;
  return (data ?? []).map((i) => ({
    value: i.id,
    label: i.cidade ? `${i.codigo} — ${i.cidade}` : i.codigo,
  }));
}

export async function getImovelById(id: string): Promise<Imovel | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("imoveis")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function insertImovel(
  values: TablesInsert<"imoveis">,
): Promise<Imovel> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("imoveis")
    .insert(values)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function updateImovelRow(
  id: string,
  values: TablesUpdate<"imoveis">,
): Promise<Imovel> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("imoveis")
    .update(values)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteImovelRow(id: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("imoveis").delete().eq("id", id);
  if (error) throw error;
}
