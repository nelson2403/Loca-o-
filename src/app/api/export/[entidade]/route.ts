import { NextResponse, type NextRequest } from "next/server";

import { requireAuth } from "@/server/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { toCsv } from "@/lib/csv";

type Entidade = "clientes" | "imoveis" | "veiculos";

const COLUMNS: Record<Entidade, { key: string; header: string }[]> = {
  clientes: [
    { key: "nome", header: "Nome" },
    { key: "tipo", header: "Tipo" },
    { key: "documento", header: "CPF/CNPJ" },
    { key: "email", header: "E-mail" },
    { key: "telefone", header: "Telefone" },
    { key: "whatsapp", header: "WhatsApp" },
    { key: "cidade", header: "Cidade" },
    { key: "estado", header: "UF" },
    { key: "status", header: "Status" },
  ],
  imoveis: [
    { key: "codigo", header: "Código" },
    { key: "tipo", header: "Tipo" },
    { key: "cidade", header: "Cidade" },
    { key: "estado", header: "UF" },
    { key: "valor_aluguel", header: "Aluguel" },
    { key: "status", header: "Status" },
  ],
  veiculos: [
    { key: "marca", header: "Marca" },
    { key: "modelo", header: "Modelo" },
    { key: "ano", header: "Ano" },
    { key: "placa", header: "Placa" },
    { key: "valor_aluguel", header: "Aluguel" },
    { key: "status", header: "Status" },
  ],
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ entidade: string }> },
) {
  await requireAuth();
  const { entidade } = await params;

  if (!(entidade in COLUMNS)) {
    return NextResponse.json({ error: "Entidade inválida." }, { status: 400 });
  }
  const key = entidade as Entidade;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from(key)
    .select("*")
    .limit(5000);
  if (error) {
    return NextResponse.json({ error: "Erro ao exportar." }, { status: 500 });
  }

  const csv = toCsv(
    (data ?? []) as Record<string, unknown>[],
    COLUMNS[key],
  );

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${key}.csv"`,
    },
  });
}
