import "server-only";

import { createClient } from "@supabase/supabase-js";

import { publicEnv } from "@/lib/env";
import { serverEnv } from "@/lib/env";
import type { Database } from "@/types/database.types";

/**
 * Cliente Supabase com a chave de serviço (`service_role`).
 *
 * ⚠️ BYPASSA TODAS as políticas de RLS. Use exclusivamente em código
 * server-only e para operações administrativas controladas:
 *  - Webhooks (ASAAS) que precisam gravar sem sessão de usuário.
 *  - Jobs/automations (cron) que rodam sem contexto de usuário.
 *  - Rotinas de sincronização em background.
 *
 * NUNCA importe este módulo em Client Components. O import `server-only`
 * garante um erro de build caso isso aconteça.
 */
export function createSupabaseAdminClient() {
  return createClient<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv().SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
