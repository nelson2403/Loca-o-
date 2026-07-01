import { NextResponse, type NextRequest } from "next/server";

import { verifyCronRequest } from "@/lib/cron";
import { enviarCobrancas } from "@/modules/automacoes/services/automacoes.service";

export async function GET(request: NextRequest) {
  if (!verifyCronRequest(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const result = await enviarCobrancas();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("[cron cobrancas]", error);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
