import Link from "next/link";
import { Car } from "lucide-react";

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
import { formatCurrency } from "@/lib/formatters";
import { VeiculoStatusBadge } from "@/modules/veiculos/components/veiculo-status-badge";
import { VeiculoRowActions } from "@/modules/veiculos/components/veiculo-row-actions";
import type { Veiculo } from "@/modules/veiculos/repositories/veiculos.repository";

export function VeiculosTable({ veiculos }: { veiculos: Veiculo[] }) {
  if (veiculos.length === 0) {
    return (
      <EmptyState
        icon={Car}
        title="Nenhum veículo encontrado"
        description="Ajuste os filtros ou cadastre um novo veículo."
        action={
          <Button asChild>
            <Link href="/veiculos/novo">Novo veículo</Link>
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
            <TableHead>Veículo</TableHead>
            <TableHead>Placa</TableHead>
            <TableHead className="hidden md:table-cell">Ano</TableHead>
            <TableHead>Aluguel</TableHead>
            <TableHead>Situação</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {veiculos.map((veiculo) => (
            <TableRow key={veiculo.id}>
              <TableCell className="font-medium">
                <Link
                  href={`/veiculos/${veiculo.id}/editar`}
                  className="hover:underline"
                >
                  {veiculo.marca} {veiculo.modelo}
                </Link>
                {veiculo.cor ? (
                  <div className="text-muted-foreground text-xs">
                    {veiculo.cor}
                  </div>
                ) : null}
              </TableCell>
              <TableCell className="uppercase">{veiculo.placa ?? "—"}</TableCell>
              <TableCell className="hidden md:table-cell">
                {veiculo.ano ?? "—"}
              </TableCell>
              <TableCell>{formatCurrency(veiculo.valor_aluguel)}</TableCell>
              <TableCell>
                <VeiculoStatusBadge status={veiculo.status} />
              </TableCell>
              <TableCell>
                <VeiculoRowActions
                  id={veiculo.id}
                  descricao={`${veiculo.marca} ${veiculo.modelo}`}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
