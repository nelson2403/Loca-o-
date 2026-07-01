import type { Metadata } from "next";
import { History } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { PaginationControl } from "@/components/shared/pagination-control";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime } from "@/lib/formatters";
import { listAudit } from "@/modules/historico/repositories/audit.repository";

export const metadata: Metadata = {
  title: "Histórico",
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function HistoricoPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page ?? 1) || 1;
  const { data, count, page: current, totalPages } = await listAudit(page);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Histórico"
        description="Registro de todas as ações realizadas no sistema."
      />

      {data.length === 0 ? (
        <EmptyState
          icon={History}
          title="Nenhum registro ainda"
          description="As ações (criações, edições, baixas) aparecem aqui automaticamente."
        />
      ) : (
        <>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/hora</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Descrição
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">
                      {formatDateTime(log.created_at)}
                    </TableCell>
                    <TableCell>{log.actor_email ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        {log.acao}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {log.descricao ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden lg:table-cell">
                      {log.ip ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <PaginationControl
            page={current}
            totalPages={totalPages}
            totalCount={count}
          />
        </>
      )}
    </div>
  );
}
