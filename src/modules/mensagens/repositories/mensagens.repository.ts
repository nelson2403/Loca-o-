import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Tables, TablesInsert } from "@/types/database.types";

export type Mensagem = Tables<"mensagens">;

export interface MensagemListItem extends Mensagem {
  cliente: { nome: string } | null;
}

const PAGE_SIZE = 20;

export interface PaginatedMensagens {
  data: MensagemListItem[];
  count: number;
  page: number;
  totalPages: number;
}

export async function listMensagens(
  page: number,
): Promise<PaginatedMensagens> {
  const supabase = await createSupabaseServerClient();
  const current = Math.max(1, page);
  const from = (current - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, count, error } = await supabase
    .from("mensagens")
    .select("*, cliente:clientes(nome)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to)
    .returns<MensagemListItem[]>();
  if (error) throw error;

  const total = count ?? 0;
  return {
    data: data ?? [],
    count: total,
    page: current,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

/** Registra uma mensagem. Usa admin para permitir gravação em jobs/cron. */
export async function insertMensagem(
  values: TablesInsert<"mensagens">,
): Promise<Mensagem> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("mensagens")
    .insert(values)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}
