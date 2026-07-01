"use server";

import { revalidatePath } from "next/cache";

import { requireAuth } from "@/server/auth";
import { recordAudit } from "@/server/audit";
import {
  clienteFormSchema,
  type ClienteFormValues,
} from "@/modules/clientes/schemas/cliente.schema";
import { toClienteRow } from "@/modules/clientes/services/clientes.service";
import {
  insertCliente,
  updateClienteRow,
  deleteClienteRow,
} from "@/modules/clientes/repositories/clientes.repository";

export interface ActionResult {
  success: boolean;
  error?: string;
  id?: string;
}

/** Erro de violação de unicidade do Postgres. */
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

export async function createClienteAction(
  values: ClienteFormValues,
): Promise<ActionResult> {
  const ctx = await requireAuth();
  if (!canWrite(ctx.profile.role)) {
    return { success: false, error: "Você não tem permissão para criar." };
  }

  const parsed = clienteFormSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: "Dados inválidos." };
  }

  try {
    const cliente = await insertCliente({
      ...toClienteRow(parsed.data),
      org_id: ctx.profile.org_id,
    });

    await recordAudit(ctx, {
      acao: "cliente.criado",
      entidade: "cliente",
      entidadeId: cliente.id,
      descricao: `Cliente "${cliente.nome}" criado.`,
    });

    revalidatePath("/clientes");
    return { success: true, id: cliente.id };
  } catch (error) {
    if (isUniqueViolation(error)) {
      return {
        success: false,
        error: "Já existe um cliente com este CPF/CNPJ.",
      };
    }
    console.error("[createClienteAction]", error);
    return { success: false, error: "Erro ao salvar o cliente." };
  }
}

export async function updateClienteAction(
  id: string,
  values: ClienteFormValues,
): Promise<ActionResult> {
  const ctx = await requireAuth();
  if (!canWrite(ctx.profile.role)) {
    return { success: false, error: "Você não tem permissão para editar." };
  }

  const parsed = clienteFormSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: "Dados inválidos." };
  }

  try {
    const cliente = await updateClienteRow(id, {
      ...toClienteRow(parsed.data),
    });

    await recordAudit(ctx, {
      acao: "cliente.atualizado",
      entidade: "cliente",
      entidadeId: id,
      descricao: `Cliente "${cliente.nome}" atualizado.`,
    });

    revalidatePath("/clientes");
    revalidatePath(`/clientes/${id}`);
    return { success: true, id };
  } catch (error) {
    if (isUniqueViolation(error)) {
      return {
        success: false,
        error: "Já existe um cliente com este CPF/CNPJ.",
      };
    }
    console.error("[updateClienteAction]", error);
    return { success: false, error: "Erro ao atualizar o cliente." };
  }
}

export async function deleteClienteAction(id: string): Promise<ActionResult> {
  const ctx = await requireAuth();
  if (ctx.profile.role !== "admin") {
    return { success: false, error: "Apenas administradores podem excluir." };
  }

  try {
    await deleteClienteRow(id);
    await recordAudit(ctx, {
      acao: "cliente.excluido",
      entidade: "cliente",
      entidadeId: id,
    });
    revalidatePath("/clientes");
    return { success: true };
  } catch (error) {
    // FK: cliente com contratos vinculados (on delete restrict).
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "23503"
    ) {
      return {
        success: false,
        error: "Não é possível excluir: o cliente possui contratos vinculados.",
      };
    }
    console.error("[deleteClienteAction]", error);
    return { success: false, error: "Erro ao excluir o cliente." };
  }
}
