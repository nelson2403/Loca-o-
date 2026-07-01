import type { Metadata } from "next";
import Link from "next/link";
import {
  Building2,
  Car,
  FileText,
  FileCheck,
  Users,
  AlertTriangle,
  Wallet,
  Clock,
} from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { StatCard } from "@/modules/dashboard/components/stat-card";
import { getDashboardData } from "@/modules/dashboard/services/dashboard.service";
import { formatCurrency, formatDate } from "@/lib/formatters";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const data = await getDashboardData();

  const stats = [
    { title: "Imóveis", value: String(data.imoveis), icon: Building2, hint: "Cadastrados" },
    { title: "Veículos", value: String(data.veiculos), icon: Car, hint: "Cadastrados" },
    {
      title: "Locações ativas",
      value: String(data.contratosAtivos),
      icon: FileText,
      hint: "Em vigência",
    },
    {
      title: "Locações encerradas",
      value: String(data.contratosEncerrados),
      icon: FileCheck,
      hint: "Histórico",
    },
    {
      title: "Clientes ativos",
      value: String(data.clientesAtivos),
      icon: Users,
      hint: "Cadastrados",
    },
    {
      title: "Inadimplentes",
      value: String(data.clientesInadimplentes),
      icon: AlertTriangle,
      hint: "Clientes",
    },
    {
      title: "Recebido no mês",
      value: formatCurrency(data.recebidoMes),
      icon: Wallet,
      hint: "Pagamentos confirmados",
    },
    {
      title: "A receber",
      value: formatCurrency(data.pendente),
      icon: Clock,
      hint: "Parcelas em aberto",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Visão geral das locações, recebimentos e inadimplência."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Próximos vencimentos (7 dias)</CardTitle>
          </CardHeader>
          <CardContent>
            {data.proximosVencimentos.length === 0 ? (
              <EmptyState
                icon={Clock}
                title="Nenhum vencimento próximo"
                description="As parcelas com vencimento nos próximos dias aparecem aqui."
              />
            ) : (
              <ul className="divide-y">
                {data.proximosVencimentos.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between py-2.5 text-sm"
                  >
                    <div>
                      <p className="font-medium">{p.cliente}</p>
                      <p className="text-muted-foreground text-xs">
                        Parcela {p.numero} · vence {formatDate(p.vencimento)}
                      </p>
                    </div>
                    <span className="font-semibold">
                      {formatCurrency(p.valor)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atalhos rápidos</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Shortcut href="/clientes/novo" label="Novo cliente" icon={Users} />
            <Shortcut href="/imoveis/novo" label="Novo imóvel" icon={Building2} />
            <Shortcut href="/veiculos/novo" label="Novo veículo" icon={Car} />
            <Shortcut
              href="/contratos/novo"
              label="Novo contrato"
              icon={FileText}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Shortcut({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: typeof Users;
}) {
  return (
    <Link
      href={href}
      className="hover:bg-accent flex items-center gap-2 rounded-lg border p-3 text-sm font-medium transition-colors"
    >
      <Icon className="text-muted-foreground size-4" />
      {label}
    </Link>
  );
}
