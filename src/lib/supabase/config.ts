import { publicEnv } from "@/lib/env";

/**
 * Sentinela usado no `.env.local` de exemplo quando ainda não há um projeto
 * Supabase real conectado.
 */
const PLACEHOLDER_MARKER = "placeholder";

/**
 * Indica se há um projeto Supabase real configurado.
 *
 * Enquanto as credenciais forem os placeholders do `.env.example`, o app roda em
 * "modo preview": pulamos as chamadas de rede ao Supabase (evitando lentidão) e
 * liberamos a navegação para que a interface possa ser avaliada sem backend.
 *
 * Assim que uma URL real for definida, autenticação e proteção de rotas passam
 * a valer automaticamente — sem alterar código.
 */
export function isSupabaseConfigured(): boolean {
  const url = publicEnv.NEXT_PUBLIC_SUPABASE_URL;
  return Boolean(url) && !url.includes(PLACEHOLDER_MARKER);
}
