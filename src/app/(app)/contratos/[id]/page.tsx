import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/formatters";
import {
  getContratoById,
  getParcelasByContrato,
} from "@/modules/contratos/repositories/contratos.repository";
import { ContratoStatusBadge } from "@/modules/contratos/components/contrato-status-badge";
import { CarneTable } from "@/modules/contratos/components/carne-table";
import { INDICE_LABEL } from "@/modules/contratos/schemas/contrato.schema";

export const metadata: Metadata = {
  title: "Contrato",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ContratoDetailPage({ params }: PageProps) {
  const { id } = await params;
  const contrato = await getContratoById(id);
  if (!contrato) notFound();

  const parcelas = await getParcelasByContrato(id);

  const objeto =
    contrato.tipo === "imovel"
      ? (contrato.imovel?.codigo ?? "Imóvel")
      : contrato.veiculo
        ? `${contrato.veiculo.marca} ${contrato.veiculo.modelo}`
        : "Veículo";

  const totalPago = parcelas
    .filter((p) => p.status === "pago")
    .reduce((s, p) => s + (p.valor_pago ?? p.valor), 0);
  const totalPendente = parcelas
    .filter((p) => p.status === "pendente" || p.status === "atrasado")
    .reduce((s, p) => s + p.valor, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Contrato ${contrato.numero ? `nº ${contrato.numero}` : ""}`}
        description={`${contrato.cliente?.nome ?? ""} · ${objeto}`}
        actions={
          <Button asChild variant="outline">
            <Link href={`/contratos/${contrato.id}/editar`}>
              <Pencil className="mr-1 size-4" />
              Editar
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Dados do contrato
              <ContratoStatusBadge status={contrato.status} />
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm sm:grid-cols-3">
            <Info label="Cliente" value={contrato.cliente?.nome ?? "—"} />
            <Info label="Objeto" value={objeto} />
            <Info label="Tipo" value={contrato.tipo} className="capitalize" />
            <Info label="Valor da parcela" value={formatCurrency(contrato.valor)} />
            <Info label="Parcelas" value={`${contrato.qtd_parcelas}x`} />
            <Info label="Dia do vencimento" value={String(contrato.dia_vencimento)} />
            <Info label="Início" value={formatDate(contrato.data_inicio)} />
            <Info label="Fim" value={formatDate(contrato.data_fim)} />
            <Info label="Reajuste" value={INDICE_LABEL[contrato.indice_reajuste]} />
            <Info label="Multa" value={`${contrato.multa_percent}%`} />
            <Info label="Juros/mês" value={`${contrato.juros_mes_percent}%`} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumo financeiro</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Info label="Total recebido" value={formatCurrency(totalPago)} />
            <Info label="Em aberto" value={formatCurrency(totalPendente)} />
            <Info
              label="Valor total do contrato"
              value={formatCurrency(contrato.valor * contrato.qtd_parcelas)}
            />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Carnê ({parcelas.length} parcelas)</h2>
        <CarneTable parcelas={parcelas} />
      </div>
    </div>
  );
}

function Info({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div>
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className={className}>{value}</p>
    </div>
  );
}
