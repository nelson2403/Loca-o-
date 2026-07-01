import "server-only";

import { headers } from "next/headers";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Json, TablesInsert } from "@/types/database.types";
import type { AuthContext } from "@/server/auth";

interface AuditInput {
  acao: string; // ex.: 'cliente.criado'
  entidade?: string; // ex.: 'cliente'
  entidadeId?: string;
  descricao?: string;
  dados?: Json;
}

/**
 * Registra uma ação no histórico/auditoria.
 *
 * Usa o cliente admin (service_role) para gravar mesmo com RLS ativa — a tabela
 * é imutável para o cliente comum. Captura IP e user-agent da requisição.
 *
 * Nunca lança: falha de auditoria não deve quebrar a operação de negócio
 * (apenas registra no console para observabilidade).
 */
export async function recordAudit(
  ctx: AuthContext,
  input: AuditInput,
): Promise<void> {
  try {
    const headerList = await headers();
    const forwardedFor = headerList.get("x-forwarded-for");
    const ip = forwardedFor?.split(",")[0]?.trim() || null;
    const userAgent = headerList.get("user-agent");

    const admin = createSupabaseAdminClient();
    const row: TablesInsert<"audit_log"> = {
      org_id: ctx.profile.org_id,
      actor_id: ctx.userId,
      actor_email: ctx.email,
      acao: input.acao,
      entidade: input.entidade ?? null,
      entidade_id: input.entidadeId ?? null,
      descricao: input.descricao ?? null,
      dados: input.dados ?? null,
      ip,
      user_agent: userAgent,
    };

    await admin.from("audit_log").insert(row);
  } catch (error) {
    console.error("[audit] falha ao registrar auditoria:", error);
  }
}
