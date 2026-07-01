import "server-only";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database.types";

export type Profile = Tables<"profiles">;

export interface AuthContext {
  userId: string;
  email: string | null;
  profile: Profile;
}

/**
 * Garante que há um usuário autenticado com perfil e retorna o contexto de
 * autenticação (id, e-mail, perfil com org_id e papel).
 *
 * Redireciona para /login se não houver sessão. Use no topo de Server
 * Components/Actions que exigem autenticação.
 */
export async function requireAuth(): Promise<AuthContext> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    // Sessão válida mas sem perfil (situação anômala) — força novo login.
    redirect("/login");
  }

  return { userId: user.id, email: user.email ?? null, profile };
}

/** Retorna o org_id do usuário autenticado. */
export async function getOrgId(): Promise<string> {
  const { profile } = await requireAuth();
  return profile.org_id;
}
