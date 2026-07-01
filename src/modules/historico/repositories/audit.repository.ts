import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database.types";

export type AuditLog = Tables<"audit_log">;

const PAGE_SIZE = 20;

export interface PaginatedAudit {
  data: AuditLog[];
  count: number;
  page: number;
  totalPages: number;
}

export async function listAudit(page: number): Promise<PaginatedAudit> {
  const supabase = await createSupabaseServerClient();
  const current = Math.max(1, page);
  const from = (current - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, count, error } = await supabase
    .from("audit_log")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);
  if (error) throw error;

  const total = count ?? 0;
  return {
    data: data ?? [],
    count: total,
    page: current,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}
