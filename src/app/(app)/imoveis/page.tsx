import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Download } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { PaginationControl } from "@/components/shared/pagination-control";
import { imoveisFilterSchema } from "@/modules/imoveis/schemas/imovel.schema";
import { listImoveis } from "@/modules/imoveis/repositories/imoveis.repository";
import { ImoveisFilters } from "@/modules/imoveis/components/imoveis-filters";
import { ImoveisTable } from "@/modules/imoveis/components/imoveis-table";

export const metadata: Metadata = {
  title: "Imóveis",
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ImoveisPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filter = imoveisFilterSchema.parse({
    q: params.q,
    status: params.status,
    page: params.page,
  });

  const { data, count, page, totalPages } = await listImoveis(filter);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Imóveis"
        description="Cadastro e gestão dos imóveis disponíveis para locação."
        actions={
          <>
            <Button asChild variant="outline">
              <a href="/api/export/imoveis" download>
                <Download className="mr-1 size-4" />
                Exportar
              </a>
            </Button>
            <Button asChild>
              <Link href="/imoveis/novo">
                <Plus className="mr-1 size-4" />
                Novo imóvel
              </Link>
            </Button>
          </>
        }
      />

      <ImoveisFilters />
      <ImoveisTable imoveis={data} />

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
