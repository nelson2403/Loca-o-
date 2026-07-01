import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { getClienteById } from "@/modules/clientes/repositories/clientes.repository";
import { toClienteFormValues } from "@/modules/clientes/services/clientes.service";
import { ClienteForm } from "@/modules/clientes/components/cliente-form";

export const metadata: Metadata = {
  title: "Editar cliente",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarClientePage({ params }: PageProps) {
  const { id } = await params;
  const cliente = await getClienteById(id);

  if (!cliente) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Editar cliente"
        description={cliente.nome}
      />
      <ClienteForm
        mode="edit"
        clienteId={cliente.id}
        defaultValues={toClienteFormValues(cliente)}
      />
    </div>
  );
}
