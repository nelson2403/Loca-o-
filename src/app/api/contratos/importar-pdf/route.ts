import { NextResponse, type NextRequest } from "next/server";

import { requireAuth } from "@/server/auth";
import { parseContratoText } from "@/modules/contratos/services/pdf-extract.service";

// pdf-parse depende de APIs de Node (Buffer, fs) — força runtime Node.
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  await requireAuth(); // exige sessão

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Arquivo não enviado." },
      { status: 400 },
    );
  }
  if (file.type !== "application/pdf") {
    return NextResponse.json(
      { error: "Envie um arquivo PDF." },
      { status: 400 },
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    // Import direto do arquivo interno evita o auto-teste do index do pdf-parse.
    // @ts-expect-error subpath do pacote não possui declarações de tipo
    const pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default as (
      b: Buffer,
    ) => Promise<{ text: string }>;
    const parsed = await pdfParse(buffer);
    const campos = parseContratoText(parsed.text ?? "");

    return NextResponse.json({
      campos,
      texto: (parsed.text ?? "").slice(0, 5000),
    });
  } catch (error) {
    console.error("[importar-pdf]", error);
    return NextResponse.json(
      { error: "Não foi possível ler o PDF. Preencha manualmente." },
      { status: 500 },
    );
  }
}
