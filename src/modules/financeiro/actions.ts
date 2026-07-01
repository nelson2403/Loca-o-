"use server";

import { revalidatePath } from "next/cache";

import { requireAuth } from "@/server/auth";
import { recordAudit } from "@/server/audit";
import {
  baixaFormSchema,
  type BaixaFormValues,
} from "@/modules/financeiro/schemas/financeiro.schema";
import {
  updateParcelaRow,
  getParcelaById,
} from "@/modules/financeiro/repositories/parcelas.repository";

export interface ActionResult {
  success: boolean;
  error?: string;
}

function canWrite(role: string): boolean {
  return role === "admin" || role === "operador";
}

/** Dá baixa em uma parcela (marca como paga). */
export async function baixarParcelaAction(
  id: string,
  values: BaixaFormValues,
): Promise<ActionResult> {
  const ctx = await requireAuth();
  if (!canWrite(ctx.profile.role)) {
    return { success: false, error: "Sem permissão." };
  }
  const parsed = baixaFormSchema.safeParse(values);
  if (!parsed.success) return { success: false, error: "Dados inválidos." };

  try {
    const parcela = await updateParcelaRow(id, {
      status: "pago",
      data_pagamento: parsed.data.data_pagamento,
      valor_pago: Number(parsed.data.valor_pago),
      forma_pagamento: parsed.data.forma_pagamento,
    });
    await recordAudit(ctx, {
      acao: "parcela.baixa",
      entidade: "parcela",
      entidadeId: id,
      descricao: `Parcela ${parcela.numero} recebida.`,
      dados: {
        valor_pago: parsed.data.valor_pago,
        forma: parsed.data.forma_pagamento,
      },
    });
    revalidatePath("/financeiro");
    revalidatePath(`/contratos/${parcela.contrato_id}`);
    return { success: true };
  } catch (error) {
    console.error("[baixarParcelaAction]", error);
    return { success: false, error: "Erro ao dar baixa." };
  }
}

/** Estorna o pagamento (volta a parcela para pendente). */
export async function estornarParcelaAction(id: string): Promise<ActionResult> {
  const ctx = await requireAuth();
  if (!canWrite(ctx.profile.role)) {
    return { success: false, error: "Sem permissão." };
  }
  try {
    const before = await getParcelaById(id);
    const parcela = await updateParcelaRow(id, {
      status: "pendente",
      data_pagamento: null,
      valor_pago: null,
      forma_pagamento: null,
    });
    await recordAudit(ctx, {
      acao: "parcela.estorno",
      entidade: "parcela",
      entidadeId: id,
      descricao: `Estorno da parcela ${parcela.numero}.`,
      dados: { valor_estornado: before?.valor_pago ?? null },
    });
    revalidatePath("/financeiro");
    revalidatePath(`/contratos/${parcela.contrato_id}`);
    return { success: true };
  } catch (error) {
    console.error("[estornarParcelaAction]", error);
    return { success: false, error: "Erro ao estornar." };
  }
}

/** Cancela uma parcela (não será cobrada). */
export async function cancelarParcelaAction(id: string): Promise<ActionResult> {
  const ctx = await requireAuth();
  if (ctx.profile.role !== "admin") {
    return { success: false, error: "Apenas administradores." };
  }
  try {
    const parcela = await updateParcelaRow(id, { status: "cancelado" });
    await recordAudit(ctx, {
      acao: "parcela.cancelada",
      entidade: "parcela",
      entidadeId: id,
      descricao: `Parcela ${parcela.numero} cancelada.`,
    });
    revalidatePath("/financeiro");
    revalidatePath(`/contratos/${parcela.contrato_id}`);
    return { success: true };
  } catch (error) {
    console.error("[cancelarParcelaAction]", error);
    return { success: false, error: "Erro ao cancelar." };
  }
}
