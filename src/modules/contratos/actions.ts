"use server";

import { revalidatePath } from "next/cache";

import { requireAuth } from "@/server/auth";
import { recordAudit } from "@/server/audit";
import {
  contratoFormSchema,
  type ContratoFormValues,
} from "@/modules/contratos/schemas/contrato.schema";
import {
  toContratoRow,
  buildParcelasRows,
} from "@/modules/contratos/services/contratos.service";
import {
  insertContrato,
  insertParcelas,
  updateContratoRow,
  deleteContratoRow,
} from "@/modules/contratos/repositories/contratos.repository";
import { updateImovelRow } from "@/modules/imoveis/repositories/imoveis.repository";
import { updateVeiculoRow } from "@/modules/veiculos/repositories/veiculos.repository";

export interface ActionResult {
  success: boolean;
  error?: string;
  id?: string;
}

function canWrite(role: string): boolean {
  return role === "admin" || role === "operador";
}

/** Atualiza a situação do bem vinculado (imóvel/veículo) — best-effort. */
async function setAssetStatus(
  values: Pick<ContratoFormValues, "tipo" | "imovel_id" | "veiculo_id">,
  status: "disponivel" | "locado",
): Promise<void> {
  try {
    if (values.tipo === "imovel" && values.imovel_id) {
      await updateImovelRow(values.imovel_id, { status });
    } else if (values.tipo === "veiculo" && values.veiculo_id) {
      await updateVeiculoRow(values.veiculo_id, { status });
    }
  } catch (error) {
    console.error("[setAssetStatus]", error);
  }
}

export async function createContratoAction(
  values: ContratoFormValues,
): Promise<ActionResult> {
  const ctx = await requireAuth();
  if (!canWrite(ctx.profile.role)) {
    return { success: false, error: "Você não tem permissão para criar." };
  }
  const parsed = contratoFormSchema.safeParse(values);
  if (!parsed.success) return { success: false, error: "Dados inválidos." };

  try {
    const contrato = await insertContrato({
      ...toContratoRow(parsed.data),
      org_id: ctx.profile.org_id,
    });

    // Gera o carnê. Se falhar, desfaz o contrato (compensação).
    try {
      await insertParcelas(buildParcelasRows(contrato));
    } catch (parcelaError) {
      await deleteContratoRow(contrato.id);
      throw parcelaError;
    }

    if (contrato.status === "ativo") {
      await setAssetStatus(parsed.data, "locado");
    }

    await recordAudit(ctx, {
      acao: "contrato.criado",
      entidade: "contrato",
      entidadeId: contrato.id,
      descricao: `Contrato criado com ${contrato.qtd_parcelas} parcela(s).`,
    });

    revalidatePath("/contratos");
    revalidatePath("/financeiro");
    return { success: true, id: contrato.id };
  } catch (error) {
    console.error("[createContratoAction]", error);
    return { success: false, error: "Erro ao criar o contrato." };
  }
}

export async function updateContratoAction(
  id: string,
  values: ContratoFormValues,
): Promise<ActionResult> {
  const ctx = await requireAuth();
  if (!canWrite(ctx.profile.role)) {
    return { success: false, error: "Você não tem permissão para editar." };
  }
  const parsed = contratoFormSchema.safeParse(values);
  if (!parsed.success) return { success: false, error: "Dados inválidos." };

  try {
    // Não regeramos o carnê na edição para preservar parcelas já pagas.
    const contrato = await updateContratoRow(id, {
      numero: parsed.data.numero?.trim() || null,
      indice_reajuste: parsed.data.indice_reajuste,
      multa_percent: Number(parsed.data.multa_percent),
      juros_mes_percent: Number(parsed.data.juros_mes_percent),
      observacoes: parsed.data.observacoes?.trim() || null,
      status: parsed.data.status,
      data_inicio: parsed.data.data_inicio,
      data_fim: parsed.data.data_fim,
    });

    // Ajusta a situação do bem conforme o status do contrato.
    if (contrato.status === "ativo") {
      await setAssetStatus(parsed.data, "locado");
    } else if (
      contrato.status === "encerrado" ||
      contrato.status === "cancelado"
    ) {
      await setAssetStatus(parsed.data, "disponivel");
    }

    await recordAudit(ctx, {
      acao: "contrato.atualizado",
      entidade: "contrato",
      entidadeId: id,
    });

    revalidatePath("/contratos");
    revalidatePath(`/contratos/${id}`);
    return { success: true, id };
  } catch (error) {
    console.error("[updateContratoAction]", error);
    return { success: false, error: "Erro ao atualizar o contrato." };
  }
}

export async function deleteContratoAction(id: string): Promise<ActionResult> {
  const ctx = await requireAuth();
  if (ctx.profile.role !== "admin") {
    return { success: false, error: "Apenas administradores podem excluir." };
  }
  try {
    await deleteContratoRow(id); // parcelas em cascata
    await recordAudit(ctx, {
      acao: "contrato.excluido",
      entidade: "contrato",
      entidadeId: id,
    });
    revalidatePath("/contratos");
    revalidatePath("/financeiro");
    return { success: true };
  } catch (error) {
    console.error("[deleteContratoAction]", error);
    return { success: false, error: "Erro ao excluir o contrato." };
  }
}
