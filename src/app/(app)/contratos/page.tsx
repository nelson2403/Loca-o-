import type { Metadata } from "next";
import Link from "next/link";
import { Plus, FileUp } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { PaginationControl } from "@/components/shared/pagination-control";
import { contratosFilterSchema } from "@/modules/contratos/schemas/contrato.schema";
import { listContratos } from "@/modules/contratos/repositories/contratos.repository";
import { ContratosFilters } from "@/modules/contratos/components/contratos-filters";
import { ContratosTable } from "@/modules/contratos/components/contratos-table";

export const metadata: Metadata = {
  title: "Contratos",
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ContratosPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filter = contratosFilterSchema.parse({
    q: params.q,
    status: params.status,
    tipo: params.tipo,
    page: params.page,
  });

  const { data, count, page, totalPages } = await listContratos(filter);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contratos"
        description="Contratos de locação e geração automática de carnês."
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/contratos/importar">
                <FileUp className="mr-1 size-4" />
                Importar PDF
              </Link>
            </Button>
            <Button asChild>
              <Link href="/contratos/novo">
                <Plus className="mr-1 size-4" />
                Novo contrato
              </Link>
            </Button>
          </>
        }
      />

      <ContratosFilters />
      <ContratosTable contratos={data} />

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
