import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface DashboardData {
  imoveis: number;
  veiculos: number;
  contratosAtivos: number;
  contratosEncerrados: number;
  clientesAtivos: number;
  clientesInadimplentes: number;
  recebidoMes: number;
  pendente: number;
  proximosVencimentos: {
    id: string;
    numero: number;
    vencimento: string;
    valor: number;
    cliente: string;
  }[];
}

function monthRange(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .slice(0, 10);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .slice(0, 10);
  return { start, end };
}

/** Agrega todos os indicadores do dashboard em paralelo. */
export async function getDashboardData(): Promise<DashboardData> {
  const supabase = await createSupabaseServerClient();
  const today = new Date().toISOString().slice(0, 10);
  const in7 = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  const { start, end } = monthRange();

  const countOf = (
    table: "imoveis" | "veiculos" | "clientes" | "contratos",
    apply?: (q: ReturnType<typeof supabase.from>) => unknown,
  ) => {
    const base = supabase
      .from(table)
      .select("*", { count: "exact", head: true });
    return (apply ? apply(base) : base) as unknown as Promise<{
      count: number | null;
    }>;
  };

  const [
    imoveis,
    veiculos,
    contratosAtivos,
    contratosEncerrados,
    clientesAtivos,
    clientesInadimplentes,
    pagosMes,
    pendentes,
    proximos,
  ] = await Promise.all([
    countOf("imoveis"),
    countOf("veiculos"),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    countOf("contratos", (q: any) => q.eq("status", "ativo")),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    countOf("contratos", (q: any) => q.eq("status", "encerrado")),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    countOf("clientes", (q: any) => q.eq("status", "ativo")),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    countOf("clientes", (q: any) => q.eq("status", "inadimplente")),
    supabase
      .from("parcelas")
      .select("valor_pago, valor")
      .eq("status", "pago")
      .gte("data_pagamento", start)
      .lte("data_pagamento", end),
    supabase
      .from("parcelas")
      .select("valor")
      .in("status", ["pendente", "atrasado"]),
    supabase
      .from("parcelas")
      .select("id, numero, vencimento, valor, contrato:contratos(cliente:clientes(nome))")
      .eq("status", "pendente")
      .gte("vencimento", today)
      .lte("vencimento", in7)
      .order("vencimento", { ascending: true })
      .limit(5),
  ]);

  const recebidoMes = (pagosMes.data ?? []).reduce(
    (s, p) => s + ((p.valor_pago as number | null) ?? (p.valor as number)),
    0,
  );
  const pendente = (pendentes.data ?? []).reduce(
    (s, p) => s + (p.valor as number),
    0,
  );

  const proximosVencimentos = (proximos.data ?? []).map((p) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const contrato = p.contrato as any;
    return {
      id: p.id as string,
      numero: p.numero as number,
      vencimento: p.vencimento as string,
      valor: p.valor as number,
      cliente: contrato?.cliente?.nome ?? "—",
    };
  });

  return {
    imoveis: imoveis.count ?? 0,
    veiculos: veiculos.count ?? 0,
    contratosAtivos: contratosAtivos.count ?? 0,
    contratosEncerrados: contratosEncerrados.count ?? 0,
    clientesAtivos: clientesAtivos.count ?? 0,
    clientesInadimplentes: clientesInadimplentes.count ?? 0,
    recebidoMes,
    pendente,
    proximosVencimentos,
  };
}
