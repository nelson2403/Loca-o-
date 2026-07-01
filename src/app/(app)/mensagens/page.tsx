import type { Metadata } from "next";
import { MessageSquare } from "lucide-react";

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
import { formatDateTime, formatPhone } from "@/lib/formatters";
import { listMensagens } from "@/modules/mensagens/repositories/mensagens.repository";

export const metadata: Metadata = {
  title: "Mensagens",
};

const STATUS: Record<string, { label: string; className: string }> = {
  enviado: {
    label: "Enviado",
    className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  },
  erro: { label: "Erro", className: "bg-red-500/15 text-red-700 dark:text-red-400" },
  pendente: { label: "Pendente", className: "bg-amber-500/15 text-amber-700" },
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function MensagensPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page ?? 1) || 1;
  const { data, count, page: current, totalPages } = await listMensagens(page);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mensagens"
        description="Histórico de mensagens enviadas por WhatsApp."
      />

      {data.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="Nenhuma mensagem enviada"
          description="As mensagens (lembretes, cobranças, recibos) aparecem aqui."
        />
      ) : (
        <>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/hora</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="hidden md:table-cell">Telefone</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((m) => {
                  const s = STATUS[m.status] ?? STATUS.pendente;
                  return (
                    <TableRow key={m.id}>
                      <TableCell className="whitespace-nowrap">
                        {formatDateTime(m.created_at)}
                      </TableCell>
                      <TableCell>{m.cliente?.nome ?? "—"}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {formatPhone(m.telefone)}
                      </TableCell>
                      <TableCell className="capitalize">
                        {m.template ?? "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`border-transparent ${s.className}`}
                        >
                          {s.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
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
