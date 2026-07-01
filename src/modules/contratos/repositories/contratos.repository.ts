import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from "@/types/database.types";
import type { ContratosFilter } from "@/modules/contratos/schemas/contrato.schema";

export type Contrato = Tables<"contratos">;
export type Parcela = Tables<"parcelas">;

export interface ContratoListItem extends Contrato {
  cliente: { nome: string } | null;
  imovel: { codigo: string } | null;
  veiculo: { marca: string; modelo: string } | null;
}

const PAGE_SIZE = 10;

const RELATIONS =
  "*, cliente:clientes(nome), imovel:imoveis(codigo), veiculo:veiculos(marca, modelo)";

export interface PaginatedContratos {
  data: ContratoListItem[];
  count: number;
  page: number;
  totalPages: number;
}

export async function listContratos(
  filter: ContratosFilter,
): Promise<PaginatedContratos> {
  const supabase = await createSupabaseServerClient();
  const page = Math.max(1, filter.page);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("contratos")
    .select(RELATIONS, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filter.q && filter.q.trim() !== "") {
    query = query.ilike("numero", `%${filter.q.trim()}%`);
  }
  if (filter.status) query = query.eq("status", filter.status);
  if (filter.tipo) query = query.eq("tipo", filter.tipo);

  const { data, count, error } = await query.returns<ContratoListItem[]>();
  if (error) throw error;

  const total = count ?? 0;
  return {
    data: data ?? [],
    count: total,
    page,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export async function getContratoById(
  id: string,
): Promise<ContratoListItem | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("contratos")
    .select(RELATIONS)
    .eq("id", id)
    .maybeSingle<ContratoListItem>();
  if (error) throw error;
  return data;
}

export async function getParcelasByContrato(
  contratoId: string,
): Promise<Parcela[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("parcelas")
    .select("*")
    .eq("contrato_id", contratoId)
    .order("numero", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function insertContrato(
  values: TablesInsert<"contratos">,
): Promise<Contrato> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("contratos")
    .insert(values)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function insertParcelas(
  rows: TablesInsert<"parcelas">[],
): Promise<void> {
  if (rows.length === 0) return;
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("parcelas").insert(rows);
  if (error) throw error;
}

export async function updateContratoRow(
  id: string,
  values: TablesUpdate<"contratos">,
): Promise<Contrato> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("contratos")
    .update(values)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteContratoRow(id: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("contratos").delete().eq("id", id);
  if (error) throw error;
}
