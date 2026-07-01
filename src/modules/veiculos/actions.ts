"use server";

import { revalidatePath } from "next/cache";

import { requireAuth } from "@/server/auth";
import { recordAudit } from "@/server/audit";
import {
  veiculoFormSchema,
  type VeiculoFormValues,
} from "@/modules/veiculos/schemas/veiculo.schema";
import { toVeiculoRow } from "@/modules/veiculos/services/veiculos.service";
import {
  insertVeiculo,
  updateVeiculoRow,
  deleteVeiculoRow,
} from "@/modules/veiculos/repositories/veiculos.repository";

export interface ActionResult {
  success: boolean;
  error?: string;
  id?: string;
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
}

function canWrite(role: string): boolean {
  return role === "admin" || role === "operador";
}

export async function createVeiculoAction(
  values: VeiculoFormValues,
): Promise<ActionResult> {
  const ctx = await requireAuth();
  if (!canWrite(ctx.profile.role)) {
    return { success: false, error: "Você não tem permissão para criar." };
  }
  const parsed = veiculoFormSchema.safeParse(values);
  if (!parsed.success) return { success: false, error: "Dados inválidos." };

  try {
    const veiculo = await insertVeiculo({
      ...toVeiculoRow(parsed.data),
      org_id: ctx.profile.org_id,
    });
    await recordAudit(ctx, {
      acao: "veiculo.criado",
      entidade: "veiculo",
      entidadeId: veiculo.id,
      descricao: `Veículo "${veiculo.marca} ${veiculo.modelo}" criado.`,
    });
    revalidatePath("/veiculos");
    return { success: true, id: veiculo.id };
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { success: false, error: "Já existe um veículo com esta placa." };
    }
    console.error("[createVeiculoAction]", error);
    return { success: false, error: "Erro ao salvar o veículo." };
  }
}

export async function updateVeiculoAction(
  id: string,
  values: VeiculoFormValues,
): Promise<ActionResult> {
  const ctx = await requireAuth();
  if (!canWrite(ctx.profile.role)) {
    return { success: false, error: "Você não tem permissão para editar." };
  }
  const parsed = veiculoFormSchema.safeParse(values);
  if (!parsed.success) return { success: false, error: "Dados inválidos." };

  try {
    const veiculo = await updateVeiculoRow(id, { ...toVeiculoRow(parsed.data) });
    await recordAudit(ctx, {
      acao: "veiculo.atualizado",
      entidade: "veiculo",
      entidadeId: id,
      descricao: `Veículo "${veiculo.marca} ${veiculo.modelo}" atualizado.`,
    });
    revalidatePath("/veiculos");
    revalidatePath(`/veiculos/${id}`);
    return { success: true, id };
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { success: false, error: "Já existe um veículo com esta placa." };
    }
    console.error("[updateVeiculoAction]", error);
    return { success: false, error: "Erro ao atualizar o veículo." };
  }
}

export async function deleteVeiculoAction(id: string): Promise<ActionResult> {
  const ctx = await requireAuth();
  if (ctx.profile.role !== "admin") {
    return { success: false, error: "Apenas administradores podem excluir." };
  }
  try {
    await deleteVeiculoRow(id);
    await recordAudit(ctx, {
      acao: "veiculo.excluido",
      entidade: "veiculo",
      entidadeId: id,
    });
    revalidatePath("/veiculos");
    return { success: true };
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "23503"
    ) {
      return {
        success: false,
        error: "Não é possível excluir: o veículo possui contratos vinculados.",
      };
    }
    console.error("[deleteVeiculoAction]", error);
    return { success: false, error: "Erro ao excluir o veículo." };
  }
}
