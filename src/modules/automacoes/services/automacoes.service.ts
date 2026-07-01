import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { enviarMensagemParcela } from "@/modules/mensagens/services/envio.service";

const DEFAULT_ORG = "00000000-0000-0000-0000-000000000001";

function addDays(days: number): string {
  return new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);
}

interface AutomacoesConfig {
  lembrete_dias_antes: number;
  cobranca_apos_dias: number;
  enviar_whatsapp: boolean;
}

async function getAutomacoesConfig(): Promise<AutomacoesConfig> {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("configuracoes")
    .select("automacoes")
    .eq("org_id", DEFAULT_ORG)
    .maybeSingle();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = (data?.automacoes as any) ?? {};
  return {
    lembrete_dias_antes: Number(a.lembrete_dias_antes ?? 3),
    cobranca_apos_dias: Number(a.cobranca_apos_dias ?? 1),
    enviar_whatsapp: Boolean(a.enviar_whatsapp ?? false),
  };
}

/** Marca como "atrasado" as parcelas pendentes já vencidas. */
export async function marcarAtrasadas(): Promise<{ atualizadas: number }> {
  const admin = createSupabaseAdminClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await admin
    .from("parcelas")
    .update({ status: "atrasado" })
    .eq("status", "pendente")
    .lt("vencimento", today)
    .select("id");
  if (error) throw error;
  return { atualizadas: data?.length ?? 0 };
}

/** Envia lembrete para parcelas que vencem em N dias. */
export async function enviarLembretes(): Promise<{
  enviados: number;
  erros: number;
}> {
  const config = await getAutomacoesConfig();
  if (!config.enviar_whatsapp) return { enviados: 0, erros: 0 };

  const admin = createSupabaseAdminClient();
  const alvo = addDays(config.lembrete_dias_antes);
  const { data } = await admin
    .from("parcelas")
    .select("id")
    .eq("status", "pendente")
    .eq("vencimento", alvo);

  let enviados = 0;
  let erros = 0;
  for (const p of data ?? []) {
    const r = await enviarMensagemParcela(p.id, "lembrete");
    if (r.success) enviados++;
    else erros++;
  }
  return { enviados, erros };
}

/** Envia cobrança para parcelas vencidas há N dias. */
export async function enviarCobrancas(): Promise<{
  enviados: number;
  erros: number;
}> {
  const config = await getAutomacoesConfig();
  if (!config.enviar_whatsapp) return { enviados: 0, erros: 0 };

  const admin = createSupabaseAdminClient();
  const alvo = addDays(-config.cobranca_apos_dias);
  const { data } = await admin
    .from("parcelas")
    .select("id")
    .in("status", ["pendente", "atrasado"])
    .eq("vencimento", alvo);

  let enviados = 0;
  let erros = 0;
  for (const p of data ?? []) {
    const r = await enviarMensagemParcela(p.id, "cobranca_atraso");
    if (r.success) enviados++;
    else erros++;
  }
  return { enviados, erros };
}
