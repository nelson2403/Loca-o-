import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Download } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { PaginationControl } from "@/components/shared/pagination-control";
import { clientesFilterSchema } from "@/modules/clientes/schemas/cliente.schema";
import { listClientes } from "@/modules/clientes/repositories/clientes.repository";
import { ClientesFilters } from "@/modules/clientes/components/clientes-filters";
import { ClientesTable } from "@/modules/clientes/components/clientes-table";

export const metadata: Metadata = {
  title: "Clientes",
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ClientesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filter = clientesFilterSchema.parse({
    q: params.q,
    status: params.status,
    page: params.page,
  });

  const { data, count, page, totalPages } = await listClientes(filter);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clientes"
        description="Cadastro e gestão de clientes (pessoas físicas e jurídicas)."
        actions={
          <>
            <Button asChild variant="outline">
              <a href="/api/export/clientes" download>
                <Download className="mr-1 size-4" />
                Exportar
              </a>
            </Button>
            <Button asChild>
              <Link href="/clientes/novo">
                <Plus className="mr-1 size-4" />
                Novo cliente
              </Link>
            </Button>
          </>
        }
      />

      <ClientesFilters />

      <ClientesTable clientes={data} />

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
