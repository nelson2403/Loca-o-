import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { ParcelaStatusBadge } from "@/components/shared/parcela-status-badge";
import type { Parcela } from "@/modules/contratos/repositories/contratos.repository";

export function CarneTable({ parcelas }: { parcelas: Parcela[] }) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Nº</TableHead>
            <TableHead>Vencimento</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Pagamento</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {parcelas.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="font-medium">{p.numero}</TableCell>
              <TableCell>{formatDate(p.vencimento)}</TableCell>
              <TableCell>{formatCurrency(p.valor)}</TableCell>
              <TableCell>
                {p.data_pagamento ? formatDate(p.data_pagamento) : "—"}
              </TableCell>
              <TableCell>
                <ParcelaStatusBadge status={p.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
