import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/**
 * Layout autenticado. O acesso já é garantido pelo middleware; aqui apenas
 * lemos os dados do usuário para exibir na topbar. Envolve todas as rotas do
 * grupo `(app)` com o shell (sidebar + topbar).
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Em modo preview (sem Supabase real) não fazemos chamada de rede.
  let email: string | null = null;
  let name: string | null = null;

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    email = user?.email ?? null;
    name = (user?.user_metadata?.name as string | undefined) ?? null;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppTopbar email={email} name={name} />
        <main className="flex-1 space-y-6 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
