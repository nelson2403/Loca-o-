import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { getVeiculoById } from "@/modules/veiculos/repositories/veiculos.repository";
import { toVeiculoFormValues } from "@/modules/veiculos/services/veiculos.service";
import { VeiculoForm } from "@/modules/veiculos/components/veiculo-form";

export const metadata: Metadata = {
  title: "Editar veículo",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarVeiculoPage({ params }: PageProps) {
  const { id } = await params;
  const veiculo = await getVeiculoById(id);
  if (!veiculo) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Editar veículo"
        description={`${veiculo.marca} ${veiculo.modelo}`}
      />
      <VeiculoForm
        mode="edit"
        veiculoId={veiculo.id}
        defaultValues={toVeiculoFormValues(veiculo)}
      />
    </div>
  );
}
