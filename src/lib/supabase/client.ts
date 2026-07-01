import { createBrowserClient } from "@supabase/ssr";

import { publicEnv } from "@/lib/env";
import type { Database } from "@/types/database.types";

/**
 * Cliente Supabase para uso no browser (Client Components).
 *
 * Usa a chave `anon` e respeita as políticas de Row Level Security (RLS).
 * Deve ser instanciado por componente/hook — o `@supabase/ssr` cuida de
 * compartilhar a sessão via cookies.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
