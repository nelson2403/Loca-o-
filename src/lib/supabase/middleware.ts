import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { publicEnv } from "@/lib/env";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Database } from "@/types/database.types";

/**
 * Rotas públicas que não exigem autenticação.
 * Qualquer outra rota (fora de assets/_next) exige sessão válida.
 */
const PUBLIC_ROUTES = ["/login", "/auth", "/api/webhooks"];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

/**
 * Atualiza a sessão do Supabase a cada requisição (refresh de tokens) e aplica
 * a proteção de rotas. Deve ser chamado a partir do `middleware.ts` na raiz.
 *
 * Baseado no padrão oficial do `@supabase/ssr` para App Router.
 */
export async function updateSession(request: NextRequest) {
  // Modo preview (sem Supabase real): não faz chamadas de rede nem protege
  // rotas — permite avaliar a UI localmente sem backend configurado.
  if (!isSupabaseConfigured()) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANTE: não colocar código entre `createServerClient` e `getUser()`.
  // Uma falha aqui pode causar logout aleatório de usuários.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Usuário não autenticado tentando acessar rota protegida → redireciona login.
  if (!user && !isPublicRoute(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  // Usuário autenticado acessando /login → redireciona para o dashboard.
  if (user && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
