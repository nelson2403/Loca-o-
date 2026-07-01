import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { ClienteForm } from "@/modules/clientes/components/cliente-form";

export const metadata: Metadata = {
  title: "Novo cliente",
};

export default function NovoClientePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Novo cliente"
        description="Preencha os dados para cadastrar um novo cliente."
      />
      <ClienteForm mode="create" />
    </div>
  );
}
