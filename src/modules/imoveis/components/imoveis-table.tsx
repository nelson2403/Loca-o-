import Link from "next/link";
import { Building2 } from "lucide-react";

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
import { IMOVEL_TIPO_LABEL } from "@/modules/imoveis/schemas/imovel.schema";
import { ImovelStatusBadge } from "@/modules/imoveis/components/imovel-status-badge";
import { ImovelRowActions } from "@/modules/imoveis/components/imovel-row-actions";
import type { Imovel } from "@/modules/imoveis/repositories/imoveis.repository";

export function ImoveisTable({ imoveis }: { imoveis: Imovel[] }) {
  if (imoveis.length === 0) {
    return (
      <EmptyState
        icon={Building2}
        title="Nenhum imóvel encontrado"
        description="Ajuste os filtros ou cadastre um novo imóvel."
        action={
          <Button asChild>
            <Link href="/imoveis/novo">Novo imóvel</Link>
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
            <TableHead>Código</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead className="hidden md:table-cell">Endereço</TableHead>
            <TableHead>Aluguel</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {imoveis.map((imovel) => (
            <TableRow key={imovel.id}>
              <TableCell className="font-medium">
                <Link
                  href={`/imoveis/${imovel.id}/editar`}
                  className="hover:underline"
                >
                  {imovel.codigo}
                </Link>
              </TableCell>
              <TableCell>{IMOVEL_TIPO_LABEL[imovel.tipo]}</TableCell>
              <TableCell className="hidden md:table-cell">
                {imovel.cidade
                  ? `${imovel.bairro ? `${imovel.bairro}, ` : ""}${imovel.cidade}${imovel.estado ? `/${imovel.estado}` : ""}`
                  : "—"}
              </TableCell>
              <TableCell>{formatCurrency(imovel.valor_aluguel)}</TableCell>
              <TableCell>
                <ImovelStatusBadge status={imovel.status} />
              </TableCell>
              <TableCell>
                <ImovelRowActions id={imovel.id} codigo={imovel.codigo} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
