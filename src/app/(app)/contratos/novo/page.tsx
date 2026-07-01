import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { ContratoForm } from "@/modules/contratos/components/contrato-form";
import { contratoFormDefaults } from "@/modules/contratos/schemas/contrato.schema";
import { getClienteOptions } from "@/modules/clientes/repositories/clientes.repository";
import { getImovelOptions } from "@/modules/imoveis/repositories/imoveis.repository";
import { getVeiculoOptions } from "@/modules/veiculos/repositories/veiculos.repository";

export const metadata: Metadata = {
  title: "Novo contrato",
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function str(v: string | string[] | undefined): string | undefined {
  return typeof v === "string" ? v : undefined;
}

export default async function NovoContratoPage({ searchParams }: PageProps) {
  const [params, clientes, imoveis, veiculos] = await Promise.all([
    searchParams,
    getClienteOptions(),
    getImovelOptions(),
    getVeiculoOptions(),
  ]);

  // Prefill vindo da importação de PDF (query params).
  const defaults = {
    ...contratoFormDefaults,
    valor: str(params.valor) ?? contratoFormDefaults.valor,
    data_inicio: str(params.data_inicio) ?? contratoFormDefaults.data_inicio,
    data_fim: str(params.data_fim) ?? contratoFormDefaults.data_fim,
    dia_vencimento:
      str(params.dia_vencimento) ?? contratoFormDefaults.dia_vencimento,
    qtd_parcelas: str(params.qtd_parcelas) ?? contratoFormDefaults.qtd_parcelas,
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Novo contrato"
        description="As parcelas do carnê são geradas automaticamente ao salvar."
      />
      <ContratoForm
        mode="create"
        defaultValues={defaults}
        clientes={clientes}
        imoveis={imoveis}
        veiculos={veiculos}
      />
    </div>
  );
}
