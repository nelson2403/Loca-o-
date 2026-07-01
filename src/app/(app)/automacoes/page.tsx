import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { AutomacoesPanel } from "@/modules/automacoes/components/automacoes-panel";

export const metadata: Metadata = {
  title: "Automações",
};

export default function AutomacoesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Automações"
        description="Rotinas automáticas (Vercel Cron). Você também pode executá-las manualmente."
      />
      <AutomacoesPanel />
      <p className="text-muted-foreground text-sm">
        Configure os prazos e ative o envio automático em{" "}
        <a href="/configuracoes" className="underline">
          Configurações → Automações
        </a>
        .
      </p>
    </div>
  );
}
