import Link from "next/link";
import { FileText } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { ContratoStatusBadge } from "@/modules/contratos/components/contrato-status-badge";
import { ContratoRowActions } from "@/modules/contratos/components/contrato-row-actions";
import type { ContratoListItem } from "@/modules/contratos/repositories/contratos.repository";

function alvoLabel(contrato: ContratoListItem): string {
  if (contrato.tipo === "imovel") return contrato.imovel?.codigo ?? "Imóvel";
  return contrato.veiculo
    ? `${contrato.veiculo.marca} ${contrato.veiculo.modelo}`
    : "Veículo";
}

export function ContratosTable({
  contratos,
}: {
  contratos: ContratoListItem[];
}) {
  if (contratos.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="Nenhum contrato encontrado"
        description="Crie um contrato para gerar o carnê de parcelas automaticamente."
        action={
          <Button asChild>
            <Link href="/contratos/novo">Novo contrato</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Objeto</TableHead>
            <TableHead className="hidden md:table-cell">Vigência</TableHead>
            <TableHead>Parcela</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {contratos.map((contrato) => (
            <TableRow key={contrato.id}>
              <TableCell className="font-medium">
                <Link
                  href={`/contratos/${contrato.id}`}
                  className="hover:underline"
                >
                  {contrato.cliente?.nome ?? "—"}
                </Link>
                {contrato.numero ? (
                  <div className="text-muted-foreground text-xs">
                    Nº {contrato.numero}
                  </div>
                ) : null}
              </TableCell>
              <TableCell>
                <span className="capitalize">{contrato.tipo}</span>
                <div className="text-muted-foreground text-xs">
                  {alvoLabel(contrato)}
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {formatDate(contrato.data_inicio)} —{" "}
                {formatDate(contrato.data_fim)}
              </TableCell>
              <TableCell>
                {formatCurrency(contrato.valor)}
                <div className="text-muted-foreground text-xs">
                  {contrato.qtd_parcelas}x
                </div>
              </TableCell>
              <TableCell>
                <ContratoStatusBadge status={contrato.status} />
              </TableCell>
              <TableCell>
                <ContratoRowActions id={contrato.id} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
