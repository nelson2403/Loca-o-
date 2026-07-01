import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { VeiculoForm } from "@/modules/veiculos/components/veiculo-form";

export const metadata: Metadata = {
  title: "Novo veículo",
};

export default function NovoVeiculoPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Novo veículo"
        description="Preencha os dados do veículo."
      />
      <VeiculoForm mode="create" />
    </div>
  );
}
