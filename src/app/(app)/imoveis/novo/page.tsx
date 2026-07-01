import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { ImovelForm } from "@/modules/imoveis/components/imovel-form";

export const metadata: Metadata = {
  title: "Novo imóvel",
};

export default function NovoImovelPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Novo imóvel"
        description="Preencha os dados do imóvel."
      />
      <ImovelForm mode="create" />
    </div>
  );
}
