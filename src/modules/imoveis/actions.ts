"use server";

import { revalidatePath } from "next/cache";

import { requireAuth } from "@/server/auth";
import { recordAudit } from "@/server/audit";
import {
  imovelFormSchema,
  type ImovelFormValues,
} from "@/modules/imoveis/schemas/imovel.schema";
import { toImovelRow } from "@/modules/imoveis/services/imoveis.service";
import {
  insertImovel,
  updateImovelRow,
  deleteImovelRow,
} from "@/modules/imoveis/repositories/imoveis.repository";

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

export async function createImovelAction(
  values: ImovelFormValues,
): Promise<ActionResult> {
  const ctx = await requireAuth();
  if (!canWrite(ctx.profile.role)) {
    return { success: false, error: "Você não tem permissão para criar." };
  }
  const parsed = imovelFormSchema.safeParse(values);
  if (!parsed.success) return { success: false, error: "Dados inválidos." };

  try {
    const imovel = await insertImovel({
      ...toImovelRow(parsed.data),
      org_id: ctx.profile.org_id,
    });
    await recordAudit(ctx, {
      acao: "imovel.criado",
      entidade: "imovel",
      entidadeId: imovel.id,
      descricao: `Imóvel "${imovel.codigo}" criado.`,
    });
    revalidatePath("/imoveis");
    return { success: true, id: imovel.id };
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { success: false, error: "Já existe um imóvel com este código." };
    }
    console.error("[createImovelAction]", error);
    return { success: false, error: "Erro ao salvar o imóvel." };
  }
}

export async function updateImovelAction(
  id: string,
  values: ImovelFormValues,
): Promise<ActionResult> {
  const ctx = await requireAuth();
  if (!canWrite(ctx.profile.role)) {
    return { success: false, error: "Você não tem permissão para editar." };
  }
  const parsed = imovelFormSchema.safeParse(values);
  if (!parsed.success) return { success: false, error: "Dados inválidos." };

  try {
    const imovel = await updateImovelRow(id, { ...toImovelRow(parsed.data) });
    await recordAudit(ctx, {
      acao: "imovel.atualizado",
      entidade: "imovel",
      entidadeId: id,
      descricao: `Imóvel "${imovel.codigo}" atualizado.`,
    });
    revalidatePath("/imoveis");
    revalidatePath(`/imoveis/${id}`);
    return { success: true, id };
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { success: false, error: "Já existe um imóvel com este código." };
    }
    console.error("[updateImovelAction]", error);
    return { success: false, error: "Erro ao atualizar o imóvel." };
  }
}

export async function deleteImovelAction(id: string): Promise<ActionResult> {
  const ctx = await requireAuth();
  if (ctx.profile.role !== "admin") {
    return { success: false, error: "Apenas administradores podem excluir." };
  }
  try {
    await deleteImovelRow(id);
    await recordAudit(ctx, {
      acao: "imovel.excluido",
      entidade: "imovel",
      entidadeId: id,
    });
    revalidatePath("/imoveis");
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
        error: "Não é possível excluir: o imóvel possui contratos vinculados.",
      };
    }
    console.error("[deleteImovelAction]", error);
    return { success: false, error: "Erro ao excluir o imóvel." };
  }
}
