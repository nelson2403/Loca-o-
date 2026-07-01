import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import { publicEnv } from "@/lib/env";
import type { Database } from "@/types/database.types";

/**
 * Cliente Supabase para uso no servidor (Server Components, Server Actions e
 * Route Handlers). Lê e grava a sessão através dos cookies da requisição,
 * respeitando as políticas de RLS do usuário autenticado.
 *
 * IMPORTANTE: deve ser criado por requisição (não fazer cache em módulo),
 * pois depende do `cookies()` do contexto atual.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // O método `setAll` é chamado a partir de um Server Component.
            // Isso pode ser ignorado com segurança quando há um middleware
            // responsável por atualizar a sessão do usuário.
          }
        },
      },
    },
  );
}
