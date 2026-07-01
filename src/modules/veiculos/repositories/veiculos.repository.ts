import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from "@/types/database.types";
import type { VeiculosFilter } from "@/modules/veiculos/schemas/veiculo.schema";

export type Veiculo = Tables<"veiculos">;

const PAGE_SIZE = 10;

export interface PaginatedVeiculos {
  data: Veiculo[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function listVeiculos(
  filter: VeiculosFilter,
): Promise<PaginatedVeiculos> {
  const supabase = await createSupabaseServerClient();
  const page = Math.max(1, filter.page);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("veiculos")
    .select("*", { count: "exact" })
    .order(filter.sort, { ascending: filter.order === "asc" })
    .range(from, to);

  if (filter.q && filter.q.trim() !== "") {
    const term = `%${filter.q.trim()}%`;
    query = query.or(
      `marca.ilike.${term},modelo.ilike.${term},placa.ilike.${term}`,
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

export async function getVeiculoOptions(): Promise<
  { value: string; label: string }[]
> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("veiculos")
    .select("id, marca, modelo, placa")
    .order("marca", { ascending: true })
    .limit(1000);
  if (error) throw error;
  return (data ?? []).map((v) => ({
    value: v.id,
    label: `${v.marca} ${v.modelo}${v.placa ? ` (${v.placa})` : ""}`,
  }));
}

export async function getVeiculoById(id: string): Promise<Veiculo | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("veiculos")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function insertVeiculo(
  values: TablesInsert<"veiculos">,
): Promise<Veiculo> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("veiculos")
    .insert(values)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function updateVeiculoRow(
  id: string,
  values: TablesUpdate<"veiculos">,
): Promise<Veiculo> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("veiculos")
    .update(values)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteVeiculoRow(id: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("veiculos").delete().eq("id", id);
  if (error) throw error;
}
