"use server";

import { revalidatePath } from "next/cache";

import { requireAuth } from "@/server/auth";
import { recordAudit } from "@/server/audit";
import { isAsaasConfigured } from "@/lib/integrations/asaas/client";
import {
  gerarCobranca,
  type BillingType,
} from "@/modules/financeiro/services/cobranca.service";

export interface ActionResult {
  success: boolean;
  error?: string;
}

function canWrite(role: string): boolean {
  return role === "admin" || role === "operador";
}

/** Gera cobrança (boleto/PIX) no ASAAS para uma parcela. */
export async function gerarCobrancaAction(
  parcelaId: string,
  billingType: BillingType,
): Promise<ActionResult> {
  const ctx = await requireAuth();
  if (!canWrite(ctx.profile.role)) {
    return { success: false, error: "Sem permissão." };
  }
  if (!isAsaasConfigured()) {
    return {
      success: false,
      error:
        "Integração ASAAS não configurada. Defina ASAAS_API_KEY no ambiente.",
    };
  }

  try {
    const result = await gerarCobranca(parcelaId, billingType);
    await recordAudit(ctx, {
      acao: "cobranca.gerada",
      entidade: "parcela",
      entidadeId: parcelaId,
      descricao: `Cobrança ${billingType} gerada no ASAAS.`,
      dados: { asaas_payment_id: result.asaasPaymentId },
    });
    revalidatePath("/financeiro");
    return { success: true };
  } catch (error) {
    console.error("[gerarCobrancaAction]", error);
    const message =
      error instanceof Error ? error.message : "Erro ao gerar cobrança.";
    return { success: false, error: message };
  }
}
