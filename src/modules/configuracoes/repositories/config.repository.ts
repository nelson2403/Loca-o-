import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Tables, TablesUpdate } from "@/types/database.types";

export type Configuracoes = Tables<"configuracoes">;

const DEFAULT_ORG = "00000000-0000-0000-0000-000000000001";

/** Lê a configuração da organização (cria a linha padrão se não existir). */
export async function getConfiguracoes(): Promise<Configuracoes | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("configuracoes")
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateConfiguracoes(
  orgId: string,
  values: TablesUpdate<"configuracoes">,
): Promise<Configuracoes> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("configuracoes")
    .upsert({ org_id: orgId || DEFAULT_ORG, ...values })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}
