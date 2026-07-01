import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { getImovelById } from "@/modules/imoveis/repositories/imoveis.repository";
import { toImovelFormValues } from "@/modules/imoveis/services/imoveis.service";
import { ImovelForm } from "@/modules/imoveis/components/imovel-form";

export const metadata: Metadata = {
  title: "Editar imóvel",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarImovelPage({ params }: PageProps) {
  const { id } = await params;
  const imovel = await getImovelById(id);
  if (!imovel) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Editar imóvel" description={imovel.codigo} />
      <ImovelForm
        mode="edit"
        imovelId={imovel.id}
        defaultValues={toImovelFormValues(imovel)}
      />
    </div>
  );
}
