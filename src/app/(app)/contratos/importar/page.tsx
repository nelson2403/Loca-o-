import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { ImportarPdf } from "@/modules/contratos/components/importar-pdf";

export const metadata: Metadata = {
  title: "Importar contrato (PDF)",
};

export default function ImportarContratoPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Importar contrato (PDF)"
        description="Envie o PDF; extraímos os dados para conferência antes de criar o contrato."
      />
      <ImportarPdf />
    </div>
  );
}
