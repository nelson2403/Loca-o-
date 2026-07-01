"use server";

import { revalidatePath } from "next/cache";

import { requireAuth } from "@/server/auth";
import { recordAudit } from "@/server/audit";
import { enviarMensagemParcela } from "@/modules/mensagens/services/envio.service";
import type { TemplateKey } from "@/lib/integrations/evolution/templates";

export interface ActionResult {
  success: boolean;
  error?: string;
}

function canWrite(role: string): boolean {
  return role === "admin" || role === "operador";
}

export async function enviarMensagemParcelaAction(
  parcelaId: string,
  templateKey: TemplateKey,
): Promise<ActionResult> {
  const ctx = await requireAuth();
  if (!canWrite(ctx.profile.role)) {
    return { success: false, error: "Sem permissão." };
  }

  const result = await enviarMensagemParcela(parcelaId, templateKey);

  if (result.success) {
    await recordAudit(ctx, {
      acao: "mensagem.enviada",
      entidade: "parcela",
      entidadeId: parcelaId,
      descricao: `WhatsApp (${templateKey}) enviado.`,
    });
    revalidatePath("/mensagens");
  }

  return { success: result.success, error: result.error };
}
