"use client";

import { Search } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { UserNav } from "@/components/layout/user-nav";

interface AppTopbarProps {
  email?: string | null;
  name?: string | null;
}

/** Barra superior fixa: trigger da sidebar, busca global (placeholder), tema e usuário. */
export function AppTopbar({ email, name }: AppTopbarProps) {
  return (
    <header className="bg-background/80 sticky top-0 z-30 flex h-14 items-center gap-2 border-b px-4 backdrop-blur">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 h-6" />

      <button
        type="button"
        className="text-muted-foreground hover:bg-accent hover:text-accent-foreground flex h-9 w-full max-w-sm items-center gap-2 rounded-md border px-3 text-sm transition-colors"
        // TODO(Fase 7): abrir command palette de busca global (Cmd+K).
        aria-label="Buscar (em breve)"
      >
        <Search className="size-4" />
        <span>Buscar...</span>
        <kbd className="bg-muted text-muted-foreground pointer-events-none ml-auto hidden rounded border px-1.5 font-mono text-[10px] sm:inline-block">
          ⌘K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-1">
        <ThemeToggle />
        <UserNav email={email} name={name} />
      </div>
    </header>
  );
}
