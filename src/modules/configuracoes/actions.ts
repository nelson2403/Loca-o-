"use server";

import { revalidatePath } from "next/cache";

import { requireAuth } from "@/server/auth";
import { recordAudit } from "@/server/audit";
import {
  configFormSchema,
  type ConfigFormValues,
} from "@/modules/configuracoes/schemas/config.schema";
import { updateConfiguracoes } from "@/modules/configuracoes/repositories/config.repository";
import { DEFAULT_TEMPLATES } from "@/lib/integrations/evolution/templates";
import type { Json } from "@/types/database.types";

export interface ActionResult {
  success: boolean;
  error?: string;
}

function nullable(v: string | undefined): string | null {
  const t = v?.trim();
  return t ? t : null;
}

export async function updateConfigAction(
  values: ConfigFormValues,
): Promise<ActionResult> {
  const ctx = await requireAuth();
  if (ctx.profile.role !== "admin") {
    return { success: false, error: "Apenas administradores." };
  }
  const parsed = configFormSchema.safeParse(values);
  if (!parsed.success) return { success: false, error: "Dados inválidos." };
  const v = parsed.data;

  const templates: Json = {
    lembrete: v.tpl_lembrete?.trim() || DEFAULT_TEMPLATES.lembrete,
    cobranca: v.tpl_cobranca?.trim() || DEFAULT_TEMPLATES.cobranca,
    cobranca_atraso:
      v.tpl_cobranca_atraso?.trim() || DEFAULT_TEMPLATES.cobranca_atraso,
    recibo: v.tpl_recibo?.trim() || DEFAULT_TEMPLATES.recibo,
  };

  const automacoes: Json = {
    lembrete_dias_antes: Number(v.lembrete_dias_antes),
    cobranca_apos_dias: Number(v.cobranca_apos_dias),
    enviar_whatsapp: v.enviar_whatsapp,
    gerar_cobranca_asaas: v.gerar_cobranca_asaas,
    enviar_recibo: v.enviar_recibo,
  };

  try {
    await updateConfiguracoes(ctx.profile.org_id, {
      empresa_nome: nullable(v.empresa_nome),
      empresa_documento: nullable(v.empresa_documento),
      empresa_telefone: nullable(v.empresa_telefone),
      empresa_email: nullable(v.empresa_email),
      templates,
      automacoes,
    });
    await recordAudit(ctx, {
      acao: "configuracoes.atualizadas",
      entidade: "configuracoes",
    });
    revalidatePath("/configuracoes");
    return { success: true };
  } catch (error) {
    console.error("[updateConfigAction]", error);
    return { success: false, error: "Erro ao salvar configurações." };
  }
}
