import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { getContratoById } from "@/modules/contratos/repositories/contratos.repository";
import { toContratoFormValues } from "@/modules/contratos/services/contratos.service";
import { ContratoForm } from "@/modules/contratos/components/contrato-form";
import { getClienteOptions } from "@/modules/clientes/repositories/clientes.repository";
import { getImovelOptions } from "@/modules/imoveis/repositories/imoveis.repository";
import { getVeiculoOptions } from "@/modules/veiculos/repositories/veiculos.repository";

export const metadata: Metadata = {
  title: "Editar contrato",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarContratoPage({ params }: PageProps) {
  const { id } = await params;
  const [contrato, clientes, imoveis, veiculos] = await Promise.all([
    getContratoById(id),
    getClienteOptions(),
    getImovelOptions(),
    getVeiculoOptions(),
  ]);
  if (!contrato) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Editar contrato"
        description="Condições financeiras e o carnê já gerado não são recriados."
      />
      <ContratoForm
        mode="edit"
        contratoId={contrato.id}
        defaultValues={toContratoFormValues(contrato)}
        clientes={clientes}
        imoveis={imoveis}
        veiculos={veiculos}
      />
    </div>
  );
}
