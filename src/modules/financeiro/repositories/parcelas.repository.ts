import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Tables, TablesUpdate } from "@/types/database.types";
import type { FinanceiroFilter } from "@/modules/financeiro/schemas/financeiro.schema";

export type Parcela = Tables<"parcelas">;

export interface ParcelaListItem extends Parcela {
  contrato: {
    numero: string | null;
    cliente: { nome: string } | null;
  } | null;
}

const PAGE_SIZE = 15;

const RELATIONS = "*, contrato:contratos(numero, cliente:clientes(nome))";

export interface PaginatedParcelas {
  data: ParcelaListItem[];
  count: number;
  page: number;
  totalPages: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyFilters<Q extends { eq: any; gte: any; lte: any }>(
  query: Q,
  filter: FinanceiroFilter,
): Q {
  let q = query;
  if (filter.status) q = q.eq("status", filter.status);
  if (filter.from) q = q.gte("vencimento", filter.from);
  if (filter.to) q = q.lte("vencimento", filter.to);
  return q;
}

export async function listParcelas(
  filter: FinanceiroFilter,
): Promise<PaginatedParcelas> {
  const supabase = await createSupabaseServerClient();
  const page = Math.max(1, filter.page);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("parcelas")
    .select(RELATIONS, { count: "exact" })
    .order("vencimento", { ascending: true })
    .range(from, to);

  query = applyFilters(query, filter);

  const { data, count, error } = await query.returns<ParcelaListItem[]>();
  if (error) throw error;

  const total = count ?? 0;
  return {
    data: data ?? [],
    count: total,
    page,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export interface FinanceiroSummary {
  totalRecebido: number;
  totalPendente: number;
  totalAtrasado: number;
  countPago: number;
  countPendente: number;
  countAtrasado: number;
}

/**
 * Agrega totais por status. Considera "atrasado" as parcelas pendentes com
 * vencimento anterior a hoje (independente do status persistido).
 */
export async function getFinanceiroSummary(
  filter: FinanceiroFilter,
): Promise<FinanceiroSummary> {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("parcelas")
    .select("status, valor, valor_pago, vencimento");
  query = applyFilters(query, filter);
  const { data, error } = await query;
  if (error) throw error;

  const today = new Date().toISOString().slice(0, 10);
  const summary: FinanceiroSummary = {
    totalRecebido: 0,
    totalPendente: 0,
    totalAtrasado: 0,
    countPago: 0,
    countPendente: 0,
    countAtrasado: 0,
  };

  for (const p of data ?? []) {
    if (p.status === "pago") {
      summary.totalRecebido += p.valor_pago ?? p.valor;
      summary.countPago += 1;
    } else if (p.status === "pendente" || p.status === "atrasado") {
      const overdue = p.status === "atrasado" || p.vencimento < today;
      if (overdue) {
        summary.totalAtrasado += p.valor;
        summary.countAtrasado += 1;
      } else {
        summary.totalPendente += p.valor;
        summary.countPendente += 1;
      }
    }
  }
  return summary;
}

export async function getParcelaById(id: string): Promise<Parcela | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("parcelas")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateParcelaRow(
  id: string,
  values: TablesUpdate<"parcelas">,
): Promise<Parcela> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("parcelas")
    .update(values)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}
