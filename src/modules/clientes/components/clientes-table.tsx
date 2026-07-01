import Link from "next/link";
import { Users } from "lucide-react";

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
import { formatDocument, formatPhone } from "@/lib/formatters";
import { ClienteStatusBadge } from "@/modules/clientes/components/cliente-status-badge";
import { ClienteRowActions } from "@/modules/clientes/components/cliente-row-actions";
import type { Cliente } from "@/modules/clientes/repositories/clientes.repository";

export function ClientesTable({ clientes }: { clientes: Cliente[] }) {
  if (clientes.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Nenhum cliente encontrado"
        description="Ajuste os filtros ou cadastre um novo cliente para começar."
        action={
          <Button asChild>
            <Link href="/clientes/novo">Novo cliente</Link>
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
            <TableHead>Nome</TableHead>
            <TableHead>CPF/CNPJ</TableHead>
            <TableHead className="hidden md:table-cell">Telefone</TableHead>
            <TableHead className="hidden lg:table-cell">Cidade/UF</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {clientes.map((cliente) => (
            <TableRow key={cliente.id}>
              <TableCell className="font-medium">
                <Link
                  href={`/clientes/${cliente.id}/editar`}
                  className="hover:underline"
                >
                  {cliente.nome}
                </Link>
                <div className="text-muted-foreground text-xs">
                  {cliente.tipo === "pj" ? "Pessoa Jurídica" : "Pessoa Física"}
                </div>
              </TableCell>
              <TableCell>{formatDocument(cliente.documento)}</TableCell>
              <TableCell className="hidden md:table-cell">
                {formatPhone(cliente.whatsapp ?? cliente.telefone)}
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                {cliente.cidade
                  ? `${cliente.cidade}${cliente.estado ? `/${cliente.estado}` : ""}`
                  : "—"}
              </TableCell>
              <TableCell>
                <ClienteStatusBadge status={cliente.status} />
              </TableCell>
              <TableCell>
                <ClienteRowActions id={cliente.id} nome={cliente.nome} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
