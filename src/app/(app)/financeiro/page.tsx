import type { Metadata } from "next";
import { Wallet, Clock, AlertTriangle } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { PaginationControl } from "@/components/shared/pagination-control";
import { StatCard } from "@/modules/dashboard/components/stat-card";
import { formatCurrency } from "@/lib/formatters";
import { financeiroFilterSchema } from "@/modules/financeiro/schemas/financeiro.schema";
import {
  listParcelas,
  getFinanceiroSummary,
} from "@/modules/financeiro/repositories/parcelas.repository";
import { FinanceiroFilters } from "@/modules/financeiro/components/financeiro-filters";
import { ParcelasTable } from "@/modules/financeiro/components/parcelas-table";

export const metadata: Metadata = {
  title: "Financeiro",
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function FinanceiroPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filter = financeiroFilterSchema.parse({
    status: params.status,
    from: params.from,
    to: params.to,
    page: params.page,
  });

  const [{ data, count, page, totalPages }, summary] = await Promise.all([
    listParcelas(filter),
    getFinanceiroSummary(filter),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Financeiro"
        description="Parcelas, recebimentos e inadimplência."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Recebido"
          value={formatCurrency(summary.totalRecebido)}
          icon={Wallet}
          hint={`${summary.countPago} parcela(s)`}
        />
        <StatCard
          title="A receber"
          value={formatCurrency(summary.totalPendente)}
          icon={Clock}
          hint={`${summary.countPendente} pendente(s)`}
        />
        <StatCard
          title="Em atraso"
          value={formatCurrency(summary.totalAtrasado)}
          icon={AlertTriangle}
          hint={`${summary.countAtrasado} atrasada(s)`}
        />
      </div>

      <FinanceiroFilters />
      <ParcelasTable parcelas={data} />

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
