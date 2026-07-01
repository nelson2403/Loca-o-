"use server";

import { requireAuth } from "@/server/auth";
import { recordAudit } from "@/server/audit";
import {
  marcarAtrasadas,
  enviarLembretes,
  enviarCobrancas,
} from "@/modules/automacoes/services/automacoes.service";

export interface RunResult {
  success: boolean;
  message?: string;
  error?: string;
}

async function ensureAdmin() {
  const ctx = await requireAuth();
  if (ctx.profile.role !== "admin") {
    throw new Error("Apenas administradores.");
  }
  return ctx;
}

export async function runAtualizarStatusAction(): Promise<RunResult> {
  try {
    const ctx = await ensureAdmin();
    const r = await marcarAtrasadas();
    await recordAudit(ctx, { acao: "automacao.atualizar_status" });
    return { success: true, message: `${r.atualizadas} parcela(s) marcadas como atrasadas.` };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function runLembretesAction(): Promise<RunResult> {
  try {
    const ctx = await ensureAdmin();
    const r = await enviarLembretes();
    await recordAudit(ctx, { acao: "automacao.lembretes" });
    return {
      success: true,
      message: `${r.enviados} lembrete(s) enviados, ${r.erros} erro(s).`,
    };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function runCobrancasAction(): Promise<RunResult> {
  try {
    const ctx = await ensureAdmin();
    const r = await enviarCobrancas();
    await recordAudit(ctx, { acao: "automacao.cobrancas" });
    return {
      success: true,
      message: `${r.enviados} cobrança(s) enviadas, ${r.erros} erro(s).`,
    };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
