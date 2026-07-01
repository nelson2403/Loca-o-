import "server-only";

import type { NextRequest } from "next/server";

import { serverEnv } from "@/lib/env";

/**
 * Valida requisições de automação (Vercel Cron ou chamadas internas).
 *
 * O Vercel Cron envia o header `Authorization: Bearer <CRON_SECRET>`.
 * Se `CRON_SECRET` não estiver definido, as rotas ficam bloqueadas (fail-safe).
 */
export function verifyCronRequest(request: NextRequest): boolean {
  const secret = serverEnv().CRON_SECRET;
  if (!secret) return false;
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}
