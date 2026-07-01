import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Download } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { PaginationControl } from "@/components/shared/pagination-control";
import { veiculosFilterSchema } from "@/modules/veiculos/schemas/veiculo.schema";
import { listVeiculos } from "@/modules/veiculos/repositories/veiculos.repository";
import { VeiculosFilters } from "@/modules/veiculos/components/veiculos-filters";
import { VeiculosTable } from "@/modules/veiculos/components/veiculos-table";

export const metadata: Metadata = {
  title: "Veículos",
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function VeiculosPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filter = veiculosFilterSchema.parse({
    q: params.q,
    status: params.status,
    page: params.page,
  });

  const { data, count, page, totalPages } = await listVeiculos(filter);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Veículos"
        description="Cadastro e gestão dos veículos disponíveis para locação."
        actions={
          <>
            <Button asChild variant="outline">
              <a href="/api/export/veiculos" download>
                <Download className="mr-1 size-4" />
                Exportar
              </a>
            </Button>
            <Button asChild>
              <Link href="/veiculos/novo">
                <Plus className="mr-1 size-4" />
                Novo veículo
              </Link>
            </Button>
          </>
        }
      />

      <VeiculosFilters />
      <VeiculosTable veiculos={data} />

      {count > 0 ? (
        <PaginationControl
          page={page}
          totalPages={totalPages}
          totalCount={count}
        />
      ) : null}
    </div>
  );
}
