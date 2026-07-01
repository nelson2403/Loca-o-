import { Wallet } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { ParcelaStatusBadge } from "@/components/shared/parcela-status-badge";
import { ParcelaActions } from "@/modules/financeiro/components/parcela-actions";
import { formatCurrency, formatDate } from "@/lib/formatters";
import type { Enums } from "@/types/database.types";
import type { ParcelaListItem } from "@/modules/financeiro/repositories/parcelas.repository";

/** Status para exibição: pendente vencido vira "atrasado". */
function effectiveStatus(
  status: Enums<"parcela_status">,
  vencimento: string,
  today: string,
): Enums<"parcela_status"> {
  if (status === "pendente" && vencimento < today) return "atrasado";
  return status;
}

export function ParcelasTable({ parcelas }: { parcelas: ParcelaListItem[] }) {
  if (parcelas.length === 0) {
    return (
      <EmptyState
        icon={Wallet}
        title="Nenhuma parcela encontrada"
        description="Ajuste os filtros. As parcelas aparecem aqui após criar contratos."
      />
    );
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead className="hidden md:table-cell">Contrato</TableHead>
            <TableHead>Parcela</TableHead>
            <TableHead>Vencimento</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {parcelas.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="font-medium">
                {p.contrato?.cliente?.nome ?? "—"}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {p.contrato?.numero ? `Nº ${p.contrato.numero}` : "—"}
              </TableCell>
              <TableCell>{p.numero}</TableCell>
              <TableCell>{formatDate(p.vencimento)}</TableCell>
              <TableCell>{formatCurrency(p.valor)}</TableCell>
              <TableCell>
                <ParcelaStatusBadge
                  status={effectiveStatus(p.status, p.vencimento, today)}
                />
              </TableCell>
              <TableCell>
                <ParcelaActions id={p.id} valor={p.valor} status={p.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
